const functions = require("firebase-functions");
const union = require("lodash/union");

const { firestore } = require("../../../../admin");
const utils = require("../../../utils");

module.exports = functions.firestore
  .document("users/{userId}/blocked_users/{blockedUid}")
  .onCreate(async (snapshot, context) => {
    // Get user vars
    let user1 = context.params.userId;
    let user2 = context.params.blockedUid;
    let userPairs = [`${user1}:${user2}`, `${user2}:${user1}`];

    // Get any SongMates records that need to be deleted
    let songmateRecordsToDelete = [];
    await firestore
      .collection("songmates")
      .where("userPair", "in", userPairs)
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc =>
          songmateRecordsToDelete.push(doc.ref)
        );
      });

    // Get any conversations that need to be disabled
    let conversationsToDisable = [];
    await firestore
      .collection("conversations")
      .where("userPair", "in", userPairs)
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc =>
          conversationsToDisable.push(doc.ref)
        );
      });

    // Get users_browse that need to be updated
    let usersBrowseToUpdate = [];
    let usersBrowse = await firestore
      .collection("users_browse")
      .where("userPair", "in", userPairs)
      .get();
    // Setup a browseRef to add to the blocked record if available
    let browseRef = null;
    await Promise.all(
      usersBrowse.docs.map(async doc => {
        if (
          doc.get("user1") === user1 &&
          doc.get("user2") === user2 &&
          browseRef === null
        ) {
          browseRef = doc.ref;
        }
        let profile = await utils.userBrowse.getBlockedProfileObject(
          doc.get("user2")
        );
        if (profile) {
          usersBrowseToUpdate.push({
            ref: doc.ref,
            data: {
              profile: profile
            }
          });
        }
      })
    );

    // Add browseRef to the blocked record if available
    let blockedRecordsToUpdate = [];
    if (browseRef !== null) {
      blockedRecordsToUpdate.push({
        ref: snapshot.ref,
        data: {
          browse: browseRef
        }
      });
    }

    // Transactions
    const songemateTransactions = songmateRecordsToDelete.map(async doc => {
      try {
        console.log(`Deleting: '${doc.path}' from Cloud Firestore.`);
        await firestore.runTransaction(transaction => {
          transaction.delete(doc);
          return Promise.resolve();
        });
        console.log(`Deleted: '${doc.path}' from Cloud Firestore.`);
      } catch (err) {
        console.error(
          `Error when deleting: '${doc.path}' from Cloud Firestore.`,
          err
        );
      }
    });
    const conversationTransactions = conversationsToDisable.map(async doc => {
      try {
        console.log(`Updating: '${doc.path}' in Cloud Firestore.`);
        await firestore.runTransaction(transaction => {
          transaction.update(doc, { accepted: false, enabled: false });
          return Promise.resolve();
        });
        console.log(`Updated: '${doc.path}' in Cloud Firestore.`);
      } catch (err) {
        console.error(
          `Error when updating: '${doc.path}' in Cloud Firestore.`,
          err
        );
      }
    });
    const usersBrowseTransaction = usersBrowseToUpdate.map(async record => {
      try {
        console.log(`Updating: '${record.ref.path}' in Cloud Firestore.`);
        await firestore.runTransaction(transaction => {
          transaction.update(record.ref, record.data);
          return Promise.resolve();
        });
        console.log(`Updated: '${record.ref.path}' in Cloud Firestore.`);
      } catch (err) {
        console.error(
          `Error when updating: '${record.ref.path}' in Cloud Firestore.`,
          err
        );
      }
    });
    const blockedRecordsTransaction = blockedRecordsToUpdate.map(
      async record => {
        try {
          console.log(`Updating: '${record.ref.path}' in Cloud Firestore.`);
          await firestore.runTransaction(transaction => {
            transaction.update(record.ref, record.data);
            return Promise.resolve();
          });
          console.log(`Updated: '${record.ref.path}' in Cloud Firestore.`);
        } catch (err) {
          console.error(
            `Error when updating: '${record.ref.path}' in Cloud Firestore.`,
            err
          );
        }
      }
    );

    let promises = union(
      songemateTransactions,
      conversationTransactions,
      usersBrowseTransaction,
      blockedRecordsTransaction
    );

    return Promise.all(promises);
  });
