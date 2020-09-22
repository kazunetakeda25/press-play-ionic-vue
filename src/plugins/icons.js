// Import addIcons utility
import { addIcons } from "ionicons";

// Get custom icons in assets to import
const requireIcon = require.context("../assets/icons", false, /\.svg$/);
const icons = {};

requireIcon.keys().forEach(filename => {
  const iconName = filename
    .replace(/(\.\/|\.svg)/g, "")
    .replace(/^\w/, c => `c-${c}`);
  icons[iconName] = requireIcon(filename);
});

export default {
  install: Vue => {
    // addIcon function
    Vue.prototype.$addIcon = function(name, file) {
      let platforms = ["ios", "md"];
      let isFile = typeof file !== "undefined" || name.startsWith("c-");
      platforms.forEach(function(platform) {
        let iconName = `${platform}-${name}`;
        let iconFile = isFile ? file : require(`@/assets/ionicons/${name}.svg`);
        if (window.Ionicons.map.has(iconName) === false) {
          let obj = {};
          obj[iconName] = iconFile;
          addIcons(obj);
        }
      });
    };
    // Add custom icons
    Object.keys(icons).forEach(icon => {
      Vue.prototype.$addIcon(icon, icons[icon]);
    });
  }
};
