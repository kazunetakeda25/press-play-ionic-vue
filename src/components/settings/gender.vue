<template>
  <ion-list class="form white" lines="none">
    <slot name="before"></slot>
    <ion-item>
      <ion-label>Gender Identity</ion-label>
      <ion-select
        placeholder="Select genders"
        :value="userData.profile.gender.identity"
        @ionChange="userData.profile.gender.identity = $event.detail.value"
      >
        <ion-select-option
          v-for="(item, i) in identities"
          :key="'identities' + i"
          :value="item.id"
          >{{ item.text }}</ion-select-option
        >
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Gender Expression</ion-label>
      <ion-select
        placeholder="Select expression"
        :value="userData.profile.gender.expression"
        @ionChange="userData.profile.gender.expression = $event.detail.value"
      >
        <ion-select-option
          v-for="(item, i) in expressions"
          :key="'expressions' + i"
          :value="item.id"
          >{{ item.text }}</ion-select-option
        >
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Gender Pronoun</ion-label>
      <ion-select
        placeholder="Select pronoun"
        :value="userData.profile.gender.pronoun"
        @ionChange="userData.profile.gender.pronoun = $event.detail.value"
      >
        <ion-select-option
          v-for="(item, i) in pronouns"
          :key="'pronouns' + i"
          :value="item.id"
          >{{ item.text }}</ion-select-option
        >
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Sexual Orientation</ion-label>
      <ion-select
        placeholder="Select expression"
        :value="userData.profile.gender.orientation"
        @ionChange="userData.profile.gender.orientation = $event.detail.value"
      >
        <ion-select-option
          v-for="(item, i) in orientations"
          :key="'orientations' + i"
          :value="item.id"
          >{{ item.text }}</ion-select-option
        >
      </ion-select>
    </ion-item>
    <slot name="after"></slot>
  </ion-list>
</template>
<script>
import Gender from "@/mixins/gender.js";
import UserData from "@/mixins/userData.js";
export default {
  mixins: [Gender, UserData]
};
</script>
