<template>
  <router-view id="messages" class="max-width"></router-view>
</template>
<script>
import merge from "lodash/merge";
export default {
  layout: {
    header: {
      class: "no-style-lg-down"
    },
    menubar: {
      components: [
        {
          component: require("@/components/matches/list.vue"),
          props: {
            actionIcon: "c-messages"
          },
          slot: "content"
        }
      ],
      icon: {
        name: "people"
      },
      navPosition: "bottom"
    }
  },
  watch: {
    "$navigator.windowWidth": {
      handler: function() {
        let vm = this;
        vm.$nextTick().then(() => {
          vm.setLayoutVars();
        });
      },
      immediate: true
    },
    $route: {
      handler: function() {
        this.setLayoutVars();
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.removeLayoutVars();
  },
  methods: {
    removeLayoutVars() {
      this.$delete(this.$navigator.layout, "header");
      this.$delete(this.$navigator.layout, "menubar");
      this.$navigator.menubarOpened = true;
    },
    setLayoutVars() {
      if (
        this.$navigator.windowWidth >= 992 &&
        this.$navigator.windowWidth <= 1200
      ) {
        let menubar = merge(this.$navigator.layoutVars.menubar, {
          inline: false
        });
        this.$set(this.$navigator.layout, "menubar", menubar);
      } else {
        this.$delete(this.$navigator.layout, "menubar");
        this.$navigator.menubarOpened = true;
      }
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
  }
};
</script>
<style lang="scss" scoped>
@media (min-width: 992px) {
  #messages {
    --padding: 16px;
    margin-top: var(--padding);
    margin-bottom: var(--padding);
    padding-inline-start: var(--padding);
    padding-inline-end: var(--padding);
  }
}
@media (min-width: 1200px) {
  #messages {
    --padding: 32px;
  }
}
</style>
