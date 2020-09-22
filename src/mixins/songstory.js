import { mapGetters } from "vuex";

import filter from "lodash/filter";
import find from "lodash/find";
import forEach from "lodash/forEach";
import sortBy from "lodash/sortBy";
import toPlainObject from "lodash/toPlainObject";

export default {
  data() {
    return {
      clearingQuestion: false,
      destroySelected: false
    };
  },

  beforeDestroy() {
    if (this.destroySelected) {
      this.$store.commit("Songstory/select", {});
    }
  },

  methods: {
    getCategoryQuestions(category) {
      return filter(
        this.questionData,
        question => question.category.path == category.path
      );
    },

    getCategoryById(id) {
      return find(this.categories, { id });
    },

    getSubCategories(parentPath) {
      return filter(this.categoryData, category => {
        if (parentPath == null) {
          return category.parent == null;
        } else if (category.parent) {
          return category.parent.path == parentPath;
        } else {
          return false;
        }
      });
    },

    getQuestionAnswers(question) {
      let vm = this;
      let answers = vm.browseAnswers ? vm.browseAnswers : vm.answers;
      return filter(answers, answer => {
        if (answer && answer.question) {
          let answerPath = vm.browseAnswers
            ? answer.question
            : answer.question.path;
          return answerPath == question.path;
        }
        return undefined;
      });
    },

    promptClearQuestion(question, answerId) {
      let vm = this;
      return vm.$error(
        "This will remove the question from your SongStory and delete any answers.",
        {
          header: "Confirm Clear",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "secondary"
            },
            {
              text: "Confirm",
              cssClass: "danger",
              handler: function () {
                vm.clearQuestion(question, answerId);
              }
            }
          ]
        }
      );
    },

    clearQuestion(question, answerId) {
      let vm = this;
      let requests = [];

      // Get current cleared questions
      let clearedQuestions = [];
      forEach(this.userData.settings.clearedQuestions, function (question) {
        clearedQuestions.push(
          vm.$fireStore.collection("songstory_questions").doc(question.id)
        );
      });

      // Add passed question
      let questionExists = find(
        clearedQuestions,
        cleared => cleared.id == question.id
      );
      if (typeof questionExists === "undefined") {
        clearedQuestions.push(
          vm.$fireStore.collection("songstory_questions").doc(question.id)
        );
      }

      // Build settings object from current settings and new cleared questions
      let settings = Object.assign({}, vm.userData.settings, {
        clearedQuestions: clearedQuestions
      });

      // Save to user settings
      requests.push(
        vm.$fireStore
          .collection("users")
          .doc(vm.user.uid)
          .update({
            settings: settings
          })
      );

      // If answerId, delete the answer
      if (answerId) {
        requests.push(
          vm.$fireStore
            .collection("songstory_answers")
            .doc(answerId)
            .delete()
        );
      }

      vm.clearingQuestion = true;

      return Promise.all(requests)
        .then(() => {
          vm.$toast("Question cleared!");
          vm.clearingQuestion = false;
          vm.$emit("songstoryClear", true);
        })
        .catch(() => {
          vm.clearingQuestion = false;
          vm.$error(
            "We couldn't clear the question. It's probably just temporary, try again.",
            {
              buttons: [
                {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "secondary"
                },
                {
                  text: "Retry",
                  cssClass: "primary",
                  handler: () => vm.clearQuestion(question, answerId)
                }
              ]
            }
          );
        });
    }
  },

  computed: {
    ...mapGetters({
      answers: "Songstory/answers",
      categories: "Songstory/categories",
      questions: "Songstory/questions",
      selected: "Songstory/selected",
      user: "User/user",
      userData: "User/userData"
    }),

    categoryData() {
      return sortBy(this.categories, "priority");
    },

    hasSelected() {
      return Object.keys(this.selected).length > 0;
    },

    questionData() {
      let vm = this;
      let questions = sortBy(vm.questions, "priority");
      let clearedQuestions = vm.userData.settings.clearedQuestions.map(
        question => question.id
      );
      return filter(
        questions,
        question => clearedQuestions.indexOf(question.id) === -1
      );
    },

    treeData() {
      let vm = this;
      let categories = [];

      filter(vm.categoryData, category => category.parent == null).forEach(
        function (category) {
          let answerCount = 0;
          let answers = [];
          let children = [];
          let questionCount = 0;

          vm.getSubCategories(category.path).forEach(function (child, c) {
            // Push sub category
            children.push(
              Object.assign({}, toPlainObject(child), {
                answerCount: 0,
                questionCount: 0,
                questions: []
              })
            );
            // Get questions
            vm.getCategoryQuestions(child).forEach(function (question, q) {
              // Update questionCounts
              questionCount++;
              children[c].questionCount++;
              // Push question
              children[c].questions.push(
                Object.assign({}, toPlainObject(question), { answers: [] })
              );
              // Get question answers
              vm.getQuestionAnswers(question).forEach(function (answer) {
                // Push answerCounts
                children[c].answerCount++;
                answerCount++;
                // Push answers
                children[c].questions[q].answers.push(toPlainObject(answer));
                answers.push(toPlainObject(answer));
              });
            });
          });

          // Push to root categories
          categories.push(
            Object.assign(
              {},
              {
                answerCount: answerCount,
                answers: answers,
                children: children,
                id: category.id,
                isComplete: answerCount >= questionCount,
                questionCount: questionCount
              },
              category
            )
          );
        }
      );

      return categories;
    }
  }
};
