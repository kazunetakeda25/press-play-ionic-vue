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

  // Make document reference
  let doc = firestore
    .collection("users")
    .doc(uid)
    .collection("archived_conversations")
    .doc(conversation.id);

  // Set doc data to accepted type
  let docData = {
    archived: true,
    timestamp: firestoreObj.FieldValue.serverTimestamp()
  };

  // Save to firestore
  try {
    console.log(
      `${uid} archiving '${conversation.ref.path}'. Saving '${doc.path}.`
    );
    await firestore.runTransaction(transaction => {
      transaction.set(doc, docData);
      return Promise.resolve();
    });
    console.log(
      `${uid} archived ${conversation.ref.path}. Saved '${doc.path}.`
    );
    return Object.assign({}, conversationData, {
      id: conversation.id,
      path: conversation.ref.path
    });
  } catch (err) {
    console.error(`Error when archiving ${conversation.ref.path}`, err);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "We couldn't accept the conversation at this time."
    );
  }
});
