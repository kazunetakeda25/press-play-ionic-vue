<template>
  <form class="ion-page" @submit.prevent="saveSeeking">
    <ion-content fullscreen>
      <ion-grid>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <h2 class="h3">Connect Types</h2>
            <p>
              We'll only match you to other people who fit into the criteria
              you're looking for.
            </p>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <settings-seeking></settings-seeking>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <h2 class="h3">Maximum Distance</h2>
            <p>
              We'll only match you to people who are within the distance (miles)
              range you set.
            </p>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <ion-list class="form white" lines="none">
              <ion-item>
                <ion-range
                  color="system"
                  :debounce="500"
                  :min="20"
                  :max="200"
                  pin="true"
                  snaps="true"
                  step="5"
                  ticks="false"
                  :value="userData.seeking.maxDistance"
                  @ionChange="
                    userData.seeking.maxDistance = $event.detail.value
                  "
                >
                  <ion-label slot="start">20 mi</ion-label>
                  <ion-label slot="end">200 mi</ion-label>
                </ion-range>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <h2 class="h3">Minimum Match %</h2>
            <p>
              Set a higher minimum if you'd like. A higher minimum may return
              less matches.
            </p>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6">
            <ion-list class="form white" lines="none">
              <ion-item>
                <ion-range
                  color="system"
                  :debounce="500"
                  :min="50"
                  :max="100"
                  pin="true"
                  snaps="true"
                  step="5"
                  ticks="false"
                  :value="userData.seeking.minScore"
                  @ionChange="userData.seeking.minScore = $event.detail.value"
                >
                  <ion-label slot="start">50%</ion-label>
                  <ion-label slot="end">100%</ion-label>
                </ion-range>
              </ion-item>
            </ion-list>
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
              :disabled="savingSeeking || !canSubmit"
            >
              <ion-spinner v-if="savingSeeking" slot="start"></ion-spinner>
              Save
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
  computed: {
    canSubmit() {
      return this.validSeeking;
    }
  },
  components: {
    SettingsSeeking
  },
  mixins: [UserData]
};
</script>
