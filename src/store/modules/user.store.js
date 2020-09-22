import Vue from "vue";
import { firestoreAction } from "vuexfire";

import defaultsDeep from "lodash/defaultsDeep";

const initialState = () => ({
  blockedUsers: [],
  songmates: [],
  songmatesDisliked: [],
  user: null,
  userData: {},
  userDataDefault: {
    profile: {
      avatars: {
        original: "",
        xl: "",
        lg: "",
        md: "",
        sm: "",
        xs: ""
      },
      firstname: "",
      lastname: "",
      birthdate: "",
      bio: "",
      gender: {
        identity: "",
        expression: "",
        orientation: "",
        pronoun: ""
      },
      location: {
        geo: {},
        hash: "",
        text: ""
      }
    },
    seeking: {
      maxDistance: 200,
      minScore: 50,
      relationships: [
        {
          type: "buddies",
          enabled: false,
          identities: [],
          expressions: [],
          orientations: [],
          pronouns: []
        },
        {
          type: "dating",
          enabled: false,
          identities: [],
          expressions: [],
          orientations: [],
          pronouns: []
        },
        {
          type: "love",
          enabled: false,
          identities: [],
          expressions: [],
          orientations: [],
          pronouns: []
        }
      ]
    },
    settings: {
      clearedQuestions: [],
      privacy: {
        birthdate: {
          display: 0,
          level: 3
        },
        bio: {
          level: 3
        },
        gender: {
          level: 3
        },
        lastname: {
          display: 0,
          level: 3
        },
        location: {
          level: 3
        },
        profile: {
          level: 3
        }
      }
    },
    setup: {
      complete: false,
      completed: [],
      next: "signup.terms"
    }
  },
  userLoaded: false
});

const state = initialState();

const getters = {
  avatars: (state, getters) => {
    return state.userLoaded
      ? getters.userData.profile.avatars
      : initialState().userDataDefault.profile.avatars;
  },
  blockedUsers: state => state.blockedUsers,
  songmates: state => state.songmates,
  songmatesDisliked: state => state.songmatesDisliked,
  user: state => state.user,
  userData: state => (state.userLoaded ? state.userData : state.userDataDefault)
};

const actions = {
  async create({ state }, payload) {
    if (state.user !== null) {
      throw "Cannot create a new user while logged in.";
    } else if (
      !Object.prototype.hasOwnProperty.call(payload, "email") ||
      !Object.prototype.hasOwnProperty.call(payload, "password")
    ) {
      throw "Must provide a username and password";
    } else {
      return await Vue.prototype.$fireAuth.createUserWithEmailAndPassword(
        payload.email,
        payload.password
      );
    }
  },

  getBlockedUsers: firestoreAction(
    ({ state, bindFirestoreRef, unbindFirestoreRef }) => {
      if (state.userLoaded) {
        return bindFirestoreRef(
          "blockedUsers",
          Vue.prototype.$fireStore
            .collection("users")
            .doc(state.user.uid)
            .collection("blocked_users"),
          {
            wait: true,
            maxRefDepth: 1,
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
        return unbindFirestoreRef("blockedUsers");
      }
    }
  ),

  async getCurrentUser({ state }) {
    return new Promise((resolve, reject) => {
      if (state.userLoaded) {
        return resolve(state.user);
      } else {
        return reject("User not logged in");
      }
    });
  },

  getSongmates: firestoreAction(
    ({ state, bindFirestoreRef, unbindFirestoreRef }) => {
      if (state.userLoaded) {
        return bindFirestoreRef(
          "songmates",
          Vue.prototype.$fireStore
            .collection("users")
            .doc(state.user.uid)
            .collection("songmates"),
          {
            wait: true,
            maxRefDepth: 1,
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
        return unbindFirestoreRef("songmates");
      }
    }
  ),

  getSongmatesDisliked: firestoreAction(
    ({ state, bindFirestoreRef, unbindFirestoreRef }) => {
      if (state.userLoaded) {
        return bindFirestoreRef(
          "songmatesDisliked",
          Vue.prototype.$fireStore
            .collection("users")
            .doc(state.user.uid)
            .collection("songmates_disliked"),
          {
            wait: true,
            maxRefDepth: 1,
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
        return unbindFirestoreRef("songmatesDisliked");
      }
    }
  ),

  getUserData: firestoreAction(
    ({ state, bindFirestoreRef, unbindFirestoreRef }) => {
      if (state.userLoaded) {
        return bindFirestoreRef(
          "userData",
          Vue.prototype.$fireStore.collection("users").doc(state.user.uid),
          {
            wait: true,
            serialize: snapshot => {
              let data = defaultsDeep(snapshot.data(), state.userDataDefault, {
                id: snapshot.id,
                path: snapshot.ref.path
              });
              return data;
            }
          }
        );
      } else {
        return unbindFirestoreRef("userData");
      }
    }
  ),

  async login({ state }, payload) {
    if (state.user !== null) {
      throw "Cannot call login while already logged in.";
    } else if (
      !Object.prototype.hasOwnProperty.call(payload, "email") ||
      !Object.prototype.hasOwnProperty.call(payload, "password") ||
      !Object.prototype.hasOwnProperty.call(payload, "persist")
    ) {
      throw "Must provide valid payload.";
    } else {
      let persistence = payload.persist ? "local" : "session";
      return await Vue.prototype.$fireAuth
        .setPersistence(persistence)
        .then(() => {
          return Vue.prototype.$fireAuth.signInWithEmailAndPassword(
            payload.email,
            payload.password
          );
        });
    }
  },

  async reload({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.userLoaded) {
        return Vue.prototype.$fireAuth.currentUser
          .reload()
          .then(function() {
            commit("updateUser", { user: Vue.prototype.$fireAuth.currentUser });
            return resolve(state.user);
          })
          .catch(res => reject(res));
      } else {
        return reject("User not logged in");
      }
    });
  },

  async updateProfile({ dispatch, state }, payload) {
    return new Promise((resolve, reject) => {
      if (state.userLoaded) {
        return Vue.prototype.$fireAuth.currentUser
          .updateProfile(payload)
          .then(function() {
            return resolve(dispatch("reload"));
          })
          .catch(res => reject(res));
      } else {
        return reject("User not logged in");
      }
    });
  }
};

const mutations = {
  addBlockedUser(state, uid) {
    let blockedUsers = state.blockedUsers.map(o => o.uid);
    if (blockedUsers.indexOf(uid) === -1) {
      state.blockedUsers.push({
        browse: null,
        id: uid,
        timestamp: null,
        uid: uid
      });
    }
  },

  updateUser(state, { user }) {
    const {
      displayName,
      email,
      metadata,
      phoneNumber,
      photoURL,
      refreshToken,
      tenantId,
      uid
    } = user;
    Vue.set(state, "user", {
      displayName,
      email,
      metadata,
      phoneNumber,
      photoURL,
      refreshToken,
      tenantId,
      uid
    });
  },

  updateUserData(state, userData) {
    state.userData = userData;
  },

  updateUserLoaded(state, userLoaded) {
    state.userLoaded = userLoaded;
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
