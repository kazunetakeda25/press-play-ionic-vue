<template>
  <div
    class="ion-page"
    id="songstory-question-wrapper"
    :class="wrapperClass"
    :style="wrapperStyle"
  >
    <ion-header class="no-style browse-header" ref="header" v-if="showNav">
      <ion-toolbar color="transparent" ref="toolbar">
        <ion-buttons slot="start">
          <ion-button @click.prevent="$emit('songstoryBack')">
            <icon
              :color="questionColor"
              name="arrow-back"
              ref="backButtonIcon"
              slot="icon-only"
            ></icon>
          </ion-button>
        </ion-buttons>
        <div class="toolbar-avatar" slot="start">
          <avatar-songmate
            :browse-ref="browse"
            :images="browse.profile.avatars"
            size="sm"
          ></avatar-songmate>
        </div>
        <ion-title :color="questionColor" ref="title">
          {{ browseDisplayName }}
        </ion-title>
        <div slot="end" v-if="updatingSongmate || userBlockAdding">
          <ion-spinner :color="questionColor"></ion-spinner>
        </div>
        <ion-buttons slot="end">
          <ion-button @click.prevent="openOptionsPopover($event, menuOptions)">
            <icon
              :color="questionColor"
              name="ellipsis-vertical"
              ref="optionsButtonIcon"
              slot="icon-only"
            ></icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content
      :class="contentCssClass"
      fullscreen
      scroll-events
      :style="contentStyle"
      @ionScroll="handleScroll"
    >
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
                <h1 class="h3">{{ question.question }}</h1>
              </ion-text>
            </div>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center">
          <ion-col v-bind="columnAttrs">
            <template v-if="showCard">
              <ion-card color="light">
                <aspect-ratio
                  class="card-image"
                  ratio="3:2"
                  :style="{
                    'background-image': `url(${getSpotifyItemImage(
                      answer.data[0]
                    )}
                  )`
                  }"
                ></aspect-ratio>
                <ion-card-header>
                  <ion-card-title>
                    {{ answer.data[0].name }}
                  </ion-card-title>
                  <ion-card-subtitle v-if="answer.data[0].artists">
                    {{ answer.data[0].artists[0].name }}
                  </ion-card-subtitle>
                </ion-card-header>
              </ion-card>
            </template>
            <ion-list :class="formCssClass">
              <ion-item-divider></ion-item-divider>
              <template v-if="answer.text">
                <ion-item class="no-style item-join-next">
                  <ion-label> {{ browse.profile.firstname }} says: </ion-label>
                </ion-item>
                <ion-item class="no-style item-join-next">
                  <ion-label class="ion-text-wrap">
                    {{ answer.text }}
                  </ion-label>
                </ion-item>
                <ion-item
                  class="ion-text-right no-style"
                  v-if="question.acceptsDate"
                >
                  <ion-label>
                    <small>
                      {{ answerDate }}
                    </small>
                  </ion-label>
                </ion-item>
              </template>
              <template v-if="!showCard">
                <template v-if="!answer.text">
                  <ion-item class="no-style">
                    <ion-label>
                      {{ browse.profile.firstname }} answered:
                    </ion-label>
                  </ion-item>
                </template>
                <spotify-item
                  v-for="(item, d) in answer.data"
                  :key="`dItem${d}`"
                  :item="item"
                  :selectable="false"
                ></spotify-item>
              </template>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row></ion-row>
      </ion-grid>
    </ion-content>
  </div>
</template>
<script>
import moment from "moment";
import find from "lodash/find";

import AvatarSongmate from "@/components/avatar/songmate.vue";
import SpotifyItem from "@/components/spotify/search-item.vue";

import BrowseMixin from "@/mixins/browse.js";
import OptionsMenuMixin from "@/mixins/options-menu.js";
import Songstory from "@/mixins/songstory.js";
import SpotifyFunctions from "@/mixins/spotify.js";

