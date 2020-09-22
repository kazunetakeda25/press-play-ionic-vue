const functions = require("firebase-functions");
const utils = require("../../../utils");
module.exports = functions.firestore
  .document("users/{userId}/songmates/{songmateId}")
  .onCreate(async (snapshot, context) => {
    let uid = context.params.userId;
    let data = snapshot.data();
    let browseDoc = await utils.userBrowse.getBrowseDoc(uid, data.uid, null, {
      isSongmate: true,
      songmatePath: data.songmate.path
    });
    return snapshot.ref.update({ browse: browseDoc });
  });
