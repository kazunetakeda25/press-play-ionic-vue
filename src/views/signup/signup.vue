<template>
  <form class="ion-page" @submit.prevent="submit">
    <ion-content color="transparent" fullscreen>
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <aspect-ratio
              ratio="16:9"
              class="ion-justify-content-center ion-align-items-center"
            >
              <ion-text color="light" class="ion-text-center">
                <h1>Let’s get it started</h1>
                <h2>(in here)</h2>
              </ion-text>
            </aspect-ratio>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <ion-list class="form white">
              <ion-grid class="ion-no-padding">
                <ion-row>
                  <ion-col size="12" size-lg="6" class="fix-padding-left">
                    <ion-item lines="none">
                      <ion-label position="stacked">First Name</ion-label>
                      <ion-input
                        autocapitalize="on"
                        required
                        type="text"
                        :value="userData.profile.firstname"
                        :disabled="loading"
                        @ionInput="
                          userData.profile.firstname = $event.target.value
                        "
                      ></ion-input>
                    </ion-item>
                  </ion-col>
                  <ion-col size="12" size-lg="6" class="fix-padding-right">
                    <ion-item lines="none">
                      <ion-label position="stacked">Last Name</ion-label>
                      <ion-input
                        autocapitalize="on"
                        required
                        type="text"
                        :value="userData.profile.lastname"
                        :disabled="loading"
                        @ionInput="
                          userData.profile.lastname = $event.target.value
                        "
                      ></ion-input>
                    </ion-item>
                  </ion-col>
                </ion-row>
              </ion-grid>
              <ion-item lines="none">
                <ion-label position="stacked">Email Address</ion-label>
                <ion-input
                  required
                  type="email"
                  :value="email"
                  :disabled="loading"
                  @ionInput="email = $event.target.value"
                ></ion-input>
              </ion-item>
              <ion-item lines="none">
                <ion-label position="stacked">Password</ion-label>
                <ion-input
                  required
                  type="password"
                  :value="password"
                  :disabled="loading"
                  @ionInput="password = $event.target.value"
                ></ion-input>
              </ion-item>
              <ion-item lines="none">
                <ion-label position="stacked">Confirm Password</ion-label>
                <ion-input
                  required
                  type="password"
                  :value="password2"
                  :disabled="loading"
                  @ionInput="password2 = $event.target.value"
                  @ionBlur="handlePassword2Blur"
                ></ion-input>
              </ion-item>
              <ion-item
                lines="none"
                color="danger"
                v-if="passwordChecker && !passwordsMatch"
              >
                <ion-label>Your passwords do not match.</ion-label>
              </ion-item>
              <ion-item class="no-style" lines="none">
                <ion-checkbox
                  :checked="termsAccepted"
                  :disabled="loading"
                  color="primary"
                  slot="start"
                  @ionChange="termsAccepted = $event.detail.checked"
                ></ion-checkbox>
                <ion-label>I agree to the terms and conditions</ion-label>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="6" size-md="3" size-xl="2">
            <router-link
              :to="{ name: 'forgotpassword' }"
              v-slot="{ href, navigate }"
            >
              <ion-button
                color="primary"
                fill="clear"
                :href="href"
                @click="navigate"
                >Forgot Password?</ion-button
              >
            </router-link>
          </ion-col>
          <ion-col size="6" size-md="3" size-xl="2">
            <div class="ion-text-end">
              <router-link :to="{ name: 'login' }" v-slot="{ href, navigate }">
                <ion-button
                  color="primary"
                  fill="clear"
                  :href="href"
                  @click.prevent="navigate"
                >
                  <icon name="person-circle" slot="start"></icon>
                  Sign In
                </ion-button>
              </router-link>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="no-style fade-to-bottom">
      <ion-grid class="align-content-center">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              type="submit"
              :disabled="loading || !canSubmit"
            >
              <ion-spinner v-if="loading"></ion-spinner>
              Create Account
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import UserData from "@/mixins/userData.js";

export default {
  data() {
    return {
      email: "",
      password: "",
      password2: "",
      passwordChecker: false,
      loading: false,
      termsAccepted: false
    };
  },

  created() {
    this.$on("errorRetry", function() {
      this.submit();
    });

    // Watch user on load, redirect to profile if logged in
    // Use unwatch guard so we don't redirect to profile on create success
    let unwatch = this.$watch(
      "user",
      function(user) {
        if (unwatch) {
          unwatch();
        } else {
          if (user) {
            this.$router.replace({ name: "profile" });
          }
        }
      },
      { immediate: true }
    );
  },

  methods: {
    submit() {
      let vm = this;

      vm.loading = true;

      vm.$store
        .dispatch("User/create", { email: vm.email, password: vm.password })
        .then(function() {
          let requests = [];

          requests.push(
            vm.$store.dispatch("User/updateProfile", {
              displayName: vm.displayName
            })
          );
          requests.push(
            vm.$fireStore
              .collection("users")
              .doc(vm.user.uid)
              .set(vm.userData)
          );

          Promise.all(requests)
            .then(function() {
              vm.loading = false;
              vm.$router.push({ name: "signup.terms" });
            })
            .catch(res => {
              return vm.error(res);
            });
        })
        .catch(res => {
          return vm.error(res);
        });
    },

    error(err) {
      let vm = this;
      vm.loading = false;
      return vm.$error(err.message);
    },

    handlePassword2Blur() {
      this.passwordChecker = true;
    }
  },

  computed: {
    canSubmit() {
      return (
        this.email !== "" &&
        this.userData.profile.firstname !== "" &&
        this.userData.profile.lastname !== "" &&
        this.termsAccepted &&
        this.passwordsMatch
      );
    },

    passwordsMatch() {
      return (
        this.password !== "" &&
        this.password2 !== "" &&
        this.password == this.password2
      );
    }
  },

  mixins: [UserData]
};
</script>
<style lang="scss" scoped>
ion-content {
  background-position-x: 10%;
}
.form ion-grid {
  --ion-grid-column-padding: 8px;
}
@media (min-width: 992px) {
  ion-content > ion-card {
    height: calc(100% - 30px);
    background-position-y: -25vh;
  }
  .fix-padding-left {
    padding-left: 0;
  }
  .fix-padding-right {
    padding-right: 0;
  }
}
@media (max-width: 992px) {
  ion-content > ion-card {
    margin: 0;
  }
  .fix-padding-left,
  .fix-padding-right {
    padding-left: 0;
    padding-right: 0;
  }
  .fix-padding-right {
    padding-bottom: 0;
  }
}
</style>
