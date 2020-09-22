<template>
  <ion-app ref="app">
    <ion-header ref="header">
      <ion-toolbar :color="layoutVars.header.toolbar.color" ref="headerToolbar">
        <ion-buttons
          slot="start"
          v-if="hasMenubar || layoutVars.header.toolbar.startButtons.length > 0"
        >
          <ion-button v-if="hasMenubar" @click.prevent="toggleMenubar">
            <icon
              :name="layoutVars.menubar.icon.name"
              :color="layoutVars.menubar.icon.color"
              slot="icon-only"
            ></icon>
          </ion-button>
          <router-link
            v-for="(startButton, index) in layoutVars.header.toolbar
              .startButtons"
            :key="`startButton${index}`"
            :to="{ name: startButton.to }"
            v-slot="{ href, navigate }"
          >
            <ion-button
              :class="startButton.buttonClass"
              :href="href"
              v-bind="startButton.buttonAttrs"
              @click="navigate"
            >
              <icon
                :name="startButton.icon.name"
                :color="
                  startButton.icon.color
                    ? startButton.icon.color
                    : layoutVars.menubar.icon.color
                "
                :slot="startButton.icon.slot"
              ></icon>
              {{ startButton.text }}
            </ion-button>
          </router-link>
        </ion-buttons>
        <ion-title :color="layoutVars.header.title.color" ref="headerTitle">
          {{ title }}
        </ion-title>
        <ion-buttons
          slot="primary"
          v-if="
            hasSidebar ||
              mainNavItems.length > 0 ||
              layoutVars.header.toolbar.endButtons.length > 0
          "
        >
          <router-link
            v-for="(item, index) in mainNavItems"
            :key="`headerNav${index}`"
            :to="item"
            v-slot="{ href, navigate, isActive }"
          >
            <ion-button
              class="ion-text-capitalize ion-hide-lg-down"
              :data-active="isActive"
              :href="href"
              ref="toolbarNav"
              @click="navigate"
            >
              <template
                v-if="
                  item.meta.menu.icon && typeof item.meta.menu.icon == 'string'
                "
              >
                <icon :name="item.meta.menu.icon" slot="start"></icon>
              </template>
              <template
                v-if="
                  item.meta.menu.icon && typeof item.meta.menu.icon == 'object'
                "
              >
                <icon v-bind="item.meta.menu.icon" slot="start"></icon>
              </template>
              {{ item.meta.menu.title }}
            </ion-button>
          </router-link>
          <router-link
            v-for="(endButton, index) in layoutVars.header.toolbar.endButtons"
            :key="`endButton${index}`"
            :to="{ name: endButton.to }"
            v-slot="{ href, navigate }"
          >
            <ion-button
              :class="endButton.buttonClass"
              :href="href"
              v-bind="endButton.buttonAttrs"
              @click="navigate"
            >
              <icon
                :name="endButton.icon.name"
                :color="
                  endButton.icon.color
                    ? endButton.icon.color
                    : layoutVars.menubar.icon.color
                "
                :slot="endButton.icon.slot"
              ></icon>
              {{ endButton.text }}
            </ion-button>
          </router-link>
          <ion-menu-toggle menu="sidebar" v-if="hasSidebar">
            <ion-button>
              <icon
                :name="layoutVars.sidebar.icon.name"
                :color="layoutVars.sidebar.icon.color"
                slot="icon-only"
              ></icon>
            </ion-button>
          </ion-menu-toggle>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content
      :fullscreen="layoutVars.content.fullscreen"
      ref="contentWrapper"
    >
      <ion-grid class="ion-no-padding" id="main-grid">
        <ion-row>
          <ion-col
            class="ion-hide-lg-down ion-no-padding"
            size-lg="4"
            size-xl="3"
            v-if="hasMenubar && layoutVars.menubar.inline"
            v-show="menubarOpened"
          >
            <sidebar
              :components="layoutVars.menubar.components"
              :nav-items="layoutVars.menubar.navItems"
              :nav-position="layoutVars.menubar.navPosition"
            >
            </sidebar>
          </ion-col>
          <ion-col
            class="ion-no-padding"
            size="12"
            :size-lg="contentSizeLg"
            :size-xl="contentSizeXl"
          >
            <ion-content
              :color="layoutVars.content.color"
              :fullscreen="layoutVars.content.fullscreen"
              id="main"
              ref="content"
            >
              <slot></slot>
            </ion-content>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>

    <ion-footer ref="footer" v-show="mainNavItems.length">
      <ion-toolbar>
        <ion-tab-bar>
          <router-link
            v-for="(item, index) in mainNavItems"
            :key="`footerNav${index}`"
            :to="item"
            v-slot="{ href, navigate, isActive }"
          >
            <ion-tab-button
              :data-active="isActive"
              :href="href"
              ref="tabButton"
              @click="navigate"
            >
              <template
                v-if="
                  item.meta.menu.icon && typeof item.meta.menu.icon == 'string'
                "
              >
                <icon :name="item.meta.menu.icon" size="large"></icon>
              </template>
              <template
                v-if="
                  item.meta.menu.icon && typeof item.meta.menu.icon == 'object'
                "
              >
                <icon v-bind="item.meta.menu.icon" size="large"></icon>
              </template>
              <ion-label v-show="isActive">
                {{ item.meta.menu.title }}
              </ion-label>
            </ion-tab-button>
          </router-link>
        </ion-tab-bar>
      </ion-toolbar>
    </ion-footer>

    <ion-menu
      content-id="main"
      menu-id="menu"
      side="start"
      ref="menubar"
      type="overlay"
      v-if="hasMenubar"
    >
      <sidebar
        :components="layoutVars.menubar.components"
        :nav-items="layoutVars.menubar.navItems"
        :nav-position="layoutVars.menubar.navPosition"
      >
        <template #header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-menu-toggle menu="menu">
                <ion-button>
                  <icon
                    :name="layoutVars.menubar.icon.name"
                    slot="icon-only"
                  ></icon>
                </ion-button>
              </ion-menu-toggle>
            </ion-buttons>
            <ion-title>{{ title }}</ion-title>
          </ion-toolbar>
        </template>
      </sidebar>
    </ion-menu>

    <ion-menu
      content-id="main"
      menu-id="sidebar"
      side="end"
      ref="sidebar"
      type="overlay"
      v-if="hasSidebar"
    >
      <sidebar
        :components="layoutVars.sidebar.components"
        :nav-items="layoutVars.sidebar.navItems"
        :nav-position="layoutVars.sidebar.navPosition"
      ></sidebar>
    </ion-menu>
  </ion-app>
