const functions = require("firebase-functions");

const { auth, firestore, storage } = require("../../../admin");
const utils = require("../../utils");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  // Logged in users UID
  let uid = context.auth.uid;

  // Remove files from Cloud Storage
  const paths = extractUserPaths(
    "{DEFAULT}/avatars/{UID},{DEFAULT}/avatars/{UID}-t-256x256,{DEFAULT}/avatars/{UID}-t-128x128,{DEFAULT}/avatars/{UID}-t-64x64,{DEFAULT}/avatars/{UID}-t-48x48,{DEFAULT}/avatars/{UID}-t-32x32",
    uid
  );
  const promises = paths.map(async path => {
    const parts = path.split("/");
    const bucketName = parts[0];
    const bucket =
      bucketName === "{DEFAULT}"
        ? storage.bucket()
        : storage.bucket(bucketName);
    const prefix = parts.slice(1).join("/");
    try {
      console.log(`Deleting: '${prefix}' from Cloud Storage`);
      await bucket.deleteFiles({
        prefix
      });
      console.log(`Deleted: '${prefix}' from Cloud Storage`);
    } catch (err) {
      if (err.code === 404) {
        console.log(
          `File: '${prefix}' does not exist in Cloud Storage, skipping`
        );
      } else {
        console.error(`Error deleting: '${prefix}' from Cloud Storage`, err);
      }
    }
  });
  await Promise.all(promises);

  // Get a blank avatar object
  let avatars = utils.avatar.getObject();

  // Save to firestore
  await firestore
    .collection("users")
    .doc(uid)
    .update({ "profile.avatars": avatars });

  // Remove photoURL in auth
  await auth.updateUser(uid, { photoURL: null });

  return {
    removed: true
  };
});
const extractUserPaths = (paths, uid) => {
  return paths.split(",").map(path => replaceUID(path, uid));
};
const replaceUID = (path, uid) => {
  return path.replace(/{UID}/g, uid);
};
