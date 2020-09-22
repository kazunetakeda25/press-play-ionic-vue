const functions = require("firebase-functions");
const isEqual = require("lodash/isEqual");

const { firestore, firestoreObj } = require("../../../../admin");

module.exports = functions.firestore
  .document("songstory_questions/{id}")
  .onWrite(async change => {
    // If deleted, delete songstory_answers
    if (change.after.exists === false) {
      // Setup records to delete
      let recordsToDelete = [];

      // Add answers to delete
      await firestore
        .collection("songstory_answers")
        .where("question", "==", change.before.ref)
        .get()
        .then(querySnapshot => {
          return querySnapshot.docs.map(doc => recordsToDelete.push(doc.ref));
        });

      // Run transactions
      const promises = recordsToDelete.map(async doc => {
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
      return Promise.all(promises);
    }

    // Retrieve the current and previous value
    const data = change.after.data();
    const previousData = change.before.exists ? change.before.data() : {};

    let changeSet = {};

    // Set created property if it doesn't exist
    if (!Object.prototype.hasOwnProperty.call(data, "created")) {
      changeSet.created = firestoreObj.FieldValue.serverTimestamp();
    }

    // We'll only update if data has changed.
    // This is crucial to prevent infinite loops.
    delete data.updated;
    delete previousData.updated;
    if (Object.keys(changeSet).length === 0 && isEqual(data, previousData)) {
      return null;
    } else {
      changeSet.updated =
        typeof changeSet.created === "undefined"
          ? firestoreObj.FieldValue.serverTimestamp()
          : changeSet.created;
    }

    if (Object.keys(changeSet).length > 0) {
      return change.after.ref.set(changeSet, { merge: true });
    } else {
      return null;
    }
  });
