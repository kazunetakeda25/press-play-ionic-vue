const functions = require("firebase-functions");
const union = require("lodash/union");
const { firestore } = require("../../admin");

module.exports = functions.auth.user().onDelete(async user => {
  // Grab the UID
  const uid = user.uid;

  // Setup records to delete
  let recordsToDelete = [];

  // Get songstory_answers to delete
  await firestore
    .collection("songstory_answers")
    .where("uid", "==", uid)
    .get()
    .then(querySnapshot => {
      return querySnapshot.docs.map(doc => recordsToDelete.push(doc.ref));
    });

  // Get matchedBy songmates to delete
  await firestore
    .collection("songmates")
    .where("matchedBy", "==", uid)
    .get()
    .then(querySnapshot => {
      return querySnapshot.docs.map(doc => recordsToDelete.push(doc.ref));
    });

  // Get matchedTo songmates to delete
  await firestore
    .collection("songmates")
    .where("matchedTo", "==", uid)
    .get()
    .then(querySnapshot => {
      return querySnapshot.docs.map(doc => recordsToDelete.push(doc.ref));
    });

  // Setup records to update
  let recordsToUpdate = [];

  // Get conversations in user1
  await firestore
    .collection("conversations")
    .where("user1", "==", uid)
    .get()
    .then(querySnapshot => {
      return querySnapshot.docs.map(doc => ({
        ref: recordsToUpdate.push(doc.ref),
        data: { enabled: false }
      }));
    });

  // Get conversations in user2
  await firestore
    .collection("conversations")
    .where("user2", "==", uid)
    .get()
    .then(querySnapshot => {
      return querySnapshot.docs.map(doc => ({
        ref: recordsToUpdate.push(doc.ref),
        data: { enabled: false }
      }));
    });

  // Build transactions
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

  // Run transactions
  const promises = union(deleteTransactions, updateTransactions);
  return Promise.all(promises);
});
