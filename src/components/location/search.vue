<template>
  <ion-item ref="search">
    <slot name="search-start"></slot>
    <ion-label v-bind="labelProps">{{ label }}</ion-label>
    <ion-input
      :value="search"
      ref="input"
      v-bind="searchInputProps"
      @ionChange="handleInput"
    >
      <slot name="input"></slot>
    </ion-input>
    <slot name="search-end"></slot>
    <ion-button
      class="ion-no-padding ion-align-self-end"
      color="medium"
      fill="clear"
      slot="end"
      v-if="locate && !locating"
      @click.prevent="getLocation"
    >
      <icon name="locate" slot="icon-only"></icon>
    </ion-button>
    <ion-spinner
      class="ion-align-self-end"
      name="dots"
      slot="end"
      v-show="locating"
    ></ion-spinner>
  </ion-item>
</template>
<script>
import Vue from "vue";
import SearchResults from "@/components/location/search-results.vue";
import Location from "@/mixins/location.js";
export default {
  defaultInputProps: {
    "clear-input": true,
    debounce: 300,
    inputmode: "search",
    type: "search"
  },

  props: {
    inputProps: {
      type: Object,
      default: function() {
        return {};
      }
    },
    indexTrack: {
      type: [Number, String],
      default: ""
    },
    label: {
      type: String,
      default: "Location"
    },
    labelProps: {
      type: Object,
      default: function() {
        return {};
      }
    },
    locate: {
      type: Boolean,
      default: false
    },
    searchTypes: {
      type: String,
      default: ""
    },
    value: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      locating: false,
      search: ""
    };
  },

  watch: {
    position: {
      handler: function(position) {
        if (this.popover && this.hasPosition) {
          this.resultsInstance.$emit("updatePosition", position);
        }
      }
    },
    search: {
      handler: function(search) {
        let vm = this;
        if (search == "") {
          vm.selected = {};
        }
        vm.$nextTick(function() {
          if (vm.popover) {
            vm.resultsInstance.$emit("updateSearch", search);
          }
        });
      }
    },
    selected: {
      handler: function(value) {
        this.$emit("selected", {
          selected: value,
          text: this.getLocationText(value),
          index: this.indexTrack
        });
      }
    }
  },

  created() {
    // Only set search value on initial load to prevent infinite loop
    let unwatch = this.$watch(
      "value",
      function(value) {
        if (unwatch) {
          unwatch();
        } else {
          this.search = value;
        }
      },
      { immediate: true }
    );
  },

  mounted() {
    // Attach focusout listener to search input instead of @ionBlur
    // Provides event.relatedTarget
    let vm = this;
    vm.$refs.input.getInputElement().then(function(e) {
      e.focus();
      e.addEventListener("focusout", vm.handleBlur);
    });
  },

  methods: {
    getLocation() {
      let vm = this;
      if (navigator.geolocation) {
        vm.locating = true;
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            vm.position = { latitude, longitude };
            vm.search = "";
            vm.locating = false;
          },
          error => {
            let message = "Can't detect your current location.";
            if (error.code == 1) {
              message = "Permission to get your location was denied.";
            }
            vm.$toast(message);

            vm.locating = false;
          }
        );
      } else {
        vm.$toast("Can't detect your current location.");
      }
    },

    // If new focus in the popover, do nothing, else dismiss popover
    // event.relatedTarget will be null if the focus is in the popover
    // @TODO: This is weird and unexpected behavior, check other browsers
    handleBlur(event) {
      if (this.popover && event.relatedTarget !== null) {
        this.popover.dismiss();
      }
    },

    handleInput(event) {
      let vm = this;

      // Set search value
      vm.search = event.target.value;

      // Handle existing popover, prepop for genre type
      if (typeof vm.popover === "undefined") {
        // Create results instance
        let ResultsComponent = Vue.extend(SearchResults);
        let ResultsInstance = new ResultsComponent({
          propsData: {
            searchTypes: vm.searchTypes,
            coordinates: vm.position,
            query: vm.search
          }
        });

        // Listen for select
        ResultsInstance.$on("select", function(selected) {
          vm.selected = selected;
          vm.search = vm.getLocationText(selected);
          vm.popover.dismiss();
        });

        ResultsInstance.$mount();

        vm.resultsInstance = ResultsInstance;

        vm.$ionic.popoverController
          .create({
            cssClass: "search-results",
            component: vm.resultsInstance.$el,
            event: Object.assign({}, event, { target: vm.$refs.search }), // Aligns popover to the ion-item instead of input
            keyboardClose: false,
            mode: "md",
            showBackdrop: false
          })
          .then(m => {
            vm.popover = m;
            // Set max width property to width of search element
            vm.popover.addEventListener("ionPopoverWillPresent", function(e) {
              e.target.style.setProperty(
                "--max-width",
                vm.$refs.search.offsetWidth + "px"
              );
            });
            // Clear popover on dismiss
            vm.popover.addEventListener("ionPopoverDidDismiss", function() {
              vm.popover = undefined;
            });
            vm.popover.present();
          });
      }
    }
  },

  computed: {
    searchInputProps() {
      return Object.assign(
        {},
        this.$options.defaultInputProps,
        this.inputProps
      );
    }
  },

  mixins: [Location]
};
</script>
<style lang="scss" scoped>
ion-item {
  ion-button {
    --background-focused: transparent;
    --background-hover: transparent;
  }
}
</style>
