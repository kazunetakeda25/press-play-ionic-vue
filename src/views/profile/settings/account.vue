<template>
  <ion-page>
    <h1>Account Page</h1>
  </ion-page>
</template>
<script>
export default {
  beforeRouteEnter(to, from, next) {
    next(async vm => {
      let alertOptions = {
        backdropDismiss: false,
        buttons: [
          {
            cssClass: "secondary",
            role: "cancel",
            text: "Cancel",
            handler: () => next(from)
          },
          {
            cssClass: "primary",
            text: "Confirm",
            handler: data => {
              if (!data.password) {
                return next(from);
              }
            }
          }
        ],
        header: "Confirm Password",
        inputs: [
          {
            id: "password",
            name: "password",
            placeholder: "Your password",
            required: true,
            type: "password"
          }
        ],
        message: "You need to confirm your password in order to use this page."
      };

      await vm.$ionic.alertController.create(alertOptions).then(function(e) {
        vm.alertWindow = e;
      });

      await vm.alertWindow.present();
    });
  }
};
</script>
