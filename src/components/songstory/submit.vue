<template>
  <form
    class="ion-page"
    id="songstory-submit-wrapper"
    :class="wrapperClass"
    :style="wrapperStyle"
    @submit.prevent="submit"
  >
    <ion-header class="no-style" v-if="showNav">
      <ion-toolbar color="transparent">
        <ion-title :color="questionColor">Submit Idea</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :color="questionColor"
            @click.prevent="$emit('songstoryBack')"
          >
            <icon slot="icon-only" name="close"></icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :class="contentCssClass" :style="contentStyle" fullscreen>
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center">
          <ion-col v-bind="columnAttrs">
            <ion-list class="question-text ion-margin-top" lines="none">
              <ion-item lines="none" :disabled="submitting">
                <ion-textarea
                  auto-grow
                  autofocus
                  :color="questionColor"
                  minlength="25"
                  maxlength="140"
                  placeholder="Type your question idea here..."
                  spellcheck
                  :value="question.question"
                  ref="questionInput"
                  @ionBlur="formatQuestion"
                  @ionChange="question.question = $event.target.value"
                  @ionFocus="questionFocused = true"
                ></ion-textarea>
              </ion-item>
              <ion-item
                v-show="question.question.length > 0 && questionFocused"
              >
                <div class="ion-text-right" style="width: 100%;">
                  <ion-text :color="questionLengthIndicatorColor">
                    <small>{{ question.question.length }} / 140</small>
                  </ion-text>
                </div>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center">
          <ion-col v-bind="columnAttrs">
            <ion-list :class="formCssClass" lines="none">
              <ion-item :disabled="submitting">
                <ion-label>Category</ion-label>
                <ion-select
                  :value="rootCategory"
                  @ionChange="rootCategory = $event.target.value"
                >
                  <ion-select-option
                    v-for="(category, index) in getSubCategories(null)"
                    :key="'rootCategory' + index"
                    :value="category.id"
                    >{{ category.name }}</ion-select-option
                  >
                </ion-select>
              </ion-item>
              <ion-item :disabled="submitting">
                <ion-label>Sub Category</ion-label>
                <ion-select
                  placeholder="Select"
                  :value="question.category"
                  @ionChange="question.category = $event.target.value"
                >
                  <ion-select-option
                    v-for="(category, index) in getSubCategories(
                      selectedRoot.path
                    )"
                    :key="'subCategory' + index"
                    :value="category.id"
                    >{{ category.name }}</ion-select-option
                  >
                </ion-select>
              </ion-item>
              <ion-item class="item-join-next" :disabled="submitting">
                <ion-label>Entry Types</ion-label>
              </ion-item>
              <ion-item :disabled="submitting">
                <div style="width: 100%;">
                  <ion-grid class="ion-no-padding ion-margin-vertical">
                    <ion-row
                      class="ion-align-items-center ion-justify-content-center"
                    >
                      <ion-col
                        v-for="(entryType, index) in submitConfig.entryTypes"
                        :key="`entryTypes${index}`"
                        size="3"
                      >
                        <label>
                          <aspect-ratio
                            class="ion-align-items-center ion-justify-content-center entry-type"
                            :class="`entry-type-${entryType}`"
                            :data-type="entryType"
                            ref="entryType"
                          >
                            <div class="ion-text-center ion-text-capitalize">
                              {{ entryType }}
                            </div>
                          </aspect-ratio>
                          <input
                            type="checkbox"
                            class="ion-hide"
                            :value="entryType"
                            v-model="question.searchTypes"
                          />
                        </label>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </div>
              </ion-item>
              <ion-item class="max-entries" :disabled="submitting">
                <ion-label>Max Entries</ion-label>
                <div slot="end" v-show="question.answerLimit !== 1">
                  <small>Exactly</small>
                </div>
                <ion-toggle
                  :checked.sync="question.answerLimitRequired"
                  color="system"
                  slot="end"
                  v-show="question.answerLimit !== 1"
                  @ionChange="
                    question.answerLimitRequired = $event.target.checked
                  "
                >
                </ion-toggle>
                <ion-select
                  placeholder="Select"
                  slot="end"
                  :value="question.answerLimit"
                  @ionChange="
                    question.answerLimit = parseInt($event.target.value)
                  "
                >
                  <ion-select-option
                    v-for="(limit, index) in maxEntries"
                    :key="'maxEntries' + index"
                    :value="limit"
                    >{{ limit }}</ion-select-option
                  >
                </ion-select>
              </ion-item>
              <template v-if="submitConfig.multipleAnswers">
                <ion-item class="item-join-next" :disabled="submitting">
                  <ion-label>Can be answered</ion-label>
                </ion-item>
                <ion-item class="segment-item" :disabled="submitting">
                  <ion-segment
                    :value="question.multipleAnswers"
                    @ionChange.prevent="
                      question.multipleAnswers = parseInt($event.target.value)
                    "
                  >
                    <ion-segment-button :value="0" layout="icon-top">
                      <icon
                        name="radio-button-on"
                        v-show="!question.multipleAnswers"
                      ></icon>
                      <icon
                        name="radio-button-off"
                        v-show="question.multipleAnswers"
                      ></icon>
                      <ion-label class="ion-text-capitalize">
                        Once
                      </ion-label>
                    </ion-segment-button>
                    <ion-segment-button :value="1" layout="icon-top">
                      <icon
                        name="radio-button-on"
                        v-show="question.multipleAnswers"
                      ></icon>
                      <icon
                        name="radio-button-off"
                        v-show="!question.multipleAnswers"
                      ></icon>
                      <ion-label class="ion-text-capitalize">
                        Multiple
                      </ion-label>
                    </ion-segment-button>
                  </ion-segment>
                </ion-item>
              </template>
              <ion-item class="no-style" :disabled="submitting" lines="none">
                <ion-checkbox
                  :checked="question.creditUser"
                  color="system"
                  slot="start"
                  @ionChange="question.creditUser = $event.detail.checked"
                ></ion-checkbox>
                <ion-label>Credit me</ion-label>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row></ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="no-style toolbar-bg">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col v-bind="columnAttrs">
            <ion-button
              color="primary"
              :disabled="submitting || !canSubmit"
              expand="block"
              shape="round"
              size="large"
              type="submit"
            >
              <ion-spinner v-show="submitting" slot="start"></ion-spinner>
              Submit
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import capitalize from "lodash/capitalize";
import merge from "lodash/merge";
import range from "lodash/range";

