<template>
  <ion-button @click.prevent="edit">
    <slot name="button-start">
      <icon :name="selected.icon" slot="start"></icon>
    </slot>
    {{ selected.title }}
    <slot name="button-end"></slot>
  </ion-button>
</template>
<script>
import Vue from "vue";
import find from "lodash/find";

import PrivacyModal from "@/components/privacy/modal.vue";

import PrivacyField from "@/mixins/privacy-field.js";
import PrivacyOptions from "@/mixins/privacy-options.js";
import WindowMixin from "@/mixins/window.js";

export default {
  props: {
    modalTitle: {
      type: String,
      default: "Privacy"
    },
    modalSubTitle: {
      type: String,
      default: ""
    }
  },
  created() {
    this.$on("resize", function() {
      if (this.activeModal) {
        this.setModalDimensions(this.activeModal);
      }
    });
  },
  methods: {
    edit() {
      let vm = this;

      // Create PrivacyModal instance
      let PrivacyModalComponent = Vue.extend(PrivacyModal);
      let PrivacyModalInstance = new PrivacyModalComponent({
        propsData: {
          describer: vm.describer,
          disabledLevels: vm.disabledLevels,
          field: vm.field,
          headerTitle: vm.modalTitle,
          headerSubTitle: vm.modalSubTitle,
          maxLevel: vm.maxLevel
        }
      });

      // Update value
      PrivacyModalInstance.$on("update:confirm", function(value) {
        vm.value = value;
        vm.activeModal.dismiss();
      });

      // Dismiss modal on confirm
      PrivacyModalInstance.$on("update:cancel", function() {
        vm.activeModal.dismiss();
      });

      // Mount the instance
      PrivacyModalInstance.$mount();

      return vm.$ionic.modalController
        .create({
          component: PrivacyModalInstance.$el,
          cssClass: "privacy-modal"
        })
        .then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
          });
          vm.activeModal.present();
        });
    },
    setModalDimensions(e) {
      let headerElement = e.querySelector("ion-header");
      let listElement = e.querySelector("ion-content > ion-list");
      let footerElement = e.querySelector("ion-footer");
      e.style.setProperty("--max-width", "80%");
      e.style.setProperty(
        "--height",
        headerElement.offsetHeight +
          listElement.offsetHeight +
          footerElement.offsetHeight +
          "px"
      );
    }
  },
  computed: {
    selected() {
      return find(this.privacyLevelOptions, { value: this.value });
    }
  },
  mixins: [PrivacyField, PrivacyOptions, WindowMixin]
};
</script>
