<template>
  <ion-page>
    <ion-grid
      class="ion-no-padding box-shadow content-grid"
      v-if="!loading && !error && filteredConversations.length > 0"
    >
      <ion-row>
        <ion-col class="ion-no-padding col-border" size="12" size-lg="4">
          <message-list
            :headerToolbarColor="listHeaderToolbarColor"
            :headerSegmentColor="listHeaderSegmentColor"
            ref="list"
          ></message-list>
        </ion-col>
        <ion-col
          class="ion-hide-lg-down ion-no-padding"
          size-lg="8"
          v-if="$navigator.windowWidth >= 992"
        >
          <ion-content color="medium">
            <template v-if="hasActive && lookup">
              <message-conversation
                ref="conversation"
                :show-back-button="false"
                :show-view-profile="true"
                :uid="lookup"
                @conversationAccepted="acceptedConversation"
              ></message-conversation>
            </template>
          </ion-content>
        </ion-col>
      </ion-row>
    </ion-grid>
    <ion-grid
      class="align-content-center"
      style="width: 100%;"
      v-show="!loading && error"
    >
      <ion-row class="ion-justify-content-center">
        <ion-col class="ion-text-center" size="12" size-md="6">
          <h1>Something went wrong</h1>
          <p class="text-large">
            We were unable to load your messages at this time. This is probably
            just temporary, try again.
          </p>
          <div>
            <ion-button color="system" fill="clear" @click.prevent="fetchData">
              <icon slot="start" name="refresh"></icon>
              Try Again
            </ion-button>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-page>
</template>
<script>
import Vue from "vue";
import find from "lodash/find";

import MessageConversation from "@/components/message/conversation.vue";
import MessageList from "@/components/message/list.vue";

import MessagesMixin from "@/mixins/messages.js";
import WindowMixin from "@/mixins/window.js";

export default {
  data() {
    return {
      error: false,
      listHeaderToolbarColor: "",
      listHeaderSegmentColor: "system",
      loading: false,
      modalLoading: false
    };
  },
  watch: {
    active: {
      handler: function() {
        if (
          this.$navigator.windowWidth < 992 &&
          this.hasActive &&
          !this.activeModal
        ) {
          this.openMessageModal();
        }
        if (!this.hasActive || this.matchActive.uid !== this.lookup) {
          this.$store.commit("Matches/active", {});
        }
      }
    },
    filteredConversations: {
      handler: function(filteredConversations) {
        if (
          filteredConversations.length > 0 &&
          this.hasActive == false &&
          this.$navigator.windowWidth >= 992 &&
          this.defaultConversation
        ) {
          this.$store.commit("Conversations/active", this.defaultConversation);
        }
      },
      immediate: true
    },
    matchActive: {
      handler: function(match) {
        let vm = this;
        if (match && Object.keys(match).length > 0) {
          vm.$store
            .dispatch("Conversations/getConversationByUid", { uid: match.uid })
            .then(function(conversation) {
              if (conversation.id) {
                vm.$store.commit("Conversations/active", conversation);
              } else {
                vm.openMessageModal(match.uid);
              }
            });
        }
      }
    },
    "$navigator.windowWidth": {
      handler: function(windowWidth) {
        let vm = this;
        vm.$nextTick().then(() => {
          // If windowWidth >= 992, check message modal and dissmiss if need be
          if (windowWidth >= 992 && vm.activeModal) {
            vm.activeModal.dismiss();
          }
          // If windowWidth >= 992, check that an active conversation exists
          if (
            windowWidth >= 992 &&
            vm.hasActive === false &&
            vm.filteredConversations.length > 0 &&
            vm.defaultConversation
          ) {
            vm.$store.commit("Conversations/active", vm.defaultConversation);
          }
          vm.setListProps();
        });
      },
      immediate: true
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    acceptedConversation(accepted) {
      if (accepted) {
        this.$refs.list.$emit("updateMessageFilter", "inbox");
      }
    },
    async fetchData() {
      let vm = this;

      vm.loading = true;

      await vm.$ionic.loadingController
        .create({
          message: "Loading messages..."
        })
        .then(function(e) {
          vm.loader = e;
          return vm.loader.present();
        });
      vm.$store
        .dispatch("Conversations/getConversations")
        .then(() => {
          vm.error = false;
        })
        .catch(() => {
          vm.error = true;
          return vm.$error(
            "We were unable to load your conversations. It's probably just temporary, try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.fetchData()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.loading = false;
          vm.loader.dismiss();
        });
    },
    async openMessageModal(uid) {
      let vm = this;

      if (!vm.activeModal && !vm.modalLoading) {
        vm.modalLoading = true;

        // Create MessageConversation instance
        let MessageConversationComponent = Vue.extend(MessageConversation);
        let MessageConversationInstance = new MessageConversationComponent({
          propsData: {
            showViewProfile: true,
            uid: uid || vm.lookup
          }
        });

        // Dismiss modal on back button, reset active message
        MessageConversationInstance.$on("conversationBack", function() {
          if (vm.activeModal) {
            vm.activeModal.dismiss();
          }
        });

        // Mount the instance
        MessageConversationInstance.$mount();

        await vm.$ionic.modalController
          .create({
            component: MessageConversationInstance.$el
          })
          .then(m => {
            vm.activeModal = m;
            vm.activeModal.addEventListener("ionModalDidDismiss", function() {
              vm.activeModal = undefined;
            });
            vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
              vm.setModalDimensions(e.target);
            });
          });

        return vm.activeModal.present().then(() => {
          vm.modalLoading = false;
        });
      }
    },
    setListProps() {
      if (this.$navigator.windowWidth <= 992) {
        this.listHeaderToolbarColor = "primary";
        this.listHeaderSegmentColor = "";
      } else {
        this.listHeaderToolbarColor = "";
        this.listHeaderSegmentColor = "system";
      }
    }
  },
  computed: {
    defaultConversation() {
      return find(this.filteredConversations, { accepted: true });
    },
    matchActive() {
      return this.$store.getters["Matches/active"];
    }
  },
  components: {
    MessageConversation,
    MessageList
  },
  mixins: [MessagesMixin, WindowMixin]
};
</script>
<style lang="scss" scoped>
@media (min-width: 992px) {
  .content-grid {
    border-radius: 8px;
  }
}
.col-border {
  border-right: 1px solid var(--ion-color-step-150, rgba(0, 0, 0, 0.13));
}
@media (min-width: 992px) {
  .content-grid {
    margin-top: 16px;
    margin-bottom: 16px;
  }
}
</style>
