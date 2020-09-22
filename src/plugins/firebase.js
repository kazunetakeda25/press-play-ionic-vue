import store from "@/store";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCb9zbPeTqxA2Ii7figAcHRlv-M7xvs4Q4",
  authDomain: "press-play-2c928.firebaseapp.com",
  databaseURL: "https://press-play-2c928.firebaseio.com",
  projectId: "press-play-2c928",
  storageBucket: "press-play-2c928.appspot.com",
  messagingSenderId: "1056478838596",
  appId: "1:1056478838596:web:71b5c060a060c66615e111",
  measurementId: "G-YTDZ0CZXXQ"
};

const Firebase = firebase.initializeApp(firebaseConfig);

// Install plugins
export default {
  install: Vue => {
    // Install auth
    let authCallBack = null;
    let authMetaDataRef = null;
    Vue.prototype.$fireAuth = Firebase.auth();
    Vue.prototype.$fireAuth.onAuthStateChanged(user => {
      // Remove previous authMetaDataRef listener.
      if (authCallBack) {
        authMetaDataRef.off("value", authCallBack);
      }

      if (user === null && store.state.User.user !== null) {
        // Reset everything on user logged out
        store.dispatch("reset");
      } else if (user) {
        // Setup auth refresh
        authMetaDataRef = Firebase.database().ref(
          "metadata/" + user.uid + "/refreshTime"
        );
        authCallBack = () => {
          if (store.state.User.user !== null) {
            user.getIdToken(true);
          }
        };
        authMetaDataRef.on("value", authCallBack);

        // Commit the user to the store
        store.commit("User/updateUserLoaded", true);
        store.commit("User/updateUser", { user });
      }
    });
    Vue.prototype.$fireAuthObj = firebase.auth;

    // Install DB
    const fireStore = Firebase.firestore();
    // If window.location.port === 5000, setup local emulator
    if (window.location.port == "5000") {
      fireStore.settings({
        host: "localhost:8080",
        ssl: false
      });
    }
    Vue.prototype.$fireStore = fireStore;
    Vue.prototype.$fireStoreObj = firebase.firestore;

    // Install functions
    const fireFunc = Firebase.functions("us-central1");
    // If window.location.port === 5000, setup local emulator
    if (window.location.port == "5000") {
      fireFunc.useFunctionsEmulator(
        `${window.location.protocol}//${window.location.hostname}:5001`
      );
    }
    Vue.prototype.$fireFunc = fireFunc;
    Vue.prototype.$fireFuncObj = firebase.functions;

    // Install Storage
    Vue.prototype.$fireStorage = Firebase.storage();
    Vue.prototype.$fireStorageObj = firebase.storage;
  }
};
