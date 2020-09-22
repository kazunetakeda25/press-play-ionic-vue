const functions = require("firebase-functions");
const isEqual = require("lodash/isEqual");

const { auth, firestore, firestoreObj } = require("../../../admin");

module.exports = functions.firestore
  .document("conversations/{id}")
  .onUpdate(async (change, context) => {
    const conversationId = context.params.id;

    // Retrieve the current and previous value
    const data = change.after.data();
    const previousData = change.before.data();

    // If no change in enabled status, return
    if (isEqual(data.enabled, previousData.enabled)) {
      return null;
    }

    // If conversation disabled, move conversation to users archived messages
    if (data.enabled === false) {
      let recordsToSave = [];
      let timestamp = firestoreObj.FieldValue.serverTimestamp();

      // Get user1
      let user1 = await auth
        .getUser(data.user1)
        .then(user => {
          return user;
        })
        .catch(() => {
          return null;
        });

      if (user1) {
        let user1ArchiveDoc = firestore
          .collection("users")
          .doc(user1.uid)
          .collection("archived_conversations")
          .doc(conversationId);
        let user1ArchiveDocData = {
          archived: true,
          timestamp: timestamp
        };
        recordsToSave.push({
          ref: user1ArchiveDoc,
          data: user1ArchiveDocData
        });
      }

      // Get user2
      let user2 = await auth
        .getUser(data.user2)
        .then(user => {
          return user;
        })
        .catch(() => {
          return null;
        });

      if (user2) {
        let user2ArchiveDoc = firestore
          .collection("users")
          .doc(user2.uid)
          .collection("archived_conversations")
          .doc(conversationId);
        let user2ArchiveDocData = {
          archived: true,
          timestamp: timestamp
        };
        recordsToSave.push({
          ref: user2ArchiveDoc,
          data: user2ArchiveDocData
        });
      }

      const saveTransactions = recordsToSave.map(async record => {
        try {
          console.log(`Saving: '${record.ref.path}' in Cloud Firestore.`);
          await firestore.runTransaction(transaction => {
            transaction.set(record.ref, record.data);
            return Promise.resolve();
          });
          console.log(`Saving: '${record.ref.path}' in Cloud Firestore.`);
        } catch (err) {
          console.error(
            `Error when saving: '${record.ref.path}' in Cloud Firestore.`,
            err
          );
        }
      });

      return Promise.all(saveTransactions);
    }

    return null;
  });
