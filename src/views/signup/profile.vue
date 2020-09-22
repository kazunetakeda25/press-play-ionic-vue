<template>
  <form class="ion-page" @submit.prevent="saveProfile">
    <ion-content color="transparent" fullscreen>
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-lg="4">
            <aspect-ratio
              ratio="16:9"
              class="ion-justify-content-center ion-align-items-center"
            >
              <ion-text color="light" class="ion-text-center">
                <h1>Welcome, {{ displayName }}!</h1>
                <p>Let's start setting up your profile.</p>
              </ion-text>
            </aspect-ratio>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-lg="4">
            <avatar-editor
              size="xl"
              @uploadingAvatar="updateUploadingAvatar"
            ></avatar-editor>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-lg="4">
            <ion-list class="form white" lines="none">
              <ion-item lines="none">
                <ion-label position="stacked">
                  Birthdate
                </ion-label>
                <ion-input
                  required
                  type="date"
                  :value="userData.profile.birthdate"
                  @ionInput="userData.profile.birthdate = $event.target.value"
                ></ion-input>
              </ion-item>
              <location-search
                :input-props="{
                  required: true,
                  placeholder: 'Search by zip code, place, or address'
                }"
                :label-props="{ position: 'stacked' }"
                lines="none"
                :locate="true"
                search-types="postcode,place,locality,address"
                :value="userData.profile.location.text"
                @selected="setLocation"
              ></location-search>
              <ion-item lines="none">
                <ion-label position="stacked">Bio</ion-label>
                <ion-textarea
                  rows="4"
                  placeholder="Tell people a little about yourself..."
                  :value="userData.profile.bio"
                  @ionInput="userData.profile.bio = $event.target.value"
                ></ion-textarea>
              </ion-item>
            </ion-list>
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
              :disabled="savingProfile || !validBasics"
            >
              <ion-spinner
                v-if="savingProfile || savingSetup"
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
import AvatarEditor from "@/components/avatar/editor.vue";
import LocationSearch from "@/components/location/search.vue";

import UserData from "@/mixins/userData.js";

export default {
  next: "signup.gender",

  data() {
    return {
      uploadingAvatar: false
    };
  },

  created() {
    this.$on("profileSaved", function(saved) {
      if (saved) {
        this.saveSetup();
      }
    });
  },

  methods: {
    updateUploadingAvatar(value) {
      this.uploadingAvatar = value;
    }
  },

  components: {
    AvatarEditor,
    LocationSearch
  },

  mixins: [UserData]
};
</script>
