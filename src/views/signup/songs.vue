<template>
  <ion-page>
    <ion-content class="purple-vertical-gradient" fullscreen>
      <songstory-question
        :column-attrs="{ size: 12, 'size-md': 6, 'size-xl': 4 }"
        question-id="favorites_what_are_your_697ece1028e8-47f9-90"
        question-color="white"
        :show-text="false"
        v-on:songstoryAnswer="saveAnswer"
        v-on:songstoryBack="goBack"
      >
      </songstory-question>
    </ion-content>
  </ion-page>
</template>
<script>
import SongstoryQuestion from "@/components/songstory/question.vue";
import UserData from "@/mixins/userData.js";

export default {
  next: "profile",
  lastStep: true,

  methods: {
    saveAnswer() {
      this.saveSetup();
    },
    goBack() {
      window.history.back();
    }
  },

  components: {
    SongstoryQuestion
  },

  mixins: [UserData]
};
</script>
<style lang="scss">
@media (min-width: 768px) {
  #songstory-question-wrapper ion-footer > ion-grid {
    width: calc(calc(6 / var(--ion-grid-columns, 12)) * 100%);
    max-width: calc(calc(6 / var(--ion-grid-columns, 12)) * 100%);
  }
}
@media (min-width: 1200px) {
  #songstory-question-wrapper ion-footer > ion-grid {
    width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    max-width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
  }
}
</style>
