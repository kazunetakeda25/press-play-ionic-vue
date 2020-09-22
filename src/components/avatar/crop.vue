<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click.prevent="$emit('dismiss')">
            <icon slot="icon-only" name="arrow-back"></icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button color="primary" @click.prevent="crop">
            Upload
          </ion-button>
        </ion-buttons>
        <ion-title>Edit Photo</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="container">
      <vue-cropper
        ref="cropper"
        :aspect-ratio="1 / 1"
        :check-orientation="true"
        :container-style="{
          position: 'relative',
          width: '100%',
          height: '100%',
          contain: 'size style',
          flex: '1 1 0%'
        }"
        drag-mode="move"
        :min-container-width="minWidth"
        :min-container-height="minHeight"
        :min-crop-box-width="300"
        :min-crop-box-height="300"
        :modal="true"
        :responsive="true"
        :src="image"
        :view-mode="3"
        alt="Source Image"
      >
      </vue-cropper>
    </ion-content>
  </ion-page>
</template>
<script>
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";

export default {
  props: ["image"],

  data() {
    return {
      imageLoaded: false
    };
  },

  methods: {
    crop() {
      let vm = this;
      let options = {
        width: 1024,
        height: 1024,
        imageSmoothingQuality: "high"
      };

      vm.$emit(
        "crop",
        vm.$refs.cropper.getCroppedCanvas(options).toDataURL("image/jpeg", 1.0)
      );
    }
  },

  computed: {
    minWidth() {
      return window.innerWidth >= 768 ? 600 : window.innerWidth;
    },
    minHeight() {
      let toolbarHeight = window.Ionic.mode == "ios" ? 44 : 56;
      return window.innerWidth >= 768
        ? 600 - toolbarHeight
        : window.innerHeight - toolbarHeight;
    }
  },

  components: {
    VueCropper
  }
};
</script>
<style lang="scss" scoped>
.cr-image {
  max-width: 100%;
}
</style>
