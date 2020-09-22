import moment from "moment";
import find from "lodash/find";

import UserDataMixin from "./userData";
export default {
  data() {
    return {
      browse: {},
      browseLoading: false
    };
  },
  created() {
    this.$on("optionMenuSelected", function(value) {
      this.optionSelected(value);
    });
    this.$on("removedSongmatesDisliked", function(removed) {
      if (removed) {
        this.$store.commit("Matches/active", {});
      }
    });
    this.$on("userBlockAdded", function(blocked) {
      if (blocked) {
        this.$store.commit("Matches/active", {});
      }
    });
    this.$on("userBlockRemoved", function(removed) {
      if (removed) {
        this.$store.commit("Matches/active", {});
      }
    });
  },
  methods: {
    block() {
      let vm = this;
      return vm.$error(
        `This will block ${vm.browse.profile.displayName} from being able to communicate with you, and they will be removed from your matches.`,
        {
          header: "Confirm Block",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: () => {
                return vm.userBlockAdd(vm.uid).then(() => {
                  vm.$toast("User has been blocked.");
                });
              }
            }
          ]
        }
      );
    },
    dislike() {
      let vm = this;
      return vm.$error(
        `This will move ${vm.browse.profile.displayName} to your Cleared Matches. ${vm.browse.profile.firstname} will no longer be eligable to match with you.`,
        {
          header: "Confirm Remove",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: () =>
                vm.saveSongmate({ disliked: true }).then(() => {
                  vm.$emit("songmateDisliked", true);
                })
            }
          ]
        }
      );
    },
    getUserBrowse(payload) {
      let vm = this;
      let found = null;

      // Check for browse doc in conversations
      let conversation = find(
        vm.$store.getters["Conversations/conversations"],
        o => o.user1 === payload.uid || o.user2 === payload.uid
      );
      if (typeof conversation !== "undefined") {
        if (
          conversation.user1 == payload.uid &&
          typeof conversation.user2Browse === "object"
        ) {
          found = conversation.user2Browse;
        }
        if (
          conversation.user2 == payload.uid &&
          typeof conversation.user1Browse === "object"
        ) {
          found = conversation.user1Browse;
        }
      }

      // Check for browse doc in songmates
      if (found === null) {
        let songmate = find(
          vm.$store.getters["User/songmates"],
          o => o.uid === payload.uid
        );
        if (
          typeof songmate !== "undefined" &&
          typeof songmate.browse === "object"
        ) {
          found = Object.assign({}, songmate.browse, {
            songmate: songmate.songmate
          });
        }
      }

      if (found !== null) {
        return new Promise(resolve => {
          vm.browse = found;
          resolve(found);
        });
      } else {
        // Not anywhere in stored data, use the browse service
        vm.browseLoading = true;
        return vm.$store
          .dispatch("Browse/getUser", payload)
          .then(data => {
            vm.browse = data;
            return data;
          })
          .finally(() => {
            vm.browseLoading = false;
          });
      }
    },
    likeFromDislike() {
      let vm = this;
      let requests = [];

      // Look for the songmate doc
      // Note: this.songmateDoc will point to songmates_disliked, and thus shouldn't be used for this operation
      if (vm.isSongmate) {
        let songmateLookUpDoc =
          vm.browse.songmate.matchedBy == vm.$store.getters["User/user"].uid
            ? vm.browse.songmate.matchedByDoc
            : vm.browse.songmate.matchedToDoc;
        let songmateDoc = find(vm.$store.getters["User/songmates"], {
          path: songmateLookUpDoc
        });
        if (typeof songmateDoc !== "undefined") {
          let update = Object.assign({}, songmateDoc, {
            liked: true,
            disliked: false
          });
          requests.push(vm.updateSongmate(update));
        }
      }

      // Push request to remove from songmates_disliked lastly
      vm.removeSongmatesDisliked(vm.songmateDoc.id);

      return Promise.all(requests)
        .then(() => {
          vm.$toast("SongMate moved to likes!");
        })
        .catch(err => {
          console.error(err.message, err);
          return vm.$error(
            "We couldn't like this cleared match. It's probably just temporary, please try again.",
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
                  handler: () => vm.likeFromDislike()
                }
              ]
            }
          );
        });
    },
    optionSelected(value) {
      switch (value) {
        case "block":
          this.block();
          break;
        case "dislike":
          this.dislike();
          break;
        case "favorite":
          this.saveSongmate({ favorite: true });
          break;
        case "like":
          this.saveSongmate({ liked: true });
          break;
        case "like-from-dislike":
          this.likeFromDislike();
          break;
        case "remove-dislike":
          this.removeDislike();
          break;
        case "unblock":
          this.unblock();
          break;
        case "unfavorite":
          this.saveSongmate({ favorite: false });
          break;
        case "unlike":
          this.saveSongmate({ liked: false });
          break;
      }
    },
    removeDislike() {
      let vm = this;
      return vm.$error(
        `This will remove ${vm.browse.profile.displayName} from your Cleared Matches. This will allow ${vm.browse.profile.firstname} to appear in your SongMate matches.`,
        {
          header: "Confirm Delete",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: () => vm.removeSongmatesDisliked(vm.songmateDoc.id)
            }
          ]
        }
      );
    },
    saveSongmate(value) {
      let vm = this;
      let update = Object.assign({}, vm.songmateDoc, value);
      return vm.updateSongmate(update).then(() => {
        vm.getUserBrowse({ uid: vm.uid });
      });
    },
    setBrowse(payload) {
      this.browse = payload;
    },
    unblock() {
      let vm = this;
      return vm.$error(
        `This will unblock ${vm.browse.profile.displayName}, and they may be able to communicate with you and be eligable to match with you.`,
        {
          header: "Confirm Unblock",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: () => {
                return vm.userBlockRemove(vm.uid).then(() => {
                  vm.$toast("User has been unblocked.");
                });
              }
            }
          ]
        }
      );
    }
  },
  computed: {
    browseAge() {
      let age = "";
      if (this.hasBrowse) {
        let birthdate = new moment(
          this.browse.profile.birthdate,
          "YYYY-MM-DD",
          true
        );
        if (birthdate.isValid()) {
          let end = new moment();
          age = end.diff(birthdate, "years");
        } else {
          age =
            this.browse.profile.birthdate !== ""
              ? this.browse.profile.birthdate
              : "?";
        }
      }
      return age;
    },
    browseDisplayName() {
      let strings = [];
      if (this.hasBrowse) {
        strings.push(this.browse.profile.firstname.trim());
        strings.push(this.browse.profile.lastname.trim());
      }
      return strings.join(" ");
    },
    browseGender() {
      let gender = {
        identity: "none",
        expression: "none",
        orientation: "none",
        pronoun: "ambiguous"
      };
      if (this.hasBrowse && this.browse.profile.gender) {
        gender = this.browse.profile.gender;
      }
      return gender;
    },
    browseSongmateDistance() {
      let distance = "";
      if (this.hasBrowse && this.isSongmate) {
        distance = `${Math.round(this.browse.songmate.distance.miles)} mi.`;
      }
      return distance;
    },
    browseSongmateScore() {
      let score = 0;
      if (this.hasBrowse && this.isSongmate) {
        score = this.browse.songmate.score;
      }
      return score;
    },
    browseSongmateMatchedTimeAgo() {
      let timeAgo = null;

      if (this.hasBrowse && this.isSongmate) {
        timeAgo = moment(
          `${this.browse.songmate.created.seconds}.${this.browse.songmate.created.nanoseconds}`,
          "X"
        ).fromNow();
      }

      return timeAgo;
    },
    hasBrowse() {
      return (
        this.browseLoading === false && Object.keys(this.browse).length > 0
      );
    },
    isBlocked() {
      return (
        this.hasBrowse &&
        this.uid &&
        this.blockedUsersIds.indexOf(this.uid) !== -1
      );
    },
    isDisliked() {
      return this.hasBrowse && this.uid
        ? this.dislikedUsersIds.indexOf(this.uid) !== -1
        : false;
    },
    isSongmate() {
      return (
        this.hasBrowse &&
        Object.prototype.hasOwnProperty.call(this.browse, "isSongmate") &&
        this.browse.isSongmate === true &&
        Object.prototype.hasOwnProperty.call(this.browse, "songmate") &&
        Object.keys(this.browse.songmate).length > 0
      );
    },
    optionsMenuDefault() {
      let options = [];
      let firstname = this.hasBrowse ? this.browse.profile.firstname : "User";

      if (!this.isBlocked) {
        options.push({
          text: `Block ${firstname}`,
          value: "block"
        });
      } else {
        options.push({
          text: `Unblock ${firstname}`,
          value: "unblock"
        });
      }

      return options;
    },
    optionsMenuSongmate() {
      let options = [];
      let firstname = this.hasBrowse ? this.browse.profile.firstname : "User";

      // Handle SongMate options
      if (typeof this.songmateDoc !== "undefined") {
        if (!this.isDisliked) {
          if (this.songmateDoc.liked) {
            options.push({
              text: `Unlike ${firstname}`,
              value: "unlike"
            });
          } else {
            options.push({
              text: `Like ${firstname}`,
              value: "like"
            });
          }
          if (this.songmateDoc.favorite) {
            options.push({
              text: "Remove From Favorites",
              value: "unfavorite"
            });
          } else {
            options.push({
              text: "Add To Favorites",
              value: "favorite"
            });
          }
          options.push({
            text: `Remove ${firstname}`,
            value: "dislike"
          });
        } else {
          options.push({
            text: `Like ${firstname}`,
            value: "like-from-dislike"
          });
          options.push({
            text: `Delete Cleared Match`,
            value: "remove-dislike"
          });
        }
      }
      return options;
    },
    songmateDoc() {
      if (!this.hasBrowse && !this.isSongmate && !this.isDisliked) {
        return undefined;
      } else if (
        this.isSongmate &&
        !this.isDisliked &&
        this.$store.getters["User/songmates"].length > 0
      ) {
        let songmateLookUpDoc =
          this.browse.songmate.matchedBy == this.$store.getters["User/user"].uid
            ? this.browse.songmate.matchedByDoc
            : this.browse.songmate.matchedToDoc;
        return find(this.$store.getters["User/songmates"], {
          path: songmateLookUpDoc
        });
      } else if (
        this.isDisliked &&
        this.$store.getters["User/songmatesDisliked"].length > 0
      ) {
        return find(this.$store.getters["User/songmatesDisliked"], {
          uid: this.uid
        });
      } else {
        return undefined;
      }
    }
  },
  mixins: [UserDataMixin]
};
