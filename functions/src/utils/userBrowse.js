const moment = require("moment");
const filter = require("lodash/filter");
const find = require("lodash/find");
const sample = require("lodash/sample");

const { firestore } = require("../../admin");
const avatar = require("./avatar");
const blockedUsers = require("./blockedUsers");
const songmates = require("./songmates");

class UserBrowse {
  constructor() {
    this.unknownUser = {
      age: "",
      avatars: avatar.getObject(),
      bannerImages: [],
      birthdate: "",
      bio: "",
      displayName: "User Unknown",
      firstname: "User",
      lastname: "Unknown",
      gender: "",
      location: ""
    };
  }

  getAge(birthdate) {
    let start = new moment(birthdate, "YYYY-MM-DD", true);
    let end = new moment();
    return end.diff(start, "years");
  }

  async getBrowseDoc(
    user1,
    user2,
    doc = null,
    songmate = null,
    runTransaction = true
  ) {
    // Setup browserDoc
    let userPair = `${user1}:${user2}`;
    let browseDocs = await firestore
      .collection("users_browse")
      .where("userPair", "==", userPair)
      .limit(1)
      .get();

    // Setup data container
    let data = {
      isSongmate: false,
      songmate: null,
      profile: null,
      user1: user1,
      user2: user2,
      userPair: userPair
    };

    // If no userDoc passed, look it up
    let userDoc = doc;
    if (doc === null) {
      userDoc = await firestore
        .collection("users")
        .doc(user2)
        .get()
        .then(snapshot => {
          return snapshot.data();
        });

      if (userDoc === undefined) {
        data.profile = this.unknownUser;
      }
    }

    // Check that neither user has blocked the other
    let user1blocked2 = await blockedUsers.isUserBlocked(user1, user2);
    let user2blocked1 = await blockedUsers.isUserBlocked(user2, user1);

    // One of the users has blocked the other, getBlockedProfileObject
    if (user1blocked2 || user2blocked1) {
      data.profile = this.getBlockedProfileObject(user2, userDoc);
    }

    // If data.profile is null, run getProfileObject
    if (data.profile === null) {
      // Default loggedInUserLevel
      // Default to 2 to represent logged in user
      let loggedInUserLevel = 2;

      // Process songmate
      if (songmate === null) {
        let songmateLookup = await songmates.lookup(user1, user2);
        data.isSongmate = songmateLookup.isSongmate;
        if (songmateLookup.isSongmate && songmateLookup.songmateData !== null) {
          data.songmate = firestore.doc(songmateLookup.songmateData.path);
          loggedInUserLevel = 1;
        }
      } else {
        data.isSongmate = songmate.isSongmate;
        if (songmate.songmatePath !== null) {
          data.songmate = firestore.doc(songmate.songmatePath);
        }
        if (songmate.isSongmate) {
          loggedInUserLevel = 1;
        }
      }

      // Get profile object
      data.profile = await this.getProfileObject(
        userDoc,
        user2,
        loggedInUserLevel
      );
    }

    // Setup browserDoc
    let browseDoc = null;
    let transactionType = "set";
    if (browseDocs.empty) {
      browseDoc = firestore.collection("users_browse").doc();
    } else {
      browseDoc = browseDocs.docs[0].ref;
      transactionType = "update";
    }

    // Run transaction and return browseDoc reference
    // Otherwise, return data
    if (runTransaction) {
      let consoleMsg = {
        running: transactionType === "set" ? "Creating" : "Updating",
        success: transactionType === "set" ? "Created" : "Updated"
      };
      try {
        console.log(`${consoleMsg.running} ${browseDoc.path}.`);
        await firestore.runTransaction(transaction => {
          if (transactionType === "set") {
            transaction.set(browseDoc, data);
          } else {
            transaction.update(browseDoc, data);
          }
          return Promise.resolve();
        });
        console.log(`${consoleMsg.success} ${browseDoc.path}.`);
      } catch (err) {
        console.error(
          `Error ${consoleMsg.running.toLowerCase()} ${browseDoc.path}`,
          err
        );
      }

      return browseDoc;
    } else {
      return { ref: browseDoc, type: transactionType, data: data };
    }
  }

