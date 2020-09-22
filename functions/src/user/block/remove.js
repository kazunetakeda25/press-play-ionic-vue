const functions = require("firebase-functions");
const { firestore } = require("../../../admin");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check for valid UID string
  if (
    !Object.prototype.hasOwnProperty.call(data, "uid") &&
    typeof data.uid !== "string" &&
    data.uid.length > 0 === false &&
    data.uid.length <= 128 === false
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid uid."
    );
  }

  // Get logged in user.uid
  let loggedInUser = context.auth.uid;

  // Build docRef
  let docRef = firestore
    .collection("users")
    .doc(loggedInUser)
    .collection("blocked_users")
    .doc(data.uid);

  // Load the document and see if it exists
  let doc = await docRef.get();

  // If doc exists, run transaction, otherwise just return true
  if (doc.exists) {
    // Remove from Firestore
    try {
      console.log(`Deleteing ${docRef.path}.`);
      await firestore.runTransaction(transaction => {
        transaction.delete(docRef);
        return Promise.resolve();
      });
      console.log(`Deleted ${docRef.path}`);
      return { removed: true };
    } catch (err) {
      console.error(`Error when deleting ${docRef.path}`, err);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "We couldn't unblock this user at this time."
      );
    }
  } else {
    return { removed: true };
  }
});
