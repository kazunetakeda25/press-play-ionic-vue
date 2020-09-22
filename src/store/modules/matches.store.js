import isEqual from "lodash/isEqual";
import toPlainObject from "lodash/toPlainObject";

const initialState = () => ({
  active: {},
  dismissed: [],
  listView: {
    filter: "all",
    orderBy: "date",
    order: "desc"
  },
  listViewDisliked: {
    orderBy: "date",
    order: "desc"
  },
  matchFilter: {}
});

const state = initialState();

const getters = {
  active: state => state.active,
  dismissed: state => state.dismissed,
  listView: state => state.listView,
  listViewDisliked: state => state.listViewDisliked,
  matchFilter: state => state.matchFilter
};

const actions = {
  setDefaultMatchFilter({ commit, rootState, state }) {
    // Setup default relationship filter
    let defaultRelationships = [];
    rootState.User.userData.seeking.relationships.forEach(function(
      relationship
    ) {
      if (relationship.enabled) {
        // Setup filter object
        let relationshipFilter = {
          type: relationship.type,
          enabled: true,
          expressions: [],
          identities: [],
          orientations: [],
          pronouns: []
        };
        // Process filter keys
        ["expressions", "identities", "orientations", "pronouns"].forEach(
          function(key) {
            relationship[key].forEach(function(value) {
              relationshipFilter[key].push({
                type: value,
                enabled: true
              });
            });
          }
        );
        // Push to defalt
        defaultRelationships.push(relationshipFilter);
      }
    });

    // Setup defualt max distance
    let defaultDistance = {
      lower: 0,
      upper: rootState.User.userData.seeking.maxDistance
    };

    // Setup defulat object
    let defaultFilter = {
      distance: defaultDistance,
      score: {
        lower: 50,
        upper: 100
      },
      relationships: defaultRelationships
    };

    commit("matchFilter", Object.assign({}, defaultFilter, state.matchFilter));
  }
};

const mutations = {
  active(state, match) {
    if (isEqual(toPlainObject(state.active), toPlainObject(match)) == false) {
      state.active = match;
    }
  },
  addDismissed(state, id) {
    state.dismissed.push(id);
  },
  clearDismissed(state) {
    state.dismissed = [];
  },
  listView(state, listView) {
    state.listView = listView;
  },
  listViewDisliked(state, listView) {
    state.listViewDisliked = listView;
  },
  matchFilter(state, matchFilter) {
    state.matchFilter = matchFilter;
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
