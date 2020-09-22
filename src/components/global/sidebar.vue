<template>
  <ion-page>
    <ion-header v-if="hasHeader">
      <slot name="header"></slot>
      <component
        v-bind:is="component.component.default"
        v-bind="component.props"
        v-for="(component, index) in headerComponents"
        :key="'copComponent' + index"
      ></component>
      <sidebar-menu
        :navItems="navItems"
        v-if="hasNavItems && navPosition == 'top'"
      ></sidebar-menu>
    </ion-header>
    <ion-content v-if="hasNavItems && navPosition == 'content'">
      <sidebar-menu :navItems="navItems"></sidebar-menu>
    </ion-content>
    <ion-content v-if="contentComponents.length > 0">
      <component
        v-bind:is="component.component.default"
        v-bind="component.props"
        v-for="(component, index) in contentComponents"
        :key="'contentComponent' + index"
      ></component>
    </ion-content>
    <ion-footer v-if="hasFooter">
      <slot name="footer"></slot>
      <sidebar-menu
        :navItems="navItems"
        v-if="hasNavItems && navPosition == 'bottom'"
      ></sidebar-menu>
      <component
        :is="component.component.default"
        :key="'footerComponent' + index"
        v-bind="component.props"
        v-for="(component, index) in footerComponents"
      ></component>
    </ion-footer>
  </ion-page>
</template>
<script>
import filter from "lodash/filter";
import { v4 as uuidv4 } from "uuid";

import SidebarMenu from "@/components/global/sidebar-menu.vue";
export default {
  props: {
    components: {
      type: Array,
      default: function() {
        return [];
      }
    },
    navItems: {
      type: Array,
      default: function() {
        return [];
      }
    },
    navPosition: {
      type: String,
      default: "content"
    }
  },
  methods: {
    getComponents(slot) {
      let components = filter(
        this.components,
        component => component.slot == slot
      );
      components.forEach(function(component) {
        component.component.default._scopeId = `data-v-${uuidv4()}`;
        return component;
      });
      return components;
    }
  },
  computed: {
    contentComponents() {
      return this.getComponents("content");
    },
    footerComponents() {
      return this.getComponents("footer");
    },
    headerComponents() {
      return this.getComponents("header");
    },
    hasHeader() {
      let hasHeaderSlot =
        Object.prototype.hasOwnProperty.call(this.$slots, "header") &&
        this.$slots.header.length > 0;
      return (
        (this.hasNavItems && this.navPosition == "top") ||
        this.headerComponents.length > 0 ||
        hasHeaderSlot
      );
    },
    hasFooter() {
      let hasFooterSlot =
        Object.prototype.hasOwnProperty.call(this.$slots, "footer") &&
        this.$slots.footer.length > 0;
      return (
        (this.hasNavItems && this.navPosition == "bottom") ||
        this.footerComponents.length > 0 ||
        hasFooterSlot
      );
    },
    hasNavItems() {
      return this.navItems.length > 0;
    }
  },
  components: {
    SidebarMenu
  }
};
</script>
