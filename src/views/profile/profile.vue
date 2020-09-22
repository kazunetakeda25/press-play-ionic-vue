<template>
  <ion-page>
    <ion-content color="light" scroll-events @ionScroll="handleScroll">
      <ion-card color="white" class="box-shadow content-card max-width">
        <ion-grid class="ion-no-padding">
          <ion-row class="ion-justify-content-center">
            <ion-col size="12" class="ion-no-padding">
              <aspect-ratio
                class="profile-banner"
                ratio="16:9"
                ratio-md="16:5"
                ref="profileBanner"
              ></aspect-ratio>
              <div class="profile-header">
                <div>
                  <avatar-editor size="xl"></avatar-editor>
                </div>
                <ion-grid>
                  <ion-row class="ion-justify-content-center">
                    <ion-col size="12" size-md="8" size-lg="6">
                      <div class="ion-text-center">
                        <h1 class="h2">{{ displayName }}</h1>
                        <ion-text class="text-large">
                          {{ userData.profile.bio }}
                        </ion-text>
                      </div>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </div>
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
                  <ion-col size="12" size-md="6">
                    <ion-grid class="ion-no-padding">
                      <ion-row class="ion-align-items-center">
                        <ion-col class="ion-text-center" size="2" size-md="3">
                          <icon name="earth" color="system" size="large"></icon>
                        </ion-col>
                        <ion-col size="10" size-md="9">
                          <h4 class="ion-no-margin">
                            {{ userData.profile.location.text }}
                          </h4>
                        </ion-col>
                      </ion-row>
                    </ion-grid>
                  </ion-col>
                  <ion-col size="12" size-md="6">
                    <ion-grid class="ion-no-padding">
                      <ion-row class="ion-align-items-center">
                        <ion-col size="2" size-md="3">
                          <div class="align-center" style="max-width: 32px;">
                            <gender-icon
                              :gender="userData.profile.gender"
                            ></gender-icon>
                          </div>
                        </ion-col>
                        <ion-col size="10" size-md="9">
                          <h4 class="ion-no-margin">{{ age }} yrs. old</h4>
                          <ion-text color="medium">
                            <gender-text
                              :gender="userData.profile.gender"
                              :show-expression="false"
                            ></gender-text>
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
              <songstory-list></songstory-list>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card>
    </ion-content>
  </ion-page>
</template>
<script>
import merge from "lodash/merge";

import AvatarEditor from "@/components/avatar/editor.vue";
import GenderIcon from "@/components/gender/icon.vue";
import GenderText from "@/components/gender/text.vue";
import SongstoryList from "@/components/songstory/list.vue";
import UserData from "@/mixins/userData.js";
export default {
  layout: {
    header: {
      title: {
        class: "ion-text-center ion-text-lg-left"
      },
      toolbar: {
        startButtons: [
          {
            to: "profile.settings",
            icon: {
              name: "settings-sharp",
              slot: "icon-only"
            }
          }
        ]
      }
    }
  },
  data() {
    return {
      scrollTop: 0
    };
  },
  watch: {
    "$navigator.windowWidth": {
      handler: function(windowWidth) {
        let vm = this;
        // Handle navigator layout
        if (windowWidth <= 992) {
          vm.$nextTick().then(() => {
            vm.setLayoutVars();
            vm.setLayoutStyle();
          });
        } else {
          vm.$nextTick().then(() => {
            vm.removeLayoutVars();
            vm.removeLayoutStyle();
          });
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.removeLayoutVars();
    this.removeLayoutStyle();
  },
  methods: {
    handleScroll(event) {
      this.scrollTop = event.detail.scrollTop;
      // Get bannerThreshold
      let bannerHeight = this.$refs.profileBanner.$el.offsetHeight - 54;
      let bannerThreshold = event.detail.scrollTop < bannerHeight - 54;

      if (bannerThreshold && this.$navigator.windowWidth <= 992) {
        this.setLayoutVars();
      } else {
        this.removeLayoutVars();
      }
    },
    setLayoutStyle() {
      this.$navigator.$refs.header.style.setProperty("position", "absolute");
      this.$navigator.$refs.app.style.setProperty(
        "--content-height",
        "calc(100vh - var(--toolbar-height)"
      );
    },
    setLayoutVars() {
      let header = merge(this.$navigator.layoutVars.header, {
        class: "no-style-lg-down",
        title: {
          color: "light"
        },
        toolbar: {
          color: "transparent"
        }
      });
      let menubar = merge(this.$navigator.layoutVars.menubar, {
        icon: {
          color: "light"
        }
      });
      let sidebar = merge(this.$navigator.layoutVars.sidebar, {
        icon: {
          color: "light"
        }
      });
      this.$set(this.$navigator.layout, "header", header);
      this.$set(this.$navigator.layout, "menubar", menubar);
      this.$set(this.$navigator.layout, "sidebar", sidebar);
    },
    removeLayoutStyle() {
      this.$navigator.$refs.app.style.removeProperty("--content-height");
      this.$navigator.$refs.header.style.removeProperty("position");
    },
    removeLayoutVars() {
      this.$delete(this.$navigator.layout, "header");
      this.$delete(this.$navigator.layout, "menubar");
      this.$delete(this.$navigator.layout, "sidebar");
    }
  },
  components: {
    AvatarEditor,
    GenderIcon,
    GenderText,
    SongstoryList
  },
  mixins: [UserData]
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
