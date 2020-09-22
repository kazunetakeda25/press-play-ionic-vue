<template>
  <ion-page>
    <ion-content color="light">
      <ion-card class="box-shadow content-card max-width">
        <ion-page>
          <ion-header class="no-style-lg-down">
            <ion-toolbar>
              <ion-tab-bar>
                <router-link
                  v-for="(navItem, index) in navItems"
                  :key="index"
                  :to="navItem.path"
                  v-slot="{ href, navigate, isActive }"
                >
                  <ion-tab-button
                    :data-active="isActive"
                    :href="href"
                    :layout="
                      isActive && $navigator.windowWidth <= 992
                        ? 'icon-bottom'
                        : 'icon-top'
                    "
                    ref="tabButton"
                    @click="navigate"
                  >
                    <icon :name="navItem.meta.menu.icon"></icon>
                    <ion-label>
                      {{ navItem.meta.menu.title }}
                    </ion-label>
                  </ion-tab-button>
                </router-link>
              </ion-tab-bar>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <router-view id="settings"></router-view>
          </ion-content>
        </ion-page>
      </ion-card>
    </ion-content>
  </ion-page>
</template>
<script>
import find from "lodash/find";
import merge from "lodash/merge";
import sortBy from "lodash/sortBy";
export default {
  layout: {
    header: {
      class: "no-style-lg-down",
      title: {
        text: "My Settings",
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
  watch: {
    $route: {
      handler: function() {
        let vm = this;
        // Handle nav classes
        // @TODO: remove when Ionic fixes :class bindings <https://github.com/ionic-team/ionic/issues/20352>
        vm.$nextTick().then(function() {
          vm.$refs.tabButton.forEach(function(tabButton) {
            tabButton.classList.toggle(
              "tab-selected",
              tabButton.dataset.active === "true"
            );
          });
        });
        // Handle layout classes
        vm.setLayoutVars();
      },
      immediate: true
    },
    "$navigator.windowWidth": {
      handler: function() {
        let vm = this;
        vm.$nextTick().then(() => {
          vm.setLayoutVars();
        });
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.$delete(this.$navigator.layout, "header");
  },
  methods: {
    setLayoutVars() {
      // Handle layoutvars
      if (this.$navigator.windowWidth <= 992) {
        let header = merge(this.$navigator.layoutVars.header, {
          toolbar: {
            color: "primary"
          }
        });
        this.$set(this.$navigator.layout, "header", header);
      } else {
        this.$delete(this.$navigator.layout, "header");
      }
    }
  },
  computed: {
    navItems() {
      return sortBy(this.parentNav.children, route => route.meta.menu.priority);
    },
    parentNav() {
      return find(this.rootNav.children, { name: "profile.settings" });
    },
    rootNav() {
      return find(this.$router.options.routes, { path: "/profile" });
    }
  }
};
</script>
<style lang="scss" scoped>
@media (min-width: 992px) {
  ion-tab-button {
    --color-selected: var(--ion-color-system);
  }
}
@media (max-width: 992px) {
  ion-header {
    --background: transparent;
    ion-tab-button {
      --background: var(--ion-color-white);
      --background-focused: var(--ion-color-white);
      --color-selected: var(--ion-color-white);
      &.tab-selected {
        &:before {
          background-image: url("../../../assets/backgrounds/tab-active-primary.svg");
        }
      }
    }
    ion-toolbar {
      --toolbar-height: 64px;
      --min-height: var(--toolbar-height);
      --background: transparent;
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 0;
      --padding-end: 0;
      ion-tab-bar {
        --background: transparent;
        --background-focused: transparent;
        --border: 0 none transparent;
        contain: initial;
        height: calc(var(--toolbar-height) - var(--toolbar-offset));
        margin-top: -11px;
        &:before {
          left: 0;
          top: 0;
          background-position: left 0 top -2px;
          position: absolute;
          width: 100%;
          height: 5px;
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAHBAMAAADzDtBxAAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABXRSTlMUCS0gBIh/TXEAAAAaSURBVAjXYxCEAgY4UIICBmMogMsgFLtAAQCNSwXZKOdPxgAAAABJRU5ErkJggg==);
          background-repeat: repeat-x;
          content: "";
        }
        &:after {
          left: 0;
          bottom: calc(var(--toolbar-offset) / 2);
          background-position: left 0 top -2px;
          position: absolute;
          width: 100%;
          height: 5px;
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAHBAMAAADzDtBxAAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABXRSTlMUCS0gBIh/TXEAAAAaSURBVAjXYxCEAgY4UIICBmMogMsgFLtAAQCNSwXZKOdPxgAAAABJRU5ErkJggg==);
          background-repeat: repeat-x;
          content: "";
        }
        ion-tab-button {
          --background: var(--ion-color-white);
          --background-focused: var(--ion-color-white);
          --color-selected: var(--ion-color-white);
          --color: var(--ion-color-tertiary);
          > ion-icon,
          > ion-label {
            width: 100%;
            z-index: 3;
          }
          &.tab-selected {
            position: relative;
            &:before {
              content: "";
              background-image: url("../../../assets/backgrounds/tab-active-primary.svg");
              background-position: top center;
              background-size: auto var(--toolbar-height);
              background-repeat: no-repeat;
              position: absolute;
              height: var(--toolbar-height);
              right: -100%;
              top: 0;
              left: -100%;
              z-index: 1;
              transform: rotate(180deg);
            }
          }
          &.tab-layout-icon-bottom {
            ion-icon {
              margin-top: 2px;
              margin-bottom: 6px;
            }
            ion-label {
              margin-bottom: 2px;
              margin-top: 6px;
            }
          }
        }
      }
    }
  }
  ion-content {
    --offset-top: calc(var(--toolbar-offset) + 1px) !important;
  }
}
</style>
