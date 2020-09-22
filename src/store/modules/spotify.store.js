import axios from "axios";
import qs from "querystring";

const spotifyCredentials = { // App: PressPlay
  clientId: "fd07e277de1a449685ef412053131dfe",
  clientSecret: "b3fdd9d0d1594d03988cb3d20d567ce7", // Can be rest in Spotify Developer Account
  scope: "user-read-playback-position user-read-private user-read-email playlist-read-private" +  
  " user-library-read user-library-modify user-top-read playlist-read-collaborative" + 
  " playlist-modify-public playlist-modify-private user-follow-read user-follow-modify" + 
  " user-read-playback-state user-read-currently-playing user-modify-playback-state user-read-recently-played"
}

const initialState = () => ({
  spotifyToken: null
});

const state = initialState();

const getters = {
  spotifyToken: state => state.spotifyToken
};

const actions = {
  getSpotifyToken({ commit, state }) {
    return new Promise((resolve, reject) => {
      let tokenIsNull = state.spotifyToken == null;
      let tokenExpired = false;

      // If token exists, have tokenExpired test if expired
      if (!tokenIsNull) {
        let now = new Date();
        tokenExpired =
          (now.getTime() - state.spotifyToken.time) / 1000 >=
          state.spotifyToken.expires_in;
      }

      // If token doesn't exist or token is expired, get new token
      // Else return the token
      if (tokenIsNull == true || tokenExpired == true) {
        axios
          .post(
            "https://accounts.spotify.com/api/token",
            qs.stringify({ grant_type: "client_credentials", client_secret: spotifyCredentials.clientSecret, client_id: spotifyCredentials.clientId, 
          scope: spotifyCredentials.scope }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            }
          )
          .then(
            res => {
              console.log("Spotify Token Object: " + res);
              let token = Object.assign({}, res.data, {
                time: new Date().getTime()
              });
              console.log("Token: " + token);
              commit("updateSpotifyToken", token);
              resolve(token);
            },
            error => {
              reject(error);
            }
          );
      } else {
        resolve(state.spotifyToken);
      }
    });
  }
};

const mutations = {
  updateSpotifyToken(state, token) {
    state.spotifyToken = token;
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
