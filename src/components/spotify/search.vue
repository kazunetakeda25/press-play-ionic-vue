<template>
  <div>
    <template v-if="!isSelected && !hasSong">
      <ion-item lines="none" ref="search">
        <slot name="search-start">
          <icon name="search" slot="start"></icon>
        </slot>
        <ion-input
          clear-input
          type="search"
          :debounce="300"
          :placeholder="placeholderValue"
          ref="input"
          :value="search"
          @ionChange="handleInput"
          @ionFocus="handleInput"
        ></ion-input>
        <slot name="search-end"></slot>
      </ion-item>
    </template>
    <template v-if="!isSelected && hasSong">
      <search-item :item="preSelected">
        <template v-slot:itemend>
          <icon name="close" slot="end" @click.native.prevent="clearSelected"></icon>
        </template>
      </search-item>
    </template>
    <template v-if="isSelected">
      <search-item :item="selected">
        <template v-slot:itemend>
          <icon name="close" slot="end" @click.native.prevent="clearSelected"></icon>
        </template>
      </search-item>
    </template>
  </div>
</template>
<script>
import Vue from "vue";

import SearchItem from "@/components/spotify/search-item.vue";
import SearchResults from "@/components/spotify/search-results.vue";
import SpotifyFunctions from "@/mixins/spotify.js";

export default {
  props: {
    searchTypes: {
      type: Array,
      default: function() {
        return ["album", "artist", "track"];
      }
    },
    placeholder: {
      type: String,
      default: ""
    },
    indexTrack: {
      type: [Number, String],
      default: ""
    },
    song: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },

  data() {
    return {
      preSelected: {},
      search: "",
      selected: {}
    };
  },

  watch: {
    song: {
      handler: function(song) {
        this.preSelected = song;
      },
      immediate: true,
      deep: true
    },

    selected: {
      handler: function(value) {
        this.$emit("spotifySelect", {
          selected: value,
          index: this.indexTrack
        });
      }
    }
  },

  mounted() {
    // Attach focusout listener to search input instead of @ionBlur
    // Provides event.relatedTarget
    let vm = this;
    vm.$watch(
      v => {
        return { isSelected: v.isSelected, hasSong: v.hasSong };
      },
      function(values) {
        if (!values.isSelected && !values.hasSong) {
          vm.$refs.input.getInputElement().then(function(e) {
            e.focus();
            e.addEventListener("focusout", vm.handleBlur);
          });
        }
      },
      { immediate: true }
    );
  },

  methods: {
    clearSelected() {
      this.search = "";
      this.selected = {};
      this.preSelected = {};
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
      if (
        typeof vm.popover === "undefined" &&
        ((typeof vm.popover === "undefined" &&
          vm.searchTypes.indexOf("genre") !== -1) ||
          vm.search !== "")
      ) {
        // Create results instance
        let ResultsComponent = Vue.extend(SearchResults);
        let ResultsInstance = new ResultsComponent({
          propsData: {
            search: vm.search,
            searchTypes: vm.searchTypes
          }
        });

        // Listen for select
        ResultsInstance.$on("updateSelected", function(selected) {
          vm.selected = selected;
          vm.popover.dismiss();
        });

        ResultsInstance.$mount();

        vm.resultsInstance = ResultsInstance;

        // Update the search prop
        vm.unwatch = vm.$watch("search", function(search) {
          vm.resultsInstance.$emit("updateSearch", search);
        });

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
            // Clear vars on dismiss
            vm.popover.addEventListener("ionPopoverDidDismiss", function() {
              if (vm.unwatch) {
                vm.unwatch();
              }
              vm.popover = undefined;
            });
            vm.popover.present();
          });
      }
    }
  },

  computed: {
    searchType() {
      return this.searchTypes.join(",");
    },

    isSelected() {
      return Object.keys(this.selected).length > 0;
    },

    hasSong() {
      return Object.keys(this.preSelected).length > 0;
    },

    placeholderValue() {
      if (this.placeholder) {
        return this.placeholder;
      } else {
        let strings = [];
        this.searchTypes.forEach(function(type) {
          strings.push(type + "s");
        });
        return "Search for " + strings.join(", ");
      }
    }
  },

  components: {
    SearchItem
  },

  mixins: [SpotifyFunctions]
};
</script>
