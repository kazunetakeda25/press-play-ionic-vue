<template>
  <ion-item
    button
    :color="isActive ? 'light' : ''"
    detail="false"
    @click.prevent="setActive(songmate)"
  >
    <template v-if="!error && !loading && hasBrowse">
      <div slot="start">
        <avatar-songmate
          :browse-ref="browse"
          :images="browse.profile.avatars"
          size="sm"
        ></avatar-songmate>
      </div>
      <ion-label>
        <ion-text color="dark">
          {{ browseDisplayName }}
        </ion-text>
        <template v-if="showMetadata">
          <div>
            <template v-if="metadata == 'score'">
              <ion-text color="medium">
                <small>Overall {{ score }} match</small>
              </ion-text>
            </template>
            <template v-if="metadata == 'timeAgo'">
              <ion-text color="medium">
                <small>Matched {{ timeAgo }}</small>
              </ion-text>
            </template>
          </div>
        </template>
      </ion-label>
      <ion-button
        :color="actionIconColor"
        fill="clear"
        slot="end"
        v-if="showActionIcon"
      >
        <icon :name="actionIcon" slot="icon-only"></icon>
      </ion-button>
    </template>
    <template v-if="loading">
      <div slot="start">
        <ion-avatar style="height: 48px; width: 48px;">
          <ion-skeleton-text animated></ion-skeleton-text>
        </ion-avatar>
      </div>
      <ion-label>
        <ion-skeleton-text animated style="width: 60%;"></ion-skeleton-text>
      </ion-label>
    </template>
    <template v-if="error">
      <ion-label color="danger">
        Couldn't load this SongMate
      </ion-label>
      <ion-button fill="clear" slot="start" @click.prevent="fetchBrowse">
        <icon name="refresh" slot="icon-only"></icon>
      </ion-button>
    </template>
  </ion-item>
</template>
<script>
import moment from "moment";

import AvatarSongmate from "@/components/avatar/songmate.vue";
import BrowseMixin from "@/mixins/browse.js";
export default {
  props: {
    actionIcon: {
      type: String,
      default: "chatbox"
    },
    actionIconColor: {
      type: String,
      default: "medium"
    },
    metadata: {
      type: String,
      default: "score"
    },
    showActionIcon: {
      type: Boolean,
      default: true
    },
    showMetadata: {
      type: Boolean,
      default: true
    },
    songmate: {
      type: Object,
      required: true
    }
  },
  watch: {
    songmate: {
      handler: function(songmate) {
        if (Object.prototype.hasOwnProperty.call(songmate, "uid")) {
          this.uid = songmate.uid;
        }
        this.fetchBrowse();
        if (this.showMetadata) {
          this.setTimeAgo();
        }
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      error: false,
      loading: true,
      timeAgo: ""
    };
  },
  created() {
    if (this.showMetadata) {
      window[`${this.songmate.id}Interval`] = window.setInterval(
        this.setTimeAgo,
        60000
      );
    }
  },
  beforeDestroy() {
    if (this.showMetadata) {
      window.clearInterval(window[`${this.songmate.id}Interval`]);
    }
  },
  methods: {
    fetchBrowse() {
      let vm = this;
      if (vm.songmate.browse && Object.keys(vm.songmate.browse).length > 0) {
        vm.loading = false;
        return vm.setBrowse(
          Object.assign({}, vm.songmate.browse, {
            songmate: vm.songmate.songmate
          })
        );
      } else {
        return vm
          .getUserBrowse({ uid: vm.songmate.uid })
          .catch(function() {
            vm.error = true;
          })
          .finally(function() {
            vm.loading = false;
          });
      }
    },
    setActive(songmate) {
      this.$store.commit("Matches/active", songmate);
    },
    setTimeAgo() {
      this.timeAgo = moment(
        `${this.songmate.songmate.created.seconds}.${this.songmate.songmate.created.nanoseconds}`,
        "X"
      ).fromNow();
    }
  },
  computed: {
    active() {
      return this.$store.getters["Matches/active"];
    },
    isActive() {
      return this.hasActive ? this.songmate.id == this.active.id : false;
    },
    hasActive() {
      return this.active ? Object.keys(this.active).length > 0 : false;
    },
    score() {
      return `${Math.round(this.songmate.songmate.score * 100)}%`;
    }
  },
  components: {
    AvatarSongmate
  },
  mixins: [BrowseMixin]
};
</script>