export default {
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
    uid: {
      type: String,
      required: true
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
      answer: {
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
      },
      destroySelected: false,
      error: false,
      loading: false,
      scrollTop: 0,
      question: {}
    };
  },

  created() {
    this.fetchData();
  },

  methods: {
    async fetchAnswer(answerRef) {
      let vm = this;

      // Get answer
      if (typeof answerRef === "object") {
        vm.answer = answerRef;
        vm.anserId = answerRef.id;
      } else if (typeof answerRef === "string") {
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
              }
            });
        }
      }

      return new Promise(r => r(true));
    },

    fetchData() {
      let vm = this;

      vm.loading = true;
      vm.error = false;

      let requests = [
        vm.getUserBrowse({ uid: vm.uid }),
        vm.fetchAnswer(vm.answerRef),
        vm.fetchQuestion(vm.questionId)
      ];

      return Promise.all(requests)
        .then(res => {
          vm.songstory = res[1].answers;
        })
        .catch(err => {
          console.error(err.message, err);
          vm.error = true;
          return vm.$error(
            "We were unable to load this profile. It's probably just temporary, try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary",
                  handler: () => vm.$emit("songstoryBack")
                },
                {
                  text: "Try Again",
                  cssClass: "primary",
                  handler: () => vm.fetchData()
                }
              ]
            }
          );
        })
        .finally(() => {
          vm.loading = false;
        });
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

      if (Object.keys(vm.question).length == 0) {
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

    handleScroll(event) {
      this.scrollTop = event.detail.scrollTop;
      if (this.showNav) {
        let scrollTopThreshold =
          event.detail.scrollTop < this.$refs.toolbar.offsetHeight;
        this.$refs.header.classList.toggle("no-style", scrollTopThreshold);
        this.$refs.toolbar.classList.toggle("ion-color", scrollTopThreshold);
        this.$refs.toolbar.classList.toggle(
          "ion-color-transparent",
          scrollTopThreshold
        );
        this.$refs.title.classList.toggle("ion-color", scrollTopThreshold);
        this.$refs.title.classList.toggle(
          "ion-color-light",
          scrollTopThreshold
        );
        this.$refs.backButtonIcon.$el.classList.toggle(
          "ion-color",
          scrollTopThreshold
        );
        this.$refs.backButtonIcon.$el.classList.toggle(
          "ion-color-light",
          scrollTopThreshold
        );
        this.$refs.optionsButtonIcon.$el.classList.toggle(
          "ion-color",
          scrollTopThreshold
        );
        this.$refs.optionsButtonIcon.$el.classList.toggle(
          "ion-color-light",
          scrollTopThreshold
        );
      }
    }
  },

  computed: {
    answerDate() {
      let date = new moment();
      let dateObj = {};
      let dateFormat = [];

      if (this.answer.date.month) {
        dateObj.month = this.answer.date.month;
        dateFormat.push("MMM");
        if (this.answer.date.day) {
          dateObj.date = this.answer.date.day;
          dateFormat.push("D,");
        }
      }
      if (this.answer.date.year) {
        dateObj.year = this.answer.date.year;
        dateFormat.push("YYYY");
      }

      date.set(dateObj);

      let format = dateFormat.join(" ");
      let formatted = date.format(format);

      return !this.answer.date.month ? `Sometime in ${formatted}` : formatted;
    },

    doc() {
      return this.$fireStore
        .collection("songstory_questions")
        .doc(this.questionId);
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
    },

    menuOptions() {
      let options = [];

      this.optionsMenuSongmate.forEach(function(option) {
        options.push(option);
      });

      this.optionsMenuDefault.forEach(function(option) {
        options.push(option);
      });

      return options;
    },

    showCard() {
      return (
        this.answer.data.length === 1 && this.answer.data[0].type !== "genre"
      );
    }
  },

  components: {
    AvatarSongmate,
    SpotifyItem
  },

  mixins: [BrowseMixin, OptionsMenuMixin, Songstory, SpotifyFunctions]
};
</script>
<style lang="scss" scoped>
.card-image {
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;
}
ion-content {
  --background: transparent;
}
ion-item-divider {
  min-height: 3px;
}
</style>
