<template>
  <ion-item>
    <div class="ion-align-self-end" :slot="avatarSlot">
      <avatar :images="avatarImages" size="sm"></avatar>
    </div>
    <ion-label
      class="ion-text-wrap"
      :class="`ion-text-${avatarSlot}`"
      :color="labelColor"
    >
      {{ message.message }}
    </ion-label>
  </ion-item>
</template>
<script>
export default {
  props: {
    message: {
      type: Object,
      required: true
    },
    profile: {
      type: Object,
      required: true
    }
  },
  computed: {
    user() {
      return this.$store.state.User.user;
    },
    userData() {
      return this.$store.getters["User/userData"];
    },
    avatarImages() {
      return this.message.uid == this.user.uid
        ? this.userData.profile.avatars
        : this.profile.avatars;
    },
    avatarSlot() {
      return this.message.uid == this.user.uid ? "end" : "start";
    },
    labelColor() {
      return this.message.uid == this.user.uid ? "system" : "";
    }
  }
};
</script>
