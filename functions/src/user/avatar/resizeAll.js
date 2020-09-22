const functions = require("firebase-functions");
const mkdirp = require("mkdirp");

const { auth, storage, firestore } = require("../../../admin");
const utils = require("../../utils");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  // Get bucket files
  const bucket = storage.bucket();
  let files = [];
  await bucket.getFiles({ prefix: "avatars/" }).then(data => {
    return (files = data[0]);
  });

  // Data object to return
  let resized = [];

  // Cycle through bucket files
  await Promise.all(
    files.map(async file => {
      // File and directory paths.
      const filePath = file.name;
      const { tempLocalFile, tempLocalDir } = utils.avatar.getTempAssets(
        filePath
      );
      const contentType = file.metadata.contentType; // This is the image MIME type

      // Exit if this is triggered on a file that is not an image.
      if (!contentType.startsWith("image/") || filePath.endsWith(".svg")) {
        return console.log("This is not an image.");
      }

      // Check if already a thumbnail
      if (filePath.contains(utils.avatar.thumbPrefix)) {
        return console.log("Skipping thumbnail.");
      }

      // Setup local files for upload
      let localFiles = [];

      // Get UID from filename
      const fileParts = filePath.split("/");
      const uid = fileParts[1];

      // Create the temp directory where the file will be written.
      await mkdirp(tempLocalDir);

      // Add temp directory for later cleanup
      utils.tempFiles.addDirectory(tempLocalDir);

      // Download file
      await file.download({ destination: tempLocalFile });

      // Add file for later cleanup
      utils.tempFiles.addFile(tempLocalFile);

      // Avatar object
      let avatars = utils.avatar.getObject();

      // Get original file url
      avatars.original = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(filePath)}?alt=media&token=${
        file.metadata.metadata.firebaseStorageDownloadTokens
      }`;

      // Resize avatar
      let thumbs = await utils.avatar.resize(filePath, contentType);
      thumbs.forEach(thumb => localFiles.push(thumb));

      // Upload files
      await Promise.all(
        localFiles.map(async localFile => {
          await utils.storage
            .uploadLocalFile(
              localFile.local,
              localFile.remote,
              localFile.contentType
            )
            .then(url => (avatars[localFile.size] = url));
        })
      );

      // Link avatars to user doc
      await firestore
        .collection("users")
        .doc(uid)
        .update({ "profile.avatars": avatars });

      // Link avatars.md to user.photoURL
      await auth.updateUser(uid, { photoURL: avatars.md });

      return resized.push(filePath);
    })
  );

  // Delete temp files
  utils.tempFiles.clean();

  return {
    resized: resized
  };
});
