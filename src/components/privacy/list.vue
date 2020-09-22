<template>
  <ion-list :lines="listLines">
    <ion-radio-group
      :class="radioGroupClass"
      :value="value"
      @ionChange="value = parseInt($event.detail.value)"
    >
      <template v-for="(option, i) in privacyLevelOptions">
        <ion-item :key="i" v-if="disabledLevels.indexOf(option.value) === -1">
          <icon :name="option.icon" slot="start"></icon>
          <ion-label class="ion-text-wrap">
            <div>
              <ion-text color="dark">
                <h3>{{ option.title }}</h3>
              </ion-text>
            </div>
            <div>
              <ion-text color="medium">
                <p>{{ option.description.replace("%s%", describer) }}</p>
              </ion-text>
            </div>
          </ion-label>
          <ion-radio
            color="system"
            :disabled="maxLevel < option.value"
            slot="end"
            :value="option.value"
          ></ion-radio>
        </ion-item>
      </template>
    </ion-radio-group>
  </ion-list>
</template>
<script>
import PrivacyField from "@/mixins/privacy-field.js";
import PrivacyOptions from "@/mixins/privacy-options.js";
export default {
  props: {
    listLines: {
      type: String,
      default: "none"
    },
    radioGroupClass: {
      type: String,
      default: "form white"
    }
  },
  mixins: [PrivacyField, PrivacyOptions]
};
</script>
