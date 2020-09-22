<template>
  <form class="ion-page" @submit.prevent="saveSeeking">
    <ion-content color="transparent" fullscreen>
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <aspect-ratio
              ratio="16:9"
              class="ion-justify-content-center ion-align-items-center"
            >
              <ion-text color="light" class="ion-text-center">
                <h1 class="ion-no-margin">...getting to like you...</h1>
              </ion-text>
            </aspect-ratio>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <div class="ion-text-center ion-margin-bottom">
              <ion-text>
                <h3>I'm seeking</h3>
              </ion-text>
            </div>
            <settings-seeking></settings-seeking>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="no-style fade-to-bottom">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              type="submit"
              :disabled="savingSeeking || savingSetup || !validSeeking"
            >
              <ion-spinner v-if="savingProfile" slot="start"></ion-spinner>
              Continue
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import SettingsSeeking from "@/components/settings/seeking.vue";
import UserData from "@/mixins/userData.js";

export default {
  next: "signup.privacy",
  created() {
    this.$on("seekingSaved", function(saved) {
      if (saved) {
        this.saveSetup();
      }
    });
  },
  mixins: [UserData],
  components: {
    SettingsSeeking
  }
};
</script>
<style lang="scss" scoped>
ion-segment-button {
  min-height: 80px;
}
.select-icon-wrapper {
  border-radius: 10px;
  background-color: #eee;
  &:hover,
  &:hover * {
    cursor: pointer;
  }
}
.select-icon {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 40px;
  height: 40px;
  margin: 0 auto;
}
.gender-expression {
  width: 40px;
  height: 40px;
}
</style>
