<template>
  <ion-page>
    <template v-if="conversationActive">
      <ion-header class="browse-header">
        <ion-toolbar>
          <ion-buttons slot="start" v-if="showBackButton">
            <ion-button @click.prevent="close">
              <icon slot="icon-only" name="arrow-back"></icon>
            </ion-button>
          </ion-buttons>
          <div class="toolbar-avatar" slot="start">
            <avatar-songmate
              :browse-ref="browse"
              :images="browse.profile.avatars"
              size="sm"
            ></avatar-songmate>
          </div>
          <ion-title>
            {{ browseDisplayName }}
          </ion-title>
          <div
            slot="end"
            v-if="
              updatingSongmate || archiving || (accepted && userBlockAdding)
            "
          >
            <ion-spinner></ion-spinner>
          </div>
          <ion-buttons slot="end">
            <ion-button
              color="dark"
              @click.prevent="openOptionsPopover($event, conversationOptions)"
            >
              <icon slot="icon-only" name="ellipsis-vertical"></icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content color="light" ref="messages">
        <ion-list class="ion-no-margin" lines="none">
          <message-content
            v-for="(message, index) in sortedMessages"
            :key="index"
            :message="message"
            :profile="browse.profile"
            ref="message"
          >
          </message-content>
          <ion-item v-if="!conversationEnabled">
            <ion-label class="ion-text-center" color="medium">
              Conversation has ended.
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
      <ion-footer>
        <ion-item
          lines="none"
          :disabled="sending"
          v-if="accepted && conversationEnabled && !archived"
        >
          <ion-textarea
            autofocus
            placeholder="Message..."
            rows="3"
            spellcheck
            :value="message.message"
            ref="messageInput"
            @ionChange="message.message = $event.target.value"
          ></ion-textarea>
          <ion-button
            class="ion-align-self-center"
            color="system"
            fill="clear"
            slot="end"
            v-show="!sending"
            @click.prevent="send"
          >
            <icon name="send" slot="icon-only"></icon>
          </ion-button>
          <ion-spinner slot="end" v-show="sending"></ion-spinner>
        </ion-item>
        <template v-if="!accepted && !archived && conversationEnabled">
          <template v-if="!accepting && !rejecting">
            <div class="ion-text-center">
              <h3>{{ browseDisplayName }} wants to send you a message</h3>
              <p>
                Do you want to let {{ browseDisplayName }} send you messages
                from now on? They'll only know you've seen their request if you
                choose accept.
              </p>
            </div>
            <ion-grid>
              <ion-row>
                <ion-col size="4">
                  <ion-button
                    color="danger"
                    expand="block"
                    fill="clear"
                    @click.prevent="block"
                  >
                    Block
                  </ion-button>
                </ion-col>
                <ion-col size="4">
                  <ion-button
                    color="danger"
                    expand="block"
                    fill="clear"
                    @click.prevent="reject"
                  >
                    Reject
                  </ion-button>
                </ion-col>
                <ion-col size="4">
                  <ion-button
                    color="system"
                    expand="block"
                    fill="clear"
                    @click.prevent="accept"
                  >
                    Accept
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </template>
          <template v-if="accepting || rejecting || userBlockAdding">
            <div class="ion-text-center ion-padding">
              <ion-spinner class="align-center"></ion-spinner>
            </div>
          </template>
        </template>
        <template v-if="archived">
          <div class="ion-text-center ion-padding">
            <h3>
              This message has been archived, and you can't send
              {{ browseDisplayName }} any messages.
            </h3>
            <p v-if="!accepted">
              You can enable this conversation if you choose "Accept." This will
              move the conversation to your inbox.
            </p>
            <p v-else>
              You can enable this conversation if you choose "Move To Inbox"
            </p>
          </div>
          <ion-grid
            v-if="
              canRemoveArchive &&
                !accepting &&
                !removingArchivedConversation &&
                !userBlockAdding
            "
          >
            <ion-row>
              <ion-col size="6">
                <ion-button
                  color="danger"
                  expand="block"
                  fill="clear"
                  @click.prevent="block"
                >
                  Block
                </ion-button>
              </ion-col>
              <ion-col size="6">
                <ion-button
                  color="system"
                  expand="block"
                  fill="clear"
                  v-if="accepted"
                  @click.prevent="removeArchivedConversation(conversation.id)"
                >
                  Move To Inbox
                </ion-button>
                <ion-button
                  color="system"
                  expand="block"
                  fill="clear"
                  v-if="!accepted"
                  @click.prevent="accept"
                >
                  Accept
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <template
            v-if="accepting || removingArchivedConversation || userBlockAdding"
          >
            <div class="ion-text-center ion-padding-vertical">
              <ion-spinner class="align-center"></ion-spinner>
            </div>
          </template>
        </template>
      </ion-footer>
    </template>
    <template v-if="loading">
      <ion-header class="browse-header">
        <ion-toolbar>
          <ion-buttons slot="start" v-if="showBackButton">
            <ion-button @click.prevent="$emit('conversationBack')">
              <icon slot="icon-only" name="arrow-back"></icon>
            </ion-button>
          </ion-buttons>
          <div class="toolbar-avatar" slot="start">
            <ion-avatar style="width: 48px; height: 48px;">
              <ion-skeleton-text animated></ion-skeleton-text>
            </ion-avatar>
          </div>
          <ion-title>
            <ion-skeleton-text
              animated
              style="height: 32px; width: 50%;"
            ></ion-skeleton-text>
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list lines="none">
          <ion-item v-for="(skeleton, index) in skeletonMessages" :key="index">
            <ion-avatar :slot="index % 2 == 0 ? 'end' : 'start'">
              <ion-skeleton-text animated></ion-skeleton-text>
            </ion-avatar>
            <ion-label>
              <ion-skeleton-text
                animated
                :class="`ion-float-${index % 2 == 0 ? 'end' : 'start'}`"
                style="height: 16px; width: 60%;"
              ></ion-skeleton-text>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </template>
    <template v-if="error">
      <ion-content>
        <ion-grid class="align-content-center" style="width: 100%;">
          <ion-row class="ion-justify-content-center">
            <ion-col class="ion-text-center" size="12" size-md="6">
              <h1>Something went wrong</h1>
              <p>
                We were unable to load this conversation at this time. This is
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
  </ion-page>
