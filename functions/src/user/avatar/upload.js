const functions = require("firebase-functions");
const fs = require("fs");
const mkdirp = require("mkdirp");

const { auth, firestore } = require("../../../admin");
const utils = require("../../utils");

module.exports = functions.https.onCall(async (data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  // Check if valid base64 data url
  if (
    !Object.prototype.hasOwnProperty.call(data, "image") &&
    !data.image.startsWith("data:image/jpeg;base64,")
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid dataURL."
    );
  }

  // Setup image data
  const base64String = data.image.replace("data:image/jpeg;base64,", "");
  const imageBuffer = Buffer.from(base64String, "base64");
  const contentType = "image/jpeg"; // This is the image MIME type

  // Setup files and directories
  let files = [];
  const filePath = `avatars/${context.auth.uid}`;
  const { tempLocalFile, tempLocalDir } = utils.avatar.getTempAssets(filePath);

  // Create new avatar object
  let avatars = utils.avatar.getObject();

  // Create the temp directory where the file will be written.
  await mkdirp(tempLocalDir);

  // Add temp directory for later cleanup
  utils.tempFiles.addDirectory(tempLocalDir);

  // Write temp file
  fs.writeFileSync(tempLocalFile, imageBuffer);

  // Add temp file for later cleanup
  utils.tempFiles.addFile(tempLocalFile);

  // Push to files array for upload
  files.push({
    local: tempLocalFile,
    remote: filePath,
    contentType: contentType,
    size: "original"
  });

  // Resize avatar
  let thumbs = await utils.avatar.resize(filePath, contentType);
  // Push to files array for upload
  thumbs.forEach(thumb => files.push(thumb));

  // Upload files
  await Promise.all(
    files.map(async file => {
      await utils.storage
        .uploadLocalFile(file.local, file.remote, file.contentType)
        .then(url => (avatars[file.size] = url));
    })
  );

  // Link avatars to user doc
  await firestore
    .collection("users")
    .doc(context.auth.uid)
    .update({ "profile.avatars": avatars });

  // Link avatars.md to user.photoURL
  await auth.updateUser(context.auth.uid, { photoURL: avatars.md });

  // Delete temp files
  utils.tempFiles.clean();

  return {
    avatars: avatars
  };
});
