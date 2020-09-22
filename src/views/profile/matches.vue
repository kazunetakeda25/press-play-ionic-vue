<template>
  <ion-page>
    <ion-grid class="content-grid">
      <ion-row>
        <ion-col class="col-border" size="12" size-lg="4">
          <match-list
            action-icon="play"
            action-icon-color="secondary"
            ref="list"
          ></match-list>
        </ion-col>
        <ion-col
          class="ion-hide-lg-down"
          size-lg="8"
          v-if="$navigator.windowWidth >= 992"
        >
          <template v-if="hasActive">
            <browse-profile
              :uid="active.uid"
              @profileBack="closeProfile"
            ></browse-profile>
          </template>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-page>
</template>
<script>
import Vue from "vue";
import { mapGetters } from "vuex";
import BrowseProfile from "@/components/browse/profile.vue";
import MatchList from "@/components/matches/list.vue";
export default {
  layout: {
    header: {
      class: "no-style-lg-down"
    }
  },
  watch: {
    active: {
      handler: function() {
        if (
          this.$navigator.windowWidth < 992 &&
          this.hasActive &&
          !this.activeModal
        ) {
          this.openProfileModal();
        }
      }
    },
    "$navigator.windowWidth": {
      handler: function(windowWidth) {
        let vm = this;
        vm.$nextTick().then(() => {
          // If windowWidth >= 992, check message modal and dissmiss if need be
          if (windowWidth >= 992 && vm.activeModal) {
            vm.activeModal.dismiss();
          }
          // If windowWidth >= 992, check that an active conversation exists
          if (
            windowWidth >= 992 &&
            vm.hasActive === false &&
            vm.defaultSongmate
          ) {
            vm.$store.commit("Matches/active", vm.defaultSongmate);
          }
        });
      }
    }
  },
  methods: {
    closeProfile() {
      if (this.activeModal) {
        this.activeModal.dismiss();
      }
      this.$store.commit("Matches/active", {});
    },
    async openProfileModal() {
      let vm = this;

      // Create BrowseProfile instance
      let BrowseProfileComponent = Vue.extend(BrowseProfile);
      let BrowseProfileInstance = new BrowseProfileComponent({
        propsData: {
          uid: vm.active.uid
        }
      });

      // Dismiss modal on back button, reset active message
      BrowseProfileInstance.$on("profileBack", function() {
        vm.closeProfile();
      });

      // Mount the instance
      BrowseProfileInstance.$mount();

      await vm.$ionic.modalController
        .create({
          component: BrowseProfileInstance.$el
        })
        .then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidDismiss", function() {
            vm.activeModal = undefined;
          });
        });

      return vm.activeModal.present();
    }
  },
  computed: {
    ...mapGetters({
      active: "Matches/active",
      songmates: "User/songmates"
    }),
    defaultSongmate() {
      return find(this.songmates, o => o.songmate.mutual === true);
    },
    hasActive() {
      return this.active ? Object.keys(this.active).length > 0 : false;
    }
  },
  components: {
    BrowseProfile,
    MatchList
  }
};
</script>
<style lang="scss" scoped>
.col-border {
  border-right: 1px solid var(--ion-color-step-150, rgba(0, 0, 0, 0.13));
}
</style>
