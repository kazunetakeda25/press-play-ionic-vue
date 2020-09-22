// Core dependencies
import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import Ionic from "@ionic/vue";
import { firestorePlugin } from "vuefire";

// Import plugins
import alert from "@/plugins/alert";
import icons from "@/plugins/icons";
import firebase from "@/plugins/firebase";

// Import layouts
import DefaultLayout from "@/layouts/default.vue";
import NavigatorLayout from "@/layouts/navigator.vue";

// Import global components
import AspectRatio from "@/components/global/aspect-ratio.vue";
import Avatar from "@/components/global/avatar.vue";
import Gesture from "@/components/global/gesture.vue";
import Icon from "@/components/global/icon.vue";
import Sidebar from "@/components/global/sidebar.vue";

// Install Ionic
Vue.use(Ionic, { mode: "md" });

// Install firestorePlugin
Vue.use(firestorePlugin);

// Install plugins
Vue.use(alert);
Vue.use(icons);
Vue.use(firebase);

// Register layouts
Vue.component("default-layout", DefaultLayout);
Vue.component("navigator-layout", NavigatorLayout);

// Register global components
Vue.component("aspect-ratio", AspectRatio);
Vue.component("avatar", Avatar);
Vue.component("gesture", Gesture);
Vue.component("icon", Icon);
Vue.component("sidebar", Sidebar);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
