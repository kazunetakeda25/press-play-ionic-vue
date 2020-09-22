<template>
  <form class="ion-page" @submit.prevent="saveSettings">
    <ion-content color="transparent" fullscreen>
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-lg="4">
            <aspect-ratio
              ratio="16:9"
              class="ion-justify-content-center ion-align-items-center"
            >
              <ion-text color="light" class="ion-text-center">
                <h1>...between the notes...</h1>
                <p>
                  Let's make sure your profile is shared the way you want it to.
                </p>
              </ion-text>
            </aspect-ratio>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-lg="4">
            <settings-privacy></settings-privacy>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="no-style fade-to-bottom">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6" size-lg="4">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              type="submit"
              :disabled="savingSettings"
            >
              <ion-spinner
                v-if="savingSettings || savingSetup"
                slot="start"
              ></ion-spinner>
              Continue
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import SettingsPrivacy from "@/components/settings/privacy.vue";
import UserData from "@/mixins/userData.js";
export default {
  next: "signup.genres",
  data() {
    return {
      segment: "profile"
    };
  },
  created() {
    this.$on("settingsSaved", function(saved) {
      if (saved) {
        this.saveSetup();
      }
    });
  },
  components: {
    SettingsPrivacy
  },
  mixins: [UserData]
};
</script>
