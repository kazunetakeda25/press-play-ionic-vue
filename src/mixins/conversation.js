export default {
  computed: {
    browseDoc() {
      let doc = null;
      if (this.hasConversation) {
        if (this.conversation.user1 == this.user.uid && this.hasUser1Browse) {
          doc = this.conversation.user1Browse;
        } else if (
          this.conversation.user2 == this.user.uid &&
          this.hasUser2Browse
        ) {
          doc = this.conversation.user2Browse;
        }
      }
      return doc;
    },
    hasConversation() {
      return this.conversation
        ? Object.keys(this.conversation).length > 0
        : false;
    },
    hasUser1Browse() {
      return (
        this.hasConversation &&
        Object.prototype.hasOwnProperty.call(
          this.conversation,
          "user1Browse"
        ) &&
        typeof this.conversation.user1Browse === "object" &&
        Object.keys(this.conversation.user1Browse).length > 0
      );
    },
    hasUser2Browse() {
      return (
        this.hasConversation &&
        Object.prototype.hasOwnProperty.call(
          this.conversation,
          "user2Browse"
        ) &&
        typeof this.conversation.user2Browse === "object" &&
        Object.keys(this.conversation.user2Browse).length > 0
      );
    }
  }
};
