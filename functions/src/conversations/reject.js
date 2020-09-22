const functions = require("firebase-functions");

const { firestore, firestoreObj } = require("../../admin");

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
    !Object.prototype.hasOwnProperty.call(data, "conversation") &&
    typeof data.conversation !== "string" &&
    data.conversation.length > 0 === false
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid conversation."
    );
  }

  // Get conversation
  let conversationRef = firestore
    .collection("conversations")
    .doc(data.conversation);
  let conversation = await conversationRef.get();

  // Make sure the conversation exists
  if (conversation.exists === false) {
    throw new functions.https.HttpsError(
      "not-found",
      "The conversation was not found."
    );
  }

  // Get data object
  let conversationData = conversation.data();

  // Get logged in user uid
  let uid = context.auth.uid;

  // Make sure the user belongs to the conversation
  // Return not found to prevent abuse
  if (conversationData.userPair.indexOf(uid) === -1) {
    throw new functions.https.HttpsError(
      "not-found",
      "The conversation was not found."
    );
  }

  // Make sure the logged in user is user2
  if (conversationData.user2 !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You can't reject this message."
    );
  }

  // Build conversation update
  let conversationUpdate = {
    accepted: false
  };

  // Make document reference
  let archivedDoc = firestore
    .collection("users")
    .doc(uid)
    .collection("archived_conversations")
    .doc(conversation.id);

  // Set doc data to rejected type
  let archivedDocData = {
    rejected: true,
    timestamp: firestoreObj.FieldValue.serverTimestamp()
  };

  // Save to firestore
  try {
    console.log(
      `${uid} rejecting '${conversation.ref.path}'. Saving '${archivedDoc.path}.`
    );
    await firestore.runTransaction(transaction => {
      transaction.update(conversation.ref, conversationUpdate);
      transaction.set(archivedDoc, archivedDocData);
      return Promise.resolve();
    });
    console.log(
      `${uid} rejected ${conversation.ref.path}. Saved '${archivedDoc.path}.`
    );
    // Get the fresh conversation object to return it
    let conversationObj = await conversationRef.get().then(snapshot => {
      return Object.assign({}, snapshot.data(), {
        id: snapshot.id,
        path: snapshot.ref.path
      });
    });
    return conversationObj;
  } catch (err) {
    console.error(`Error when rejecting ${conversation.ref.path}`, err);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "We couldn't accept the conversation at this time."
    );
  }
});
