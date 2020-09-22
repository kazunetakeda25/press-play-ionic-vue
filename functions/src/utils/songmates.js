const chunk = require("lodash/chunk");
const filter = require("lodash/filter");
const find = require("lodash/find");
const isEqual = require("lodash/isEqual");
const map = require("lodash/map");
const max = require("lodash/max");
const union = require("lodash/union");

const { auth, firestore } = require("../../admin");
const blockedUsers = require("./blockedUsers");
const geo = require("./geo");

class Songmates {
  getMatchedRelationTypes(user1, user2) {
    let user1Gender = user1.profile.gender;
    let user2Gender = user2.profile.gender;
    let user1Relationships = filter(user1.seeking.relationships, {
      enabled: true
    });
    let user2Relationships = filter(user2.seeking.relationships, {
      enabled: true
    });
    let user1RelationshipTypes = map(user1Relationships, "type");
    let user2RelationshipTypes = map(user2Relationships, "type");
    let enabledMatchedRelationTypes = [];

    user1RelationshipTypes.forEach(type => {
      if (user2RelationshipTypes.indexOf(type) !== -1) {
        enabledMatchedRelationTypes.push(type);
      }
    });

    // If no enabledMatchedRelationTypes matched, return empty
    if (enabledMatchedRelationTypes.length === 0) {
      return [];
    }

    // Cycle through enabledMatchedRelationTypes to get matchedRelationTypes
    let matchedRelationTypes = [];
    enabledMatchedRelationTypes.forEach(type => {
      let user1Relationship = find(user1Relationships, { type: type });
      let user2Relationship = find(user2Relationships, { type: type });
      let user1RelationshipMatched = false;
      let user2RelationshipMatched = false;

      // Check user2Relationship to get user1RelationshipMatched
      if (
        user2Relationship.identities.indexOf(user1Gender.identity) !== -1 &&
        user2Relationship.expressions.indexOf(user1Gender.expression) !== -1 &&
        user2Relationship.orientations.indexOf(user1Gender.orientation) !==
          -1 &&
        user2Relationship.pronouns.indexOf(user1Gender.pronoun) !== -1
      ) {
        user1RelationshipMatched = true;
      }

      // Check user1Relationship to get user2RelationshipMatched
      if (
        user1Relationship.identities.indexOf(user2Gender.identity) !== -1 &&
        user1Relationship.expressions.indexOf(user2Gender.expression) !== -1 &&
        user1Relationship.orientations.indexOf(user2Gender.orientation) !==
          -1 &&
        user1Relationship.pronouns.indexOf(user2Gender.pronoun) !== -1
      ) {
        user2RelationshipMatched = true;
      }

      if (user1RelationshipMatched && user2RelationshipMatched) {
        matchedRelationTypes.push(type);
      }
    });

    return matchedRelationTypes;
  }

  /**
   * Tests if two users are songmates
   */
  async lookup(user1, user2) {
    // Set initial songmateData
    let songmateData = null;

    // Setup userPairs
    let userPairs = [`${user1}:${user2}`, `${user2}:${user1}`];

    // Get current songmates
    let songmates = await firestore
      .collection("songmates")
      .where("userPair", "in", userPairs)
      .limit(1)
      .get();

    // Set vars
    let isSongmate = songmates.empty === false;
    if (isSongmate) {
      let data = songmates.docs[0].data();
      songmateData = Object.assign({}, data, {
        id: songmates.docs[0].id,
        matchedByDoc: data.matchedByDoc.path,
        matchedToDoc: data.matchedToDoc.path,
        path: songmates.docs[0].ref.path
      });
    }

    return { isSongmate, songmateData };
  }

