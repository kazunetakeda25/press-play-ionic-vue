<template>
  <ion-page>
    <ion-content class="box-shadow" v-if="!loading && !error">
      <ion-header class="toolbar-bg no-style" slot="fixed">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button
              class="cat-button"
              disabled="true"
              v-for="(category, index) in treeData"
              :key="'categoryButton' + index"
            >
              <ion-avatar
                class="songstory-cat-avatar cat-button-icon"
                :class="`cat-${category.id}`"
                slot="end"
              >
                <icon color="light" :name="`c-songstory-${category.id}`"></icon>
              </ion-avatar>
              {{ category.answerCount }}
            </ion-button>
          </ion-buttons>
          <ion-text color="system" slot="end">
            <ion-select
              class="ion-padding-end"
              interface="popover"
              :value="categoryFilter"
              @ionChange="categoryFilter = $event.target.value"
            >
              <ion-select-option value="all">All Questions</ion-select-option>
              <ion-select-option
                v-for="(category, index) in treeData"
                :key="'categoryFilter' + index"
                :value="category.id"
                >{{ category.name }}</ion-select-option
              >
            </ion-select>
          </ion-text>
        </ion-toolbar>
        <ion-fab
          horizontal="end"
          vertical="bottom"
          style="margin-bottom: calc(var(--toolbar-height) / 2 * -1);"
        >
          <ion-fab-button
            color="light"
            size="small"
            @click.prevent="submitQuestion"
          >
            <icon name="bulb" color="secondary"></icon>
          </ion-fab-button>
        </ion-fab>
      </ion-header>
      <ion-content class="primary-vertical-gradient">
        <ion-grid class="align-content-center">
          <ion-row class="ion-justify-content-center ion-align-items-center">
            <ion-col size="12" size-md="8" size-xl="6">
              <template v-if="question">
                <div
                  class="ion-text-center ion-margin-bottom ion-padding-vertical"
                >
                  <div>
                    <icon
                      class="songstory-cat-icon"
                      color="light"
                      :name="`c-songstory-${question.category.parent.id}`"
                    ></icon>
                  </div>
                  <ion-text color="light">
                    <h1 class="h2">{{ question.question }}</h1>
                  </ion-text>
                </div>
                <ion-grid>
                  <ion-row
                    class="ion-justify-content-center ion-align-items-center"
                  >
                    <ion-col size="auto">
                      <ion-fab-button
                        color="light"
                        size="small"
                        :disabled="historyIndex == 0"
                        @click.prevent="skipBackward"
                      >
                        <icon name="play-skip-back"></icon>
                      </ion-fab-button>
                    </ion-col>
                    <ion-col size="auto">
                      <ion-fab-button
                        class="bright-vertical-gradient"
                        @click.prevent="editAnswer"
                      >
                        <icon name="play"></icon>
                      </ion-fab-button>
                    </ion-col>
                    <ion-col size="auto">
                      <ion-fab-button
                        color="light"
                        size="small"
                        @click.prevent="skipForward"
                      >
                        <icon name="play-skip-forward"></icon>
                      </ion-fab-button>
                    </ion-col>
                  </ion-row>
                  <ion-row
                    class="ion-justify-content-center ion-align-items-center"
                  >
                    <ion-col size="auto">
                      <div class="ion-padding-vertical">
                        <ion-button
                          class="opacity-button"
                          color="light"
                          shape="round"
                          @click.prevent="confirmClearQuestion"
                        >
                          <ion-spinner
                            v-show="clearingQuestion"
                            slot="start"
                          ></ion-spinner>
                          Clear
                        </ion-button>
                      </div>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </template>
              <template
                v-if="
                  answerable.length == 0 && !question && questions.length > 0
                "
              >
                <div class="ion-text-center">
                  <ion-text color="light">
                    <h1>
                      Oh no! You've run out of SongStory questions to answer
                    </h1>
                    <h2>We're always adding more, so check back soon!</h2>
                  </ion-text>
                </div>
                <ion-button
                  color="light"
                  expand="block"
                  size="large"
                  @click.prevent="skipBackward"
                >
                  <icon name="skip-backward" slot="start"></icon>
                  Go back
                </ion-button>
              </template>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </ion-content>
    <template v-if="!loading && error">
      <ion-content>
        <ion-grid
          class="align-content-center"
          style="width: 100%;"
          v-if="error"
        >
          <ion-row class="ion-justify-content-center">
            <ion-col class="ion-text-center" size="12" size-md="6">
              <h1>Something went wrong</h1>
              <p class="text-large">
                We were unable to load your SongStory at this time. This is
                probably just temporary, try again.
              </p>
              <div>
                <ion-button
                  color="system"
                  fill="clear"
                  @click.prevent="fetchData"
                >
                  <icon slot="start" name="refresh"></icon>
                  Try Again
                </ion-button>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>
    </template>
  </ion-page>
