<template>
  <ion-page>
    <ion-card class="primary-vertical-gradient">
      <ion-grid>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <songstory-question
              :question-id.sync="$route.params.id"
              question-color="white"
              v-on:songstoryBack="goBack"
            >
            </songstory-question>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card>
  </ion-page>
</template>
<script>
import SongstoryQuestion from "@/components/songstory/question.vue";

export default {
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  },

  components: {
    SongstoryQuestion
  }
};
</script>
<style lang="scss" scoped>
ion-grid,
ion-row,
ion-page,
ion-card {
  height: 100%;
}
ion-page {
  position: relative;
}
@media screen and (min-width: 992px) {
  ion-page {
    height: calc(100% - 86px);
  }
}
@media screen and (max-width: 992px) {
  ion-card {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
    border-radius: 0;
  }
}
</style>
