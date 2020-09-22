<template>
  <ion-page>
    <template v-if="!loading && !error && hasBrowse">
      <ion-content fullscreen>
        <ion-header
          class="no-style"
          ref="header"
          v-if="showToolbar"
          slot="fixed"
        >
          <ion-toolbar color="transparent" ref="toolbar">
            <ion-buttons slot="start">
              <ion-button @click.prevent="$emit('profileBack')">
                <icon
                  color="light"
                  name="arrow-back"
                  ref="backButtonIcon"
                  slot="icon-only"
                ></icon>
              </ion-button>
            </ion-buttons>
            <div
              class="toolbar-avatar"
              slot="start"
              v-show="showToolbarProfile"
            >
              <avatar-songmate
                :browse-ref="browse"
                :images="browse.profile.avatars"
                size="sm"
              ></avatar-songmate>
            </div>
            <ion-title v-show="showToolbarProfile">
              {{ browseDisplayName }}
            </ion-title>
            <div slot="end" v-show="updatingProfile">
              <ion-spinner color="light" ref="spinner"></ion-spinner>
            </div>
            <ion-buttons slot="end">
              <ion-button
                :disabled="updatingProfile"
                @click.prevent="openOptionsPopover($event, profileOptions)"
              >
                <icon
                  color="light"
                  name="ellipsis-vertical"
                  ref="optionsButtonIcon"
                  slot="icon-only"
                ></icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen scroll-events @ionScroll="handleScroll">
          <ion-grid class="ion-no-padding">
            <ion-row class="ion-justify-content-center">
              <ion-col size="12" class="ion-no-padding">
                <aspect-ratio
                  class="profile-banner"
                  ratio="16:9"
                  ratio-md="16:5"
                  ref="profileBanner"
                ></aspect-ratio>
                <div class="profile-header" ref="profileHeader">
                  <div>
                    <template v-if="isSongmate">
                      <avatar-dial
                        :images="browse.profile.avatars"
                        :percent="browseSongmateScore"
                        size="lg"
                        size-xl="xl"
                      ></avatar-dial>
                    </template>
                    <template v-else>
                      <avatar
                        :images="browse.profile.avatars"
                        size="lg"
                        size-xl="xl"
                      ></avatar>
                    </template>
                  </div>
                  <ion-grid>
                    <ion-row class="ion-justify-content-center">
                      <ion-col size="12" size-md="8" size-lg="6">
                        <div class="ion-text-center">
                          <h1 class="h2">{{ browse.profile.displayName }}</h1>
                          <ion-text class="text-large">
                            {{ browse.profile.bio }}
                          </ion-text>
                        </div>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </div>
              </ion-col>
            </ion-row>
            <ion-row
              class="ion-justify-content-center ion-margin-top"
              v-if="songmateDoc && showButtonBar && !isDisliked"
            >
              <ion-col class="ion-no-padding" size="12" size-md="8">
                <ion-grid class="ion-no-padding" fixed>
                  <ion-row
                    class="ion-justify-content-between ion-align-items-center"
                  >
                    <ion-col size="6" size-md="8">
                      <ion-button
                        class="ion-text-capitalize bright-horizontal-gradient"
                        expand="block"
                        shape="round"
                        size="large"
                        v-if="songmateDoc.liked"
                        @click.prevent="message"
                      >
                        <icon name="c-messages" slot="start"></icon>
                        Message
                      </ion-button>
                      <ion-button
                        class="ion-text-capitalize bright-horizontal-gradient"
                        :disabled="updatingProfile"
                        expand="block"
                        shape="round"
                        size="large"
                        v-if="!songmateDoc.liked"
                        @click.prevent="saveSongmate({ liked: true })"
                      >
                        <icon
                          name="heart-outline"
                          slot="start"
                          v-show="!updatingProfile"
                        ></icon>
                        <ion-spinner
                          slot="start"
                          v-show="updatingProfile"
                        ></ion-spinner>
                        <span class="ion-hide-md-down">
                          Like {{ browse.profile.firstname }}
                        </span>
                        <span class="ion-hide-md-up">
                          Like
                        </span>
                      </ion-button>
                    </ion-col>
                    <ion-col size="3" size-md="2">
                      <ion-button
                        color="light"
                        :disabled="updatingProfile"
                        expand="block"
                        size="large"
                        shape="round"
                        v-if="songmateDoc.liked"
                        @click.prevent="
                          openOptionsPopover($event, optionsMenuSongmate)
                        "
                      >
                        <icon
                          name="c-songmates-mutual"
                          slot="icon-only"
                          v-if="browse.songmate.mutual"
                          v-show="!updatingProfile"
                        ></icon>
                        <icon
                          name="c-songmates-liked"
                          slot="icon-only"
                          v-else
                          v-show="!updatingProfile"
                        ></icon>
                        <ion-spinner
                          color="dark"
                          slot="icon-only"
                          v-show="updatingProfile"
                        ></ion-spinner>
                      </ion-button>
                      <ion-button
                        color="light"
                        expand="block"
                        shape="round"
                        size="large"
                        v-if="!songmateDoc.liked"
                        @click.prevent="message"
                      >
                        <icon name="c-messages" slot="icon-only"></icon>
                      </ion-button>
                    </ion-col>
                    <ion-col size="3" size-md="2">
                      <ion-button
                        color="light"
                        :disabled="updatingProfile"
                        expand="block"
                        shape="round"
                        size="large"
                        @click.prevent="
                          openOptionsPopover($event, optionsMenuDefault)
                        "
                      >
                        <icon
                          name="ellipsis-horizontal"
                          slot="icon-only"
                        ></icon>
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-col>
            </ion-row>
            <ion-row
              class="ion-justify-content-center ion-margin-top"
              v-if="songmateDoc && showButtonBar && isDisliked"
            >
              <ion-col class="ion-no-padding" size="12" size-md="8">
                <ion-grid class="ion-no-padding" fixed>
                  <ion-row
                    class="ion-justify-content-between ion-align-items-center"
                  >
                    <ion-col size="5" v-if="isSongmate">
                      <ion-button
                        class="ion-text-capitalize bright-horizontal-gradient"
                        :disabled="updatingProfile"
                        expand="block"
                        shape="round"
                        size="large"
                        @click.prevent="likeFromDislike"
                      >
                        <icon name="heart-outline" slot="start"></icon>
                        Like
                      </ion-button>
                    </ion-col>
                    <ion-col :size="isSongmate ? 5 : 10">
                      <ion-button
                        class="ion-text-capitalize"
                        color="danger"
                        :disabled="updatingProfile"
                        expand="block"
                        size="large"
                        shape="round"
                        @click.prevent="removeDislike"
                      >
                        <icon name="trash" slot="start"></icon>
                        Delete
                      </ion-button>
                    </ion-col>
                    <ion-col size="2">
                      <ion-button
                        color="light"
                        :disabled="updatingProfile"
                        expand="block"
                        shape="round"
                        size="large"
                        @click.prevent="
                          openOptionsPopover($event, optionsMenuDefault)
                        "
                      >
                        <icon
                          name="ellipsis-horizontal"
                          slot="icon-only"
                        ></icon>
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-col>
            </ion-row>
            <ion-row
              class="ion-justify-content-center ion-margin-top row-divider"
            >
              <ion-col class="ion-no-padding" size="12">
                <ion-grid class="ion-no-padding info-grid" fixed>
                  <ion-row
                    class="ion-justify-content-between ion-align-items-center"
                  >
                    <ion-col v-bind="infoColAttrs">
                      <ion-grid class="ion-no-padding">
                        <ion-row class="ion-align-items-center">
                          <ion-col class="ion-text-center" size="2" size-md="3">
                            <icon
                              name="earth"
                              color="system"
                              size="large"
                            ></icon>
                          </ion-col>
                          <ion-col size="10" size-md="9">
                            <h4 class="ion-no-margin">
                              {{ browse.profile.location }}
                            </h4>
                            <ion-text color="medium" v-if="isSongmate">
                              {{ browseSongmateDistance }}
                            </ion-text>
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-col>
                    <ion-col v-bind="infoColAttrs">
                      <ion-grid class="ion-no-padding">
                        <ion-row class="ion-align-items-center">
                          <ion-col size="2" size-md="3">
                            <div class="align-center" style="max-width: 32px;">
                              <gender-icon
                                :gender="browse.profile.gender"
                              ></gender-icon>
                            </div>
                          </ion-col>
                          <ion-col size="10" size-md="9">
                            <h4 class="ion-no-margin">
                              {{ browseAge }} yrs. old
                            </h4>
                            <ion-text color="medium">
                              <gender-text
                                :gender="browse.profile.gender"
                                :show-expression="false"
                              ></gender-text>
                            </ion-text>
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-col>
                    <ion-col v-bind="infoColAttrs" v-if="isSongmate">
                      <ion-grid class="ion-no-padding">
                        <ion-row class="ion-align-items-center">
                          <ion-col class="ion-text-center" size="2" size-md="3">
                            <icon
                              class="songmate-icon"
                              color="light"
                              name="c-songmates-mutual"
                              size="large"
                              v-if="browse.songmate.mutual"
                            ></icon>
                            <icon
                              class="songmate-icon"
                              color="medium"
                              name="c-songmates-liked"
                              size="large"
                              v-if="
                                !browse.songmate.mutual && songmateDoc.liked
                              "
                            ></icon>
                            <icon
                              class="songmate-icon"
                              color="medium"
                              name="c-songmates"
                              size="large"
                              v-if="
                                !browse.songmate.mutual && !songmateDoc.liked
                              "
                            ></icon>
                          </ion-col>
                          <ion-col size="10" size-md="9">
                            <h4 class="ion-no-margin">
                              {{
                                `${Math.round(
                                  browseSongmateScore * 100
                                )}% Match`
                              }}
                            </h4>
                            <ion-text color="medium">
                              {{ `Matched ${browseSongmateMatchedTimeAgo}` }}
                            </ion-text>
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="12" class="ion-no-padding">
                <songstory-list
                  :browse-answers="songstory"
                  :list-col-attrs="{ size: 12, 'size-md': 8 }"
                  :modal-options="{ showBackdrop: false }"
                  mode="browse"
                  :show-category-filter="false"
                  :uid="uid"
                ></songstory-list>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-content>
    </template>
    <template v-if="!loading && error">
      <ion-content fullscreen>
        <ion-grid class="align-content-center">
          <ion-row class="ion-justify-content-center">
            <ion-col class="ion-text-center" size="12">
              <h4>Something went wrong</h4>
              <p>
                We were unable to load this profile at this time. This is
                probably just temporary, try again.
              </p>
              <div>
                <ion-button
                  color="system"
                  fill="clear"
                  @click.prevent="fetchData"
                >
                  <icon slot="start" name="refresh"></icon>
                  Try Again
                </ion-button>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </template>
    <template v-if="loading">
      <ion-content fullscreen>
        <ion-grid class="align-content-center">
          <ion-row class="ion-justify-content-center">
            <ion-col class="ion-text-center" size="12">
              <ion-spinner></ion-spinner>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </template>
  </ion-page>
