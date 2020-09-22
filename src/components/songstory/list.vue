<template>
  <div class="songstory-list">
    <template v-for="(cat, c) in treeData">
      <ion-grid class="ion-no-padding" :key="'c' + c">
        <ion-row>
          <ion-col size="12" class="ion-no-padding">
            <div
              class="songstory-cat-banner ion-padding"
              :class="
                `cat-${cat.id} bg-${showCategoryBg} img-${showCategoryImage} icon-${showCategoryIcon}`
              "
            >
              <div class="cat-image fade-to-bottom" v-if="showCategoryImage">
                <songstory-banner :answers="cat.answers"></songstory-banner>
              </div>
              <aspect-ratio
                class="ion-justify-content-center ion-align-items-center"
                v-bind="aspectRatioAttrs"
              >
                <ion-grid class="ion-no-padding">
                  <ion-row :class="categoryTitleClass" v-if="showCategoryTitle">
                    <ion-col size="auto" v-if="showCategoryIcon">
                      <ion-avatar
                        class="songstory-cat-avatar"
                        :class="`cat-${cat.id}`"
                      >
                        <icon
                          color="light"
                          :name="`c-songstory-${cat.id}`"
                        ></icon>
                      </ion-avatar>
                    </ion-col>
                    <ion-col class="ion-no-padding" size="auto">
                      <ion-text :color="textColor">
                        <h3 class="ion-no-margin h4">{{ cat.name }}</h3>
                      </ion-text>
                      <ion-text :color="secondaryColor">
                        <h4 class="ion-no-margin ion-text-lowercase h5">
                          {{ cat.subtitle }}
                        </h4>
                      </ion-text>
                    </ion-col>
                  </ion-row>
                  <ion-row :class="answerClass" v-if="showAnswerIndicator">
                    <ion-col size="12" size-sm="6">
                      <ion-text :color="textColor">
                        <h4 class="ion-no-margin">
                          {{ cat.answerCount }} answers
                        </h4>
                      </ion-text>
                    </ion-col>
                    <ion-col
                      size="12"
                      size-sm="6"
                      v-if="showUnansweredToggle && mode !== 'browse'"
                    >
                      <ion-item lines="none">
                        <ion-label>Show unanswered only</ion-label>
                        <ion-toggle
                          :checked="unansweredFilters[c]"
                          :color="secondaryColor"
                          slot="start"
                          @ionChange="unansweredChanged($event, c)"
                        >
                        </ion-toggle>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </aspect-ratio>
            </div>
          </ion-col>
        </ion-row>
        <ion-row
          class="ion-justify-content-center"
          v-if="
            showCategoryFilter &&
              (unansweredFilters[c] ? !cat.isComplete : true)
          "
        >
          <ion-col v-bind="filterColAttrs">
            <ion-segment
              scrollable
              value="all"
              @ionChange="segmentChanged($event, c)"
            >
              <ion-segment-button class="ion-text-capitalize" value="all">
                <ion-label>All</ion-label>
              </ion-segment-button>
              <template v-for="(category, index) in cat.children">
                <ion-segment-button
                  class="ion-text-capitalize"
                  :key="'filter' + index"
                  :value="category.path"
                  v-if="showCategory(category, c, false)"
                >
                  <ion-label>{{ category.name }}</ion-label>
                </ion-segment-button>
              </template>
            </ion-segment>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center">
          <ion-col v-bind="listColAttrs">
            <template v-for="(category, index) in cat.children">
              <ion-list
                :key="'list' + index"
                lines="full"
                v-show="showCategory(category, c, true)"
              >
                <ion-list-header v-if="categoryFilters[c] == 'all'">
                  {{ category.name }}
                </ion-list-header>
                <template v-for="(question, i) in category.questions">
                  <ion-item
                    :button="mode !== 'editor'"
                    :color="isSelected(question) ? 'light' : ''"
                    :detail="mode == 'select'"
                    :disabled="isSelected(question)"
                    :key="i"
                    :style="{
                      'pointer-events':
                        question.answers.length > 0 && mode == 'editor'
                          ? 'none'
                          : 'auto'
                    }"
                    v-show="showQuestion(question, c)"
                    @click.prevent="handleClick(question)"
                  >
                    <template v-if="showListIcons">
                      <icon
                        slot="start"
                        name="search"
                        v-show="question.answers.length == 0"
                      ></icon>
                      <icon
                        class="ion-align-self-start"
                        color="primary"
                        name="checkmark-circle"
                        slot="start"
                        v-show="question.answers.length > 0"
                      ></icon>
                    </template>

                    <ion-label class="ion-text-wrap">
                      <ion-text>{{ question.question }}</ion-text>
                      <div v-if="question.answers.length > 0">
                        <template v-for="(answer, a) in question.answers">
                          <ion-list
                            class="songstory-answer-list"
                            :key="`aItem${a}`"
                          >
                            <ion-item
                              v-if="answer.text || question.multipleAnswers"
                            >
                              <ion-label v-if="answer.text">
                                {{ answer.text }}
                              </ion-label>
                              <ion-note slot="end" v-if="question.acceptsDate">
                                {{ getAnswerDate(answer) }}
                              </ion-note>
                              <template v-if="question.multipleAnswers">
                                <template v-if="mode === 'editor'">
                                  <ion-button
                                    fill="clear"
                                    color="medium"
                                    slot="end"
                                    @click.prevent="
                                      editAnswer(question, answer)
                                    "
                                  >
                                    <icon name="create" slot="icon-only"></icon>
                                  </ion-button>
                                </template>
                                <template v-if="mode === 'browse'">
                                  <ion-button
                                    class="ion-align-self-start"
                                    color="secondary"
                                    fill="clear"
                                    slot="end"
                                    @click.prevent="
                                      viewAnswer(question, answer)
                                    "
                                  >
                                    <icon name="play" slot="icon-only"></icon>
                                  </ion-button>
                                </template>
                              </template>
                            </ion-item>
                            <spotify-item
                              v-for="(item, d) in answer.data"
                              :key="`dItem${d}`"
                              :item="item"
                              :selectable="true"
                            ></spotify-item>
                          </ion-list>
                        </template>
                      </div>
                    </ion-label>

                    <template v-if="showListIcons">
                      <template v-if="mode === 'editor'">
                        <ion-button
                          class="ion-align-self-start"
                          color="medium"
                          fill="clear"
                          slot="end"
                          v-show="
                            question.answers.length > 0 &&
                              !question.multipleAnswers
                          "
                          @click.prevent="
                            editAnswer(question, question.answers[0])
                          "
                        >
                          <icon name="create" slot="icon-only"></icon>
                        </ion-button>
                        <ion-button
                          fill="clear"
                          slot="end"
                          v-show="question.answers.length == 0"
                          @click.prevent="editAnswer(question, 'add')"
                        >
                          <icon name="add" slot="icon-only"></icon>
                        </ion-button>
                        <ion-button
                          class="ion-align-self-start"
                          fill="clear"
                          slot="end"
                          v-show="
                            question.multipleAnswers &&
                              question.answers.length > 0
                          "
                          @click.prevent="editAnswer(question, 'add')"
                        >
                          <icon name="add" slot="icon-only"></icon>
                        </ion-button>
                      </template>
                      <template v-if="mode === 'browse'">
                        <ion-button
                          class="ion-align-self-start"
                          color="secondary"
                          fill="clear"
                          slot="end"
                          @click.prevent="viewAnswer(question, answer)"
                        >
                          <icon name="play" slot="icon-only"></icon>
                        </ion-button>
                      </template>
                    </template>
                  </ion-item>
                </template>
                <ion-item
                  :style="{
                    'text-align':
                      categoryFilters[c] !== 'all' ? 'center' : 'left'
                  }"
                  v-show="category.questions.length == 0"
                >
                  <ion-label color="medium"
                    ><small>No questions in this category.</small></ion-label
                  >
                </ion-item>
              </ion-list>
            </template>
            <div
              class="ion-padding-vertical ion-text-center"
              v-if="unansweredFilters[c] ? cat.isComplete : false"
            >
              <h4>
                All these questions were answered!
              </h4>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </template>
  </div>
