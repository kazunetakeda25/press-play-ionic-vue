<template>
  <ion-avatar
    class="align-center"
    :style="{ width: dimensionUnit, height: dimensionUnit }"
  >
    <slot name="before" />
    <ion-img
      :src="avatar + refresh"
      :width="dimension"
      :height="dimension"
    ></ion-img>
    <slot name="after" />
  </ion-avatar>
</template>
<script>
import { mapGetters } from "vuex";
import AvatarMixin from "@/mixins/avatar.js";
export default {
  props: {
    refresh: {
      type: String,
      default: ""
    }
  },
  computed: {
    ...mapGetters({ avatars: "User/avatars" }),
    avatar() {
      let avatar =
        Object.keys(this.images).length > 0
          ? this.images[this.selected]
          : this.avatars[this.selected];

      return avatar !== ""
        ? avatar
        : require("@/assets/images/default_avatar.svg");
    }
  },
  mixins: [AvatarMixin]
};
</script>
<style scoped>
ion-avatar {
  position: relative;
}
</style>
