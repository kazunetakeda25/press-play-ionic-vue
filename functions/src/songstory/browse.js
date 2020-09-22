const functions = require("firebase-functions");
const filter = require("lodash/filter");

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

  // Setup rejectUser function to 404
  // Avoids hinting user privacy settings and status.
  let rejectUser = function() {
    throw new functions.https.HttpsError("not-found", "User not found.");
  };

  // Get user to browse
  let user = await auth
    .getUser(data.uid)
    .then(user => {
      return user;
    })
    .catch(() => {
      rejectUser();
    });

  // Get userDoc
  let userDoc = await firestore
    .collection("users")
    .doc(user.uid)
    .get()
    .then(snapshot => {
      return snapshot.data();
    });

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
      throw new functions.https.HttpsError(
        "permission-denied",
        "This SongStory has been disabled."
      );
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

  // If loggedInUserLevel > privacySettings.profile.level rejectUser
  if (loggedInUserLevel > privacySettings.profile.level) {
    rejectUser();
  }

  // Get SongStory answers
  let songstory = await firestore
    .collection("songstory_answers")
    .where("uid", "==", user.uid)
    .get()
    .then(snapshot => {
      return snapshot.docs.map(doc =>
        Object.assign({}, doc.data(), { question: doc.data().question.path })
      );
    });

  // // Handle songstory privacy
  songstory = filter(songstory, answer => loggedInUserLevel <= answer.privacy);

  // Remove the privacy key
  songstory.forEach(answer => {
    delete answer.privacy;
  });

  // Return data objects
  return songstory;
});
