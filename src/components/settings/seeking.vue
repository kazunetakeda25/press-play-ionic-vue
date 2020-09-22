<template>
  <div>
    <ion-list class="form white" lines="none">
      <ion-item class="segment-item">
        <ion-segment
          :value="segment"
          @ionChange.prevent="segment = $event.target.value"
        >
          <ion-segment-button
            v-for="(relationship, index) in userData.seeking.relationships"
            :key="'segmentButton' + index"
            :value="index"
            layout="icon-top"
          >
            <icon
              :name="`c-relationship-${relationship.type}`"
              v-show="!relationship.enabled"
            ></icon>
            <icon
              :name="`c-relationship-${relationship.type}-active`"
              v-show="relationship.enabled"
            ></icon>
            <ion-label class="ion-text-capitalize">{{
              relationship.type
            }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-item>
    </ion-list>

    <template v-for="(relationship, index) in userData.seeking.relationships">
      <ion-list
        class="ion-margin-top form white"
        lines="none"
        :key="'segmentList' + index"
        v-show="activeSegment == index"
      >
        <ion-item>
          <ion-label>Match me for {{ relationship.type }}</ion-label>
          <ion-toggle
            color="system"
            slot="end"
            @ionChange="relationship.enabled = $event.target.checked"
            :checked="relationship.enabled"
          >
          </ion-toggle>
        </ion-item>
        <ion-item>
          <ion-label>Of these genders</ion-label>
          <ion-select
            :disabled="!relationship.enabled"
            multiple="true"
            placeholder="Select genders"
            ref="genderSelect"
            @ionChange="relationship.identities = $event.detail.value"
          >
            <ion-select-option
              v-for="(item, i) in identities"
              :key="'identities' + index + i"
              :value="item.id"
            >
              {{ item.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label>Of these expressions</ion-label>
          <ion-select
            :disabled="!relationship.enabled"
            multiple
            placeholder="Select expressions"
            ref="expressionSelect"
            @ionChange="relationship.expressions = $event.detail.value"
          >
            <ion-select-option
              v-for="(item, e) in expressions"
              :key="'expressions' + index + e"
              :value="item.id"
            >
              {{ item.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label>Of these orientations</ion-label>
          <ion-select
            :disabled="!relationship.enabled"
            multiple
            placeholder="Select orientations"
            ref="orientationSelect"
            @ionChange="relationship.orientations = $event.detail.value"
          >
            <ion-select-option
              v-for="(item, o) in orientations"
              :key="'orientations' + index + o"
              :value="item.id"
            >
              {{ item.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label>Of these pronouns</ion-label>
          <ion-select
            :disabled="!relationship.enabled"
            multiple
            placeholder="Select pronouns"
            ref="pronounSelect"
            @ionChange="relationship.pronouns = $event.detail.value"
          >
            <ion-select-option
              v-for="(item, o) in pronouns"
              :key="'pronouns' + index + o"
              :value="item.id"
            >
              {{ item.text }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </template>
  </div>
</template>
<script>
import Gender from "@/mixins/gender.js";
import UserData from "@/mixins/userData.js";
export default {
  data() {
    return {
      segment: 0
    };
  },
  created() {
    let vm = this;
    let unwatch = vm.$watch(
      "userData.seeking.relationships",
      function(relationships) {
        if (unwatch) {
          return unwatch();
        } else {
          vm.$nextTick().then(() => {
            relationships.forEach(function(relationship, i) {
              vm.$refs.genderSelect[i].value = relationship.identities;
              vm.$refs.expressionSelect[i].value = relationship.expressions;
              vm.$refs.orientationSelect[i].value = relationship.orientations;
              vm.$refs.pronounSelect[i].value = relationship.pronouns;
            });
          });
        }
      },
      { immediate: true }
    );
  },
  computed: {
    activeSegment() {
      return parseInt(this.segment);
    }
  },
  mixins: [UserData, Gender]
};
</script>
