const functions = require("firebase-functions");
const { auth, database } = require("../../admin");

module.exports = functions.auth.user().onCreate(user => {
  let customClaims = {
    admin: false,
    accessLevel: 1
  };

  // Setup admin user for emails ending with @pressplay.me
  if (user.email && user.email.endsWith("@pressplay.me")) {
    customClaims.admin = true;
    customClaims.accessLevel = 9;
  }

  // Set custom user claims on this newly created user.
  return auth
    .setCustomUserClaims(user.uid, customClaims)
    .then(() => {
      // Update real-time database to notify client to force refresh.
      const metadataRef = database.ref("metadata/" + user.uid);
      // Set the refresh time to the current UTC timestamp.
      // This will be captured on the client to force a token refresh.
      return metadataRef.set({ refreshTime: new Date().getTime() });
    })
    .catch(err => {
      console.error(`Failed to set custom claims for ${user.uid}`, err);
    });
});
