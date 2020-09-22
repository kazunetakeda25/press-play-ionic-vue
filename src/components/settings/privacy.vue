<template>
  <div>
    <ion-list class="form white" lines="none">
      <ion-item class="segment-item">
        <ion-segment
          :value="segment"
          @ionChange.prevent="segment = $event.target.value"
        >
          <ion-segment-button layout="icon-top" value="profile">
            <icon name="person"></icon>
            <ion-label class="ion-text-capitalize">
              My Profile
            </ion-label>
          </ion-segment-button>
          <ion-segment-button layout="icon-top" value="fields">
            <icon name="list"></icon>
            <ion-label class="ion-text-capitalize">
              My Info
            </ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-item>
    </ion-list>

    <div v-show="segment == 'profile'">
      <privacy-list
        describer="your profile"
        :disabled-levels="[0]"
        :field="userData.settings.privacy.profile.level"
        @update:field="userData.settings.privacy.profile.level = $event"
      ></privacy-list>
    </div>

    <div v-show="segment == 'fields'">
      <ion-list class="form white" lines="none">
        <ion-item class="item-join-next">
          <ion-label>Last Name</ion-label>
          <privacy-button
            class="ion-text-capitalize"
            color="system"
            fill="clear"
            describer="your last name"
            :field="userData.settings.privacy.lastname.level"
            :max-level="userData.settings.privacy.profile.level"
            modal-title="Last Name"
            modal-sub-title="Control who can see your last name"
            @update:field="userData.settings.privacy.lastname.level = $event"
          ></privacy-button>
        </ion-item>
        <ion-item class="segment-item">
          <ion-segment
            :value="userData.settings.privacy.lastname.display"
            @ionChange.prevent="
              userData.settings.privacy.lastname.display = parseInt(
                $event.target.value
              )
            "
          >
            <ion-segment-button
              layout="icon-top"
              v-for="(option, index) in lastNameDisplayOptions"
              :key="'lastnameDisplay' + index"
              :value="option.value"
            >
              <icon
                name="radio-button-on"
                v-show="
                  userData.settings.privacy.lastname.display == option.value
                "
              ></icon>
              <icon
                name="radio-button-off"
                v-show="
                  userData.settings.privacy.lastname.display !== option.value
                "
              ></icon>
              <ion-label class="ion-text-capitalize">{{
                option.title
              }}</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-item>

        <ion-item class="item-join-next">
          <ion-label>Birthday</ion-label>
          <privacy-button
            class="ion-text-capitalize"
            color="system"
            fill="clear"
            describer="your birthday"
            :field="userData.settings.privacy.birthdate.level"
            :max-level="userData.settings.privacy.profile.level"
            modal-title="Birthday"
            modal-sub-title="Control who can see your birthday"
            @update:field="userData.settings.privacy.birthdate.level = $event"
          ></privacy-button>
        </ion-item>
        <ion-item class="item-join-top segment-item">
          <ion-segment
            :value="userData.settings.privacy.birthdate.display"
            @ionChange.prevent="
              userData.settings.privacy.birthdate.display = parseInt(
                $event.target.value
              )
            "
          >
            <ion-segment-button
              layout="icon-top"
              v-for="(option, index) in birthdateDisplayOptions"
              :key="'birthdateDisplay' + index"
              :value="option.value"
            >
              <icon
                name="radio-button-on"
                v-show="
                  userData.settings.privacy.birthdate.display == option.value
                "
              ></icon>
              <icon
                name="radio-button-off"
                v-show="
                  userData.settings.privacy.birthdate.display !== option.value
                "
              ></icon>
              <ion-label class="ion-text-capitalize">{{
                option.title
              }}</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-item>

        <ion-item>
          <ion-label>Bio</ion-label>
          <privacy-button
            class="ion-text-capitalize"
            color="system"
            fill="clear"
            describer="your bio"
            :field="userData.settings.privacy.bio.level"
            :max-level="userData.settings.privacy.profile.level"
            modal-title="Bio"
            modal-sub-title="Control who can see your bio"
            @update:field="userData.settings.privacy.bio.level = $event"
          ></privacy-button>
        </ion-item>

        <ion-item>
          <ion-label>Gender</ion-label>
          <privacy-button
            class="ion-text-capitalize"
            color="system"
            fill="clear"
            describer="your gender"
            :field="userData.settings.privacy.gender.level"
            :max-level="userData.settings.privacy.profile.level"
            modal-title="Gender"
            modal-sub-title="Control who can see your gender"
            @update:field="userData.settings.privacy.gender.level = $event"
          ></privacy-button>
        </ion-item>

        <ion-item>
          <ion-label>Location</ion-label>
          <privacy-button
            class="ion-text-capitalize"
            color="system"
            fill="clear"
            describer="your location"
            :field="userData.settings.privacy.location.level"
            :max-level="userData.settings.privacy.profile.level"
            modal-title="Location"
            modal-sub-title="Control who can see your location"
            @update:field="userData.settings.privacy.location.level = $event"
          ></privacy-button>
        </ion-item>
      </ion-list>
    </div>
  </div>
</template>
<script>
import PrivacyButton from "@/components/privacy/button.vue";
import PrivacyList from "@/components/privacy/list.vue";

import PrivacyOptions from "@/mixins/privacy-options.js";
import UserData from "@/mixins/userData.js";
export default {
  data() {
    return {
      segment: "profile"
    };
  },
  components: {
    PrivacyButton,
    PrivacyList
  },
  mixins: [PrivacyOptions, UserData]
};
</script>
