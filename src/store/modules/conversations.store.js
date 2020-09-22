import Vue from "vue";
import { firestoreAction } from "vuexfire";

import find from "lodash/find";
import isEqual from "lodash/isEqual";
import toPlainObject from "lodash/toPlainObject";
import union from "lodash/union";

const initialState = () => ({
  active: {},
  archived: [],
  listView: {
    filter: "inbox",
    order: "desc"
  },
  user1: [],
  user2: []
});

const state = initialState();

const getters = {
  active: state => state.active,
  archived: state => state.archived,
  listView: state => state.listView,
  conversations: state => union(state.user1, state.user2),
  user1: state => state.user1,
  user2: state => state.user2
};

const actions = {
  getConversations: firestoreAction(
    ({ bindFirestoreRef, rootState, unbindFirestoreRef }) => {
      if (rootState.User.userLoaded) {
        bindFirestoreRef(
          "user1",
          Vue.prototype.$fireStore
            .collection("conversations")
            .where("user1", "==", rootState.User.user.uid),
          {
            wait: true,
            serialize: snapshot => {
              let data = Object.assign(snapshot.data(), {
                id: snapshot.id,
                path: snapshot.ref.path
              });
              return data;
            }
          }
        );
        bindFirestoreRef(
          "user2",
          Vue.prototype.$fireStore
            .collection("conversations")
            .where("user2", "==", rootState.User.user.uid),
          {
            wait: true,
            serialize: snapshot => {
              let data = Object.assign(snapshot.data(), {
                id: snapshot.id,
                path: snapshot.ref.path
              });
              return data;
            }
          }
        );
        bindFirestoreRef(
          "archived",
          Vue.prototype.$fireStore
            .collection("users")
            .doc(rootState.User.user.uid)
            .collection("archived_conversations"),
          {
            wait: true,
            serialize: snapshot => {
              let data = Object.assign(snapshot.data(), {
                id: snapshot.id,
                path: snapshot.ref.path
              });
              return data;
            }
          }
        );
        return Promise.resolve();
      } else {
        unbindFirestoreRef("user1");
        unbindFirestoreRef("user2");
        unbindFirestoreRef("archived");
        return Promise.resolve();
      }
    }
  ),
  getConversationByUid({ rootState, getters }, payload) {
    return new Promise((resolve, reject) => {
      // Validate payload
      if (!Object.prototype.hasOwnProperty.call(payload, "uid")) {
        reject("No uid supplied");
      }
      // Get userPairs
      let userPairs = [
        `${rootState.User.user.uid}:${payload.uid}`,
        `${payload.uid}:${rootState.User.user.uid}`
      ];
      let conversation = find(
        getters.conversations,
        o => userPairs.indexOf(o.userPair) !== -1
      );
      if (typeof conversation !== "undefined") {
        resolve(conversation);
      } else {
        resolve({
          id: null,
          accepted: true,
          enabled: true
        });
      }
    });
  }
};

const mutations = {
  active(state, conversation) {
    if (
      conversation !== null &&
      isEqual(toPlainObject(state.active), toPlainObject(conversation)) == false
    ) {
      state.active = conversation;
    }
  },
  listView(state, listView) {
    state.listView = listView;
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
