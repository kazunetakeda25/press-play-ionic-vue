<template>
  <form class="ion-page" @submit.prevent="saveProfile">
    <ion-content fullscreen>
      <ion-grid>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <h2 class="h3">Profile Basics</h2>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <settings-profile>
              <template #before>
                <settings-profile-picture></settings-profile-picture>
              </template>
            </settings-profile>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <h2 class="h3">Gender &amp; Sexuality</h2>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <settings-gender>
              <template #before>
                <ion-item>
                  <ion-label position="stacked">Gender Icon</ion-label>
                  <ion-input readonly>
                    Your gender badge
                  </ion-input>
                  <div class="gender-img" slot="end">
                    <gender-icon
                      :gender="userData.profile.gender"
                    ></gender-icon>
                  </div>
                </ion-item>
              </template>
            </settings-gender>
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
              :disabled="savingProfile || !canSubmit"
            >
              <ion-spinner v-if="savingProfile" slot="start"></ion-spinner>
              Save
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import GenderIcon from "@/components/gender/icon.vue";
import SettingsGender from "@/components/settings/gender.vue";
import SettingsProfile from "@/components/settings/profile.vue";
import SettingsProfilePicture from "@/components/settings/profile-picture.vue";
import UserData from "@/mixins/userData.js";
export default {
  computed: {
    canSubmit() {
      return this.validBasics && this.validGender;
    }
  },
  components: {
    GenderIcon,
    SettingsGender,
    SettingsProfile,
    SettingsProfilePicture
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
