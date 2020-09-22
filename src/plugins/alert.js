export default {
  install: Vue => {
    // Error handling
    Vue.prototype.$error = function(message, controllerOptions) {
      let vm = this;

      // Handle options
      let defaultOptions = {
        backdropDismiss: false,
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "secondary",
            handler: function() {
              vm.$emit("errorCanceled", true);
            }
          },
          {
            text: "Retry",
            cssClass: "primary",
            handler: function() {
              vm.$emit("errorRetry", true);
            }
          }
        ],
        header: "Something went wrong"
      };
      let options =
        typeof controllerOptions === "undefined"
          ? defaultOptions
          : Object.assign({}, defaultOptions, controllerOptions);

      // Make sure passed message is the message
      options.message = message;

      return vm.$ionic.alertController.create(options).then(function(e) {
        e.onDidDismiss(function() {
          vm.$emit("errorCanceled", true);
        });
        e.present();
      });
    };

    // Toast messages
    Vue.prototype.$toast = async function(message, controllerOptions) {
      let vm = this;

      // Handle options
      let defaultOptions = {
        color: "dark",
        duration: 2000,
        position: "top"
      };
      let options =
        typeof controllerOptions === "undefined"
          ? defaultOptions
          : Object.assign({}, defaultOptions, controllerOptions);

      // Make sure passed message is the message
      options.message = message;

      return vm.$ionic.toastController.create(options).then(function(e) {
        e.onDidDismiss(function() {
          vm.$emit("toast.dismissed", true);
        });
        e.present();
      });
    };
  }
};
