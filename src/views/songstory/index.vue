<template>
  <router-view id="songstory" class="max-width"></router-view>
</template>
<script>
export default {
  layout: {
    content: {
      fullscreen: true
    },
    header: {
      class: "no-style-lg-down"
    },
    footer: {
      toolbarStyle: "secondary"
    }
  }
};
</script>
<style lang="scss" scoped>
@media (min-width: 992px) {
  #songstory {
    --padding: 16px;
    padding-inline-start: var(--padding);
    padding-inline-end: var(--padding);
    padding-top: var(--padding);
    padding-bottom: var(--padding);
  }
}
@media (min-width: 1200px) {
  #songstory {
    --padding: 32px;
  }
}
</style>
