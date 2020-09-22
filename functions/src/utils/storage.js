const { v4: uuidv4 } = require("uuid");

const { storage } = require("../../admin");

class Storage {
  async uploadLocalFile(file, destination, contentType) {
    const bucket = storage.bucket();
    const token = uuidv4();
    return bucket
      .upload(file, {
        destination: destination,
        validation: "md5",
        resumable: false,
        metadata: {
          contentType,
          metadata: { firebaseStorageDownloadTokens: token }
        }
      })
      .then(() => {
        console.log(`The file ${destination} was uploaded.`);
        return `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;
      })
      .catch(err => {
        console.log(`Unable to upload file ${err}`);
        return err;
      });
  }
}

module.exports = new Storage();
