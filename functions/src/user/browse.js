const functions = require("firebase-functions");

const { auth, firestore } = require("../../admin");
const utils = require("../utils");

module.exports = functions.https.onCall(async (data, context) => {
  // Check for valid UID string
  if (
    !Object.prototype.hasOwnProperty.call(data, "uid") &&
    typeof data.uid !== "string" &&
    data.uid.length > 0 === false &&
    data.uid.length <= 128 === false
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid uid."
    );
  }

  // Get loggedInUser
  let loggedInUser = context.auth;

  // Get user to browse
  let user = await auth
    .getUser(data.uid)
    .then(user => {
      return user;
    })
    .catch(() => {
      return null;
    });

  if (!user) {
    return utils.userBrowse.unknownUser;
  }

  // Get userDoc
  let userDoc = await firestore
    .collection("users")
    .doc(user.uid)
    .get()
    .then(snapshot => {
      return snapshot.data();
    });

  if (!userDoc) {
    return utils.userBrowse.unknownUser;
  }

  // Setup songmateLookup
  let songmateLookup = {
    isSongmate: false,
    songmateDoc: null
  };

  // Setup privacy check vars
  let loggedInUserLevel = 3;
  let privacySettings = userDoc.settings.privacy;

  if (loggedInUser) {
    // Check if either user has blocked the other
    let user1blocked2 = await utils.blockedUsers.isUserBlocked(
      user.uid,
      loggedInUser.uid
    );
    let user2blocked1 = await utils.blockedUsers.isUserBlocked(
      loggedInUser.uid,
      user.uid
    );
    if (user1blocked2 || user2blocked1) {
      // User is blocked, return only basic information (avatars, firstname, lastname)
      let profile = await utils.userBrowse.getBlockedProfileObject(
        user.uid,
        userDoc
      );
      return profile;
    }

    // Run songmateLookup
    songmateLookup = await utils.songmates.lookup(user.uid, loggedInUser.uid);
  }

  // Update loggedInUserLevel
  if (loggedInUser) {
    loggedInUserLevel = 2;
  }
  if (loggedInUser && songmateLookup.isSongmate) {
    loggedInUserLevel = 1;
  }
  if (loggedInUser && loggedInUser.uid === user.uid) {
    loggedInUserLevel = 0;
  }

  // If loggedInUserLevel > privacySettings.profile.level return unknown user
  if (loggedInUserLevel > privacySettings.profile.level) {
    return utils.userBrowse.unknownUser;
  }

  // Get profile data
  let profile = await utils.userBrowse.getProfileObject(
    userDoc,
    user.uid,
    loggedInUserLevel
  );

  const metadata = {
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime
  };

  // Return data objects
  return {
    isSongmate: songmateLookup.isSongmate,
    profile,
    songmate: songmateLookup.songmateData,
    metadata
  };
});