import Songstory from "@/mixins/songstory.js";
import SpotifyFunctions from "@/mixins/spotify.js";

export default {
  props: {
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
    defaultCategory: {
      type: String,
      default: "nowplaying"
    },
    formClass: {
      type: String,
      default: ""
    },
    formMode: {
      type: String,
      default: "white"
    },
    questionColor: {
      type: String,
      default: ""
    },
    showNav: {
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
      question: {
        answerLimit: 1,
        answerLimitRequired: false,
        category: "",
        creditUser: true,
        multipleAnswers: 0,
        searchTypes: [],
        question: ""
      },
      questionFocused: false,
      rootCategory: "nowplaying",
      submitting: false
    };
  },

  created() {
    let vm = this;
    vm.$on("displayCheck", function() {
      vm.$refs.questionInput.getInputElement().then(e => {
        e.style.setProperty("height", "auto");
        e.style.setProperty("overflow", "hidden");
      });
    });
  },

  watch: {
    defaultCategory: {
      handler: function(category) {
        this.rootCategory = category;
      },
      immediate: true
    },
    rootCategory: {
      handler: function() {
        this.question.category = "";
      }
    },
    question: {
      handler: function(question) {
        let vm = this;
        // Toggle entry type classes
        vm.$refs.entryType.forEach(function(entryType) {
          entryType.$el.classList.toggle(
            "entry-active",
            question.searchTypes.indexOf(entryType.$el.dataset.type) !== -1
          );
        });
      },
      deep: true
    }
  },

  methods: {
    formatQuestion() {
      this.questionFocused = false;
      if (this.question.question.length > 0) {
        // Convert to title case
        let question = capitalize(this.question.question);

        // Remove periods
        question = question.replace(/\./g, "");

        // Add question mark if needed
        if (question.slice(-1) !== "?") {
          question = question + "?";
        }

        // Set formatted string
        this.question.question = question;
      }
    },

    submit() {
      let vm = this;
      let submitQuestion = vm.$fireFunc.httpsCallable(
        "songstory-questions-submit"
      );

      vm.submitting = true;

      return submitQuestion(vm.question)
        .then(() => {
          vm.$emit("songstorySubmit");
          vm.$toast("Successfully submitted question!");
        })
        .catch(() => {
          return vm.$error(
            "We couldn't submit your question. This is probably just temporary, try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.submit()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.submitting = false;
        });
    }
  },

  computed: {
    canSubmit() {
      return (
        this.question.question !== "" &&
        this.question.category !== "" &&
        this.question.searchTypes.length > 0
      );
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

    maxEntries() {
      return range(1, this.submitConfig.maxEntries + 1);
    },

    selectedRoot() {
      return this.getCategoryById(this.rootCategory);
    },

    submitConfig() {
      let config = {
        acceptsDate: true,
        entryTypes: ["genre", "album", "artist", "track"],
        maxEntries: 10,
        multipleAnswers: false
      };
      if (this.selectedRoot.submitConfig) {
        config = merge(config, this.selectedRoot.submitConfig);
      }
      if (this.question.category) {
        let category = this.getCategoryById(this.question.category);
        if (category.submitConfig) {
          config = merge(config, category.submitConfig);
        }
      }
      return config;
    },

    questionLengthIndicatorColor() {
      let color = "";
      if (this.question.question.length < 25) {
        color = "warning";
      }
      if (this.question.question.length > 140) {
        color = "danger";
      }
      return color;
    }
  },

  mixins: [Songstory, SpotifyFunctions]
};
</script>
<style lang="scss" scoped>
ion-content {
  --background: transparent;
}
.cat-toggle {
  max-width: 70%;
  position: relative;
  ion-button {
    --background: rgba(255, 255, 255, 0.3);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
.entry-type {
  background: rgba(255, 255, 255, 0.3);
  border: 1px soild transparent;
  color: #fff;
  &.entry-type-genre {
    border-radius: 4px;
    &.entry-active {
      background: #ff26a8;
    }
  }
  &.entry-type-album {
    border-radius: 8px;
    &.entry-active {
      background: #7d35f3;
    }
  }
  &.entry-type-artist {
    border-radius: 16px;
    &.entry-active {
      background: #28caed;
    }
  }
  &.entry-type-track {
    border-radius: 50%;
    &.entry-active {
      background: #f2c94c;
    }
  }
  &.entry-active {
    border-color: #fff;
    box-shadow: 0px 0px 8px rgba(255, 255, 255, 0.5);
  }
}
ion-item.max-entries {
  [slot="end"] {
    margin-inline-start: 8px;
  }
  ion-toggle {
    padding-inline-start: 8px;
  }
}
ion-list.question-text {
  --ion-item-background: transparent;
  --ion-item-color: #ffffff;
  ion-textarea {
    font-size: 26px;
    text-align: center;
    overflow: hidden;
  }
  ion-item:not(.item-has-value) {
    ion-label {
      text-align: center;
      font-size: 26px;
    }
  }
  ion-item.item-has-value {
    ion-label {
      display: none;
    }
  }
}
</style>
