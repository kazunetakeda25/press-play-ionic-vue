import Vue from "vue";

const initialState = () => ({
  songstories: {},
  users: {}
});

const state = initialState();

const getters = {
  songstories: state => state.songstories,
  users: state => state.users
};

const actions = {
  async getSongstory({ commit, state }, payload) {
    return new Promise((resolve, reject) => {
      // Validate payload
      if (!Object.prototype.hasOwnProperty.call(payload, "uid")) {
        reject("No uid supplied");
      }

      // Check if songstory exists in state and is not expired
      // Resolve if not expired
      if (typeof state.songstories[payload.uid] !== "undefined") {
        let songstory = state.songstories[payload.uid];
        let now = new Date();
        let songstoryExpired =
          (now.getTime() - songstory.timestamp) / 1000 >= 3600;

        if (songstoryExpired === false) {
          return resolve(songstory);
        }
      }

      let songstoryBrowse = Vue.prototype.$fireFunc.httpsCallable(
        "songstory-browse"
      );
      return songstoryBrowse({ uid: payload.uid })
        .then(res => {
          let data = Object.assign(
            {},
            {
              answers: res.data,
              timestamp: new Date().getTime(),
              uid: payload.uid
            }
          );
          commit("addSongstory", data);
          return resolve(data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  },
  async getUser({ commit, state }, payload) {
    return new Promise((resolve, reject) => {
      // Validate payload
      if (!Object.prototype.hasOwnProperty.call(payload, "uid")) {
        reject("No uid supplied");
      }

      // Check if profile exists in state and is not expired
      // Resolve if not expired
      if (typeof state.users[payload.uid] !== "undefined") {
        let user = state.users[payload.uid];
        let now = new Date();
        let userExpired = (now.getTime() - user.timestamp) / 1000 >= 3600;

        if (userExpired === false) {
          return resolve(user);
        }
      }

      let userBrowse = Vue.prototype.$fireFunc.httpsCallable("user-browse");
      return userBrowse({ uid: payload.uid })
        .then(res => {
          let data = Object.assign({}, res.data, {
            uid: payload.uid,
            timestamp: new Date().getTime()
          });
          commit("addUser", data);
          return resolve(data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
};

const mutations = {
  addSongstory(state, data) {
    Vue.set(state.songstories, data.uid, data);
  },
  addUser(state, data) {
    Vue.set(state.users, data.uid, data);
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
