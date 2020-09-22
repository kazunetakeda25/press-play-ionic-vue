<template>
  <ion-content>
    <ion-list lines="full" v-show="!loading">
      <ion-list-header>Select a location</ion-list-header>
      <ion-item
        :button="true"
        detail="false"
        :key="'location' + index"
        v-for="(location, index) in locations"
        @click.prevent="selected = location"
      >
        <icon name="location" slot="end" color="primary"></icon>
        <ion-label>
          <div>
            <ion-text>
              {{ location.text }}
            </ion-text>
          </div>
          <div>
            <ion-text color="medium">
              {{ getLocationContext(location) }}
            </ion-text>
          </div>
        </ion-label>
      </ion-item>
      <ion-item
        class="ion-text-center"
        lines="none"
        v-if="locations.length == 0"
      >
        <ion-label>No results</ion-label>
      </ion-item>
    </ion-list>
    <div class="ion-text-center" v-if="loading">
      <ion-spinner class="align-center"></ion-spinner>
    </div>
  </ion-content>
</template>
<script>
import axios from "axios";
import qs from "querystring";

import Location from "@/mixins/location.js";
export default {
  props: {
    coordinates: {
      type: Object,
      default: function() {
        return {};
      }
    },
    searchTypes: {
      type: String,
      default: ""
    },
    query: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      locations: [],
      search: ""
    };
  },
  watch: {
    position: {
      handler: function(position) {
        if (this.hasPosition) {
          let value = `${position.longitude},${position.latitude}`;
          this.getLocations(value);
        }
      },
      deep: true,
      immediate: true
    },
    search: {
      handler: function(value) {
        // Reset
        this.locations = [];

        // Get locations
        let selectedCondition = this.isSelected
          ? !this.selected.place_name.includes(value)
          : true;
        if (value && selectedCondition) {
          this.getLocations(value);
        }
      },
      immediate: true
    },
    selected: {
      handler: function(selected) {
        this.$emit("select", selected);
      }
    }
  },
  created() {
    // Only set search value on initial load to prevent infinite loop
    let queryWatcher = this.$watch(
      "query",
      function(value) {
        if (queryWatcher) {
          queryWatcher();
        } else {
          this.search = value;
        }
      },
      { immediate: true }
    );

    // Only set search value on initial load to prevent infinite loop
    let coordWatcher = this.$watch(
      "coordinates",
      function(value) {
        if (coordWatcher) {
          coordWatcher();
        } else {
          this.position = value;
        }
      },
      { immediate: true }
    );

    // Listen for updateSearch
    this.$on("updateSearch", function(value) {
      this.search = value;
    });

    // Listen for updatePosition
    this.$on("updatePosition", function(value) {
      this.position = value;
    });
  },
  methods: {
    getLocations(search) {
      let vm = this;
      let query = {
        access_token:
          "pk.eyJ1IjoiZ2hvbGxleSIsImEiOiJjazdjZ3Z5eGYwNDB4M2RvemluazcwbTBhIn0.w9t5W69FAZ3VZezRDBBBCA"
      };

      if (vm.searchTypes !== "") {
        query.types = vm.searchTypes;
      }

      vm.loading = true;

      return axios
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            search
          )}.json?${qs.stringify(query)}`
        )
        .then(res => {
          let data = res.data;
          if (data.features.length > 0) {
            vm.locations = res.data.features;
          }
        })
        .finally(() => (vm.loading = false));
    },
    getLocationContext(location) {
      let strings = [];
      location.context.forEach(function(context) {
        strings.push(context.text);
      });
      return strings.join(", ");
    }
  },
  mixins: [Location]
};
</script>
