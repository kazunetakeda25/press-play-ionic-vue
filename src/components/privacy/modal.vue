<template>
  <ion-page>
    <ion-header :class="{ 'has-sub-title': headerSubTitle }">
      <ion-toolbar>
        <ion-title>{{ headerTitle }}</ion-title>
      </ion-toolbar>
      <ion-toolbar v-if="headerSubTitle">
        <ion-title color="medium" size="small">
          {{ headerSubTitle }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <privacy-list
        :describer="describer"
        :disabled-levels="disabledLevels"
        :field="field"
        :max-level="maxLevel"
        radio-group-class=""
        @update:field="value = $event"
      ></privacy-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button color="medium" @click.prevent="$emit('update:cancel')">
            Cancel
          </ion-button>
          <ion-button
            color="system"
            @click.prevent="$emit('update:confirm', value)"
          >
            Confirm
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script>
import PrivacyList from "@/components/privacy/list.vue";

import PrivacyField from "@/mixins/privacy-field.js";
import PrivacyOptions from "@/mixins/privacy-options.js";
export default {
  props: {
    headerTitle: {
      type: String,
      default: "Privacy"
    },
    headerSubTitle: {
      type: String,
      default: ""
    }
  },
  components: {
    PrivacyList
  },
  mixins: [PrivacyField, PrivacyOptions]
};
</script>
<style lang="scss" scoped>
ion-header.md.has-sub-title {
  ion-toolbar.toolbar-title-default {
    --min-height: 36px;
    --padding-top: 10px;
  }
  ion-toolbar.toolbar-title-small {
    --min-height: 36px;
    --padding-bottom: 10px;
  }
}
ion-header.ios.has-sub-title {
  ion-toolbar.toolbar-title-small {
    --min-height: 30px;
    ion-title {
      padding-top: 0;
      padding-bottom: 6px;
    }
  }
}
</style>