</template>
<script>
import Vue from "vue";

import AvatarDial from "@/components/avatar/dial.vue";
import AvatarSongmate from "@/components/avatar/songmate.vue";
import GenderIcon from "@/components/gender/icon.vue";
import GenderText from "@/components/gender/text.vue";
import MessageConversation from "@/components/message/conversation.vue";
import SongstoryList from "@/components/songstory/list.vue";

import BrowseMixin from "@/mixins/browse.js";
import OptionsMenuMixin from "@/mixins/options-menu.js";
export default {
  props: {
    showButtonBar: {
      type: Boolean,
      default: true
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    uid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      error: false,
      loading: false,
      scrollTop: 0,
      showToolbarProfile: false,
      songstory: []
    };
  },
  watch: {
    uid: {
      handler: function() {
        this.fetchData();
      },
      immediate: true
    }
  },
  created() {
    this.$on("optionMenuSelected", function(value) {
      if (value === "message") {
        this.message();
      }
    });
  },
  methods: {
    fetchData() {
      let vm = this;

      vm.loading = true;
      vm.error = false;

      let requests = [
        vm.getUserBrowse({ uid: vm.uid }),
        vm.$store.dispatch("Browse/getSongstory", { uid: vm.uid })
      ];

      return Promise.all(requests)
        .then(res => {
          vm.songstory = res[1].answers;
        })
        .catch(err => {
          console.error(err.message, err);
          vm.error = true;
          return vm.$error(
            "We were unable to load this profile. It's probably just temporary, try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary",
                  handler: () => vm.$emit("profileBack")
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.fetchData()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.loading = false;
        });
    },
    handleScroll(event) {
      this.scrollTop = event.detail.scrollTop;
      if (this.showToolbar) {
        // Get bannerThreshold
        let bannerHeight =
          this.$refs.profileBanner.$el.offsetHeight -
          this.$refs.toolbar.offsetHeight;
        let bannerThreshold =
          event.detail.scrollTop <
          bannerHeight - this.$refs.toolbar.offsetHeight;
        // Style header
        this.$refs.header.classList.toggle("no-style", bannerThreshold);
        // Style toolbar
        this.$refs.toolbar.classList.toggle("ion-color", bannerThreshold);
        this.$refs.toolbar.classList.toggle(
          "ion-color-transparent",
          bannerThreshold
        );
        // Style back button
        this.$refs.backButtonIcon.$el.classList.toggle(
          "ion-color",
          bannerThreshold
        );
        this.$refs.backButtonIcon.$el.classList.toggle(
          "ion-color-light",
          bannerThreshold
        );
        // Style options button
        this.$refs.optionsButtonIcon.$el.classList.toggle(
          "ion-color",
          bannerThreshold
        );
        this.$refs.optionsButtonIcon.$el.classList.toggle(
          "ion-color-light",
          bannerThreshold
        );
        // Style spinner
        this.$refs.spinner.classList.toggle("ion-color", bannerThreshold);
        this.$refs.spinner.classList.toggle("ion-color-light", bannerThreshold);
        // Set showToolbarProfile
        let profileHeaderHeight = this.$refs.profileHeader.getBoundingClientRect()
          .height;
        if (event.detail.scrollTop > profileHeaderHeight) {
          this.showToolbarProfile = true;
        } else {
          this.showToolbarProfile = false;
        }
      }
    },
    message() {
      let vm = this;

      // Create MessageConversation instance
      let MessageConversationComponent = Vue.extend(MessageConversation);
      let MessageConversationInstance = new MessageConversationComponent({
        propsData: {
          uid: vm.uid
        }
      });

      // Dismiss modal on back button
      MessageConversationInstance.$on("conversationBack", function() {
        vm.messageModal.dismiss();
      });

      // Mount the instance
      MessageConversationInstance.$mount();

      return vm.$ionic.modalController
        .create({
          component: MessageConversationInstance.$el
        })
        .then(m => {
          vm.messageModal = m;
          vm.messageModal.present();
        });
    }
  },
  computed: {
    infoColAttrs() {
      let attrs = {
        size: 12,
        "size-md": 6
      };

      if (this.isSongmate) {
        attrs["size-md"] = 4;
      }

      return attrs;
    },
    profileOptions() {
      let options = [];

      if (this.showButtonBar && !this.isDisliked) {
        options.push({
          text: `Message ${this.browse.profile.firstname}`,
          value: "message"
        });
      }

      this.optionsMenuSongmate.forEach(function(option) {
        options.push(option);
      });

      this.optionsMenuDefault.forEach(function(option) {
        options.push(option);
      });

      return options;
    },
    updatingProfile() {
      return (
        this.removingSongmatesDisliked ||
        this.updatingSongmate ||
        this.userBlockAdding ||
        this.userBlockRemoving
      );
    }
  },
  components: {
    AvatarDial,
    AvatarSongmate,
    GenderIcon,
    GenderText,
    SongstoryList
  },
  mixins: [BrowseMixin, OptionsMenuMixin]
};
</script>
<style lang="scss" scoped>
.row-divider {
  border-top: 1px solid #d9d9d9;
}
@media (min-width: 768px) {
  .info-grid > ion-row > ion-col {
    --vertical-padding: calc(var(--ion-grid-column-padding, 5px) * 2);
    padding-bottom: var(--vertical-padding);
    padding-top: var(--vertical-padding);
    &:not(:first-child) {
      border-left: 1px solid #d9d9d9;
    }
  }
}
</style>
