import Vue from "vue";
import { firestoreAction } from "vuexfire";
import * as firebase from "firebase/app";

const initialState = () => ({
  subscriptions: [],
  current_subscription: {}
});

const state = initialState();

const getters = {
  subscriptions: state => state.subscriptions,
  current_subscription: state => state.current_subscription
};

const actions = {
  getSubscription: firestoreAction(
    ({ bindFirestoreRef, rootState, unbindFirestoreRef }) => {
      if (rootState.User.userLoaded) {
        return bindFirestoreRef(
          "subscriptions",
          Vue.prototype.$fireStore
            .collection("subscriptions")
            .doc(rootState.User.user.uid),
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
        return unbindFirestoreRef("subscriptions");
      }
    }
  ),
  saveSubscription: firestoreAction(({ rootState }, payload) => {
    if (rootState.User.userLoaded) {
      const subscriptionRef = Vue.prototype.$fireStore
        .collection("subscriptions")
        .doc(rootState.User.user.uid);
      subscriptionRef.get().then(snapShot => {
        if (snapShot.exists) {
          return subscriptionRef
            .update(
              "subscriptions",
              firebase.firestore.FieldValue.arrayUnion(payload)
            )
            .then(() => {
              console.log("subscription saved!");
            });
        } else {
          return subscriptionRef.set({ subscriptions: [payload] }).then(() => {
            console.log("subscription saved!");
          });
        }
      });
    } else {
      return false;
    }
  }),
  saveCardDetails: firestoreAction(({ rootState }, payload) => {
    if (rootState.User.userLoaded) {
      const subscriptionRef = Vue.prototype.$fireStore
        .collection("subscriptions")
        .doc(rootState.User.user.uid);
        return subscriptionRef.update("card", payload).then(() => {
          console.log("card info updated!");
        });
    } else {
      return false;
    }
  }),
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
