const functions = require("firebase-functions");
const { firestore } = require("../../../../admin");
const utils = require("../../../utils");

module.exports = functions.firestore
  .document("users/{userId}/blocked_users/{blockedUid}")
  .onDelete(async (snapshot, context) => {
    // Get user vars
    let user1 = context.params.userId;
    let user2 = context.params.blockedUid;
    let userPairs = [`${user1}:${user2}`, `${user2}:${user1}`];

    // Check that neither user has blocked the other
    let user1blocked2 = await utils.blockedUsers.isUserBlocked(user1, user2);
    let user2blocked1 = await utils.blockedUsers.isUserBlocked(user2, user1);

    // One of the users has blocked the other, return null
    if (user1blocked2 || user2blocked1) {
      return null;
    }

    // Get any conversations that need to be enabled
    let conversationsToEnable = [];
    await firestore
      .collection("conversations")
      .where("userPair", "in", userPairs)
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc =>
          conversationsToEnable.push(doc.ref)
        );
      });

    // Update users_browse
    await utils.userBrowse.getBrowseDoc(user1, user2, null, {
      isSongmate: false,
      songmatePath: null
    });
    await utils.userBrowse.getBrowseDoc(user2, user1, null, {
      isSongmate: false,
      songmatePath: null
    });

    // Transactions
    const conversationTransactions = conversationsToEnable.map(async doc => {
      try {
        console.log(`Updating: '${doc.path}' in Cloud Firestore.`);
        await firestore.runTransaction(transaction => {
          transaction.update(doc, { enabled: true });
          return Promise.resolve();
        });
        console.log(`Updating: '${doc.path}' in Cloud Firestore.`);
      } catch (err) {
        console.error(
          `Error when updating: '${doc.path}' in Cloud Firestore.`,
          err
        );
      }
    });

    return Promise.all(conversationTransactions);
  });
