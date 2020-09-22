<template>
  <ion-item>
    <ion-label>
      Profile Picture
    </ion-label>
    <ion-button color="system" slot="end" @click.prevent="$refs.file.click()">
      <icon class="ion-hide-md-down" name="cloud-upload" slot="start"></icon>
      <icon class="ion-hide-md-up" name="cloud-upload" slot="icon-only"></icon>
      <span class="ion-hide-md-down">
        Upload
      </span>
    </ion-button>
    <ion-button color="light" slot="end" @click.prevent="confirmRemove">
      <icon class="ion-hide-md-down" name="trash-outline" slot="start"></icon>
      <icon class="ion-hide-md-up" name="trash-outline" slot="icon-only"></icon>
      <span class="ion-hide-md-down">
        Remove
      </span>
    </ion-button>
    <div slot="end">
      <avatar size="sm" v-if="!saving"></avatar>
      <ion-spinner v-if="saving"></ion-spinner>
    </div>
    <input
      type="file"
      accept="image/*"
      ref="file"
      style="position: fixed; top: -100em"
      @change="getPicture"
    />
  </ion-item>
</template>
<script>
import Vue from "vue";
import Crop from "@/components/avatar/crop.vue";
export default {
  data() {
    return {
      picture: "",
      refresh: "",
      saving: false
    };
  },

  created() {
    this.$on("errorRetry", function() {
      this.savePicture(this.picture);
    });
  },

  methods: {
    confirmRemove() {
      let vm = this;
      return vm.$error(
        `This will remove your profile picture, and may limit your matches. It's recommended you click "Cancel" and upload another photo instead. ;)`,
        {
          header: "Confirm Remove",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: () => vm.remove()
            }
          ]
        }
      );
    },

    getPicture(e) {
      let vm = this;

      vm.saving = true;

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
          vm.saving = false;
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
              vm.saving = false;
              vm.$refs.file.value = "";
            });
            vm.activeModal.present();
          });
      };
      reader.readAsDataURL(files[0]);
    },

    remove() {
      let vm = this;
      let removeAvatar = vm.$fireFunc.httpsCallable("user-avatar-remove");

      vm.saving = true;

      removeAvatar()
        .then(() => {
          vm.$emit("avatarRemoved", true);
          vm.$toast("Profile picture removed");
        })
        .catch(err => {
          console.log(err.message, err);
          vm.$emit("avatarRemoved", false);
          return vm.$error(
            "We couldn't remove your photo. This is probably just temporary, try again.",
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
                  handler: () => vm.remove()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.saving = false;
        });
    },

    savePicture(file) {
      let vm = this;
      let uploadAvatar = vm.$fireFunc.httpsCallable("user-avatar-upload");

      uploadAvatar({ image: file })
        .then(() => {
          vm.picture = "";
          vm.refresh = "&v=" + new Date().getTime();
          vm.$refs.file.value = "";
          vm.$emit("avatarSaved", true);
          vm.$toast("Profile picture updated");
        })
        .catch(err => {
          console.log(err.message, err);
          vm.$emit("avatarSaved", false);
          return vm.$error(
            "We couldn't upload your photo. This is probably just temporary, try again.",
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
                  handler: () => vm.savePicture(vm.picture)
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.saving = false;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
ion-item {
  --min-height: 55px;
  ion-label {
    transform-origin: left center;
    transform: scale(0.75);
  }
  [slot="end"] {
    margin-inline-start: 16px;
  }
}
</style>
