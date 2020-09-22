const functions = require("firebase-functions");
const isEqual = require("lodash/isEqual");

const { auth } = require("../../../admin");
const utils = require("../../utils");

module.exports = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    // Set UID
    const uid = context.params.userId;

    // Retrieve the current and previous value
    const data = change.after.data();
    const previousData = change.before.data();

    // Prevent infinite loops
    if (isEqual(data, previousData)) {
      return null;
    }

    // Sync name data to firebase.auth.UserRecord.displayName
    let lastnamePrivacyUnchanged =
      Object.prototype.hasOwnProperty.call(data, "settings") &&
      Object.prototype.hasOwnProperty.call(data.settings, "privacy") &&
      Object.prototype.hasOwnProperty.call(previousData, "settings") &&
      Object.prototype.hasOwnProperty.call(previousData.settings, "privacy") &&
      isEqual(
        data.settings.privacy.lastname.display,
        previousData.settings.privacy.lastname.display
      );
    let nameUnchanged =
      isEqual(data.profile.firstname, previousData.profile.firstname) &&
      isEqual(data.profile.lastname, previousData.profile.lastname);
    if (nameUnchanged === false || lastnamePrivacyUnchanged === false) {
      let nameStrings = [];
      if (data.profile.firstname !== "") {
        nameStrings.push(data.profile.firstname.trim());
      }
      if (data.profile.lastname !== "") {
        let lastname = data.profile.lastname.trim();
        // Handle lastname privacy setting
        if (
          Object.prototype.hasOwnProperty.call(data, "settings") &&
          Object.prototype.hasOwnProperty.call(data.settings, "privacy") &&
          data.settings.privacy.lastname.display === 1
        ) {
          lastname = lastname.charAt(0);
        }
        nameStrings.push(lastname);
      }
      let displayName = nameStrings.join(" ");
      await auth.updateUser(uid, { displayName });
    }

    // Test that setup is complete
    if (!data.setup.complete) {
      return null;
    }

    // Check if users_browse needs to be updated
    let usersBrowseFieldsUnchanged =
      isEqual(data.profile, previousData.profile) &&
      isEqual(data.settings.privacy, previousData.settings.privacy);
    if (usersBrowseFieldsUnchanged === false) {
      await utils.userUpdate.updateUsersBrowse(uid, data);
    }

    // Check if songmates need to be updated
    let songmateFieldsUnchanged =
      isEqual(data.profile.gender, previousData.profile.gender) &&
      isEqual(data.profile.location, previousData.profile.location) &&
      isEqual(data.seeking, previousData.seeking);
    if (songmateFieldsUnchanged === false) {
      await utils.songmates.processUser(uid, data);
    }

    return null;
  });
