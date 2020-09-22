<template>
  <ion-item
    :button="selectable"
    detail="false"
    lines="none"
    @click.prevent="selectable ? $emit('selected', item) : null"
  >
    <slot name="itemstart"></slot>
    <ion-avatar slot="start">
      <ion-img :src="getSpotifyItemImage(item)" v-if="spotifyItemHasImages(item)" />
      <icon name="musical-notes" size="large" v-else></icon>
    </ion-avatar>
    <ion-label class="ion-text-wrap">
      <ion-text>
        <h4>{{ getSpotifyItemName(item) }}</h4>
      </ion-text>
      <ion-text color="medium" v-if="showType">
        <h5>{{ getSpotifyItemType(item) }}</h5>
      </ion-text>
    </ion-label>
    <slot name="itemend"></slot>
  </ion-item>
</template>
<script>
import SpotifyFunctions from "@/mixins/spotify.js";
export default {
  props: {
    item: {
      type: Object,
      default: function() {
        return {};
      }
    },
    selectable: {
      type: Boolean,
      default: false
    },
    showType: {
      type: Boolean,
      default: true
    }
  },
  mixins: [SpotifyFunctions],
  methods: {
    openSpotifyPlayer() {
      console.log("open spotify player");
    }
  }
};
</script>
