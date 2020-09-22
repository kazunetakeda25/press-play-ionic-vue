import filter from "lodash/filter";
import geohash from "ngeohash";
import moment from "moment";
export default {
  data() {
    return {
      removingArchivedConversation: false,
      removingSongmatesDisliked: false,
      savingProfile: false,
      savingSeeking: false,
      savingSettings: false,
      savingSetup: false,
      savingTerms: false,
      updatingSongmate: false,
      userBlockAdding: false,
      userBlockRemoving: false
    };
  },

  watch: {
    userData: {
      handler: function(userData) {
        this.$store.commit("User/updateUserData", userData);
      },
      deep: true
    }
  },

  methods: {
    removeArchivedConversation(conversationId) {
      let vm = this;
      let removeArchived = vm.$fireFunc.httpsCallable(
        "user-conversations-archived-remove"
      );

      vm.removingArchivedConversation = true;

      return removeArchived({ conversation: conversationId })
        .then(() => {
          vm.$emit("removedArchivedConversation", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("removedArchivedConversation", false);
          return vm.$error(
            "We couldn't remove this conversation from your archives. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.removeArchivedConversation(conversationId)
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.removingArchivedConversation = false;
        });
    },

    removeSongmatesDisliked(id) {
      let vm = this;
      let userRemoveSongmatesDisliked = vm.$fireFunc.httpsCallable(
        "user-removeSongmatesDisliked"
      );

      vm.removingSongmatesDisliked = true;

      return userRemoveSongmatesDisliked({ id: id })
        .then(() => {
          vm.$store.dispatch("User/getSongmatesDisliked");
          vm.$emit("removedSongmatesDisliked", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("removedSongmatesDisliked", false);
          return vm.$error(
            "We couldn't delete this cleared match. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.removeSongmatesDisliked(id)
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.removingSongmatesDisliked = false;
        });
    },

    settingsReducer(settings) {
      let reduced = Object.assign({}, settings);

      // Reduce clearedQuestions
      if (Object.prototype.hasOwnProperty.call(settings, "clearedQuestions")) {
        let clearedQuestions = [];
        settings.clearedQuestions.forEach(function(clearedQuestion) {
          if (typeof clearedQuestion === "object") {
            clearedQuestions.push(clearedQuestion.id);
          } else {
            clearedQuestions.push(clearedQuestion);
          }
        });
        reduced.clearedQuestions = clearedQuestions;
      }

      return reduced;
    },

    saveProfile() {
      let vm = this;
      let userUpdateProfile = vm.$fireFunc.httpsCallable("user-update-profile");

      vm.savingProfile = true;

      return userUpdateProfile(vm.userData.profile)
        .then(() => {
          vm.$emit("profileSaved", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("profileSaved", false);
          return vm.$error(
            "We couldn't save your changes. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.saveProfile()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.savingProfile = false;
        });
    },

    saveSeeking() {
      let vm = this;
      let userUpdateSeeking = vm.$fireFunc.httpsCallable("user-update-seeking");

      vm.savingSeeking = true;

      return userUpdateSeeking(vm.userData.seeking)
        .then(() => {
          vm.$emit("seekingSaved", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("seekingSaved", false);
          return vm.$error(
            "We couldn't save your changes. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.saveSeeking()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.savingSeeking = false;
        });
    },

    saveSettings() {
      let vm = this;
      let settingsUpdate = vm.settingsReducer(vm.userData.settings);
      let userUpdateSettings = vm.$fireFunc.httpsCallable(
        "user-update-settings"
      );

      vm.savingSettings = true;

      return userUpdateSettings(settingsUpdate)
        .then(() => {
          vm.$emit("settingsSaved", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("settingsSaved", false);
          return vm.$error(
            "We couldn't save your changes. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.saveSettings()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.savingSettings = false;
        });
    },

    saveSetup() {
      let vm = this;
      let current = vm.$route.name;
      let nextStep = vm.$options.next;
      let complete =
        typeof vm.$options.lastStep !== "undefined"
          ? vm.$options.lastStep
          : false;
      let next = complete ? "" : nextStep; // If complete, blank out the next var to save to the DB

      // Check if already complete before assigning new value
      if (!vm.userData.setup.complete) {
        vm.userData.setup.complete = complete;
      }
      vm.userData.setup.next = next;

      if (vm.userData.setup.completed.indexOf(current) == -1) {
        vm.userData.setup.completed.push(current);
      }

      let userUpdateSetup = vm.$fireFunc.httpsCallable("user-update-setup");

      vm.savingSetup = true;

      return userUpdateSetup(vm.userData.setup)
        .then(() => {
          vm.$router.push({ name: nextStep });
        })
        .catch(err => {
          console.error(err.message, err);
          return vm.$error(
            "We couldn't save your changes. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.saveSetup()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.savingSetup = false;
        });
    },

    setLocation(location) {
      if (
        Object.prototype.hasOwnProperty.call(location, "selected") &&
        Object.keys(location.selected).length > 0
      ) {
        const firestore = this.$fireStoreObj;
        let geopoint = new firestore.GeoPoint(
          location.selected.geometry.coordinates[1],
          location.selected.geometry.coordinates[0]
        );
        this.userData.profile.location.geo = geopoint;
        this.userData.profile.location.hash = geohash.encode(
          geopoint.latitude,
          geopoint.longitude
        );
        this.userData.profile.location.text = location.text;
      } else {
        this.userData.profile.location.geo = {};
        this.userData.profile.location.hash = "";
        this.userData.profile.location.text = "";
      }
    },

    updateSongmate(songmate) {
      let vm = this;
      let updateSongmate = vm.$fireFunc.httpsCallable("user-update-songmate");

      vm.updatingSongmate = true;

      return updateSongmate(songmate)
        .then(() => {
          vm.$store.dispatch("User/getSongmates");
          vm.$emit("songmateUpdated", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("songmateUpdated", false);
          return vm.$error(
            `We couldn't update your SongMate. This is probably just temporary, try again.`,
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Confirm",
                  cssClass: "danger",
                  handler: () => vm.updateSongmate(songmate)
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.updatingSongmate = false;
        });
    },

    userBlockAdd(uid) {
      let vm = this;
      let userBlockAdd = vm.$fireFunc.httpsCallable("user-block-add");

      vm.userBlockAdding = true;

      return userBlockAdd({ uid: uid })
        .then(() => {
          vm.$store.dispatch("User/getBlockedUsers").then(() => {
            // Let's double check that the blocked user made it from the server response
            // If not, lets manually add it
            if (vm.blockedUsersIds.indexOf(uid) === -1) {
              vm.$store.commit("User/addBlockedUser", uid);
            }
          });
          vm.$emit("userBlockAdded", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("userBlockAdded", false);
          return vm.$error(
            "We couldn't block this user. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.userBlockAdd(uid)
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.userBlockAdding = false;
        });
    },

    userBlockRemove(uid) {
      let vm = this;
      let userBlockRemove = vm.$fireFunc.httpsCallable("user-block-remove");

      vm.userBlockRemoving = true;

      return userBlockRemove({ uid: uid })
        .then(() => {
          vm.$emit("userBlockRemoved", true);
        })
        .catch(err => {
          console.error(err.message, err);
          vm.$emit("userBlockRemoved", false);
          return vm.$error(
            "We couldn't unblock this user. It's probably just temporary, please try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.userBlockRemove(uid)
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.userBlockRemoving = false;
        });
    }
  },

  computed: {
    user() {
      return this.$store.state.User.user;
    },

    userData() {
      return this.$store.getters["User/userData"];
    },

    age() {
      let age = "";
      let birthdate = new moment(
        this.userData.profile.birthdate,
        "YYYY-MM-DD",
        true
      );
      if (birthdate.isValid()) {
        let end = new moment();
        age = end.diff(birthdate, "years");
      } else {
        age = "?";
      }
      return age;
    },

    blockedUsersIds() {
      return this.$store.state.User.blockedUsers.map(o => o.uid);
    },

    dislikedUsersIds() {
      return this.$store.state.User.songmatesDisliked.map(o => o.uid);
    },

    displayName() {
      let strings = [];
      if (this.userData.profile.firstname) {
        strings.push(this.userData.profile.firstname.trim());
      }
      if (this.userData.profile.lastname) {
        strings.push(this.userData.profile.lastname.trim());
      }
      return strings.join(" ");
    },

    maximumBirthdate() {
      let date = new moment();
      date.subtract(18, "years");
      return date.format("YYYY-MM-DD");
    },

    validBasics() {
      return (
        this.userData.profile.firstname !== "" &&
        this.userData.profile.lastname !== "" &&
        this.validBirthdate &&
        this.validLocation
      );
    },

    validBirthdate() {
      let end = new moment();
      let birthdate = new moment(
        this.userData.profile.birthdate,
        "YYYY-MM-DD",
        true
      );
      if (birthdate.isValid()) {
        let age = end.diff(birthdate, "years");
        return age >= 18;
      } else {
        return false;
      }
    },

    validGender() {
      return (
        this.userData.profile.gender.identity !== "" &&
        this.userData.profile.gender.expression !== "" &&
        this.userData.profile.gender.orientation !== "" &&
        this.userData.profile.gender.pronoun !== ""
      );
    },

    validLocation() {
      return (
        Object.keys(this.userData.profile.location.geo).length > 0 &&
        this.userData.profile.location.hash !== "" &&
        this.userData.profile.location.text !== ""
      );
    },

    validSeeking() {
      let enabled = filter(this.userData.seeking.relationships, {
        enabled: true
      });
      let hasIdentities = true;
      let hasExpressions = true;
      let hasOrientations = true;
      let hasPronouns = true;

      enabled.forEach(function(relationship) {
        if (hasIdentities && relationship.identities.length == 0) {
          hasIdentities = false;
        }
        if (hasExpressions && relationship.expressions.length == 0) {
          hasExpressions = false;
        }
        if (hasOrientations && relationship.orientations.length == 0) {
          hasOrientations = false;
        }
        if (hasPronouns && relationship.pronouns.length == 0) {
          hasPronouns = false;
        }
      });

      return (
        enabled.length > 0 && hasIdentities && hasExpressions && hasOrientations
      );
    }
  }
};