</template>
<script>
import Vue from "vue";
import merge from "lodash/merge";
import moment from "moment";

import SongstoryAnswer from "@/components/songstory/answer.vue";
import SongstoryBanner from "@/components/songstory/banner.vue";
import SongstoryQuestion from "@/components/songstory/question.vue";
import SpotifyItem from "@/components/spotify/search-item.vue";

import Songstory from "@/mixins/songstory.js";
import SpotifyFunctions from "@/mixins/spotify.js";
import WindowMixin from "@/mixins/window.js";

export default {
  props: {
    aspectRatioAttrs: {
      type: Object,
      default: function() {
        return {
          ratio: "16:9",
          ratioSm: "16:5"
        };
      }
    },
    browseAnswers: Array,
    categoryTitleAlignment: {
      type: String,
      default: "center"
    },
    clearSelected: {
      type: Boolean,
      default: false
    },
    filterColAttrs: {
      type: Object,
      default: function() {
        return {
          size: 12
        };
      }
    },
    listColAttrs: {
      type: Object,
      default: function() {
        return {
          size: 12
        };
      }
    },
    modalOptions: {
      type: Object,
      default: function() {
        return {};
      }
    },
    mode: {
      type: String,
      default: "editor"
    },
    showAnswerIndicator: {
      type: Boolean,
      default: true
    },
    showCategoryBg: {
      type: Boolean,
      default: true
    },
    showCategoryFilter: {
      type: Boolean,
      default: true
    },
    showCategoryIcon: {
      type: Boolean,
      default: true
    },
    showCategoryImage: {
      type: Boolean,
      default: true
    },
    showCategoryTitle: {
      type: Boolean,
      default: true
    },
    showListIcons: {
      type: Boolean,
      default: true
    },
    showUnansweredOnly: {
      type: Boolean,
      default: false
    },
    showUnansweredToggle: {
      type: Boolean,
      default: true
    },
    uid: String
  },

  data() {
    return {
      categoryFilters: [],
      unansweredFilters: [],
      loading: false,
      modalLoading: false
    };
  },

  created() {
    let vm = this;
    // Get data
    vm.fetchData();
    // Create categoryFilters
    vm.$watch(
      "treeData",
      function(data) {
        data.forEach(function(cat, c) {
          if (typeof vm.categoryFilters[c] == "undefined") {
            vm.$set(vm.categoryFilters, c, "all");
          }
          if (typeof vm.unansweredFilters[c] == "undefined") {
            vm.$set(vm.unansweredFilters, c, vm.showUnansweredOnly);
          }
        });
      },
      { immediate: true }
    );
    // Set destroySelected
    vm.destroySelected = vm.clearSelected;
    // Set modal dimensions
    vm.$on("resize", function() {
      if (vm.activeModal) {
        vm.setModalDimensions(vm.activeModal);
      }
    });
  },

  methods: {
    fetchData() {
      let vm = this;
      vm.loading = true;
      return vm.$store
        .dispatch("Songstory/loadAll")
        .catch(() =>
          vm.$error(
            "We were unable to load the SongStory. It's probably just temporary, try again.",
            {
              buttons: [
                {
                  text: "Retry",
                  cssClass: "primary",
                  handler: () => vm.fetchData()
                }
              ]
            }
          )
        )
        .finally(() => {
          vm.loading = false;
        });
    },

    async editAnswer(question, answer) {
      let vm = this;

      let propsData = {
        columnAttrs: { size: 12, "size-md": 6 },
        formMode: "transparent",
        questionId: question.id,
        questionColor: "light"
      };

      if (answer) {
        propsData.answerRef = answer;
      }

      if (!vm.activeModal && !vm.modalLoading) {
        vm.modalLoading = true;

        // Create SongstoryQuestion instance
        let SongstoryQuestionComponent = Vue.extend(SongstoryQuestion);
        let SongstoryQuestionInstance = new SongstoryQuestionComponent({
          propsData
        });

        // Dismiss modal on answer
        SongstoryQuestionInstance.$on("songstoryAnswer", function() {
          vm.activeModal.dismiss();
        });

        // Dismiss modal on back button
        SongstoryQuestionInstance.$on("songstoryBack", function() {
          vm.activeModal.dismiss();
        });

        // Dismiss modal on clear
        SongstoryQuestionInstance.$on("songstoryClear", function() {
          vm.activeModal.dismiss();
        });

        // Mount the instance
        SongstoryQuestionInstance.$mount();

        // Get modal options
        let modalOptions = merge(vm.modalOptions, {
          component: SongstoryQuestionInstance.$el,
          cssClass: `cat-${question.category.parent.id}-gradient`
        });

        await vm.$ionic.modalController.create(modalOptions).then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidDismiss", function() {
            vm.activeModal = undefined;
          });
          vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
          });
        });

        return vm.activeModal.present().then(() => {
          vm.modalLoading = false;
        });
      }
    },

    getAnswerDate(answer) {
      let date = new moment();
      let dateObj = {};
      let dateFormat = [];

      if (answer.date.month) {
        dateObj.month = answer.date.month;
        dateFormat.push("MMM");
        if (answer.date.day) {
          dateObj.date = answer.date.day;
          dateFormat.push("D,");
        }
      }
      if (answer.date.year) {
        dateObj.year = answer.date.year;
        dateFormat.push("YYYY");
      }

      date.set(dateObj);

      let format = dateFormat.join(" ");
      let formatted = date.format(format);

      return !answer.date.month ? `Sometime in ${formatted}` : formatted;
    },

    getAnswerText(answers) {
      let vm = this;
      let strings = [];
      answers.forEach(function(answer) {
        if (Object.prototype.hasOwnProperty.call(answer, "data")) {
          answer.data.forEach(function(data) {
            strings.push(vm.getSpotifyItemName(data));
          });
        }
      });
      return strings.join(", ");
    },

    handleClick(question) {
      switch (this.mode) {
        case "browse":
          if (!question.multipleAnswers) {
            this.viewAnswer(question, question.answers[0]);
          }
          break;
        case "editor":
          if (question.answers.length === 0) {
            this.editAnswer(question, "add");
          } else {
            if (!question.multipleAnswers) {
              this.editAnswer(question, question.answers[0]);
            }
          }
          break;
        case "select":
          this.$store.commit("Songstory/select", question);
          break;
      }
    },

    isSelected(question) {
      return (
        this.mode == "select" &&
        this.hasSelected &&
        this.selected.id == question.id
      );
    },

    segmentChanged(event, index) {
      return this.$set(this.categoryFilters, index, event.target.value);
    },

    showCategory(category, index, testCategory = true) {
      if (this.mode === "browse") {
        return category.answerCount > 0;
      } else {
        let categoryCondition = testCategory
          ? this.categoryFilters[index] == "all" ||
            this.categoryFilters[index] == category.path
          : true;
        let answerCondition = true;

        if (this.unansweredFilters[index] == true) {
          answerCondition = category.answerCount < category.questionCount;
        }

        return categoryCondition && answerCondition;
      }
    },

    showQuestion(question, index) {
      if (this.mode === "browse") {
        return question.answers.length > 0;
      } else {
        return (
          this.unansweredFilters[index] == false ||
          (this.unansweredFilters[index] == true &&
            question.answers.length == 0)
        );
      }
    },

    unansweredChanged(event, index) {
      return this.$set(this.unansweredFilters, index, event.target.checked);
    },

    async viewAnswer(question, answer) {
      let vm = this;

      let propsData = {
        answerRef: answer,
        columnAttrs: { size: 12, "size-md": 6 },
        formMode: "transparent",
        questionId: question.id,
        questionColor: "light",
        uid: vm.uid
      };

      if (!vm.activeModal && !vm.modalLoading) {
        vm.modalLoading = true;

        // Create SongstoryAnswer instance
        let SongstoryAnswerComponent = Vue.extend(SongstoryAnswer);
        let SongstoryAnswerInstance = new SongstoryAnswerComponent({
          propsData
        });

        // Dismiss modal on back button
        SongstoryAnswerInstance.$on("songstoryBack", function() {
          vm.activeModal.dismiss();
        });

        // Mount the instance
        SongstoryAnswerInstance.$mount();

        // Get modal options
        let modalOptions = merge(vm.modalOptions, {
          component: SongstoryAnswerInstance.$el,
          cssClass: `cat-${question.category.parent.id}-gradient`
        });

        await vm.$ionic.modalController.create(modalOptions).then(m => {
          vm.activeModal = m;
          vm.activeModal.addEventListener("ionModalDidDismiss", function() {
            vm.activeModal = undefined;
          });
          vm.activeModal.addEventListener("ionModalDidPresent", function(e) {
            vm.setModalDimensions(e.target);
          });
        });

        return vm.activeModal.present().then(() => {
          vm.modalLoading = false;
        });
      }
    }
  },

  computed: {
    answerClass() {
      return `ion-text-center ion-align-items-center ion-justify-content-${
        this.showUnansweredToggle && this.mode !== "browse"
          ? "between"
          : "center"
      }`;
    },
    categoryTitleClass() {
      return `ion-align-items-center ion-justify-content-${this.categoryTitleAlignment}`;
    },
    secondaryColor() {
      return this.showCategoryBg ? "secondary" : "primary";
    },
    textColor() {
      return this.showCategoryBg ? "light" : "";
    }
  },

  components: {
    SongstoryBanner,
    SpotifyItem
  },

  mixins: [Songstory, SpotifyFunctions, WindowMixin]
};
</script>
<style lang="scss" scoped>
ion-list {
  [slot="start"] {
    margin-inline-end: 16px;
    margin-bottom: 12px;
    margin-top: 12px;
  }
  [slot="end"] {
    margin-inline-start: 16px;
    margin-bottom: 12px;
    margin-top: 12px;
    pointer-events: auto !important;
    z-index: 3 !important;
  }
}
.songstory-answer-list {
  --ion-item-background: transparent;
  --ion-item-background-focused: transparent;
  --ion-item-background-hover: transparent;
  ion-item {
    --padding-start: 0;
  }
}
</style>
