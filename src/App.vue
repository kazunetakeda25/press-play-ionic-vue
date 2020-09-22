<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
<script>
import WebFont from "webfontloader";
WebFont.load({
  google: {
    families: ["Nunito:400"]
  }
});
const default_layout = "default";
export default {
  data() {
    return {
      refreshing: false,
      registration: null
    };
  },

  created() {
    document.addEventListener("swUpdated", this.showRefreshUI, { once: true });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.refreshing) return;
      this.refreshing = true;
      window.location.reload();
    });
  },

  methods: {
    showRefreshUI(e) {
      let vm = this;
      vm.registration = e.detail;
      vm.$toast("New update available!", {
        buttons: [
          {
            side: "end",
            text: "Refresh",
            handler: () => vm.refreshApp()
          }
        ],
        color: "dark",
        duration: undefined,
        position: "bottom"
      });
    },

    refreshApp() {
      if (!this.registration || !this.registration.waiting) {
        return;
      }
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  },

  computed: {
    layout() {
      return (this.$route.meta.layout || default_layout) + "-layout";
    }
  }
};
</script>
<style lang="scss">
@import "./assets/css/global.scss";
</style>
