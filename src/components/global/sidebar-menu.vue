<template>
  <ion-list class="sidebar-menu" :lines="navItems.length > 1 ? 'full' : 'none'">
    <router-link
      v-for="(item, index) in navItems"
      :key="'nav' + index"
      :exact="
        typeof item.meta.menu.exact !== 'undefined'
          ? item.meta.menu.exact
          : true
      "
      :to="item"
      v-slot="{ href, navigate, isActive }"
    >
      <ion-item
        :data-active="isActive"
        :href="href"
        ref="navItem"
        @click="navigate"
      >
        <template
          v-if="item.meta.menu.icon && typeof item.meta.menu.icon == 'string'"
        >
          <icon :name="item.meta.menu.icon" slot="start"></icon>
        </template>
        <template
          v-if="item.meta.menu.icon && typeof item.meta.menu.icon == 'object'"
        >
          <icon v-bind="item.meta.menu.icon" slot="start"></icon>
        </template>
        <ion-label>{{ item.meta.menu.title }}</ion-label>
      </ion-item>
    </router-link>
  </ion-list>
</template>
<script>
export default {
  props: {
    navItems: {
      type: Array,
      default: function() {
        return [];
      },
      required: true
    }
  },
  watch: {
    navItems: {
      handler: function(navItems) {
        let vm = this;
        if (navItems.length > 0) {
          vm.$nextTick().then(function() {
            vm.$refs.navItem.forEach(function(navItem) {
              navItem.classList.toggle(
                "ion-focused",
                navItem.dataset.active === "true"
              );
            });
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="scss" scoped>
ion-list.sidebar-menu {
  padding: 0;
}
</style>
