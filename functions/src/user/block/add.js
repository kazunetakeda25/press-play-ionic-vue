const functions = require("firebase-functions");
const { auth, firestore, firestoreObj } = require("../../../admin");

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

  // Check to make sure data.uid isn't the same as loggedInUser
  if (loggedInUser === data.uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You can't block yourself."
    );
  }

  // Make sure data.uid exists
  let user = await auth
    .getUser(data.uid)
    .then(user => {
      return user;
    })
    .catch(() => {
      throw new functions.https.HttpsError("not-found", "User not found.");
    });

  // Build docRef
  let docRef = firestore
    .collection("users")
    .doc(loggedInUser)
    .collection("blocked_users")
    .doc(user.uid);

  // Load the document and see if it exists
  let doc = await docRef.get();

  // If it doesn't exist, run transaction, otherwise just return true
  if (!doc.exists) {
    let docData = {
      browse: null,
      timestamp: firestoreObj.FieldValue.serverTimestamp(),
      uid: user.uid
    };
    // Save to firestore
    try {
      console.log(`Creating ${docRef.path}.`);
      await firestore.runTransaction(transaction => {
        transaction.set(docRef, docData);
        return Promise.resolve();
      });
      console.log(`Created ${docRef.path}`);
      return { blocked: true };
    } catch (err) {
      console.error(`Error when creating ${docRef.path}`, err);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "We couldn't block this user at this time."
      );
    }
  } else {
    return { blocked: true };
  }
});
