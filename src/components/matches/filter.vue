<template>
  <ion-page>
    <ion-content>
      <div class="ion-padding">
        <h3 class="h4 text-bold">% Match</h3>
        <ion-list class="form white" lines="none">
          <ion-item>
            <ion-range
              color="system"
              :debounce="300"
              dual-knobs="true"
              :min="50"
              :max="100"
              pin="true"
              snaps="true"
              step="5"
              ticks="false"
              ref="score"
              @ionChange="handleScore"
            >
              <ion-label slot="start">50%</ion-label>
              <ion-label slot="end">100%</ion-label>
            </ion-range>
          </ion-item>
        </ion-list>
        <h3 class="h4 text-bold">Distance</h3>
        <ion-list class="form white" lines="none">
          <ion-item>
            <ion-range
              color="system"
              :debounce="300"
              dual-knobs="true"
              :min="0"
              :max="userData.seeking.relationships.maxDistance"
              pin="true"
              snaps="true"
              step="1"
              ticks="false"
              ref="distance"
              @ionChange="handleDistance"
            >
              <ion-label slot="start">0 mi</ion-label>
              <ion-label slot="end">200 mi</ion-label>
            </ion-range>
          </ion-item>
        </ion-list>
        <h3 class="h4 text-bold">Relationships</h3>
        <ion-list class="form white" lines="none">
          <ion-item class="segment-item">
            <ion-segment
              :value="segment"
              @ionChange.prevent="segment = $event.target.value"
            >
              <ion-segment-button
                v-for="(relationship, index) in matchFilter.relationships"
                :key="'segmentButton' + index"
                :value="index"
                layout="icon-top"
              >
                <icon :name="`c-relationship-${relationship.type}`"></icon>
                <ion-label class="ion-text-capitalize">
                  {{ relationship.type }}
                </ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-item>
        </ion-list>
        <template v-for="(relationship, index) in matchFilter.relationships">
          <ion-list
            class="form white"
            lines="none"
            :key="'segmentList' + index"
            v-show="activeRelationshipSegment == index"
          >
            <ion-item>
              <ion-label>Show {{ relationship.type }} matches</ion-label>
              <ion-toggle
                :checked="relationship.enabled"
                color="system"
                slot="start"
                @ionChange="relationship.enabled = $event.target.checked"
              >
              </ion-toggle>
            </ion-item>
            <template v-for="(field, f) in relationshipGenderFields">
              <ion-item-group :key="`relationshipFieldGroup${f}`">
                <ion-item-divider>
                  <ion-label>Of these {{ field }}</ion-label>
                </ion-item-divider>
                <ion-item
                  v-for="(item, i) in relationship[field]"
                  :key="field + index + i"
                  :disabled="relationship[field].length == 1"
                >
                  <ion-label>
                    {{ getRelationshipGenderFieldLabel(field, item.type) }}
                  </ion-label>
                  <ion-toggle
                    :checked="item.enabled"
                    color="system"
                    slot="start"
                    @ionChange="item.enabled = $event.target.checked"
                  >
                  </ion-toggle>
                </ion-item>
              </ion-item-group>
            </template>
          </ion-list>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>
<script>
import { mapGetters } from "vuex";
import find from "lodash/find";

import GenderMixin from "@/mixins/gender.js";
export default {
  data() {
    return {
      filter: {},
      relationshipGenderFields: [
        "identities",
        "expressions",
        "orientations",
        "pronouns"
      ],
      segment: 0
    };
  },
  created() {
    let vm = this;
    vm.$store.dispatch("Matches/setDefaultMatchFilter");
    let unwatch = vm.$watch(
      "matchFilter",
      function(matchFilter) {
        if (unwatch) {
          return unwatch();
        }
        vm.$nextTick().then(() => {
          vm.$refs.distance.value = matchFilter.distance;
          vm.$refs.score.value = matchFilter.score;
        });
      },
      {
        immediate: true
      }
    );
  },
  methods: {
    getRelationshipGenderFieldLabel(field, type) {
      return find(this[field], { id: type }).text;
    },
    handleDistance(event) {
      this.matchFilter.distance = event.detail.value;
    },
    handleScore(event) {
      this.matchFilter.score = event.detail.value;
    }
  },
  computed: {
    ...mapGetters({
      matchFilter: "Matches/matchFilter",
      userData: "User/userData"
    }),
    activeRelationshipSegment() {
      return parseInt(this.segment);
    }
  },
  mixins: [GenderMixin]
};
</script>
<style lang="scss">
ion-range {
  padding-inline-start: 0;
  padding-inline-end: 0;
  ion-label {
    width: 45px;
    &[slot="start"] {
      text-align: right;
    }
    &[slot="end"] {
      text-align: left;
    }
  }
}
</style>
