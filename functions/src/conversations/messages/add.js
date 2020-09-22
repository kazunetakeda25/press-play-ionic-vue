const functions = require("firebase-functions");

const { firestore, firestoreObj } = require("../../../admin");
const utils = require("../../utils");

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
    typeof data.answerLimit !== "string" &&
    data.conversation.length > 0 &&
    !Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof data.message !== "string" &&
    data.message.length > 0 === false
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid message."
    );
  }

  // Get conversation
  let conversation = await firestore
    .collection("conversations")
    .doc(data.conversation)
    .get();

  // Make sure the conversation exists
  if (conversation.exists === false) {
    throw new functions.https.HttpsError(
      "not-found",
      "The conversation was not found."
    );
  }

  // Get data object
  let conversationData = conversation.data();

  // Make sure the conversation is enabled
  if (conversationData.enabled === false) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "This conversation has been disabled."
    );
  }

  // Check that neither user has blocked the other
  let user1blocked2 = await utils.blockedUsers.isUserBlocked(
    conversationData.user1,
    conversationData.user2
  );
  let user2blocked1 = await utils.blockedUsers.isUserBlocked(
    conversationData.user2,
    conversationData.user1
  );
  if (user1blocked2 || user2blocked1) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "This conversation has been disabled."
    );
  }

  // Get logged in user uid
  let uid = context.auth.uid;

  // Make sure the user belongs to the conversation
  // Return not-found to prevent abuse
  if (conversationData.userPair.indexOf(uid) === -1) {
    throw new functions.https.HttpsError(
      "not-found",
      "The conversation was not found."
    );
  }

  // Get timestamp
  let timestamp = firestoreObj.FieldValue.serverTimestamp();

  // Build message object
  let message = {
    attachments: [],
    message: data.message,
    read: false,
    received: null,
    sent: timestamp,
    uid: uid
  };

  // Create document reference
  let messageRef = firestore
    .collection("conversations")
    .doc(conversation.id)
    .collection("messages")
    .doc();

  // Build conversation update
  let conversationUpdate = {
    updated: timestamp,
    lastMessage: data.message
  };

  // Save to firestore
  try {
    console.log(`Creating message ${messageRef.path}.`);
    await firestore.runTransaction(transaction => {
      transaction.set(messageRef, message);
      transaction.update(conversation.ref, conversationUpdate);
      return Promise.resolve();
    });
    console.log(`Created message ${messageRef.path}`);
    return data;
  } catch (err) {
    console.error(`Error when creating ${messageRef.path}.`, err);
    throw new functions.https.HttpsError(
      "internal",
      "We couldn't send your message at this time."
    );
  }
});