</template>
<script>
import Vue from "vue";

import filter from "lodash/filter";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import random from "lodash/random";

import Songstory from "@/mixins/songstory.js";
import SongstorySubmit from "@/components/songstory/submit.vue";
import SongstoryQuestion from "@/components/songstory/question.vue";

import WindowMixin from "@/mixins/window.js";

export default {
  layout: {
    menubar: {
      components: [
        {
          component: require("@/components/songstory/list.vue"),
          props: {
            aspectRatioAttrs: {
              ratio: "16:4"
            },
            categoryTitleAlignment: "start",
            class: "isSidebarView",
            clearSelected: true,
            mode: "select",
            showAnswerIndicator: false,
            showCategoryBg: true,
            showCategoryFilter: false,
            showCategoryIcon: true,
            showCategoryImage: true,
            showListIcons: false,
            showUnansweredOnly: true
          },
          slot: "content"
        }
      ]
    }
  },

  data() {
    return {
      categoryFilter: "all",
      error: false,
      exclusions: [],
      history: [],
      historyIndex: 0,
      loading: true,
      question: null
    };
  },

  created() {
    let vm = this;

    // Setup data
    vm.$on("errorRetry", () => vm.fetchData());
    vm.fetchData();

    // Get question exclusions
    vm.$watch(
      "answers",
      function(answers) {
        answers.map(answer => {
          if (answer.question != undefined && vm.exclusions.indexOf(answer.question.path) === -1) {
            vm.exclusions.push(answer.question.path);
          }
        });
      },
      { immediate: true }
    );

    // Watch for the questions to load and get random question
    vm.$watch(
      "questions",
      function(questions) {
        if (questions.length > 0 && this.question == null) {
          this.getRandomQuestion();
        }
      },
      { immediate: true }
    );

    // Build question history
    vm.$watch(
      "question",
      function(question) {
        if (question) {
          // Check if question in history before adding
          let existingQuestion = find(
            vm.history,
            item => item.path == question.path
          );
          if (typeof existingQuestion === "undefined") {
            vm.history.push(question);
          }

          // Commit to selected
          if (
            !vm.hasSelected ||
            (vm.hasSelected && vm.selected.id !== question.id)
          ) {
            vm.$store.commit("Songstory/select", question);
          }
        } else {
          vm.$store.commit("Songstory/select", {});
        }
      },
      { immediate: true }
    );

    // Watch selected
    vm.$watch("selected", function(selected) {
      if (Object.keys(selected).length > 0) {
        // Handle current question
        if (vm.question && vm.exclusions.indexOf(vm.question.path) == -1) {
          vm.exclusions.push(vm.question.path);
        }
        // If selected in history, move to it
        // Else, push selected into history
        let historyIndex = findIndex(vm.history, { id: selected.id });
        if (historyIndex !== -1) {
          vm.historyIndex = historyIndex;
          vm.question = vm.history[historyIndex];
        } else {
          vm.historyIndex = vm.historyIndex + 1;
          vm.question = selected;
        }
        // Close the menu
        // console.log(vm.$ionic.menuController);
        vm.$ionic.menuController.close("menu");
      }
    });

    // Watch categoryFilter
    vm.$watch("categoryFilter", function() {
      vm.history = [];
      vm.historyIndex = 0;
      vm.question = null;
      vm.getRandomQuestion();
    });

    // Listen for songstoryClear
    vm.$on("songstoryClear", function() {
      vm.handleClearQuestion();
    });

    // Listen for resize
    vm.$on("resize", function() {
      if (vm.activeModal) {
        vm.setModalDimensions(vm.activeModal);
      }
    });
  },

  methods: {
    confirmClearQuestion() {
      return this.promptClearQuestion(this.question);
    },

    async fetchData() {
      let vm = this;

      vm.loading = true;
      vm.error = false;

      await vm.$ionic.loadingController
        .create({
          message: "Loading SongStory..."
        })
        .then(function(e) {
          vm.loader = e;
          return vm.loader.present();
        });
      return vm.$store
        .dispatch("Songstory/loadAll")
        .catch(err => {
          console.error(err.message, err);
          vm.error = true;
          return vm.$error("Something went wrong, please try again.");
        })
        .finally(() => {
          vm.loading = false;
          vm.loader.dismiss();
        });
    },

    async editAnswer() {
      let vm = this;

      // Create SongstoryQuestion instance
      let SongstoryQuestionComponent = Vue.extend(SongstoryQuestion);
      let SongstoryQuestionInstance = new SongstoryQuestionComponent({
        propsData: {
          answerRef: "add",
          columnAttrs: { size: 12, "size-md": 6 },
          formMode: "transparent",
          questionId: vm.question.id,
          questionColor: "light"
        }
      });

      // Dismiss modal and skip forward on answer
      SongstoryQuestionInstance.$on("songstoryAnswer", function() {
        vm.activeModal.dismiss();
        vm.skipForward();
      });

      // Dismiss modal on back button
      SongstoryQuestionInstance.$on("songstoryBack", function() {
        vm.activeModal.dismiss();
      });

      // Handler cleared question, dismiss modal on clear
      SongstoryQuestionInstance.$on("songstoryClear", function() {
        vm.handleClearQuestion();
        vm.activeModal.dismiss();
      });

      // Mount the instance
      SongstoryQuestionInstance.$mount();

      await vm.$ionic.modalController
        .create({
          component: SongstoryQuestionInstance.$el,
          cssClass: `cat-${vm.question.category.parent.id}-gradient`
        })
        .then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
          });
        });

      return vm.activeModal.present();
    },

    getRandomQuestion() {
      return this.answerable.length
        ? (this.question = this.answerable[random(this.answerable.length - 1)])
        : (this.question = null);
    },

    handleClearQuestion() {
      // Remove question from history
      this.$delete(this.history, this.historyIndex);

      if (this.historyIndex !== 0) {
        this.historyIndex = this.historyIndex - 1;
        this.skipForward();
      } else {
        this.getRandomQuestion();
      }
    },

    skipBackward() {
      if (this.historyIndex !== 0) {
        this.historyIndex = this.historyIndex - 1;
        this.question = this.history[this.historyIndex];
      }
    },

    skipForward() {
      // Add question to exclusions
      if (this.exclusions.indexOf(this.question.path) == -1) {
        this.exclusions.push(this.question.path);
      }

      // Bump index
      this.historyIndex = this.historyIndex + 1;

      // If at the end of history, getRandomQuestion
      if (this.historyIndex + 1 > this.history.length) {
        this.getRandomQuestion();
      } else {
        if (typeof this.history[this.historyIndex] !== "undefined") {
          // We're back in history, move forward
          this.question = this.history[this.historyIndex];
        } else {
          this.question = null;
        }
      }
    },

    async submitQuestion() {
      let vm = this;

      // Create SongstorySubmit instance
      let SongstorySubmitComponent = Vue.extend(SongstorySubmit);
      let SongstorySubmitInstance = new SongstorySubmitComponent({
        propsData: {
          columnAttrs: { size: 12, "size-md": 6 },
          defaultCategory:
            vm.categoryFilter === "all" ? "nowplaying" : vm.categoryFilter,
          formMode: "transparent",
          questionColor: "light"
        }
      });

      // Dismiss modal and skip forward on answer
      SongstorySubmitInstance.$on("songstorySubmit", function() {
        vm.activeModal.dismiss();
      });

      // Dismiss modal on back button
      SongstorySubmitInstance.$on("songstoryBack", function() {
        vm.activeModal.dismiss();
      });

      // Mount the instance
      SongstorySubmitInstance.$mount();

      await vm.$ionic.modalController
        .create({
          component: SongstorySubmitInstance.$el,
          cssClass: `bright-vertical-gradient`
        })
        .then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
            SongstorySubmitInstance.$emit("displayCheck");
          });
        });

      return vm.activeModal.present();
    }
  },

  computed: {
    answerable() {
      let vm = this;
      return filter(vm.questionData, question => {
        let exlusionCondition = vm.exclusions.indexOf(question.path) === -1;
        let categoryCondition = true;

        if (vm.categoryFilter !== "all") {
          let rootCategory = find(
            vm.treeData,
            category => category.id == vm.categoryFilter
          );
          let categories = rootCategory.children.map(child => child.path);
          categoryCondition = categories.indexOf(question.category.path) !== -1;
        }

        return exlusionCondition && categoryCondition;
      });
    }
  },

  mixins: [Songstory, WindowMixin]
};
</script>
<style lang="scss" scoped>
@media (min-width: 992px) {
  .ion-page > ion-content {
    border-radius: 8px;
    overflow: hidden;
  }
}
ion-button.select {
  ion-select {
    --padding-start: 0;
    --padding-top: 0;
    --padding-bottom: 0;
  }
}
.cat-button {
  &.button-disabled {
    --opacity: 1;
  }
  .cat-button-icon {
    width: 32px;
    height: 32px;
    &[slot="start"] {
      margin-right: unset;
      margin-inline-end: 0.3em;
    }
    &[slot="end"] {
      margin-left: unset;
      margin-inline-start: 0.4em;
    }
  }
}
</style>
