const functions = require("firebase-functions");
const { firestore, firestoreObj } = require("../../../admin");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check if valid data
  if (
    !Object.prototype.hasOwnProperty.call(data, "id") &&
    typeof data.id !== "string" &&
    !Object.prototype.hasOwnProperty.call(data, "liked") &&
    typeof data.liked !== "boolean" &&
    !Object.prototype.hasOwnProperty.call(data, "disliked") &&
    typeof data.disliked !== "boolean" &&
    !Object.prototype.hasOwnProperty.call(data, "favorite") &&
    typeof data.favorite !== "boolean"
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with required data attributes."
    );
  }

  // Get logged in user
  let uid = context.auth.uid;

  // Setup update data
  let update = {
    liked: data.liked,
    disliked: data.disliked,
    favorite: data.favorite,
    updated: firestoreObj.FieldValue.serverTimestamp()
  };

  // Setup document
  let userSongmateDoc = firestore
    .collection("users")
    .doc(uid)
    .collection("songmates")
    .doc(data.id);

  // Update
  try {
    console.log(`Updating ${userSongmateDoc.path}.`);
    let updated = await firestore.runTransaction(async transaction => {
      // Lookup docs
      let songmateRef = await transaction
        .get(userSongmateDoc)
        .then(snapshot => {
          if (!snapshot.exists) {
            throw new functions.https.HttpsError(
              "not-found",
              "SongMate not found."
            );
          }
          return snapshot.data();
        });

      let songmate = await transaction
        .get(songmateRef.songmate)
        .then(snapshot => {
          if (!snapshot.exists) {
            throw new functions.https.HttpsError(
              "not-found",
              "SongMate not found."
            );
          }
          let data = snapshot.data();
          let lookup = data.matchedBy === uid ? data.matchedTo : data.matchedBy;
          let lookupDoc =
            data.matchedBy === uid ? data.matchedToDoc : data.matchedByDoc;
          return { data, lookup, lookupDoc };
        });

      let lookup = await transaction.get(songmate.lookupDoc).then(snapshot => {
        if (!snapshot.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "SongMate not found."
          );
        }
        return snapshot.data();
      });

      // If disliked, save to users disliked collection and modify update
      if (update.disliked) {
        // Make sure liked and favorite are set to false
        update.liked = false;
        update.favorite = false;
        // Setup transaction data
        let dislikedDoc = firestore
          .collection("users")
          .doc(uid)
          .collection("songmates_disliked")
          .doc(songmateRef.uid);
        let dislikedDocData = Object.assign({}, songmateRef, update);
        // Run transaction
        console.log(`Saving '${dislikedDoc.path}'.`);
        transaction.set(dislikedDoc, dislikedDocData);
        console.log(`Saved '${dislikedDoc.path}'.`);
      }

      // Update userSongmateDoc
      transaction.update(userSongmateDoc, update);

      // Update SongmateRef mutual field
      let mutual = update.liked && lookup.liked;
      console.log(`Updating '${songmateRef.songmate.path}'.`);
      transaction.update(songmateRef.songmate, { mutual });
      console.log(`Updated '${songmateRef.songmate.path}'.`);

      return Promise.resolve({ update, mutual });
    });
    console.log(`Updated ${userSongmateDoc.path}`);
    return updated;
  } catch (err) {
    console.error(`Error when updating ${userSongmateDoc.path}`, err);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "We couldn't update this SongMate at this time."
    );
  }
});
