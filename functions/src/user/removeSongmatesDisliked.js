const functions = require("firebase-functions");
const { firestore } = require("../../admin");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check for valid UID string
  if (!Object.prototype.hasOwnProperty.call(data, "id")) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid conversation."
    );
  }

  // Get logged in user.uid
  let loggedInUser = context.auth.uid;

  // Build docRef
  let docRef = firestore
    .collection("users")
    .doc(loggedInUser)
    .collection("songmates_disliked")
    .doc(data.id);

  // Load the document and see if it exists
  let doc = await docRef.get();

  // If doc exists, run transaction, otherwise just return true
  if (doc.exists) {
    // Remove from Firestore
    try {
      console.log(`Deleteing ${docRef.path} in Cloud Firestore.`);
      await firestore.runTransaction(transaction => {
        transaction.delete(docRef);
        return Promise.resolve();
      });
      console.log(`Deleted ${docRef.path} in Cloud Firestore.`);
      return { removed: true };
    } catch (err) {
      console.error(
        `Error when deleting ${docRef.path} in Cloud Firestore.`,
        err
      );
      throw new functions.https.HttpsError(
        "invalid-argument",
        "We couldn't update this conversation at this time."
      );
    }
  } else {
    return { removed: true };
  }
});
