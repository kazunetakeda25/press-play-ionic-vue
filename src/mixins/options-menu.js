import Vue from "vue";
import OptionsList from "@/components/global/options-list.vue";
export default {
  methods: {
    openOptionsPopover(event, options) {
      let vm = this;

      // Create results instance
      let OptionsComponent = Vue.extend(OptionsList);
      let OptionsInstance = new OptionsComponent({
        propsData: {
          options: options
        }
      });

      // Listen for select
      OptionsInstance.$on("optionListSelect", function(value) {
        vm.$emit("optionMenuSelected", value);
        vm.optionsPopover.dismiss();
      });

      OptionsInstance.$mount();

      return vm.$ionic.popoverController
        .create({
          component: OptionsInstance.$el,
          event: event,
          keyboardClose: true,
          showBackdrop: false
        })
        .then(m => {
          vm.optionsPopover = m;
          // Clear vars on dismiss
          vm.optionsPopover.addEventListener(
            "ionPopoverDidDismiss",
            function() {
              vm.optionsPopover = undefined;
            }
          );
          vm.optionsPopover.present();
        });
    }
  }
};