</template>
<script>
import Vue from "vue";

import filter from "lodash/filter";
import find from "lodash/find";
import flatMap from "lodash/flatMap";
import kebabCase from "lodash/kebabCase";
import merge from "lodash/merge";
import remove from "lodash/remove";
import sortBy from "lodash/sortBy";

import FlattenObjectMixin from "@/mixins/flattenObject.js";
import WindowMixin from "@/mixins/window.js";

export default {
  layout: {
    content: {
      color: "",
      class: "",
      fullscreen: false
    },
    header: {
      class: "",
      title: {
        class: "ion-text-center ion-text-lg-left",
        color: "",
        text: ""
      },
      toolbar: {
        class: "",
        color: "",
        endButtons: [],
        startButtons: []
      }
    },
    footer: {
      class: "",
      toolbarStyle: "primary"
    },
    menubar: {
      components: [],
      icon: {
        color: "",
        name: "options"
      },
      inline: true,
      navItems: [],
      navPosition: "content"
    },
    sidebar: {
      components: [
        {
          component: require("@/components/global/sidebar-header.vue"),
          props: {},
          slot: "header"
        },
        {
          component: require("@/components/global/sidebar-footer.vue"),
          props: {},
          slot: "footer"
        }
      ],
      icon: {
        color: "",
        name: "menu"
      },
      navItems: [],
      navPosition: "content"
    }
  },

  data() {
    return {
      childLayouts: [],
      fabInit: false,
      layout: {},
      menubarOpened: true
    };
  },

  watch: {
    $route: {
      handler: function() {
        let vm = this;

        // Reset layout
        vm.layout = {};

        // Child layout params
        vm.childLayouts = [];
        vm.$router.currentRoute.matched.forEach(function(matched) {
          if (
            matched.components.default &&
            Object.prototype.hasOwnProperty.call(
              matched.components.default,
              "layout"
            )
          ) {
            vm.childLayouts.push(matched.components.default.layout);
          }
        });

        // Handle nav classes
        // @TODO: remove when Ionic fixes :class bindings <https://github.com/ionic-team/ionic/issues/20352>
        vm.$nextTick().then(function() {
          vm.$refs.toolbarNav.forEach(function(toolbarNav) {
            toolbarNav.classList.toggle(
              "ion-focused",
              toolbarNav.dataset.active === "true"
            );
          });
          vm.$refs.tabButton.forEach(function(tabButton) {
            tabButton.classList.toggle(
              "tab-selected",
              tabButton.dataset.active === "true"
            );
          });
          // Close menus
          if (vm.$refs.menubar) {
            vm.$refs.menubar.close();
          }
          if (vm.$refs.sidebar) {
            vm.$refs.sidebar.close();
          }
        });
      },
      deep: true,
      immediate: true
    },
    menubarOpened: {
      handler: function(opened) {
        let vm = this;
        vm.$nextTick().then(() => {
          vm.$refs.app.classList.toggle("menubar-opened", opened);
        });
      },
      immediate: true
    }
  },

  created() {
    Vue.prototype.$navigator = this;
  },

  mounted() {
    let vm = this;
    this.$nextTick().then(function() {
      // Set CSS classes from layout vars
      // @TODO: remove when Ionic fixes :class bindings <https://github.com/ionic-team/ionic/issues/20352>
      vm.$watch(
        "layoutVars",
        function(values, oldValues) {
          // Setup default classes
          let defaultClasses = {
            content: [],
            footer: ["ion-hide-lg-up", "no-style"]
          };
          if (vm.hasMenubar && vm.menubarOpened) {
            defaultClasses.content.push("content-shadow-inset");
          }

          // Handle old values first
          if (oldValues !== undefined) {
            // App class
            vm.getAppClasses(oldValues).forEach(cssClass =>
              vm.$refs.app.classList.remove(cssClass)
            );

            // Header class
            vm.getClassArrary(oldValues.header.class).forEach(cssClass => {
              vm.$refs.header.classList.remove(cssClass);
            });

            // Header title class
            vm.getClassArrary(oldValues.header.title.class).forEach(
              cssClass => {
                vm.$refs.headerTitle.classList.remove(cssClass);
              }
            );

            // Header toolbar class
            vm.getClassArrary(oldValues.header.toolbar.class).forEach(
              cssClass => {
                vm.$refs.headerToolbar.classList.remove(cssClass);
              }
            );

            // Content class
            vm.getClassArrary(
              oldValues.content.class,
              defaultClasses.content
            ).forEach(cssClass => vm.$refs.content.classList.remove(cssClass));

            // Footer class
            vm.getClassArrary(
              oldValues.footer.class,
              defaultClasses.footer
            ).forEach(cssClass => vm.$refs.footer.classList.remove(cssClass));
          }

          // App class
          vm.getAppClasses(values).forEach(cssClass =>
            vm.$refs.app.classList.add(cssClass)
          );

          // Header class
          vm.getClassArrary(values.header.class).forEach(cssClass => {
            vm.$refs.header.classList.add(cssClass);
          });

          // Header title class
          vm.getClassArrary(values.header.title.class).forEach(cssClass => {
            vm.$refs.headerTitle.classList.add(cssClass);
          });

          // Header toolbar class
          vm.getClassArrary(values.header.toolbar.class).forEach(cssClass => {
            vm.$refs.headerToolbar.classList.add(cssClass);
          });

          // Content class
          vm.getClassArrary(
            values.content.class,
            defaultClasses.content
          ).forEach(cssClass => vm.$refs.content.classList.add(cssClass));

          // Footer class
          vm.getClassArrary(
            values.footer.class,
            defaultClasses.footer
          ).forEach(cssClass => vm.$refs.footer.classList.add(cssClass));
        },
        { deep: true, immediate: true }
      );
    });
  },

  methods: {
    getAppClasses(values) {
      let layoutVars = this.flattenObject(values);
      let appCssClasses = flatMap(layoutVars, function(value, key) {
        let param = kebabCase(key);
        if (
          !param.includes("buttons") &&
          !param.includes("class") &&
          !param.includes("color") &&
          !param.includes("components") &&
          !param.includes("name") &&
          !param.includes("nav-items") &&
          !param.includes("text")
        ) {
          let val =
            typeof value == "string" && value == ""
              ? "none"
              : kebabCase(`${value}`);
          return `${param}-${val}`;
        } else {
          return "remove-me";
        }
      });
      remove(appCssClasses, cssClass => cssClass == "remove-me");
      return appCssClasses;
    },

    getContentClasses(values) {
      let classes = [];
      if (this.hasMenubar && this.menubarOpened) {
        classes.push("content-shadow-inset");
      }
      if (values && values !== "") {
        let cssClases = values.trim().split(" ");
        cssClases.forEach(string => {
          classes.push(string);
        });
      }
      return classes;
    },

    getChildNavItems(parentPath, filterHidden = true) {
      let children = [];
      let parent = find(this.$router.options.routes, { path: parentPath });

      if (parent) {
        children = sortBy(
          filter(parent.children, function(child) {
            return (filterHidden && !child.meta.menu.hide) || !filterHidden;
          }),
          route => route.meta.menu.priority
        );
      }

      return children;
    },

    getClassArrary(value, defaults) {
      let classes = [];
      if (typeof defaults !== "undefined") {
        classes = defaults;
      }
      if (value) {
        let cssClases = value.trim().split(" ");
        cssClases.forEach(string => {
          classes.push(string);
        });
      }
      return classes;
    },

    openMenubar() {
      if (this.windowWidth >= 992) {
        this.menubarOpened = true;
      } else {
        this.$refs.menubar.open();
      }
    },

    openSidebar() {
      this.$refs.sidebar.open();
    },

    toggleMenubar() {
      if (this.windowWidth >= 992 && this.layoutVars.menubar.inline) {
        this.menubarOpened = !this.menubarOpened;
      } else {
        this.$refs.menubar.toggle();
      }
    },

    toggleSidebar() {
      this.$refs.sidebar.toggle();
    }
  },

  computed: {
    title() {
      return this.layoutVars.header.title.text
        ? this.layoutVars.header.title.text
        : this.$route.meta.menu.title;
    },

    parentPath() {
      return this.$route.path.split("/").length > 1
        ? "/" + this.$route.path.split("/")[1]
        : "";
    },

    childNavItems() {
      return this.getChildNavItems(this.parentPath);
    },

    contentSizeLg() {
      return this.hasMenubar &&
        this.menubarOpened &&
        this.layoutVars.menubar.inline
        ? 8
        : 12;
    },

    contentSizeXl() {
      return this.hasMenubar &&
        this.menubarOpened &&
        this.layoutVars.menubar.inline
        ? 9
        : 12;
    },

    hasMenubar() {
      return (
        this.childNavItems.length > 0 ||
        this.layoutVars.menubar.components.length > 0
      );
    },

    hasSidebar() {
      return this.layoutVars.sidebar.components.length > 0;
    },

    mainNavItems() {
      return sortBy(
        filter(this.$router.options.routes, route => !route.meta.menu.hide),
        route => route.meta.menu.priority
      );
    },

    layoutVars() {
      let vm = this;
      let layoutParams = merge({}, this.$options.layout, this.layout);
      let childLayoutParams = {};

      // Set child navs
      layoutParams.menubar.navItems = vm.childNavItems;
      layoutParams.sidebar.navItems = vm.getChildNavItems("/profile", false);

      // Copy menubar components
      let menubarComponents = [];
      vm.$options.layout.menubar.components.forEach(function(component) {
        menubarComponents.push(component);
      });

      // Copy sidebar components
      let sidebarComponents = [];
      vm.$options.layout.sidebar.components.forEach(function(component) {
        sidebarComponents.push(component);
      });

      vm.childLayouts.forEach(function(childLayout) {
        // Check for menubar components
        if (
          Object.prototype.hasOwnProperty.call(childLayout, "menubar") &&
          Object.prototype.hasOwnProperty.call(
            childLayout.menubar,
            "components"
          )
        ) {
          // Push to menubarComponents
          childLayout.menubar.components.forEach(function(component) {
            menubarComponents.push(component);
          });
        }
        // Check for sidebar components
        if (
          Object.prototype.hasOwnProperty.call(childLayout, "sidebar") &&
          Object.prototype.hasOwnProperty.call(
            childLayout.sidebar,
            "components"
          )
        ) {
          // Push to sidebarComponents
          childLayout.sidebar.components.forEach(function(component) {
            sidebarComponents.push(component);
          });
        }
        // Merge childLayout
        merge(childLayoutParams, childLayout);
      });

      return merge({}, layoutParams, childLayoutParams, {
        menubar: {
          components: menubarComponents
        },
        sidebar: {
          components: sidebarComponents
        }
      });
    }
  },

  mixins: [FlattenObjectMixin, WindowMixin]
};
</script>
<style lang="scss" scoped>
ion-app {
  --toolbar-height: 54px;
  --toolbar-offset: 10px;
  --content-height: calc(100vh - var(--toolbar-height));
  #main-grid {
    height: var(--content-height);
    overflow: hidden;
    width: 100%;
    > ion-row,
    > ion-row > ion-col {
      height: var(--content-height);
    }
    ion-content {
      --background: #f4f5f8;
    }
  }
  ion-toolbar {
    --min-height: var(--toolbar-height);
  }
}
@media (max-width: 992px) {
  ion-app {
    &.content-fullscreen-true {
      --content-height: calc(
        100vh - (var(--toolbar-height) + var(--toolbar-offset))
      );
    }
    &.content-fullscreen-false {
      --content-height: calc(
        100vh - ((var(--toolbar-height) * 2) + var(--toolbar-offset))
      );
    }
    &.footer-toolbar-style-primary {
      &:after {
        background-color: var(--ion-color-primary);
      }
      ion-footer {
        ion-tab-bar {
          &:before {
            left: 0;
            top: calc(var(--toolbar-offset) / 2);
            background-position: left 0 top -2px;
            position: absolute;
            width: 100%;
            height: 5px;
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAHBAMAAADzDtBxAAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABXRSTlMUCS0gBIh/TXEAAAAaSURBVAjXYxCEAgY4UIICBmMogMsgFLtAAQCNSwXZKOdPxgAAAABJRU5ErkJggg==);
            background-repeat: repeat-x;
            content: "";
            transform: rotate(180deg);
          }
        }
        ion-tab-button {
          --background: var(--ion-color-white);
          --background-focused: var(--ion-color-white);
          --color-selected: var(--ion-color-white);
          &.tab-selected:before {
            background-image: url("../assets/backgrounds/tab-active-primary.svg");
          }
        }
      }
    }
    &.footer-toolbar-style-secondary {
      &:after {
        background-color: var(--ion-color-white);
      }
      ion-footer {
        ion-tab-button {
          --color: rgba(var(--ion-color-primary-contrast-rgb), 0.5);
          --color-selected: var(--ion-color-primary);
          &.tab-selected:before {
            background-image: url("../assets/backgrounds/tab-active-secondary.svg");
          }
        }
      }
    }
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      width: 100%;
      height: var(--toolbar-offset);
    }
    > ion-footer {
      --background: transparent;
      position: absolute;
      bottom: var(--toolbar-offset);
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
          margin-bottom: -11px;
          &:after {
            left: 0;
            bottom: 0;
            background-position: left 0 bottom 0;
            position: absolute;
            width: 100%;
            height: 5px;
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAHBAMAAADzDtBxAAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABXRSTlMUCS0gBIh/TXEAAAAaSURBVAjXYxCEAgY4UIICBmMogMsgFLtAAQCNSwXZKOdPxgAAAABJRU5ErkJggg==);
            background-repeat: repeat-x;
            content: "";
            transform: rotate(180deg);
          }
          ion-tab-button {
            --color: var(--ion-color-tertiary);
            > ion-icon,
            > ion-label {
              width: 100%;
              z-index: 3;
            }
            &.tab-selected {
              --background-position: top center;
              --background-size: auto var(--toolbar-height);
              --background-repeat: no-repeat;
              position: relative;
              &:before {
                content: "";
                background-position: var(--background-position);
                background-size: var(--background-size);
                background-repeat: var(--background-repeat);
                position: absolute;
                height: var(--toolbar-height);
                right: -100%;
                bottom: 0;
                left: -100%;
                z-index: 1;
              }
            }
          }
        }
      }
    }
  }
}
@media (min-width: 992px) {
  .menubar-opened .content-shadow-inset {
    &:after {
      content: "";
      background-position: left 0 top -2px;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAHBAMAAADzDtBxAAAAD1BMVEUAAAAAAAAAAAAAAAAAAABPDueNAAAABXRSTlMUCS0gBIh/TXEAAAAaSURBVAjXYxCEAgY4UIICBmMogMsgFLtAAQCNSwXZKOdPxgAAAABJRU5ErkJggg==);
      background-repeat: repeat-x;
      bottom: 0;
      height: 5px;
      left: 0;
      position: absolute;
      top: 0;
      transform: rotate(90deg) scaleY(-1);
      transform-origin: left;
      width: 100%;
    }
  }
}
</style>
