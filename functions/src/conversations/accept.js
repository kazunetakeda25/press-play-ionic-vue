const functions = require("firebase-functions");
const union = require("lodash/union");

const { firestore } = require("../../admin");
const utils = require("../utils");

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
      "You can't accept this message."
    );
  }

  // Build conversation update
  let conversationUpdate = {
    accepted: true
  };

  // Build transactions
  let recordsToUpdate = [
    {
      ref: conversation.ref,
      data: conversationUpdate
    }
  ];
  let recordsToDelete = [];

  // Get any archived conversations that need to be deleted
  let archivedDoc = await firestore
    .collection("users")
    .doc(uid)
    .collection("archived_conversations")
    .doc(conversation.id)
    .get();

  if (archivedDoc.exists && archivedDoc.get("rejected") === true) {
    recordsToDelete.push(archivedDoc.ref);
  }

  // Save to firestore
  const deleteTransactions = recordsToDelete.map(async doc => {
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
  const updateTransactions = recordsToUpdate.map(async record => {
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

  let promises = union(deleteTransactions, updateTransactions);
  await Promise.all(promises);

  // Return fresh conversation object
  let conversationObj = await conversationRef.get().then(snapshot => {
    return Object.assign({}, snapshot.data(), {
      id: snapshot.id,
      path: snapshot.ref.path
    });
  });

  return conversationObj;
});
