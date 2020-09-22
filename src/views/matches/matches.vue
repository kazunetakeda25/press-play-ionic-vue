<template>
  <ion-page>
    <ion-card
      class="box-shadow content-card max-width primary-vertical-gradient"
    >
      <ion-grid class="align-content-center">
        <ion-row
          class="ion-align-items-center ion-justify-content-center"
          v-show="songmate && !loading && !error"
        >
          <ion-col class="ion-hide-xl-down" size="3" v-show="!browseLoading">
            <ion-fab-button
              class="align-center"
              color="light"
              @click.prevent="setDisliked"
            >
              <icon name="thumbs-down-outline"></icon>
            </ion-fab-button>
          </ion-col>
          <ion-col size="12" size-md="8" size-xl="6">
            <gesture
              direction="y"
              :options="{ passive: false }"
              v-show="songmate && !loading"
              @down="handleDown"
              @end="handleEnd"
              @move="handleMove"
              @up="handleUp"
            >
              <ion-card
                class="ion-no-margin box-shadow match-card"
                color="white"
                ref="card"
              >
                <ion-grid class="ion-no-padding" v-if="hasBrowse && songmate">
                  <ion-row>
                    <ion-col class="ion-no-padding" size="12">
                      <aspect-ratio ratio="6775:3011" class="profile-banner">
                        <div style="width: 100%;">
                          <div class="match-banner">
                            <match-banner
                              :bannerImages="browse.profile.bannerImages"
                            ></match-banner>
                          </div>
                          <div class="avatar-container">
                            <avatar-dial
                              :images="browse.profile.avatars"
                              :percent="browseSongmateScore"
                              size="lg"
                            ></avatar-dial>
                          </div>
                        </div>
                      </aspect-ratio>
                      <ion-grid>
                        <ion-row
                          class="ion-justify-content-between ion-align-items-center"
                        >
                          <ion-col size="auto">
                            <ion-grid class="ion-no-padding">
                              <ion-row class="ion-align-items-center">
                                <ion-col size="auto">
                                  <ion-text color="medium">
                                    <icon name="earth" size="large"></icon>
                                  </ion-text>
                                </ion-col>
                                <ion-col size="auto">
                                  <ion-text color="medium">
                                    {{ browseSongmateDistance }}
                                  </ion-text>
                                </ion-col>
                              </ion-row>
                            </ion-grid>
                          </ion-col>
                          <ion-col size="4">
                            <ion-grid class="ion-no-padding">
                              <ion-row
                                class="ion-align-items-center ion-text-center"
                              >
                                <ion-col class="ion-no-padding" size="7">
                                  <ion-text>
                                    <p class="text-large ion-no-margin">
                                      {{ browseAge }}
                                    </p>
                                  </ion-text>
                                </ion-col>
                                <ion-col class="ion-no-padding" size="5">
                                  <div style="max-width: 48px;">
                                    <gender-icon
                                      :gender="browseGender"
                                    ></gender-icon>
                                  </div>
                                </ion-col>
                              </ion-row>
                            </ion-grid>
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col size="12">
                      <ion-grid class="ion-no-padding">
                        <ion-row
                          class="ion-justify-content-between ion-align-items-center"
                        >
                          <ion-col size="auto">
                            <ion-text color="dark">
                              <h3 class="ion-no-margin">
                                {{ browseDisplayName }}
                              </h3>
                            </ion-text>
                          </ion-col>
                          <!-- <ion-col size="auto">
                            <ion-text>
                              Last online: {{ browseLastSignInTimeAgo }}
                            </ion-text>
                          </ion-col> -->
                        </ion-row>
                        <ion-row v-if="browse.profile.bio">
                          <ion-col size="12">
                            {{ browse.profile.bio }}
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col size="12">
                      <ion-grid class="ion-no-padding">
                        <ion-row class="ion-align-items-center ion-text-center">
                          <ion-col size="4">
                            <ion-button
                              fill="clear"
                              color="medium"
                              @click.prevent="message"
                            >
                              <icon name="c-messages" slot="icon-only"></icon>
                            </ion-button>
                          </ion-col>
                          <ion-col size="4">
                            <ion-fab-button
                              class="align-center bright-vertical-gradient play-button"
                              @click.prevent="profile"
                            >
                              <icon name="play"></icon>
                            </ion-fab-button>
                          </ion-col>
                          <ion-col size="4">
                            <gesture
                              direction="none"
                              :options="{ threshold: 0 }"
                              @end="likeEnd"
                              @move="likeMove"
                              @start="likeStart"
                            >
                              <ion-button fill="clear" ref="likeButton">
                                <icon
                                  :name="
                                    this.songmate.liked
                                      ? 'c-songmates-liked'
                                      : 'heart-outline'
                                  "
                                  color="medium"
                                  slot="icon-only"
                                ></icon>
                              </ion-button>
                            </gesture>
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                <div
                  class="card-backdrop"
                  v-show="browseLoading || updatingSongmate"
                >
                  <ion-grid class="align-content-center">
                    <ion-row class="ion-justify-content-center">
                      <ion-col size="auto">
                        <ion-spinner></ion-spinner>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </div>
              </ion-card>
            </gesture>
          </ion-col>
          <ion-col class="ion-hide-xl-down" size="3" v-show="!browseLoading">
            <ion-fab-button
              class="align-center"
              color="light"
              @click.prevent="setNext"
            >
              <icon name="arrow-forward"></icon>
            </ion-fab-button>
          </ion-col>
        </ion-row>
        <ion-row
          class="ion-align-items-center ion-justify-content-center"
          v-show="!songmate && !loading && !error"
        >
          <ion-col size="12" size-md="6">
            <div
              class="ion-text-center ion-margin-vertical ion-padding-vertical"
            >
              <ion-text color="light">
                <h1>
                  You don't have any new matches
                </h1>
                <h3>
                  Try the following to get more matches
                </h3>
              </ion-text>
            </div>
            <ion-grid class="ion-margin-top">
              <ion-row
                class="ion-align-items-center ion-justify-content-center"
              >
                <ion-col size="12" size-xl="8">
                  <router-link
                    :to="{ name: 'songstory' }"
                    v-slot="{ href, navigate }"
                  >
                    <ion-button
                      class="secondary-horizontal-gradient"
                      expand="block"
                      :href="href"
                      shape="round"
                      size="large"
                      @click="navigate"
                    >
                      Add to SongStory
                    </ion-button>
                  </router-link>
                </ion-col>
              </ion-row>
              <ion-row
                class="ion-align-items-center ion-justify-content-center"
              >
                <ion-col size="12" size-xl="8">
                  <ion-button
                    color="light"
                    expand="block"
                    shape="round"
                    size="large"
                    @click="$navigator.openMenubar()"
                  >
                    Adjust Filters
                  </ion-button>
                </ion-col>
              </ion-row>
              <ion-row
                class="ion-align-items-center ion-justify-content-center"
              >
                <ion-col size="12" size-xl="8">
                  <router-link
                    :to="{
                      name: 'profile.settings.seeking'
                    }"
                    v-slot="{ href, navigate }"
                  >
                    <ion-button
                      color="light"
                      expand="block"
                      :href="href"
                      shape="round"
                      size="large"
                      @click="navigate"
                    >
                      Adjust Settings
                    </ion-button>
                  </router-link>
                </ion-col>
              </ion-row>
              <ion-row
                class="ion-align-items-center ion-justify-content-center"
                v-if="dismissed.length > 0"
              >
                <ion-col size="12" size-xl="8">
                  <ion-button
                    color="light"
                    expand="block"
                    shape="round"
                    size="large"
                    @click="$store.commit('Matches/clearDismissed')"
                  >
                    Show Skipped
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-col>
        </ion-row>
        <ion-row
          class="ion-align-items-center ion-justify-content-center"
          v-show="!loading && error"
        >
          <ion-col class="ion-text-center" size="12" size-md="6">
            <ion-text color="light">
              <h1>Something went wrong</h1>
              <p class="text-large">
                We were unable to load your SongMates at this time. This is
                probably just temporary, try again.
              </p>
            </ion-text>
            <div>
              <ion-button color="light" @click.prevent="fetchData">
                <icon slot="start" name="refresh"></icon>
                Try Again
              </ion-button>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card>
  </ion-page>
