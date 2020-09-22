import Vue from "vue";
import Vuex from "vuex";
import VuexPersist from "vuex-persist";
import { vuexfireMutations } from "vuexfire";
import modules from "./modules";

Vue.use(Vuex);

const vuexLocalStorage = new VuexPersist({
  key: "vuex",
  storage: window.localStorage
});

const store = new Vuex.Store({
  modules,
  actions: {
    reset({ commit }) {
      // resets state of all the modules
      Object.keys(modules).forEach(moduleName => {
        commit(`${moduleName}/RESET`);
      });
    }
  },
  mutations: {
    ...vuexfireMutations
  },
  plugins: [vuexLocalStorage.plugin]
});

// Attach to prototype to access this.$store globally
Vue.prototype.$store = store;

export default store;
