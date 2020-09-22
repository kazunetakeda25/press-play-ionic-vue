import filter from "lodash/filter";
import UserDataMixin from "./userData";
export default {
  data() {
    return {
      accepting: false,
      archiving: false,
      rejecting: false
    };
  },
  methods: {
    acceptConversation(conversationId) {
      let vm = this;
      let conversationAccept = vm.$fireFunc.httpsCallable(
        "conversations-accept"
      );

      vm.accepting = true;

      return conversationAccept({ conversation: conversationId })
        .then(res => {
          return res.data;
        })
        .catch(function () {
          return vm.$error(
            "We were unable to accept this conversation. It's probably just temporary, try again.",
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
                  handler: () => vm.acceptConversation(conversationId)
                }
              ]
            }
          );
        })
        .finally(function () {
          vm.accepting = false;
        });
    },
    archiveConversation(conversationId) {
      let vm = this;
      let conversationArchive = vm.$fireFunc.httpsCallable(
        "conversations-archive"
      );

      vm.archiving = true;

      return conversationArchive({ conversation: conversationId })
        .then(res => {
          return res.data;
        })
        .catch(function () {
          return vm.$error(
            "We were unable to archive this conversation. It's probably just temporary, try again.",
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
                  handler: () => vm.archiveConversation(conversationId)
                }
              ]
            }
          );
        })
        .finally(function () {
          vm.archiving = false;
        });
    },
    rejectConversation(conversationId) {
      let vm = this;
      let conversationReject = vm.$fireFunc.httpsCallable(
        "conversations-reject"
      );

      vm.rejecting = true;

      return conversationReject({ conversation: conversationId })
        .then(res => {
          return res.data;
        })
        .catch(function () {
          return vm.$error(
            "We were unable to reject this conversation. It's probably just temporary, try again.",
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
                  handler: () => vm.rejectConversation(conversationId)
                }
              ]
            }
          );
        })
        .finally(function () {
          vm.rejecting = false;
        });
    }
  },
  computed: {
    active() {
      return this.$store.state.Conversations.active;
    },
    archivedConversationsIds() {
      return this.$store.getters["Conversations/archived"].map(
        archived => archived.id
      );
    },
    conversations() {
      return this.$store.getters["Conversations/conversations"];
    },
    filteredConversations() {
      let vm = this;
      return filter(vm.conversations, o => {
        let lookup = vm.user.uid ? o.user2 : o.user1;
        let isArchived = vm.archivedConversationsIds.indexOf(o.id) !== -1;
        let isBlocked = vm.blockedUsersIds.indexOf(lookup) !== -1;
        return vm.listView.filter == "archive"
          ? isArchived
          : !isArchived && !isBlocked;
      });
    },
    hasActive() {
      return this.active ? Object.keys(this.active).length > 0 : false;
    },
    listView() {
      return this.$store.getters["Conversations/listView"];
    },
    lookup() {
      let uid = null;
      if (this.hasActive) {
        uid =
          this.active.user1 === this.user.uid
            ? this.active.user2
            : this.active.user1;
      }
      return uid;
    }
  },
  mixins: [UserDataMixin]
};