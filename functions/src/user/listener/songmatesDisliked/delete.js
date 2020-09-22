const functions = require("firebase-functions");
const { firestore } = require("../../../../admin");

module.exports = functions.firestore
  .document("users/{userId}/songmates_disliked/{lookup}")
  .onDelete(async (snapshot, context) => {
    let userId = context.params.userId;
    let lookup = snapshot.get("uid");
    let songmateDocs = await firestore
      .collection("users")
      .doc(userId)
      .collection("songmates")
      .where("uid", "==", lookup)
      .where("disliked", "==", true)
      .get();

    // Setup transactions
    let recordsToUpdate = [];

    // Cycle through songmateDocs
    songmateDocs.docs.forEach(doc => {
      recordsToUpdate.push({
        ref: doc.ref,
        data: {
          disliked: false
        }
      });
    });

    // Run transactions
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

    return Promise.all(updateTransactions);
  });