  async processUser(uid, data) {
    // Setup songmates to create
    let songmatesToCreate = [];

    // Setup songmates to delete
    let songmatesToDelete = [];

    // Setup songmates to update
    let songmatesToUpdate = [];

    // Setup usersToExclude during newSongmates
    let usersToExclude = [uid];
    await blockedUsers.getBlockedUsers(uid).map(id => usersToExclude.push(id));
    await firestore
      .collection("users")
      .doc(uid)
      .collection("songmates_disliked")
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc =>
          usersToExclude.push(doc.get("uid"))
        );
      });

    // Setup maxDistance for geo matches
    let maxDistance = data.seeking.maxDistance || 200;

    // Get current songmates
    let matchedBy = await firestore
      .collection("songmates")
      .where("matchedBy", "==", uid)
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc => {
          let data = doc.data();
          return Object.assign({}, data, {
            id: doc.id,
            lookup: data.matchedTo,
            path: doc.ref.path,
            isMatchedBy: true,
            isMatchedTo: false
          });
        });
      });
    let matchedTo = await firestore
      .collection("songmates")
      .where("matchedTo", "==", uid)
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc => {
          let data = doc.data();
          return Object.assign({}, data, {
            id: doc.id,
            lookup: data.matchedBy,
            path: doc.ref.path,
            isMatchedBy: false,
            isMatchedTo: true
          });
        });
      });

    let songmates = union(matchedBy, matchedTo);

    // Cycle through songmates and check if still matched
    await Promise.all(
      songmates.map(async songmate => {
        // Add to usersToExclude
        usersToExclude.push(songmate.lookup);

        // Lookup user
        let user = await firestore
          .collection("users")
          .doc(songmate.lookup)
          .get()
          .then(snapshot => {
            let data = snapshot.exists ? snapshot.data() : {};
            return Object.assign({}, data, {
              id: snapshot.id,
              exists: snapshot.exists
            });
          });
        if (user.exists === false) {
          songmatesToDelete.push(songmate.path);
          return;
        }

        // Setup update
        let updatedData = {};

        // Get distance between
        let distance = geo.distanceBetweenHashes(
          data.profile.location.hash,
          user.profile.location.hash
        );

        // If distance is greater than distanceLimit, add to songmatesToDelete
        let userMaxDistance = user.seeking.maxDistance || 200;
        let distanceLimit = max([maxDistance, userMaxDistance]);
        if (distance.miles > distanceLimit) {
          songmatesToDelete.push(songmate.path);
          return;
        }

        // Check seeking.relationships
        let matchedRelationTypes = this.getMatchedRelationTypes(data, user);

        // If no matchedRelationTypes, add to songmatesToDelete
        if (matchedRelationTypes.length === 0) {
          songmatesToDelete.push(songmate.path);
          return;
        }

        // Setup songmateUpdate
        let songmateUpdate = {};

        // If distance is changed, add to songmateUpdate
        if (!isEqual(songmate.distance, distance)) {
          songmateUpdate.distance = distance;
        }

        // If matchedRelationTypes changed, add to songmateUpdate
        if (!isEqual(songmate.relationshipTypes, matchedRelationTypes)) {
          songmateUpdate.relationshipTypes = matchedRelationTypes;
        }

        // Check songmateUpdate length and add to songmatesToUpdate
        if (Object.keys(songmateUpdate).length > 0) {
          songmatesToUpdate.push({
            ref: firestore.collection("songmates").doc(songmate.id),
            data: updatedData
          });
        }
      })
    );

    // Setup newSongMates
    let newSongMates = [];

    // Get users in location range
    const range = geo.hashRange(data.profile.location.hash, maxDistance);
    let users = await firestore
      .collection("users")
      .where("profile.location.hash", ">=", range.lower)
      .where("profile.location.hash", "<=", range.upper)
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc =>
          Object.assign({}, doc.data(), { id: doc.id })
        );
      });

    let filteredUsers = filter(users, u => usersToExclude.indexOf(u.id) === -1);

    // Cycle through filteredUsers and compare to see if match
    await Promise.all(
      filteredUsers.map(async user => {
        // Check if user exists, is enabled
        let userAuth = await auth
          .getUser(user.id)
          .then(auth => {
            return Object.assign({}, auth, { exists: true });
          })
          .catch(() => {
            return { disabled: true, exists: false };
          });
        if (userAuth.exists === false || userAuth.disabled === true) {
          return;
        }

        // Check to see if user setup is complete
        if (!user.setup.complete) {
          return;
        }

        // Check seeking.relationships
        let matchedRelationTypes = this.getMatchedRelationTypes(data, user);

        // If no matchedRelationTypes matched, skip
        if (matchedRelationTypes.length === 0) {
          return;
        }

        // Get distance between
        let distance = geo.distanceBetweenHashes(
          data.profile.location.hash,
          user.profile.location.hash
        );

        // If distance is greater than distanceLimit, skip
        let userMaxDistance = user.seeking.maxDistance || 200;
        let distanceLimit = max([maxDistance, userMaxDistance]);
        if (distance.miles > distanceLimit) {
          return;
        }

        // Push to matched
        newSongMates.push({
          id: user.id,
          distance: distance,
          relationshipTypes: matchedRelationTypes,
          userDoc: user
        });
      })
    );

    // Cycle through newSongMates and add to songmatesToCreate
    await Promise.all(
      newSongMates.map(async newSongMate => {
        // Setup songmates document
        let songmate = {
          created: new Date(),
          distance: newSongMate.distance,
          relationshipTypes: newSongMate.relationshipTypes,
          matchedBy: uid,
          matchedByDoc: null,
          matchedTo: newSongMate.id,
          matchedToDoc: null,
          mutual: false,
          score: 0.5,
          songstoryMatches: [],
          userPair: `${uid}:${newSongMate.id}`
        };
        let songmateDoc = firestore.collection("songmates").doc();

        // Setup matchedByDoc
        let matchedBy = {
          browse: null,
          disliked: false,
          favorite: false,
          liked: false,
          uid: newSongMate.id,
          updated: null,
          songmate: songmateDoc
        };
        let matchedByDoc = firestore
          .collection("users")
          .doc(uid)
          .collection("songmates")
          .doc();

        // Setup matchedToDoc
        let matchedTo = Object.assign({}, matchedBy, {
          uid: uid
        });
        let matchedToDoc = firestore
          .collection("users")
          .doc(newSongMate.id)
          .collection("songmates")
          .doc();

        // Set songmate.matchedByDoc, songmate.matchedToDoc
        songmate.matchedByDoc = matchedByDoc;
        songmate.matchedToDoc = matchedToDoc;

        // Add docs to songmatesToCreate
        songmatesToCreate.push({
          ref: songmateDoc,
          data: songmate
        });
        songmatesToCreate.push({
          ref: matchedByDoc,
          data: matchedBy
        });
        songmatesToCreate.push({
          ref: matchedToDoc,
          data: matchedTo
        });
      })
    );

    // Create batchOperations
    let batchOperations = [];

    // Process created
    songmatesToCreate.forEach(create => {
      batchOperations.push({
        type: "create",
        ref: create.ref,
        data: create.data
      });
    });

    // Process updated
    songmatesToUpdate.forEach(update => {
      batchOperations.push({
        type: "update",
        ref: update.ref,
        data: update.data
      });
    });

    // Process deleted
    songmatesToDelete.forEach(path => {
      batchOperations.push({
        type: "delete",
        ref: firestore.doc(path)
      });
    });

    // Run batchOperations
    if (batchOperations.length > 0) {
      // Setup counter to log results
      let batchCreates = 0;
      let batchUpdates = 0;
      let batchDeletes = 0;
      let successfullBatches = 0;
      let failedBatches = 0;

      // Chunk operations by 500, the max batch operations limit
      let batchChunks = chunk(batchOperations, 500);
      await Promise.all(
        batchChunks.map(async batchChunk => {
          let batch = firestore.batch();
          batchChunk.forEach(operation => {
            if (operation.type === "create") {
              batch.create(operation.ref, operation.data);
              batchCreates++;
            }
            if (operation.type === "update") {
              batch.update(operation.ref, operation.data);
              batchUpdates++;
            }
            if (operation.type === "delete") {
              batch.delete(batch.ref);
              batchDeletes++;
            }
          });
          await batch
            .commit()
            .then(() => {
              // Log to console
              console.log(
                `SongMates batch for ${uid} succesfully ran. Created: ${batchCreates}, Updated: ${batchUpdates}, Deleted: ${batchDeletes}`
              );
              // Add to successful batches
              successfullBatches++;
              // Reset counters
              batchCreates = 0;
              batchUpdates = 0;
              batchDeletes = 0;
              return true;
            })
            .catch(err => {
              // Log to console
              console.error(
                `SongMates batch for ${uid} failed. Failed Creates: ${batchCreates}, Failed Updates: ${batchUpdates}, Failed Deletes: ${batchDeletes}`,
                err
              );
              // Add to failed batches
              failedBatches++;
              // Reset counters
              batchCreates = 0;
              batchUpdates = 0;
              batchDeletes = 0;
            });
        })
      );

      // Log finish
      console.log(
        `All SongMates batches for ${uid} ran. Successful: ${successfullBatches}, Failed: ${failedBatches}`
      );
    } else {
      console.log(`No SongMate batches to run for ${uid}.`);
    }
  }
}

module.exports = new Songmates();
