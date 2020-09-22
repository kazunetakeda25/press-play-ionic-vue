<template>
  <form class="ion-page" @submit.prevent="saveSetup">
    <ion-content color="transparent" fullscreen>
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <div class="ion-text-center">
              <img
                src="../../assets/logo/logo-vertical.svg"
                width="320"
                height="350"
              />
            </div>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <div class="ion-text-center">
              <ion-text>
                <h1>
                  Why we <ion-text color="primary">can</ion-text> be friends
                </h1>
              </ion-text>
              <ion-text class="text-large">
                A short description of our terms in a friendly voice. Reminding
                everyone to be nice, and letting them know that we’re nice, and
                we’re gonna have a good time.
              </ion-text>
            </div>
          </ion-col>
        </ion-row>
        <ion-row></ion-row>
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
              :disabled="savingSetup"
            >
              <ion-spinner v-if="savingSetup" slot="start"></ion-spinner>
              Accept
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import UserData from "@/mixins/userData.js";
export default {
  next: "signup.profile",
  mixins: [UserData]
};
</script>
