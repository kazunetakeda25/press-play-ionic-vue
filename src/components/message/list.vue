<template>
  <ion-page>
    <ion-header class="browse-header" v-if="showFilter">
      <ion-toolbar :color="headerToolbarColor">
        <ion-segment
          :color="headerSegmentColor"
          :value="listView.filter"
          @ionChange="listView.filter = $event.target.value"
        >
          <ion-segment-button value="inbox">
            <ion-label>Inbox</ion-label>
          </ion-segment-button>
          <ion-segment-button value="requests">
            <ion-label>Requests</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-list lines="full" v-if="sortedConversations.length > 0">
        <template v-if="listView.filter !== 'requests'">
          <message-preview
            v-for="(conversation, index) in sortedConversations"
            :key="index"
            :conversation="conversation"
          >
          </message-preview>
        </template>
        <template v-if="listView.filter == 'requests'">
          <ion-item-sliding
            v-for="(conversation, index) in sortedConversations"
            :key="index"
            ref="slide"
          >
            <ion-item-options side="start">
              <ion-item-option
                color="system"
                @click.prevent="acceptConversation(conversation.id)"
              >
                <icon
                  slot="icon-only"
                  name="chatbox-outline"
                  v-show="!accepting"
                ></icon>
                <ion-spinner slot="icon-only" v-show="accepting"></ion-spinner>
              </ion-item-option>
            </ion-item-options>
            <message-preview :conversation="conversation"></message-preview>
            <ion-item-options side="end">
              <ion-item-option
                color="danger"
                @click.prevent="rejectConversation(conversation.id)"
              >
                <icon
                  slot="icon-only"
                  name="trash-outline"
                  v-show="!rejecting"
                ></icon>
                <ion-spinner slot="icon-only" v-show="rejecting"></ion-spinner>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </template>
      </ion-list>
      <ion-grid
        class="align-content-center"
        v-if="sortedConversations.length == 0"
      >
        <ion-row class="ion-justify-content-center">
          <ion-col size="auto">
            <ion-text color="medium">
              No conversations in your {{ listView.filter }}.
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer v-if="showSort">
      <ion-toolbar>
        <div class="ion-padding-horizontal" slot="start">
          Sort by
        </div>
        <ion-text color="system" slot="end">
          <ion-select
            class="ion-padding-end"
            interface="popover"
            :value="listView.order"
            @ionChange="listView.order = $event.target.value"
          >
            <ion-select-option value="desc">Newest</ion-select-option>
            <ion-select-option value="asc">Oldest</ion-select-option>
          </ion-select>
        </ion-text>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script>
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";

import MessagePreview from "@/components/message/preview.vue";

import MessagesMixin from "@/mixins/messages.js";
export default {
  props: {
    defaultMessageFilter: String,
    defaultMessageOrder: String,
    headerToolbarColor: {
      type: String,
      default: ""
    },
    headerSegmentColor: {
      type: String,
      default: "system"
    },
    showFilter: {
      type: Boolean,
      default: true
    },
    showSort: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    listView: {
      handler: function(listView) {
        this.$store.commit("Conversations/listView", listView);
      },
      deep: true
    }
  },
  created() {
    if (this.defaultMessageFilter) {
      this.listView.filter = this.defaultMessageFilter;
    }
    if (this.defaultMessageOrder) {
      this.listView.filter = this.defaultMessageOrder;
    }
    this.$on("updateMessageFilter", function(filter) {
      this.listView.filter = filter;
    });
    this.$on("updateMessageOrder", function(order) {
      this.listView.order = order;
    });
  },
  methods: {
    doRefresh(event) {
      return this.$store.dispatch("Conversations/getConversations").then(() => {
        event.target.complete();
      });
    }
  },
  computed: {
    listView() {
      return this.$store.getters["Conversations/listView"];
    },
    listConversations() {
      let vm = this;
      return filter(this.filteredConversations, o => {
        if (vm.listView.filter == "archive") {
          return vm.archivedConversationsIds.indexOf(o.id) !== -1;
        }
        if (vm.listView.filter == "inbox") {
          return (o.accepted === false && o.user2 == vm.user.uid) == false;
        }
        if (vm.listView.filter == "requests") {
          return o.accepted === false && o.user2 == vm.user.uid;
        }
      });
    },
    sortedConversations() {
      return orderBy(
        this.listConversations,
        o => o.updated.seconds + o.updated.nanoseconds,
        [this.listView.order]
      );
    }
  },
  components: {
    MessagePreview
  },
  mixins: [MessagesMixin]
};
</script>
