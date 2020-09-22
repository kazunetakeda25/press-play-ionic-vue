<template>
  <ion-toolbar class="blurple-vertical-gradient sidebar-header-toolbar">
    <div class="ion-padding-horizontal" slot="start">
      <avatar size="sm" class="box-shadow"></avatar>
    </div>
    <ion-title color="light" size="small">
      <div>{{ user.displayName }}</div>
      <div>
        <router-link :to="{ name: 'profile' }" v-slot="{ href, navigate }">
          <small>
            <a class="ion-text-uppercase" :href="href" @click="navigate">
              View Profile
            </a>
          </small>
        </router-link>
      </div>
    </ion-title>
    <ion-menu-button color="light" menu="sidebar" slot="end"></ion-menu-button>
  </ion-toolbar>
</template>
<script>
import UserData from "@/mixins/userData.js";
export default {
  mixins: [UserData]
};
</script>
<style lang="scss">
ion-toolbar.sidebar-header-toolbar {
  --min-height: 72px;
  ion-avatar {
    border: 3px solid #ffffff;
  }
  ion-title {
    padding-inline-start: 0;
  }
  a {
    color: var(--ion-color-secondary, #ffffff);
    text-decoration: none;
  }
}
</style>
