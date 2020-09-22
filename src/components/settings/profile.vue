<template>
  <ion-list class="form white" lines="none">
    <slot name="before"></slot>
    <ion-item>
      <ion-label position="stacked">First Name</ion-label>
      <ion-input
        autocapitalize="on"
        enterkeyhint="done"
        minlength="1"
        maxlength="35"
        required
        type="text"
        :value="userData.profile.firstname"
        @ionChange="userData.profile.firstname = $event.target.value"
      ></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">Last Name</ion-label>
      <ion-input
        autocapitalize="on"
        enterkeyhint="done"
        minlength="1"
        maxlength="35"
        required
        type="text"
        :value="userData.profile.lastname"
        @ionChange="userData.profile.lastname = $event.target.value"
      ></ion-input>
    </ion-item>
    <ion-item ref="birthdate">
      <ion-label position="stacked">
        Birthdate
      </ion-label>
      <ion-input
        :max="maximumBirthdate"
        required
        type="date"
        :value="userData.profile.birthdate"
        @ionChange="userData.profile.birthdate = $event.target.value"
      ></ion-input>
    </ion-item>
    <location-search
      :input-props="{
        placeholder: 'Search by zip code, place, or address',
        required: true
      }"
      :label-props="{ position: 'stacked' }"
      :locate="true"
      search-types="postcode,place,locality,address"
      :value="userData.profile.location.text"
      @selected="setLocation"
    ></location-search>
    <ion-item>
      <ion-label position="stacked">Bio</ion-label>
      <ion-textarea
        enterkeyhint="done"
        placeholder="Tell people a little about yourself..."
        rows="4"
        :value="userData.profile.bio"
        @ionChange="userData.profile.bio = $event.target.value"
      ></ion-textarea>
    </ion-item>
    <slot name="after"></slot>
  </ion-list>
</template>
<script>
import LocationSearch from "@/components/location/search.vue";
import UserData from "@/mixins/userData.js";
export default {
  watch: {
    "userData.profile.birthdate": {
      handler: function() {
        let vm = this;
        console.log("birthdate");
        vm.$nextTick().then(() => {
          vm.$refs.birthdate.classList.toggle(
            "ion-invalid",
            !vm.validBirthdate
          );
          vm.$refs.birthdate.classList.toggle("ion-valid", vm.validBirthdate);
        });
      }
    }
  },
  components: {
    LocationSearch
  },
  mixins: [UserData]
};
</script>
