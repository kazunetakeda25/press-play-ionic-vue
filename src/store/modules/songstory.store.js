import Vue from "vue";
import { firestoreAction } from "vuexfire";

const initialState = () => ({
  answers: [],
  categories: [],
  questions: [],
  selected: {}
});

const state = initialState();

const getters = {
  answers: state => state.answers,
  categories: state => state.categories,
  questions: state => state.questions,
  selected: state => state.selected
};

const actions = {
  getAnswers: firestoreAction(
    ({ bindFirestoreRef, rootState, unbindFirestoreRef }) => {
      if (rootState.User.userLoaded) {
        return bindFirestoreRef(
          "answers",
          Vue.prototype.$fireStore
            .collection("songstory_answers")
            .where("uid", "==", rootState.User.user.uid),
          {
            serialize: snapshot => {
              let data = Object.assign(snapshot.data(), {
                id: snapshot.id,
                path: snapshot.ref.path
              });
              return data;
            }
          }
        );
      } else {
        return unbindFirestoreRef("answers");
      }
    }
  ),
  getCategories: firestoreAction(({ bindFirestoreRef }) => {
    return bindFirestoreRef(
      "categories",
      Vue.prototype.$fireStore
        .collection("songstory_categories")
        .where("published", "==", true),
      {
        serialize: snapshot => {
          let data = Object.assign(snapshot.data(), {
            id: snapshot.id,
            path: snapshot.ref.path
          });
          return data;
        }
      }
    );
  }),
  getQuestions: firestoreAction(({ bindFirestoreRef }) => {
    return bindFirestoreRef(
      "questions",
      Vue.prototype.$fireStore
        .collection("songstory_questions")
        .where("published", "==", true),
      {
        serialize: snapshot => {
          let data = Object.assign(snapshot.data(), {
            id: snapshot.id,
            path: snapshot.ref.path
          });
          return data;
        }
      }
    );
  }),
  async loadAll({ dispatch, state }) {
    if (state.categories.length == 0) {
      await dispatch("getCategories");
    }
    if (state.questions.length == 0) {
      await dispatch("getQuestions");
    }
    if (state.answers.length == 0) {
      await dispatch("getAnswers");
    }
    return new Promise(r => {
      return r({
        categories: state.categories,
        questions: state.questions,
        answers: state.answers
      });
    });
  }
};

const mutations = {
  select(state, selected) {
    state.selected = selected;
  },
  RESET(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key];
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