</template>
<script>
import Vue from "vue";

import find from "lodash/find";
import last from "lodash/last";
import orderBy from "lodash/orderBy";
import range from "lodash/range";

import AvatarSongmate from "@/components/avatar/songmate.vue";
import BrowseProfile from "@/components/browse/profile.vue";
import MessageContent from "@/components/message/content.vue";

import BrowseMixin from "@/mixins/browse.js";
import ConversationMixin from "@/mixins/conversation.js";
import MessagesMixin from "@/mixins/messages.js";
import OptionsMenuMixin from "@/mixins/options-menu.js";
import WindowMixin from "@/mixins/window.js";

export default {
  props: {
    showBackButton: {
      type: Boolean,
      default: true
    },
    showViewProfile: {
      type: Boolean,
      default: false
    },
    uid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      conversation: {},
      conversationData: {
        id: null,
        accepted: true,
        enabled: true
      },
      error: false,
      loading: false,
      messages: [],
      message: {
        attachments: [],
        message: ""
      },
      sending: false
    };
  },
  watch: {
    uid: {
      handler: function() {
        this.fetchData();
      },
      immediate: true
    },
    "conversationData.id": {
      handler: function(id) {
        let vm = this;
        if (
          id !== null ||
          (id !== null && vm.hasConversation && vm.convseration.id !== id)
        ) {
          vm.$bind(
            "conversation",
            vm.$fireStore.collection("conversations").doc(id),
            {
              serialize: snapshot => {
                let data = Object.assign(snapshot.data(), {
                  id: snapshot.id,
                  path: snapshot.ref.path
                });
                return data;
              }
            }
          ).catch(() => {
            vm.handleLoadError();
          });
          vm.$bind(
            "messages",
            vm.$fireStore
              .collection("conversations")
              .doc(id)
              .collection("messages")
          ).catch(() => {
            vm.handleLoadError();
          });
        }
      }
    },
    conversation: {
      handler: function(conversation) {
        if (this.hasConversation) {
          this.$store.commit("Conversations/active", conversation);
        }
        if (this.browseDoc) {
          this.setBrowse(this.browseDoc);
        }
      },
      deep: true
    },
    messages: {
      handler: function(messages) {
        if (messages.length > 0) {
          let vm = this;
          // Setup mutation observer that scrolls to the bottom
          let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (
                mutation.type == "attributes" &&
                mutation.attributeName == "class" &&
                mutation.target.classList.contains("hydrated")
              ) {
                vm.$refs.messages.scrollToBottom(500);
              }
            });
          });
          // After the instance is updated, attach mutation observer to the last message
          vm.$nextTick().then(function() {
            let lastMessage = last(vm.$refs.message);
            if (lastMessage) {
              observer.observe(lastMessage.$el, {
                attributes: true
              });
            }
          });
        }
      },
      deep: true
    }
  },
  created() {
    this.$on("optionMenuSelected", function(value) {
      switch (value) {
        case "accept":
          this.accept();
          break;
        case "archive":
          this.archive();
          break;
        case "close":
          this.close();
          break;
        case "profile":
          this.viewProfile();
          break;
        case "reject":
          this.reject();
          break;
        case "remove-archive":
          this.removeArchivedConversation(this.conversation.id);
          break;
      }
    });
    this.$on("songmateDisliked", function(disliked) {
      if (disliked) {
        this.close();
      }
    });
    this.$on("resize", function() {
      if (this.profileModal) {
        this.setModalDimensions(this.profileModal);
      }
    });
    this.$on("userBlockAdded", function(blocked) {
      if (blocked) {
        this.close();
      }
    });
  },
  beforeDestroy() {
    this.close();
  },
  methods: {
    accept() {
      let vm = this;
      return vm.acceptConversation(vm.conversation.id).then(res => {
        vm.conversationData = res;
        vm.$emit("conversationAccepted", true);
      });
    },
    archive() {
      let vm = this;
      return vm.$error(
        `This will move the conversation to your message archives, and you will no longer be able to send new messages to ${vm.browseDisplayName}.`,
        {
          header: "Confirm Archive",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: () => {
                return vm.archiveConversation(vm.conversation.id).then(() => {
                  vm.$toast("Conversation has been archived.");
                  vm.close();
                });
              }
            }
          ]
        }
      );
    },
    close() {
      this.$store.commit("Conversations/active", {});
      this.$emit("conversationBack");
    },
    fetchData() {
      let vm = this;

      vm.loading = true;
      vm.error = false;

      let requests = [
        vm.$store.dispatch("Conversations/getConversations"),
        vm.$store.dispatch("Conversations/getConversationByUid", {
          uid: vm.uid
        })
      ];

      return Promise.all(requests)
        .then(res => {
          vm.conversationData = res[1];
          if (vm.conversationData.id === null) {
            return vm.getUserBrowse({ uid: vm.uid });
          }
        })
        .catch(function() {
          vm.handleLoadError();
        })
        .finally(function() {
          vm.loading = false;
        });
    },
    handleLoadError() {
      let vm = this;
      vm.error = true;
      // Reset data
      vm.conversation = {};
      vm.conversationData = {
        id: null,
        accepted: true,
        enabled: true
      };
      vm.messeages = [];
      vm.message = {
        attachments: [],
        message: ""
      };
      return vm.$error(
        "We were unable to load this conversation. It's probably just temporary, try again.",
        {
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary",
              handler: () => vm.close()
            },
            {
              text: "Try Again",
              cssClass: "primary",
              handler: () => vm.fetchData()
            }
          ]
        }
      );
    },
    reject() {
      let vm = this;
      return vm.$error(
        `This will remove the conversation from your requests. ${vm.browseDisplayName} won't know you've rejected their request.`,
        {
          header: "Confirm Reject",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: () => {
                return vm.rejectConversation(vm.conversation.id).then(() => {
                  vm.$toast("Conversation has been rejected.");
                  vm.close();
                });
              }
            }
          ]
        }
      );
    },
    send() {
      let vm = this;

      vm.sending = true;

      if (vm.conversationData.id) {
        let conversationMessagesAdd = vm.$fireFunc.httpsCallable(
          "conversations-messages-add"
        );
        let messageObject = Object.assign({}, vm.message, {
          conversation: vm.conversationData.id
        });

        return conversationMessagesAdd(messageObject)
          .then(() => {
            vm.message = {
              attachments: [],
              message: ""
            };
          })
          .catch(function() {
            return vm.$error("We were unable to send your message", {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.send()
                }
              ]
            });
          })
          .finally(function() {
            vm.sending = false;
            vm.$refs.messages.scrollToBottom(500);
          });
      } else {
        let conversationCreate = vm.$fireFunc.httpsCallable(
          "conversations-create"
        );
        let covnersationObject = Object.assign({}, vm.message, {
          uid: vm.uid,
          message: vm.message.message
        });
        return conversationCreate(covnersationObject)
          .then(res => {
            vm.conversationData = res.data;
            vm.message = {
              attachments: [],
              message: ""
            };
            vm.$refs.messages.scrollToBottom(500);
          })
          .catch(function() {
            return vm.$error("We were unable to send your message", {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.send()
                }
              ]
            });
          })
          .finally(function() {
            vm.sending = false;
          });
      }
    },
    async viewProfile() {
      let vm = this;

      // Create BrowseProfile instance
      let BrowseProfileComponent = Vue.extend(BrowseProfile);
      let BrowseProfileInstance = new BrowseProfileComponent({
        propsData: {
          showButtonBar: false,
          uid: vm.uid
        }
      });

      // Dismiss modal on back button
      BrowseProfileInstance.$on("profileBack", function() {
        vm.profileModal.dismiss();
      });

      // Mount the instance
      BrowseProfileInstance.$mount();

      await vm.$ionic.modalController
        .create({
          component: BrowseProfileInstance.$el
        })
        .then(m => {
          vm.profileModal = m;
          vm.profileModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
          });
        });

      return vm.profileModal.present();
    }
  },
  computed: {
    accepted() {
      if (this.conversationData.id === null) {
        return true;
      }
      if (this.hasConversation && this.conversation.user1 === this.user.uid) {
        return true;
      } else if (this.hasConversation) {
        return this.conversation.accepted;
      } else {
        return true;
      }
    },
    archived() {
      return (
        this.hasConversation &&
        this.archivedConversationsIds.indexOf(this.conversation.id) !== -1
      );
    },
    canRemoveArchive() {
      return this.archived && !this.isBlocked && this.conversation.enabled;
    },
    conversationActive() {
      return !this.error && !this.loading && this.hasBrowse;
    },
    conversationEnabled() {
      return this.hasConversation ? this.conversation.enabled : true;
    },
    conversationOptions() {
      let options = [];

      if (this.showViewProfile && !this.isBlocked && this.conversationEnabled) {
        options.push({
          text: "View Profile",
          value: "profile"
        });
      }

      this.optionsMenuSongmate.forEach(function(option) {
        options.push(option);
      });

      this.optionsMenuDefault.forEach(function(option) {
        options.push(option);
      });

      if (this.conversationEnabled) {
        if (!this.accepted) {
          options.push({
            text: "Accept Conversation",
            value: "accept"
          });
          if (!this.archived) {
            options.push({
              text: "Reject Conversation",
              value: "reject"
            });
          }
        }
      }

      if (!this.archived) {
        options.push({
          text: "Archive Message",
          value: "archive"
        });
      }

      if (this.archived && this.canRemoveArchive) {
        options.push({
          text: "Move to Inbox",
          value: "remove-archive"
        });
      }

      options.push({
        text: "Close Message",
        value: "close"
      });

      return options;
    },
    songmateDoc() {
      if (!this.hasBrowse) {
        return undefined;
      } else if (
        this.browse.isSongmate &&
        this.$store.getters["User/songmates"].length > 0
      ) {
        let songmateLookUpDoc =
          this.browse.songmate.matchedBy == this.user.uid
            ? this.browse.songmate.matchedByDoc
            : this.browse.songmate.matchedToDoc;
        return find(this.$store.getters["User/songmates"], {
          path: songmateLookUpDoc
        });
      } else {
        return undefined;
      }
    },
    skeletonMessages() {
      return range(0, 10);
    },
    sortedMessages() {
      return orderBy(this.messages, o => o.sent.seconds, "asc");
    }
  },
  components: {
    AvatarSongmate,
    MessageContent
  },
  mixins: [
    BrowseMixin,
    ConversationMixin,
    MessagesMixin,
    OptionsMenuMixin,
    WindowMixin
  ]
};
</script>
<style lang="scss" scoped>
ion-list {
  --ion-item-background: transparent;
  ion-item + ion-item {
    margin-top: 16px;
  }
}
</style>
