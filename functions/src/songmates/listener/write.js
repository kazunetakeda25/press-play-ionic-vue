const functions = require("firebase-functions");
const union = require("lodash/union");
const { firestore } = require("../../../admin");

module.exports = functions.firestore
  .document("songmates/{id}")
  .onWrite(async change => {
    // If deleted
    if (change.after.exists === false) {
      let data = change.before.data();

      // Setup transaction records
      let recordsToDelete = [];
      let recordsToUpdate = [];

      // Add matchedTo and matchedBy to records to delete
      if (data.matchedByDoc) {
        recordsToDelete.push(data.matchedByDoc);
      }
      if (data.matchedToDoc) {
        recordsToDelete.push(data.matchedToDoc);
      }

      let ref = change.before.ref;

      // Get users_browse docs and update
      let usersBrowse = await firestore
        .collection("users_browse")
        .where("songmate", "==", ref)
        .get();

      usersBrowse.docs.forEach(userBrowse => {
        recordsToUpdate.push({
          ref: userBrowse.ref,
          data: {
            isSongmate: false,
            songmate: null
          }
        });
      });

      // Update songates_disliked for matchedBy
      let matchedByDisliked = await firestore
        .collection("users")
        .doc(data.matchedBy)
        .collection("songmates_disliked")
        .where("songmate", "==", ref)
        .get();

      matchedByDisliked.docs.forEach(matchedByDislike => {
        recordsToUpdate.push({
          ref: matchedByDislike.ref,
          data: {
            songmate: null
          }
        });
      });

      // Update songates_disliked for matchedTo
      let matchedToDisliked = await firestore
        .collection("users")
        .doc(data.matchedTo)
        .collection("songmates_disliked")
        .where("songmate", "==", ref)
        .get();

      matchedToDisliked.docs.forEach(matchedToDislike => {
        recordsToUpdate.push({
          ref: matchedToDislike.ref,
          data: {
            songmate: null
          }
        });
      });

      // Run transactions
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

      return Promise.all(promises);
    } else {
      return null;
    }
  });