  async getBlockedProfileObject(uid, doc = null) {
    // If no userDoc passed, look it up
    let userDoc = doc;
    if (doc === null) {
      userDoc = await firestore
        .collection("users")
        .doc(uid)
        .get()
        .then(snapshot => {
          return snapshot.data();
        });

      if (userDoc === undefined) {
        return null;
      }
    }

    // Get privacy settings
    let privacySettings = userDoc.settings.privacy;

    // Get profile data
    let profile = userDoc.profile;
    // Handle last name privacy
    if (privacySettings.lastname.display === 1) {
      profile.lastname = profile.lastname.trim().charAt(0);
    }
    // Over write other profile fields with blank values
    let profileObject = Object.assign({}, profile, {
      age: "",
      bannerImages: [],
      birthdate: "",
      bio: "",
      displayName: [profile.firstname, profile.lastname].join(" "),
      gender: "",
      location: ""
    });

    return profileObject;
  }

  async getProfileObject(userDoc, uid, loggedInUserLevel = 3) {
    console.log(`User Doc`, userDoc);
    console.log(`Uid`, uid);
    console.log(`Logged In User Level`, loggedInUserLevel);

    // Get user objects
    let privacySettings = userDoc.settings.privacy;
    let profile = userDoc.profile;

    // If loggedInUserLevel > privacySettings.profile.level rejectUser
    if (loggedInUserLevel > privacySettings.profile.level) {
      return null;
    }

    // Always override profile.location
    let locationText = profile.location.text;
    profile.location = locationText;

    // Get user age
    let age = this.getAge(profile.birthdate);

    // Set profile.age
    // If birthdate is hidden via privacy settings, setup an age range
    // Otherwise just return the age
    if (loggedInUserLevel > privacySettings.birthdate.level) {
      // Make sure the minmum age is always atleast 18
      let minAge = age <= 21 ? 18 : age - 3;
      profile.age = {
        min: minAge,
        max: age + sample([3, 4, 5])
      };
    } else {
      profile.age = {
        min: age,
        max: age
      };
    }

    // Handle user privacy display settings
    if (privacySettings.birthdate.display === 1) {
      profile.birthdate = age;
    }
    if (privacySettings.lastname.display === 1) {
      profile.lastname = profile.lastname.charAt(0);
    }

    // Handle user privacy.level settings on profile fields
    Object.keys(privacySettings).forEach(key => {
      if (key === "profile") {
        return;
      }
      if (loggedInUserLevel > privacySettings[key].level) {
        profile[key] = "";
      }
    });

    // Set displayName
    profile.displayName = [profile.firstname, profile.lastname].join(" ");

    // Set bannerImages
    profile.bannerImages = [];

    // Get songstory_answers to build bannerImages
    let songstoryAnswers = await firestore
      .collection("songstory_answers")
      .where("uid", "==", uid)
      .get()
      .then(snapshot => {
        return snapshot.docs.map(doc =>
          Object.assign({}, doc.data(), { question: doc.data().question.path })
        );
      });

    // Handle songstory_answers privacy
    songstoryAnswers = filter(
      songstoryAnswers,
      answer => loggedInUserLevel <= answer.privacy
    );

    // Cycle through answers and pull image urls
    songstoryAnswers.forEach(answer => {
      answer.data.forEach(item => {
        let images = [];

        // Get images by item.type
        if (
          (item.type === "artist" || item.type === "album") &&
          Object.prototype.hasOwnProperty.call(item, "images") &&
          Array.isArray(item.images)
        ) {
          images = item.images;
        }
        if (
          item.type === "track" &&
          Object.prototype.hasOwnProperty.call(item, "album") &&
          Object.prototype.hasOwnProperty.call(item.album, "images") &&
          Array.isArray(item.album.images)
        ) {
          images = item.album.images;
        }
        if (
          item.type === "genre" &&
          Object.prototype.hasOwnProperty.call(item, "icons") &&
          Array.isArray(item.icons)
        ) {
          images = item.icons;
        }

        // Filter images for widths between 150 - 300, otherwise return the first image in array
        if (images.length > 0) {
          let image = find(
            images,
            i => i.width !== null && i.width <= 300 && i.width >= 150
          );
          if (typeof image !== "undefined") {
            profile.bannerImages.push(image.url);
          } else {
            profile.bannerImages.push(images[0].url);
          }
        }
      });
    });

    return profile;
  }
}

module.exports = new UserBrowse();
