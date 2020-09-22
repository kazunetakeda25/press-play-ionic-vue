<template>
  <form
    class="ion-page"
    id="songstory-question-wrapper"
    :class="wrapperClass"
    :style="wrapperStyle"
    @submit.prevent="submit"
  >
    <ion-header class="no-style" v-if="showNav">
      <ion-grid>
        <ion-row class="ion-align-items-center ion-justify-content-between">
          <ion-col size="auto">
            <ion-button
              color="light"
              fill="clear"
              size="large"
              @click.prevent="$emit('songstoryBack')"
            >
              <icon slot="icon-only" name="arrow-back"></icon>
            </ion-button>
          </ion-col>
          <ion-col size="auto" v-if="!question.required">
            <ion-button
              color="light"
              size="small"
              shape="round"
              @click.prevent="confirmClearQuestion"
            >
              <ion-spinner v-show="clearingQuestion" slot="start"></ion-spinner>
              Clear
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-header>
    <ion-content :class="contentCssClass" :style="contentStyle" fullscreen>
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center">
          <ion-col v-bind="columnAttrs">
            <div>
              <div class="ion-margin-vertical" v-if="hasIcon">
                <icon
                  class="songstory-cat-icon"
                  :color="questionColor"
                  :name="`c-songstory-${question.category.parent.id}`"
                ></icon>
              </div>
              <ion-text :color="questionColor">
                <h1 class="h2">{{ question.question }}</h1>
              </ion-text>
            </div>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center" v-if="hasAnswer">
          <ion-col v-bind="columnAttrs">
            <template v-if="question.searchMode == 'grid'">
              <div
                class="ion-margin-bottom"
                :class="formCssClass"
                v-if="activeAnswer !== null"
              >
                <spotify-search
                  :index-track="activeAnswer"
                  :search-types="question.searchTypes"
                  :placeholder="`${placeholderValue} for #${activeAnswer + 1}`"
                  v-on:spotifySelect="updateAnswerData"
                ></spotify-search>
              </div>
              <ion-grid class="ion-no-padding">
                <ion-row class="ion-justify-content-center">
                  <ion-col
                    class="ion-no-padding ion-padding-bottom"
                    :class="{
                      'middle-col': index % 3 == 1,
                      'ion-padding-end': index % 3 == 0,
                      'ion-padding-start': index % 3 == 2
                    }"
                    size="4"
                    v-for="(item, index) in answer.data"
                    :key="index"
                  >
                    <ion-card
                      button="true"
                      class="ion-no-padding ion-no-margin"
                      :style="{
                        background: spotifyItemHasImages(item)
                          ? `url(${getSpotifyItemImage(
                              item
                            )}) 50% 50% / cover no-repeat`
                          : ''
                      }"
                      @click.prevent="activeAnswer = index"
                    >
                      <aspect-ratio>
                        <div>
                          <ion-badge class="ion-margin-start ion-margin-top">{{
                            index + 1
                          }}</ion-badge>
                        </div>
                      </aspect-ratio>
                    </ion-card>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </template>
            <ion-list :class="formCssClass">
              <template v-if="question.searchMode == 'search'">
                <spotify-search
                  v-for="(item, index) in answer.data"
                  :key="index"
                  :index-track="index"
                  :search-types="question.searchTypes"
                  :song="item"
                  v-on:spotifySelect="updateAnswerData"
                ></spotify-search>
                <ion-item
                  button
                  class="no-style"
                  v-if="showAddMoreButton"
                  @click.prevent="answer.data.push({})"
                >
                  <ion-label>
                    Add up to
                    {{ question.answerLimit - answer.data.length }} more
                  </ion-label>
                  <ion-button :color="questionColor" slot="end">
                    <icon name="add"></icon>
                    Add
                  </ion-button>
                </ion-item>
              </template>

              <template v-if="question.searchMode == 'picker'">
                <spotify-search
                  v-for="(item, index) in answer.data"
                  :key="index"
                  :index-track="index"
                  :search-types="question.searchTypes"
                  :song="item"
                  :placeholder="placeholderValue"
                  v-on:spotifySelect="updateAnswerData"
                >
                  <template v-slot:search-start>
                    <ion-badge slot="start">{{ index + 1 }}</ion-badge>
                  </template>
                </spotify-search>
              </template>

              <ion-item lines="none" v-if="showText">
                <ion-label position="stacked"
                  >Take us back...what do you remember?</ion-label
                >
                <ion-textarea
                  rows="3"
                  maxlength="255"
                  :value="answer.text"
                  :disabled="submitting"
                  @ionInput="answer.text = $event.target.value"
                ></ion-textarea>
              </ion-item>
              <template v-if="question.acceptsDate">
                <ion-item lines="none" @click.prevent="showDate = !showDate">
                  <ion-label>When?</ion-label>
                  <ion-button color="light" slot="end" rounded>
                    {{ chosenDate }}
                    <icon name="arrow-up" slot="end" v-if="showDate"></icon>
                    <icon name="arrow-down" slot="end" v-if="!showDate"></icon>
                  </ion-button>
                </ion-item>
                <ion-grid class="ion-no-padding" v-show="showDate">
                  <ion-row>
                    <ion-col
                      size="4"
                      style="padding-top: 0; padding-bottom: 0; padding-left: 0;"
                    >
                      <ion-item lines="none">
                        <ion-label position="stacked">Year</ion-label>
                        <ion-select
                          placeholder="Select"
                          :value="answer.date.year"
                          @ionChange="answer.date.year = $event.target.value"
                        >
                          <ion-select-option
                            v-for="(year, index) in years"
                            :key="'year' + index"
                            :value="year"
                          >
                            {{ year }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-col>
                    <ion-col
                      size="4"
                      style="padding-top: 0; padding-bottom: 0;"
                    >
                      <ion-item lines="none">
                        <ion-label position="stacked">Month</ion-label>
                        <ion-select
                          :disabled.sync="!answer.date.year"
                          placeholder="Select"
                          :value="answer.date.month"
                          @ionChange="answer.date.month = $event.target.value"
                        >
                          <ion-select-option
                            v-for="(month, index) in months"
                            :key="'month' + index"
                            :value="month.value"
                          >
                            {{ month.name }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-col>
                    <ion-col
                      size="4"
                      style="padding-top: 0; padding-bottom: 0; padding-right: 0;"
                    >
                      <ion-item lines="none">
                        <ion-label position="stacked">Day</ion-label>
                        <ion-select
                          :disabled.sync="!answer.date.month"
                          placeholder="Select"
                          :value="answer.date.day"
                          @ionChange="answer.date.day = $event.target.value"
                        >
                          <ion-select-option
                            v-for="(day, index) in days"
                            :key="'day' + index"
                            :value="day"
                          >
                            {{ day }}
                          </ion-select-option>
                        </ion-select>
                      </ion-item>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </template>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row></ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="no-style toolbar-bg" v-if="hasAnswer">
      <ion-grid>
        <ion-row class="ion-align-items-center ion-justify-content-between">
          <ion-col size="auto">
            <privacy-button
              color="system"
              fill="clear"
              describer="this answer"
              :field="answer.privacy"
              @update:field="answer.privacy = $event"
            ></privacy-button>
          </ion-col>
          <ion-col size="auto">
            <ion-button
              class="bright-horizontal-gradient"
              :disabled="submitting || !canSubmit"
              shape="round"
              size="large"
              type="submit"
            >
              <ion-spinner v-show="submitting" slot="start"></ion-spinner>
              Answer
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import PrivacyButton from "@/components/privacy/button.vue";
import SpotifySearch from "@/components/spotify/search.vue";

import Songstory from "@/mixins/songstory.js";
import SpotifyFunctions from "@/mixins/spotify.js";

import Moment from "moment";
import { extendMoment } from "moment-range";

import find from "lodash/find";
import filter from "lodash/filter";
import forEach from "lodash/forEach";
import range from "lodash/range";
import toPlainObject from "lodash/toPlainObject";

const moment = extendMoment(Moment);

export default {
  privacyInterfaceOptions: {
    header: "Privacy"
  },
  props: {
    answerRef: {
      type: [Object, String]
    },
    columnAttrs: {
      type: Object,
      default: function() {
        return {
          size: 12
        };
      }
    },
    contentClass: {
      type: String,
      default: ""
    },
    contentStyle: {
      type: Object,
      default: function() {
        return {};
      }
    },
    formClass: {
      type: String,
      default: ""
    },
    formMode: {
      type: String,
      default: "white"
    },
    questionId: {
      type: String,
      default: "",
      required: true
    },
    questionColor: {
      type: String,
      default: ""
    },
    showNav: {
      type: Boolean,
      default: true
    },
    showText: {
      type: Boolean,
      default: true
    },
    wrapperClass: {
      type: String,
      default: ""
    },
    wrapperStyle: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },

  data() {
    return {
      answer: {},
      activeAnswer: null,
      answerId: null,
      clearingQuestion: false,
      destroySelected: false,
      question: {},
      submitting: false,
      showDate: false
    };
  },

  created() {
    // If error is dismissed, reset
    this.$on("errorCanceled", function() {
      this.fetchData();
    });

    // Error handler for submit
    this.$on("errorRetry", function() {
      this.submit();
    });
  },

  watch: {
    // Make sure there is no work around to set a future date
    "answer.date.year": {
      handler: function() {
        let month = find(this.months, { value: this.answer.date.month });
        if (!month) {
          this.answer.date.month = "";
        }
      }
    },

    answerRef: {
      handler: function(answerRef) {
        this.fetchAnswer(answerRef);
      },
      immediate: true
    },

    question: {
      handler: function(question) {
        if (Object.keys(question).length > 0) {
          // Handle question properties that may be ommitted
          if (!Object.prototype.hasOwnProperty.call(question, "acceptsDate")) {
            this.question.acceptsDate = false;
          }
          if (
            !Object.prototype.hasOwnProperty.call(question, "acceptsDateRange")
          ) {
            this.question.acceptsDateRange = false;
          }
          if (!Object.prototype.hasOwnProperty.call(question, "answerLimit")) {
            this.question.answerLimit = 1;
          }
          if (
            !Object.prototype.hasOwnProperty.call(
              question,
              "answerLimitRequired"
            )
          ) {
            this.question.answerLimitRequired = true;
          }
          if (!Object.prototype.hasOwnProperty.call(question, "required")) {
            this.question.required = false;
          }
          if (!Object.prototype.hasOwnProperty.call(question, "searchMode")) {
            this.question.searchMode = "search";
          }
          if (!Object.prototype.hasOwnProperty.call(question, "searchTypes")) {
            this.question.searchTypes = ["album", "artist", "track"];
          }

          // Populate selected
          if (this.hasSelected && this.selected.id !== question.id) {
            this.$store.commit("Songstory/select", question);
          }
        }
      },
      immediate: true,
      deep: true
    },

    questionId: {
      handler: function(questionId) {
        this.fetchQuestion(questionId);
      },
      immediate: true
    }
  },

  methods: {
    confirmClearQuestion() {
      return this.promptClearQuestion(this.question, this.answerId);
    },

    fetchData() {
      // TODO
    },

    async fetchAnswer(answerRef) {
      let vm = this;

      // Get answer
      if (typeof answerRef === "object") {
        vm.answer = answerRef;
        vm.anserId = answerRef.id;
      } else if (typeof answerRef === "string" && answerRef !== "add") {
        let existingAnswer = find(vm.answers, answer => answer.id == answerRef);
        if (typeof existingAnswer === "undefined") {
          vm.answer = existingAnswer;
          vm.answerId = existingAnswer.id;
        } else {
          await vm.$fireStore
            .collection("songstory_answers")
            .doc(answerRef)
            .get()
            .then(snapshot => {
              if (snapshot.exists) {
                vm.answer = Object.assign({}, snapshot.data(), {
                  id: snapshot.id,
                  path: snapshot.ref.path
                });
                vm.answerId = snapshot.id;
              }
            });
        }
      }

      // If no data found from answerRef, query database for any answer to the question
      if (answerRef !== "add" && Object.keys(vm.answer).length === 0) {
        await vm.$fireStore
          .collection("songstory_answers")
          .where("uid", "==", vm.user.uid)
          .where("question", "==", vm.doc)
          .get()
          .then(async snapshot => {
            // Handle answer
            if (!snapshot.empty) {
              let answer = snapshot.docs[0];
              vm.answer = Object.assign({}, answer.data(), {
                id: answer.id,
                path: answer.ref.path
              });
              vm.answerId = answer.id;
            }
          });
      }

      // Lastly, if new answer or no answer data, populate default answer
      if (answerRef === "add" || Object.keys(vm.answer).length === 0) {
        let answer = {
          text: "",
          date: {
            month: "",
            day: "",
            year: ""
          },
          data: [],
          privacy: 3,
          created: null,
          updated: null
        };
        if (
          vm.question.searchMode == "picker" ||
          vm.question.searchMode == "grid"
        ) {
          forEach(range(1, vm.question.answerLimit + 1), function() {
            answer.data.push({});
          });
        } else {
          answer.data.push({});
        }
        vm.answer = answer;
      }

      return new Promise(r => r(true));
    },

    async fetchQuestion(questionId) {
      let vm = this;

      // Get question
      let existingQuestion = find(
        vm.questions,
        question => question.id == questionId
      );

      if (typeof existingQuestion !== "undefined") {
        vm.question = existingQuestion;
      } else {
        await vm.$bind("question", vm.doc, {
          serialize: snapshot => {
            let data = Object.assign(snapshot.data(), {
              id: snapshot.id,
              path: snapshot.ref.path
            });
            return data;
          }
        });
      }

      if (!vm.question || Object.keys(vm.question).length == 0) {
        return vm.$error(
          "We were unable to load the question. It's probably just temporary, try again.",
          {
            buttons: [
              {
                text: "Retry",
                cssClass: "primary",
                handler: () => vm.fetchData()
              }
            ]
          }
        );
      }

      return new Promise(r => r(true));
    },

    submit() {
      let vm = this;

      let document = vm.answerId
        ? vm.$fireStore.collection("songstory_answers").doc(vm.answerId)
        : vm.$fireStore.collection("songstory_answers").doc();

      vm.submitting = true;

      // Convert answer to plain object
      let answer = toPlainObject(vm.answer);

      // Handle timestamps
      if (!answer.created) {
        answer.created = new Date();
      }
      answer.updated = new Date();

      // Handle data
      let data = [];
      forEach(answer.data, function(item) {
        if (Object.keys(item).length > 0) {
          data.push(
            Object.assign({}, vm.getSpotifyItemDataStorage(item), {
              timestamp: new Date()
            })
          );
        }
      });
      answer.data = data;

      // Set question ref
      answer.question = vm.doc;

      // Set uid
      answer.uid = vm.user.uid;

      // Remove id and path
      delete answer.id;
      delete answer.path;

      document
        .set(answer)
        .then(() => {
          vm.submitting = false;
          vm.answerId = document.id;
          vm.$emit("songstoryAnswer", {
            question: vm.question,
            answer: vm.answer,
            answerId: vm.answerId
          });
          vm.$toast("Answer saved!");
          vm.$store.dispatch("Songstory/getAnswers");
        })
        .catch(err => {
          vm.submitting = false;
          console.log(err.message, err);
          vm.$error(
            "We couldn't save your response. It's probably just temporary, try again."
          );
        });
    },

    updateAnswerData(value) {
      // Set answer data
      this.$set(this.answer.data, value.index, value.selected);
      // Handle question limit
      if (
        this.answer.data.length !== this.question.answerLimit &&
        this.question.answerLimitRequired
      ) {
        this.answer.data.push({});
      }
      // Unset active answer
      this.activeAnswer = null;
    }
  },

  computed: {
    canSubmit() {
      let vm = this;
      let dateCondition = false;
      let answerCondition = false;

      if (vm.hasAnswer) {
        // If dates are accepted, there must be atleast one date answer (day/month/year)
        if (vm.question.acceptsDate) {
          let dates = [];
          let keys = ["day", "month", "year"];
          keys.forEach(function(key) {
            if (vm.answer.date[key]) {
              dates.push(vm.answer.date[key]);
            }
          });
          dateCondition = dates.length > 0;
        } else {
          dateCondition = true;
        }

        // If question.answerLimitRequired, the answer data length must match question.answerLimit
        if (vm.question.answerLimitRequired) {
          answerCondition =
            filter(vm.answer.data, answer => Object.keys(answer).length > 0)
              .length === vm.question.answerLimit;
        } else {
          answerCondition =
            filter(vm.answer.data, answer => Object.keys(answer).length > 0)
              .length > 0;
        }
      }

      return dateCondition && answerCondition;
    },

    hasAnswer() {
      return this.answer ? Object.keys(this.answer).length > 0 : false;
    },

    doc() {
      return this.$fireStore
        .collection("songstory_questions")
        .doc(this.questionId);
    },

    months() {
      if (this.hasAnswer && this.answer.date.year) {
        let start = new moment(this.answer.date.year, "YYYY").startOf("year");
        let end =
          moment().year() === start.year()
            ? new moment()
            : start.clone().endOf("year");
        let range = new moment().range(start, end);

        let months = Array.from(range.by("month", { step: 1 }));

        return months.map(m => {
          return {
            value: m.format("MM"),
            name: m.format("MMMM")
          };
        });
      } else {
        return [];
      }
    },

    days() {
      if (this.hasAnswer && this.answer.date.month && this.answer.date.year) {
        let year = new moment(this.answer.date.year, "YYYY").startOf("year");
        let start = new moment(
          year.format("YYYY") + this.answer.date.month,
          "YYYYMM"
        ).startOf("month");
        let end = start.clone().endOf("month");
        let range = new moment().range(start, end);

        let days = Array.from(range.by("day", { step: 1 }));

        return days.map(d => d.format("DD"));
      } else {
        return [];
      }
    },

    years() {
      let birthDate = new moment(this.userData.profile.birthdate);
      let start = new moment(birthDate.format("YYYY"), "YYYY");
      let end = new moment();
      let range = new moment().range(start, end);

      let years = Array.from(range.reverseBy("year", { step: 1 }));

      return years.map(y => y.format("YYYY"));
    },

    chosenDate() {
      if (this.hasAnswer) {
        if (!this.answer.date.year) {
          return "Choose Date";
        } else {
          let date = new moment();
          let strings = [];

          // Set year first, or you'll end up with conflicts for leap years
          date.year(this.answer.date.year);

          // Check and set month
          if (this.answer.date.month) {
            date.month(parseInt(this.answer.date.month) - 1);
            strings.push("MMM");
          }

          // Check and set day
          if (this.answer.date.day) {
            date.date(parseInt(this.answer.date.day));
            strings.push("D,");
          }

          // Push year string lastly
          strings.push("YYYY");

          return date.format(strings.join(" "));
        }
      } else {
        return "";
      }
    },

    contentCssClass() {
      let strings = ["ion-text-center"];
      if (this.contentClass) {
        strings.push(this.contentClass);
      }
      return strings.join(" ");
    },

    formCssClass() {
      let strings = ["form"];
      if (this.formClass) {
        strings.push(this.formClass);
      }
      if (this.formMode) {
        strings.push(this.formMode);
      }
      return strings.join(" ");
    },

    placeholderValue() {
      if (Object.keys(this.question).length > 0) {
        let strings = [];
        let qualifier = this.question.searchTypes.length > 1 ? "an" : "a";

        this.question.searchTypes.forEach(function(type) {
          strings.push(type);
        });

        if (this.question.searchTypes.length > 1) {
          let lastIndex = this.question.searchTypes.length - 1;
          strings[lastIndex] = "or " + strings[lastIndex];
        }

        return "Pick " + qualifier + " " + strings.join(", ");
      } else {
        return "";
      }
    },

    showAddMoreButton() {
      return (
        this.hasAnswer &&
        this.question.searchMode === "search" &&
        !this.question.answerLimitRequired &&
        this.question.answerLimit !== 1 &&
        this.answer.data.length >= 1 &&
        (Object.keys(this.answer.data[this.answer.data.length - 1]).length >
          0 ||
          this.answer.data.length > 1) &&
        this.answer.data.length !== this.question.answerLimit
      );
    },

    hasIcon() {
      return (
        Object.prototype.hasOwnProperty.call(this.question, "category") &&
        Object.prototype.hasOwnProperty.call(
          this.question.category,
          "parent"
        ) &&
        Object.prototype.hasOwnProperty.call(
          this.question.category.parent,
          "id"
        )
      );
    }
  },

  components: {
    PrivacyButton,
    SpotifySearch
  },

  mixins: [Songstory, SpotifyFunctions]
};
</script>
<style lang="scss" scoped>
ion-content {
  --background: transparent;
}
.middle-col {
  --padding: calc(var(--ion-padding, 16px) / 2);
  --padding-end: var(--padding);
  --padding-start: var(--padding);
  padding-left: unset;
  padding-right: unset;
  padding-inline-end: var(--padding);
  padding-inline-start: var(--padding);
  -webkit-padding-start: var(--padding);
  -webkit-padding-end: var(--padding);
}
</style>