</template>
<script>
import Vue from "vue";

import { mapGetters } from "vuex";
import filter from "lodash/filter";
import find from "lodash/find";
import first from "lodash/first";
import intersection from "lodash/intersection";
import map from "lodash/map";
import merge from "lodash/merge";
import orderBy from "lodash/orderBy";

import AvatarDial from "@/components/avatar/dial.vue";
import BrowseProfile from "@/components/browse/profile.vue";
import GenderIcon from "@/components/gender/icon.vue";
import MatchBanner from "@/components/matches/banner.vue";
import MessageConversation from "@/components/message/conversation.vue";

import BrowseMixin from "@/mixins/browse.js";
import UserDataMixin from "@/mixins/userData.js";
import WindowMixin from "@/mixins/window.js";

export default {
  layout: {
    header: {
      class: "no-style-lg-down"
    },
    content: {
      fullscreen: true
    },
    footer: {
      toolbarStyle: "secondary"
    },
    menubar: {
      components: [
        {
          component: require("@/components/matches/filter.vue"),
          slot: "content"
        }
      ],
      navPosition: "bottom"
    }
  },
  data() {
    return {
      error: false,
      likeStarted: 0,
      likeCanceled: false,
      loading: false,
      songmate: undefined
    };
  },
  watch: {
    filteredSongmates: {
      handler: function(filteredSongmates) {
        // Set header title
        let header = merge(this.$navigator.layoutVars.header, {
          title: {
            text: `${filteredSongmates.length} Matches`
          }
        });
        this.$set(this.$navigator.layout, "header", header);
        // If no songmate is set, run setSongmate
        if (filteredSongmates.length > 0 && !this.songmate) {
          this.setSongmate();
        }
        // If songmates changes and current songmate no longer available, get a new songmate
        if (
          filteredSongmates.length > 0 &&
          this.songmate &&
          typeof find(filteredSongmates, { id: this.songmate.id }) ==
            "undefined"
        ) {
          this.setSongmate();
        }
      },
      immediate: true
    },
    matchFilter: {
      handler: function() {
        this.setSongmate();
      },
      deep: true
    },
    "$navigator.windowWidth": {
      handler: function(windowWidth) {
        let vm = this;
        // Handle navigator layout
        if (windowWidth <= 992) {
          vm.$nextTick().then(() => {
            let header = merge(vm.$navigator.layoutVars.header, {
              title: {
                color: "light"
              },
              toolbar: {
                color: "transparent"
              }
            });
            let menubar = merge(vm.$navigator.layoutVars.menubar, {
              icon: {
                color: "light"
              }
            });
            let sidebar = merge(vm.$navigator.layoutVars.sidebar, {
              icon: {
                color: "light"
              }
            });
            vm.$set(vm.$navigator.layout, "header", header);
            vm.$set(vm.$navigator.layout, "menubar", menubar);
            vm.$set(vm.$navigator.layout, "sidebar", sidebar);

            vm.$navigator.$refs.app.style.setProperty(
              "--content-height",
              "100vh"
            );
            vm.$navigator.$refs.header.style.setProperty(
              "position",
              "absolute"
            );
          });
        } else {
          vm.$nextTick().then(() => {
            vm.removeLayoutVars();
          });
        }
      },
      immediate: true
    },
    songmate: {
      handler: function(songmate) {
        let vm = this;
        if (songmate) {
          if (songmate.browse && Object.keys(songmate.browse).length) {
            vm.setBrowse(
              Object.assign({}, songmate.browse, {
                songmate: songmate.songmate
              })
            );
          } else {
            vm.fetchProfileData(songmate.uid);
          }
        }
      },
      immediate: true
    }
  },
  created() {
    let vm = this;
    vm.$on("errorRetry", () => vm.fetchData());
    vm.$on("resize", function() {
      if (vm.activeModal) {
        vm.setModalDimensions(vm.activeModal);
      }
    });
    vm.fetchData();
  },
  beforeDestroy() {
    this.removeLayoutVars();
  },
  methods: {
    async fetchData() {
      let vm = this;
      vm.loading = true;
      vm.error = false;
      await vm.$ionic.loadingController
        .create({
          message: "Getting SongMates..."
        })
        .then(function(e) {
          vm.loader = e;
          return vm.loader.present();
        });
      return vm.$store
        .dispatch("User/getSongmates")
        .catch(err => {
          console.error(err.message, err);
          vm.error = true;
          return vm.$error(
            "We were unable to load your SongMates. It's probably just temporary, try again."
          );
        })
        .finally(function() {
          vm.loading = false;
          vm.loader.dismiss();
        });
    },
    fetchProfileData(uid) {
      let vm = this;
      return vm.getUserBrowse({ uid: uid }).catch(err => {
        console.error(err.message, err);
        return vm.$error(
          "We were unable to load this profile. It's probably just temporary, try again.",
          {
            buttons: [
              {
                text: "Cancel",
                role: "cancel",
                cssClass: "secondary",
                handler: () =>
                  vm.$store.commit("Matches/addDismissed", vm.songmate.id)
              },
              {
                text: "Try Again",
                cssClass: "primary",
                handler: () => vm.fetchProfileData(uid)
              }
            ]
          }
        );
      });
    },
    handleDown() {
      // Add to dismissed
      this.$store.commit("Matches/addDismissed", this.songmate.id);
      // Style the card
      this.resetCard();
    },
    handleEnd(ev) {
      // Check threshold
      if (this.thresholdMet(ev)) {
        // If disliked, save the response
        // Else, set new songmate
        if (this.songmate.disliked) {
          this.saveSongmate();
        } else {
          this.setSongmate();
        }
      }
      // Style the card
      this.resetCard();
    },
    handleMove(ev) {
      // Cancel swipe after 100px
      if (this.thresholdMet(ev)) {
        if (ev.event.sourceCapabilities.firesTouchEvents) {
          ev.event.target.dispatchEvent(new TouchEvent("touchend", ev.event));
        } else {
          ev.event.target.dispatchEvent(new MouseEvent("mouseup", ev.event));
        }
        ev.event.preventDefault();
      }
      // Style the card
      this.$refs.card.style.transition = "";
      this.$refs.card.style.transform = `translateY(${
        ev.deltaY
      }px) rotate(${ev.deltaY / 20}deg)`;
    },
    handleUp() {
      // Set liked to false
      this.songmate.disliked = true;
      // Style the card
      this.resetCard();
    },
    inFilterVars(types, filterVars) {
      let vm = this;
      let relationshipKeys = [
        "expressions",
        "identities",
        "orientations",
        "pronouns"
      ];
      let filterKeys = ["expression", "identity", "orientation", "pronoun"];
      let filterMap = {};

      // Build filterMap
      types.forEach(function(type) {
        let relationshipFilter = find(vm.matchFilter.relationships, {
          type: type
        });
        filterMap[type] = {};
        relationshipKeys.forEach(function(key, i) {
          let enabled = map(
            filter(relationshipFilter[key], { enabled: true }),
            "type"
          );
          let filterVarKey = filterKeys[i];
          filterMap[type][key] =
            intersection(enabled, [filterVars[filterVarKey]]).length > 0;
        });
      });

      // Reduce filterMap to simple true/false
      types.forEach(function(type) {
        let allTrue = true;
        relationshipKeys.forEach(function(key) {
          if (filterMap[type][key] === false) {
            allTrue = false;
          }
        });
        filterMap[type] = allTrue;
      });

      // Test filterMap for any that are true
      let anyTrue = false;
      types.forEach(function(type) {
        if (filterMap[type]) {
          anyTrue = true;
        }
      });

      return anyTrue;
    },
    likeEnd() {
      clearInterval(this.interval);
      let now = new Date();
      this.$refs.likeButton.style.transform = "";
      if (Math.abs(now - this.likeStarted) >= 1000 && !this.likeCanceled) {
        this.songmate.favorite = true;
      }
      if (!this.likeCanceled) {
        this.saveSongmate();
      }
    },
    likeMove(ev) {
      if (Math.abs(ev.deltaY) >= ev.event.target.offsetHeight) {
        this.likeCanceled = true;
        this.songmate.liked = false;
        this.songmate.favorite = false;
        if (ev.event.sourceCapabilities.firesTouchEvents) {
          ev.event.target.dispatchEvent(new TouchEvent("touchend", ev.event));
        } else {
          ev.event.target.dispatchEvent(new MouseEvent("mouseup", ev.event));
        }
        ev.event.preventDefault();
      }
    },
    likeStart() {
      let vm = this;

      vm.songmate.liked = true;
      vm.likeStarted = new Date();

      vm.translateInt = 1;
      vm.$refs.likeButton.style.transition = "0.3s ease-out";
      vm.interval = setInterval(function() {
        let now = new Date();
        let timepassed = Math.abs(now - vm.likeStarted);
        let scale = (timepassed / 100) * 1;
        let max = scale < 2 ? scale : 2;
        let translate = 0;
        if (timepassed >= 1000) {
          translate = 3 * vm.translateInt;
          vm.translateInt = Math.sign(vm.translateInt) == 1 ? -1 : 1;
        }
        vm.$refs.likeButton.style.transform = `scale(${max}) translateX(${translate}px)`;
      }, 100);
    },
    async message() {
      let vm = this;

      // Create MessageConversation instance
      let MessageConversationComponent = Vue.extend(MessageConversation);
      let MessageConversationInstance = new MessageConversationComponent({
        propsData: {
          uid: vm.songmate.uid
        }
      });

      // Dismiss modal on back button
      MessageConversationInstance.$on("conversationBack", function() {
        vm.activeModal.dismiss();
      });

      // Mount the instance
      MessageConversationInstance.$mount();

      await vm.$ionic.modalController
        .create({
          component: MessageConversationInstance.$el
        })
        .then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
          });
        });

      return vm.activeModal.present();
    },
    async profile() {
      let vm = this;

      // Create BrowseProfile instance
      let BrowseProfileComponent = Vue.extend(BrowseProfile);
      let BrowseProfileInstance = new BrowseProfileComponent({
        propsData: {
          uid: vm.songmate.uid
        }
      });

      // Dismiss modal on back button
      BrowseProfileInstance.$on("profileBack", function() {
        vm.activeModal.dismiss();
      });

      // Mount the instance
      BrowseProfileInstance.$mount();

      await vm.$ionic.modalController
        .create({
          component: BrowseProfileInstance.$el
        })
        .then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
          });
        });

      return vm.activeModal.present();
    },
    resetCard() {
      let vm = this;
      vm.$nextTick().then(function() {
        vm.$refs.card.style.transition = "0.3s ease-out";
        vm.$refs.card.style.transform = "";
      });
    },
    removeLayoutVars() {
      this.$delete(this.$navigator.layout, "header");
      this.$delete(this.$navigator.layout, "menubar");
      this.$delete(this.$navigator.layout, "sidebar");
      this.$navigator.$refs.app.style.removeProperty("--content-height");
      this.$navigator.$refs.header.style.removeProperty("position");
    },
    saveSongmate() {
      let vm = this;
      return vm.updateSongmate(vm.songmate).then(() => {
        vm.setSongmate();
      });
    },
    setDisliked() {
      this.songmate.disliked = true;
      this.saveSongmate();
    },
    setNext() {
      this.$store.commit("Matches/addDismissed", this.songmate.id);
      this.setSongmate();
    },
    setSongmate() {
      return (this.songmate = first(this.filteredSongmates));
    },
    thresholdMet(ev) {
      return Math.abs(ev.deltaY) >= 100;
    }
  },
  computed: {
    ...mapGetters({
      dismissed: "Matches/dismissed",
      matchFilter: "Matches/matchFilter",
      songmates: "User/songmates"
    }),
    filteredSongmates() {
      let vm = this;
      return orderBy(
        filter(vm.songmates, songmate => {
          // Only show unprocessed
          let unprocessed =
            songmate.disliked == false &&
            songmate.liked == false &&
            vm.dismissed.indexOf(songmate.id) == -1;

          // Test score filter
          let inScoreRange =
            songmate.songmate.score * 100 >= vm.matchFilter.score.lower &&
            songmate.songmate.score * 100 <= vm.matchFilter.score.upper;

          // Test distance filter
          let inDistanceRange =
            songmate.songmate.distance.miles >= vm.matchFilter.distance.lower &&
            songmate.songmate.distance.miles <= vm.matchFilter.distance.upper;

          // Test relationship filter
          let relationshipIntersection = intersection(
            vm.filteredRelationshipTypes,
            songmate.songmate.relationshipTypes
          );
          let inRelationshipTypes = relationshipIntersection.length > 0;

          // Test filterVars
          let inFilterVars = false;
          if (
            inRelationshipTypes &&
            songmate.browse &&
            Object.keys(songmate.browse).length
          ) {
            inFilterVars = vm.inFilterVars(
              relationshipIntersection,
              songmate.browse.profile.gender
            );
          }

          return (
            unprocessed &&
            inDistanceRange &&
            inScoreRange &&
            inRelationshipTypes &&
            inFilterVars
          );
        }),
        o => {
          if (
            Object.prototype.hasOwnProperty.call(o, "songmate") &&
            Object.prototype.hasOwnProperty.call(o.songmate, "created")
          ) {
            return o.songmate.created.seconds;
          } else {
            return;
          }
        },
        "desc"
      );
    },
    filteredRelationshipTypes() {
      return map(
        filter(this.matchFilter.relationships, {
          enabled: true
        }),
        "type"
      );
    }
  },
  components: {
    AvatarDial,
    GenderIcon,
    MatchBanner
  },
  mixins: [BrowseMixin, UserDataMixin, WindowMixin]
};
</script>
<style lang="scss" scoped>
@media (min-width: 992px) {
  .ion-page > ion-content {
    border-radius: 8px;
    overflow: hidden;
  }
}
ion-card.match-card {
  --border-radius: 12px;
  --banner-border-radius: var(--border-radius) var(--border-radius) 50px 50px;
  min-height: 300px;
  border-radius: var(--border-radius);
  overflow: visible;
  z-index: 3;
  &:before,
  &:after {
    content: "";
    background: var(--ion-color-base, #ffffff);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    left: 50%;
    height: 150px;
    position: absolute;
    transform: translateX(-50%);
    z-index: -1;
  }
  &:before {
    top: -30px;
    width: calc(100% - calc(var(--border-radius) * 2));
    opacity: 0.1;
  }
  &:after {
    top: -15px;
    width: calc(100% - var(--border-radius));
    opacity: 0.7;
  }
  .avatar-container {
    position: absolute;
    width: 100%;
    bottom: -36px;
    max-height: 100%;
  }
  .card-backdrop {
    background-color: var(--ion-color-base, #ffffff);
    border-radius: var(--border-radius);
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    display: block;
    position: absolute;
    transform: translateZ(0px);
    contain: strict;
    cursor: pointer;
    touch-action: none;
    z-index: 10;
  }
  .match-banner {
    border-radius: var(--banner-border-radius);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
    overflow: hidden;
  }
  .profile-banner {
    background: var(--blurple-vertical-gradient);
    border-radius: var(--banner-border-radius);
    position: relative;
  }
  .play-button {
    margin-bottom: -25%;
  }
}
</style>
