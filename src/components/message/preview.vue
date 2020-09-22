<template>
  <ion-item
    button
    :color="isActive ? 'light' : ''"
    detail="false"
    @click.prevent="setActive(conversation)"
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
        <div>
          <ion-text color="medium">
            <small>{{ conversation.lastMessage }}</small>
          </ion-text>
        </div>
      </ion-label>
      <ion-note color="medium" slot="end">
        {{ timeAgo }}
      </ion-note>
    </template>
    <template v-if="loading">
      <div slot="start">
        <ion-avatar style="height: 48px; width: 48px;">
          <ion-skeleton-text animated></ion-skeleton-text>
        </ion-avatar>
      </div>
      <ion-label>
        <h3>
          <ion-skeleton-text animated style="width: 60%;"></ion-skeleton-text>
        </h3>
        <p>
          <ion-skeleton-text animated style="width: 80%;"></ion-skeleton-text>
        </p>
      </ion-label>
      <ion-note color="medium" slot="end">
        {{ timeAgo }}
      </ion-note>
    </template>
    <template v-if="error">
      <ion-label color="danger">
        Couldn't load this preview
      </ion-label>
      <ion-button fill="clear" slot="start" @click.prevent="fetchBrowse">
        <icon name="refresh" slot="icon-only"></icon>
      </ion-button>
      <ion-note color="medium" slot="end">
        {{ timeAgo }}
      </ion-note>
    </template>
  </ion-item>
</template>
<script>
import moment from "moment";

import AvatarSongmate from "@/components/avatar/songmate.vue";

import BrowseMixin from "@/mixins/browse.js";
import ConversationMixin from "@/mixins/conversation.js";
import MessagesMixin from "@/mixins/messages.js";
export default {
  props: {
    conversation: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      error: false,
      loading: false,
      timeAgo: ""
    };
  },
  watch: {
    conversation: {
      handler: function() {
        this.setTimeAgo();
      },
      deep: true,
      immediate: true
    },
    lookup: {
      handler: function() {
        this.fetchBrowse();
      },
      immediate: true
    }
  },
  created() {
    window[`${this.conversation.id}Interval`] = window.setInterval(
      this.setTimeAgo,
      60000
    );
  },
  beforeDestroy() {
    window.clearInterval(window[`${this.conversation.id}Interval`]);
  },
  methods: {
    fetchBrowse() {
      let vm = this;
      if (vm.browseDoc) {
        return vm.setBrowse(vm.browseDoc);
      } else {
        vm.loading = true;
        return vm
          .getUserBrowse({ uid: vm.lookup })
          .catch(function() {
            vm.error = true;
          })
          .finally(function() {
            vm.loading = false;
          });
      }
    },
    setActive(conversation) {
      this.$store.commit("Conversations/active", conversation);
    },
    setTimeAgo() {
      this.timeAgo = moment(
        `${this.conversation.updated.seconds}.${this.conversation.updated.nanoseconds}`,
        "X"
      ).fromNow();
    }
  },
  components: {
    AvatarSongmate
  },
  computed: {
    isActive() {
      return this.hasActive ? this.conversation.id == this.active.id : false;
    },
    lookup() {
      return this.conversation.user1 == this.user.uid
        ? this.conversation.user2
        : this.conversation.user1;
    }
  },
  mixins: [BrowseMixin, ConversationMixin, MessagesMixin]
};
</script>
