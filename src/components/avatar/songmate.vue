<template>
  <avatar
    class="songmate-avatar"
    :images="images"
    ref="avatar"
    :size="size"
    :size-sm="sizeSm"
    :size-md="sizeMd"
    :size-lg="sizeLg"
    :size-xl="sizeXl"
  >
    <template #after v-if="hasBrowse && isSongmate && songmateDoc">
      <icon
        class="songmate-icon"
        color="light"
        name="c-songmates-connected"
        v-if="browse.songmate.mutual"
      ></icon>
      <icon
        class="songmate-icon"
        color="medium"
        name="c-songmates-liked"
        v-if="!browse.songmate.mutual && songmateDoc.liked"
      ></icon>
      <icon
        class="songmate-icon"
        color="medium"
        name="c-songmates"
        v-if="!browse.songmate.mutual && !songmateDoc.liked"
      ></icon>
    </template>
  </avatar>
</template>
<script>
import AvatarMixin from "@/mixins/avatar.js";
import BrowseMixin from "@/mixins/browse.js";
export default {
  props: {
    browseRef: {
      type: [Object, String],
      required: true
    }
  },
  watch: {
    browseRef: {
      handler: function(ref) {
        if (typeof ref === "object") {
          this.setBrowse(ref);
        } else if (typeof ref === "string") {
          this.getUserBrowse({ uid: ref });
        }
      },
      immediate: true
    }
  },
  mounted() {
    let vm = this;
    vm.$watch(
      "browse",
      function() {
        vm.$nextTick().then(() => {
          let avatar = vm.$refs.avatar.$el;
          if (vm.hasBrowse && vm.isSongmate && vm.songmateDoc) {
            avatar.classList.toggle("is-favorite", vm.songmateDoc.favorite);
            avatar.classList.toggle("is-mutual", vm.browse.songmate.mutual);
          }
        });
      },
      { deep: true, immediate: true }
    );
  },
  mixins: [AvatarMixin, BrowseMixin]
};
</script>
<style lang="scss" scoped>
.songmate-avatar {
  --avatar-border: var(--border-color);
  border: 3px solid var(--avatar-border);
  > .songmate-icon {
    // bottom: 0;
    height: 50%;
    left: -10%;
    margin: initial;
    position: absolute;
    // right: -25%;
    top: -10%;
    transform: none;
    width: 50%;
  }
  &.is-mutual {
    --avatar-border: var(--ion-color-secondary);
  }
  &.is-favorite {
    --avatar-border: var(--ion-color-primary);
  }
}
</style>
