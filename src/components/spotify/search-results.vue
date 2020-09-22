<template>
  <div>
    <ion-header v-if="searchTypes.length > 1">
      <ion-toolbar>
        <ion-segment :value="activeType" @ionChange="activeType = $event.target.value">
          <ion-segment-button class="ion-text-capitalize" value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button
            class="ion-text-capitalize"
            v-for="(type, index) in searchTypes"
            :key="'type' + index"
            :value="type"
          >
            <ion-label>{{ type }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full" class="ion-no-margin">
        <template v-for="(item, index) in results">
          <search-item
            :item="item"
            :key="index"
            selectable
            :show-type="activeType == 'all' && searchTypes.length > 1"
            v-on:selected="updateSelected"
          />
        </template>
        <ion-item class="ion-text-center" v-if="results.length == 0 && !loading">
          <ion-label>No results</ion-label>
        </ion-item>
      </ion-list>
      <div class="ion-text-center" v-if="loading">
        <ion-spinner></ion-spinner>
      </div>
    </ion-content>
  </div>
</template>
<script>
import axios from "axios";
import qs from "querystring";

import filter from "lodash/filter";
import max from "lodash/max";
import orderBy from "lodash/orderBy";
import pull from "lodash/pull";
import union from "lodash/union";

import SearchItem from "@/components/spotify/search-item.vue";

export default {
  props: {
    search: {
      type: String,
      default: ""
    },
    searchTypes: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      activeType: "all",
      limit: 50,
      loading: false,
      offset: 0,
      searched: [],
      spotifyCategories: []
    };
  },
  watch: {
    search: {
      handler: function(value) {
        let vm = this;

        // Reset search
        vm.searched = [];

        // Search spotify
        if (value) {
          vm.loading = true;
          vm.searchSpotify(value)
            .then(() => {
              vm.loading = false;
            })
            .catch(() => {
              vm.loading = false;
            });
        }
      },
      immediate: true
    }
  },
  created() {
    let vm = this;

    // Listen for updateSearch
    vm.$on("updateSearch", function(search) {
      vm.search = search;
    });

    // Load categories if genre in search type
    if (vm.searchTypes.indexOf("genre") !== -1) {
      vm.$store
        .dispatch("Spotify/getSpotifyToken")
        .then(spotifyToken => {
          async function getCategories() {
            let next =
              "https://api.spotify.com/v1/browse/categories?" +
              qs.stringify({ limit: 50 });

            do {
              await axios
                .get(next, {
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + spotifyToken.access_token
                  }
                })
                .then(res => {
                  let data = res.data;
                  let items = data.categories.items.map(item =>
                    Object.assign({}, item, { type: "genre" })
                  );

                  vm.spotifyCategories = union(vm.spotifyCategories, items);

                  next = data.next;
                })
                .catch(res => {
                  console.log(res);
                  next = null;
                });
            } while (next);

            return new Promise(r => r(vm.spotifyCategories));
          }

          return getCategories();
        })
        .then(() => {
          vm.searched = union(vm.searched, vm.genres);
        });
    }
  },
  methods: {
    async searchSpotify(value) {
      let vm = this;

      // Build query object
      let queryObject = {
        limit: vm.limit,
        offset: 0,
        type: vm.searchType,
        q: '"' + value + '"' // for strict search
      };

      // Execute search
      await vm.$store.dispatch("Spotify/getSpotifyToken").then(spotifyToken => {
        if (
          vm.searchTypes.indexOf("album") !== -1 ||
          vm.searchTypes.indexOf("artist") !== -1 ||
          vm.searchTypes.indexOf("track") !== -1
        ) {
          axios
            .get(
              "https://api.spotify.com/v1/search?" + qs.stringify(queryObject),
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + spotifyToken.access_token
                }
              }
            )
            .then(res => {
              let data = res.data;
              let albums = [];
              let artists = [];
              let tracks = [];
              let totals = [];

              if (data.albums) {
                albums = data.albums.items;
                totals.push(data.albums.total);
              }

              if (data.artists) {
                artists = data.artists.items;
                totals.push(data.artists.total);
              }

              if (data.tracks) {
                tracks = data.tracks.items;
                totals.push(data.tracks.total);
              }

              if (max(totals) > vm.limit) {
                vm.offset = vm.offset + vm.limit;
              }

              return (vm.searched = union(
                vm.searched,
                artists,
                albums,
                tracks
              ));
            })
            .catch(res => {
              console.log(res);
              return (vm.searched = []);
            });
        }
      });

      // Handle genres
      if (vm.searchTypes.indexOf("genre") !== -1) {
        vm.searched = union(vm.searched, vm.genres);
      }

      return new Promise(r => r(vm.searched));
    },

    updateSelected(item) {
      this.$emit("updateSelected", item);
    }
  },
  computed: {
    searchType() {
      return pull(this.searchTypes, "genre").join(",");
    },

    genres() {
      let vm = this;
      let categories = filter(vm.spotifyCategories, function(category) {
        return (
          !vm.search ||
          category.name.toLowerCase().indexOf(vm.search.toLowerCase()) !== -1
        );
      });
      let results = orderBy(categories, ["name"], ["asc"]);

      return results;
    },

    results() {
      let vm = this;
      return filter(
        vm.searched,
        searched => vm.activeType == "all" || searched.type == vm.activeType
      );
    }
  },
  components: {
    SearchItem
  }
};
</script>
