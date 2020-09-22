<template>
  <ion-page>
    <template v-if="!loading && !error">
      <ion-content>
        <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        <ion-list lines="full" v-if="sortedSongmates.length > 0 && !error">
          <list-item
            v-for="(songmate, index) in sortedSongmates"
            :key="index"
            :action-icon="actionIcon"
            :action-icon-color="actionIconColor"
            :songmate="songmate"
            :show-action-icon="showActionIcon"
            :show-metadata="false"
          >
          </list-item>
        </ion-list>
        <ion-grid
          class="align-content-center"
          v-show="sortedSongmates.length == 0"
        >
          <ion-row class="ion-justify-content-center">
            <ion-col class="ion-text-center">
              <ion-text color="medium">
                {{ `No SongMates in your cleared list.` }}
              </ion-text>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
      <ion-footer v-show="showToolbar">
        <ion-toolbar>
          <ion-searchbar
            :debounce="300"
            placeholder="Search by name"
            @ionChange="search = $event.target.value"
          ></ion-searchbar>
        </ion-toolbar>
        <ion-toolbar>
          <div class="ion-padding-horizontal" slot="start">
            Sort by
          </div>
          <ion-text color="system" slot="end">
            <ion-select
              class="ion-padding-end"
              interface="popover"
              :value="listView.orderBy"
              @ionChange="listView.orderBy = $event.target.value"
            >
              <ion-select-option value="name">Name</ion-select-option>
              <ion-select-option value="date">Date</ion-select-option>
            </ion-select>
          </ion-text>
          <ion-text color="system" slot="end">
            <ion-select
              class="ion-padding-end"
              interface="popover"
              :value="listView.order"
              @ionChange="listView.order = $event.target.value"
            >
              <ion-select-option value="asc">
                {{ listOrderLabelAscendingLabel }}
              </ion-select-option>
              <ion-select-option value="desc">
                {{ listOrderLabelDescendingLabel }}
              </ion-select-option>
            </ion-select>
          </ion-text>
        </ion-toolbar>
      </ion-footer>
    </template>
    <template v-if="!loading && error">
      <ion-content>
        <ion-grid class="align-content-center">
          <ion-row class="ion-justify-content-center">
            <ion-col class="ion-text-center" size="12">
              <h4>Something went wrong</h4>
              <p>
                We were unable to load your SongMates at this time. This is
                probably just temporary, try again.
              </p>
              <div>
                <ion-button
                  color="system"
                  fill="clear"
                  @click.prevent="fetchData"
                >
                  <icon slot="start" name="refresh"></icon>
                  Try Again
                </ion-button>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </template>
    <template v-if="loading">
      <ion-content>
        <ion-grid class="align-content-center">
          <ion-row class="ion-justify-content-center">
            <ion-col class="ion-text-center" size="12">
              <ion-spinner></ion-spinner>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </template>
  </ion-page>
</template>
<script>
import { mapGetters } from "vuex";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";

import ListItem from "@/components/matches/list-item.vue";
import UserDataMixin from "@/mixins/userData.js";
export default {
  props: {
    actionIcon: {
      type: String,
      default: "play"
    },
    actionIconColor: {
      type: String,
      default: "medium"
    },
    defaultListOrderBy: String,
    defaultListOrder: String,
    showToolbar: {
      type: Boolean,
      default: true
    },
    showActionIcon: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      error: false,
      loading: false,
      search: ""
    };
  },
  watch: {
    listView: {
      handler: function(listView) {
        this.$store.commit("Matches/listViewDisliked", listView);
      },
      deep: true
    },
    // vm.loading can sometimes stay true even after finished loading (multiple component instances)
    // Check songmates and error to over write
    songmates: {
      handler: function(songmates) {
        if (songmates && Array.isArray(songmates) && !this.error) {
          this.loading = false;
        }
      }
    }
  },
  created() {
    if (this.defaultListOrderBy) {
      this.listView.orderBy = this.defaultListOrderBy;
    }
    if (this.defaultListOrder) {
      this.listView.order = this.defaultListOrder;
    }
    let unwatch = this.$watch(
      "songmates",
      function(songmates) {
        if (unwatch) {
          return unwatch();
        }
        if (songmates && songmates.length == 0) {
          this.fetchData();
        }
      },
      {
        immediate: true
      }
    );
  },
  beforeDestroy() {
    this.$store.commit("Matches/active", {});
  },
  methods: {
    doRefresh(event) {
      return Promise.all(this.stores).then(() => {
        event.target.complete();
      });
    },
    fetchData() {
      let vm = this;
      vm.error = false;
      vm.loading = true;
      return Promise.all(vm.stores)
        .catch(function() {
          vm.error = true;
        })
        .finally(function() {
          vm.loading = false;
        });
    }
  },
  computed: {
    ...mapGetters({
      listView: "Matches/listViewDisliked",
      songmates: "User/songmatesDisliked"
    }),
    listOrderLabelAscendingLabel() {
      let label = "";
      switch (this.listView.orderBy) {
        case "date":
          label = "Oldest";
          break;
        case "name":
          label = "A - Z";
          break;
      }
      return label;
    },
    listOrderLabelDescendingLabel() {
      let label = "";
      switch (this.listView.orderBy) {
        case "date":
          label = "Newest";
          break;
        case "name":
          label = "Z - A";
          break;
      }
      return label;
    },
    sortedSongmates() {
      let vm = this;
      let filteredSongmates = filter(
        vm.songmates,
        o => vm.blockedUsersIds.indexOf(o.uid) === -1
      );
      return orderBy(
        filteredSongmates,
        o => {
          if (vm.listView.orderBy == "date") {
            return o.updated.seconds + o.updated.nanoseconds;
          }
          if (vm.listView.orderBy == "name") {
            return o.browse.profile.displayName;
          }
        },
        vm.listView.order
      );
    },
    stores() {
      return [
        this.$store.dispatch("User/getBlockedUsers"),
        this.$store.dispatch("User/getSongmates"),
        this.$store.dispatch("User/getSongmatesDisliked")
      ];
    }
  },
  components: {
    ListItem
  },
  mixins: [UserDataMixin]
};
</script>
<style lang="scss">
ion-toolbar {
  ion-searchbar {
    --padding: var(--ion-padding, 16px);
    --box-shadow: none !important;
    padding-inline-start: var(--padding) !important;
    padding-inline-end: var(--padding) !important;
    padding-top: var(--padding) !important;
    padding-bottom: var(--padding) !important;
  }
}
</style>
