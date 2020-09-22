<template>
  <form>
    <div>
      <avatar
        class="box-shadow"
        :images.sync="pictures"
        :size="size"
        :size-sm="sizeSm"
        :size-md="sizeMd"
        :size-xl="sizeXl"
        :refresh="refresh"
      >
        <template v-slot:after>
          <ion-fab
            horizontal="end"
            vertical="bottom"
            :style="{
              'margin-right': selected !== 'xl' ? '-10px' : '',
              'margin-bottom': selected !== 'xl' ? '-10px' : '',
              'z-index': 2
            }"
          >
            <ion-fab-button
              class="ion-no-margin blurple-vertical-gradient"
              :size="selected !== 'xl' ? 'small' : ''"
              @click.prevent="$refs.file.click()"
            >
              <icon name="add" v-show="!uploading"></icon>
              <ion-spinner v-show="uploading"></ion-spinner>
            </ion-fab-button>
          </ion-fab>
        </template>
      </avatar>
    </div>
    <input
      type="file"
      accept="image/*"
      ref="file"
      style="position: fixed; top: -100em"
      @change="getPicture"
    />
  </form>
</template>
<script>
import Vue from "vue";

import AvatarMixin from "@/mixins/avatar.js";
import Crop from "@/components/avatar/crop.vue";
export default {
  data() {
    return {
      picture: "",
      refresh: "",
      uploading: false
    };
  },

  watch: {
    uploading: {
      handler: function(uploading) {
        this.$emit("avatarUploading", uploading);
      }
    }
  },

  created() {
    this.$on("errorRetry", function() {
      this.savePicture(this.picture);
    });
  },

  methods: {
    getPicture(e) {
      let vm = this;

      vm.uploading = true;

      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;

      let reader = new FileReader();
      reader.onload = e => {
        vm.picture = e.target.result;

        // Make new Crop instance
        let CropComponent = Vue.extend(Crop);
        let CropInstance = new CropComponent({
          propsData: {
            image: e.target.result
          }
        });

        // Dismiss modal on crop and save the picture
        CropInstance.$on("crop", function(output) {
          vm.picture = output;
          vm.activeModal.dismiss();
          vm.savePicture(output);
        });

        CropInstance.$on("dismiss", () => {
          vm.picture = "";
          vm.uploading = false;
          vm.$refs.file.value = "";
          vm.activeModal.dismiss();
        });

        // Mount the instance
        CropInstance.$mount();

        // Present modal
        vm.$ionic.modalController
          .create({
            component: CropInstance.$el
          })
          .then(m => {
            vm.activeModal = m;
            vm.activeModal.onDidDismiss(() => {
              vm.picture = "";
              vm.uploading = false;
              vm.$refs.file.value = "";
            });
            vm.activeModal.present();
          });
      };
      reader.readAsDataURL(files[0]);
    },

    savePicture(file) {
      let vm = this;
      let uploadAvatar = vm.$fireFunc.httpsCallable("user-avatar-upload");

      uploadAvatar({ image: file })
        .then(() => {
          vm.picture = "";
          vm.refresh = "&v=" + new Date().getTime();
          vm.uploading = false;
          vm.$refs.file.value = "";
          vm.$emit("avatarSaved", true);
          vm.$toast("Profile picture updated!");
        })
        .catch(() => {
          vm.uploading = false;
          vm.$emit("avatarSaved", false);
          return vm.$error(
            "We couldn't upload your photo. This is probably just temporary, try again."
          );
        });
    }
  },

  computed: {
    pictures() {
      if (this.picture !== "") {
        return {
          original: this.picture,
          xl: this.picture,
          lg: this.picture,
          md: this.picture,
          sm: this.picture,
          xs: this.picture
        };
      } else {
        return {};
      }
    }
  },
  mixins: [AvatarMixin]
};
</script>
<style scoped>
ion-avatar {
  margin: 0 auto;
  position: relative;
}
</style>
