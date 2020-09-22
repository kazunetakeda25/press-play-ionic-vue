<template>
  <ion-page>
    <ion-grid
      class="ion-no-padding box-shadow content-grid"
      v-if="!loading && !error"
    >
      <ion-row>
        <ion-col class="col-border" size="12" size-lg="4">
          <message-list
            default-message-filter="archive"
            :show-filter="false"
            ref="list"
          ></message-list>
        </ion-col>
        <ion-col
          class="ion-hide-lg-down"
          size-lg="8"
          v-if="$navigator.windowWidth >= 992"
        >
          <template v-if="hasActive && lookup">
            <message-conversation
              ref="conversation"
              :show-back-button="false"
              :show-view-profile="true"
              :uid="lookup"
            ></message-conversation>
          </template>
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

import MessageConversation from "@/components/message/conversation.vue";
import MessageList from "@/components/message/list.vue";

import MessagesMixin from "@/mixins/messages.js";
export default {
  layout: {
    menubar: {
      navItems: [
        {
          name: "messages",
          meta: {
            menu: {
              icon: "arrow-back",
              title: "Back to inbox"
            }
          }
        }
      ],
      navPosition: "top"
    }
  },
  data() {
    return {
      loading: false,
      error: false
    };
  },
  watch: {
    active: {
      handler: function() {
        if (
          this.$navigator.windowWidth < 992 &&
          this.hasActive &&
          !this.messageModal
        ) {
          this.openMessageModal();
        }
      }
    },
    "$navigator.windowWidth": {
      handler: function(windowWidth) {
        let vm = this;
        vm.$nextTick().then(() => {
          // If windowWidth >= 992, check message modal and dissmiss if need be
          if (windowWidth >= 992 && vm.messageModal) {
            vm.messageModal.dismiss();
          }
        });
      }
    }
  },
  created() {
    this.fetchData();
    this.$store.commit("Conversations/listView", {
      filter: "archive",
      order: "desc"
    });
  },
  beforeDestroy() {
    this.$store.commit("Conversations/active", {});
    this.$store.commit("Conversations/listView", {
      filter: "inbox",
      order: "desc"
    });
  },
  methods: {
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

      let requests = [
        vm.$store.dispatch("Conversations/getConversations"),
        vm.$store.dispatch("User/getBlockedUsers")
      ];

      Promise.all(requests)
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
        if (vm.messageModal) {
          vm.messageModal.dismiss();
        }
      });

      // Mount the instance
      MessageConversationInstance.$mount();

      await vm.$ionic.modalController
        .create({
          component: MessageConversationInstance.$el
        })
        .then(m => {
          vm.messageModal = m;
          vm.messageModal.addEventListener("ionModalDidDismiss", function() {
            vm.messageModal = undefined;
          });
        });

      return vm.messageModal.present();
    }
  },
  components: {
    MessageConversation,
    MessageList
  },
  mixins: [MessagesMixin]
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
