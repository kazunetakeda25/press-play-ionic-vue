<template>
  <ion-page>
    <ion-grid class="content-grid">
      <ion-row>
        <ion-col class="ion-no-padding col-border" size="12" size-lg="4">
          <match-list
            action-icon="play"
            action-icon-color="secondary"
            ref="list"
          ></match-list>
        </ion-col>
        <ion-col
          class="ion-hide-lg-down ion-no-padding"
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
import MatchList from "@/components/matches/list-disliked.vue";
export default {
  layout: {
    menubar: {
      icon: {
        name: "ellipsis-vertical"
      },
      inline: false,
      navItems: [
        {
          path: "/matches",
          name: "matches",
          meta: {
            menu: {
              icon: "arrow-back",
              title: "Back to matches"
            }
          }
        },
        {
          path: "/matches/cleared",
          name: "matches.cleared",
          meta: {
            menu: {
              icon: "close-circle-outline",
              title: "Cleared Matches"
            }
          }
        },
        {
          path: "/matches/settings",
          name: "matches.settings",
          meta: {
            menu: {
              icon: "search-outline",
              title: "Seeking Settings"
            }
          }
        }
      ]
    }
  },
  watch: {
    active: {
      handler: function() {
        if (
          this.$navigator.windowWidth < 992 &&
          this.hasActive &&
          !this.profileModal
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
          if (windowWidth >= 992 && vm.profileModal) {
            vm.profileModal.dismiss();
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
          vm.profileModal = m;
          vm.profileModal.addEventListener("ionModalDidDismiss", function() {
            vm.profileModal = undefined;
          });
        });

      return vm.profileModal.present();
    }
  },
  computed: {
    ...mapGetters({
      active: "Matches/active"
    }),
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
