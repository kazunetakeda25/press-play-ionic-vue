<template>
  <form class="ion-page" @submit.prevent="saveSettings">
    <ion-content fullscreen>
      <ion-grid>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <h2 class="h3">Profile Privacy</h2>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <settings-privacy></settings-privacy>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <h2 class="h3">Blocked Users</h2>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <ion-list lines="full" v-if="blockedUsers.length > 0">
              <browse-blocked
                v-for="(blockedUser, index) in blockedUsers"
                :key="index"
                :blocked="blockedUser"
              ></browse-blocked>
            </ion-list>
            <ion-text color="medium" v-else>
              <h4 class="ion-text-center">
                You haven't blocked any users.
              </h4>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="no-style fade-to-bottom">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              type="submit"
              :disabled="savingSettings"
            >
              <ion-spinner v-if="savingSettings" slot="start"></ion-spinner>
              Save
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import { mapGetters } from "vuex";

import BrowseBlocked from "@/components/browse/blocked.vue";
import SettingsPrivacy from "@/components/settings/privacy.vue";
import UserData from "@/mixins/userData.js";
export default {
  created() {
    this.$store.dispatch("User/getBlockedUsers");
  },
  computed: {
    ...mapGetters({
      blockedUsers: "User/blockedUsers"
    })
  },
  components: {
    BrowseBlocked,
    SettingsPrivacy
  },
  mixins: [UserData]
};
</script>
<style lang="scss" scoped>
.gender-img {
  min-width: 48px;
  min-height: 48px;
}
</style>
