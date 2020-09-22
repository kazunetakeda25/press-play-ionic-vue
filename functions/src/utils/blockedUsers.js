const { firestore } = require("../../admin");

class BlockedUsers {
  async getBlockedUsers(uid) {
    return await firestore
      .collection("users")
      .doc(uid)
      .collection("blocked_users")
      .get()
      .then(querySnapshot => {
        return querySnapshot.docs.map(doc => doc.id);
      });
  }

  async isUserBlocked(uid, checkUid) {
    let blockedUsers = await this.getBlockedUsers(uid);
    return blockedUsers.indexOf(checkUid) !== -1;
  }
}

module.exports = new BlockedUsers();
