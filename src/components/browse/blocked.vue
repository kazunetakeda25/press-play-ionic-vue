<template>
  <ion-item detail="false">
    <template v-if="!error && !loading && hasBrowse">
      <ion-label class="ion-text-wrap">
        <ion-text color="dark">
          {{ browseDisplayName }}
        </ion-text>
        <div>
          <ion-text color="medium">
            <small>Blocked on {{ timestamp }}</small>
          </ion-text>
        </div>
      </ion-label>
      <ion-button
        color="system"
        fill="clear"
        slot="end"
        v-show="!userBlockRemoving"
        @click.prevent="unblock"
      >
        Unblock
      </ion-button>
      <ion-spinner v-show="userBlockRemoving"></ion-spinner>
    </template>
    <template v-if="loading">
      <div slot="start">
        <ion-avatar style="height: 48px; width: 48px;">
          <ion-skeleton-text animated></ion-skeleton-text>
        </ion-avatar>
      </div>
      <ion-label>
        <ion-skeleton-text animated style="width: 60%;"></ion-skeleton-text>
      </ion-label>
    </template>
    <template v-if="error">
      <ion-label color="danger">
        Couldn't load this user
      </ion-label>
      <ion-button fill="clear" slot="start" @click.prevent="fetchBrowse">
        <icon name="refresh" slot="icon-only"></icon>
      </ion-button>
    </template>
  </ion-item>
</template>
<script>
import moment from "moment";
import BrowseMixin from "@/mixins/browse.js";
export default {
  props: {
    blocked: {
      type: Object,
      required: true
    }
  },
  watch: {
    blocked: {
      handler: function(blocked) {
        this.uid = blocked.uid;
        this.fetchBrowse();
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      error: false,
      loading: true
    };
  },
  methods: {
    fetchBrowse() {
      let vm = this;
      if (vm.blocked.browse && Object.keys(vm.blocked.browse).length > 0) {
        vm.loading = false;
        return vm.setBrowse(vm.blocked.browse);
      } else {
        return vm
          .getUserBrowse({ uid: vm.blocked.uid })
          .catch(function() {
            vm.error = true;
          })
          .finally(function() {
            vm.loading = false;
          });
      }
    }
  },
  computed: {
    timestamp() {
      return moment(
        `${this.blocked.timestamp.seconds}.${this.blocked.timestamp.nanoseconds}`,
        "X"
      ).format("LLL");
    }
  },
  mixins: [BrowseMixin]
};
</script>
