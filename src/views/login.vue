<template>
  <ion-page>
    <ion-content class="purple-radial-gradient">
      <ion-grid class="align-content-center" fixed>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="8">
            <aspect-ratio
              ratio="32:35"
              ratio-md="16:9"
              ratio-lg="2:1"
              class="ion-justify-content-center ion-align-items-center soundbar-bg ion-padding"
            >
              <h1>
                <router-link :to="{ name: 'login' }" v-slot="{ href }">
                  <a :href="href" title="Go to PressPlay Login">
                    <i class="img logo-vertical-contrast">
                      <u>PressPlay Login</u>
                    </i>
                  </a>
                </router-link>
              </h1>
            </aspect-ratio>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <ion-text color="light">
              <h2 class="ion-text-center">Sign in to your account</h2>
            </ion-text>

            <form class="ion-margin-top" @submit.prevent="submit">
              <ion-list class="form transparent" lines="none">
                <ion-item lines="none">
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input
                    required
                    type="email"
                    :value="email"
                    @ionInput="email = $event.target.value"
                  ></ion-input>
                </ion-item>
                <ion-item lines="none">
                  <ion-label position="stacked">Password</ion-label>
                  <ion-input
                    required
                    type="password"
                    :value="password"
                    @ionInput="password = $event.target.value"
                  ></ion-input>
                </ion-item>
                <ion-item class="no-style" lines="none">
                  <ion-checkbox
                    color="light"
                    slot="start"
                    :checked="persist"
                    @ionChange="persist = $event.detail.checked"
                  ></ion-checkbox>
                  <ion-label>Remember me</ion-label>
                </ion-item>
              </ion-list>
              <div class="ion-margin-top">
                <ion-button
                  class="bright-horizontal-gradient"
                  expand="block"
                  size="large"
                  type="submit"
                  >Sign in</ion-button
                >
              </div>
            </form>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="6" size-md="3" size-xl="2">
            <div class="ion-padding-vertical ion-text-start">
              <router-link
                :to="{ name: 'forgotpassword' }"
                v-slot="{ href, navigate }"
              >
                <ion-button
                  color="light"
                  fill="clear"
                  :href="href"
                  @click="navigate"
                  >Forgot Password?</ion-button
                >
              </router-link>
            </div>
          </ion-col>
          <ion-col size="6" size-md="3" size-xl="2">
            <div class="ion-padding-vertical ion-text-end">
              <router-link :to="{ name: 'signup' }" v-slot="{ href, navigate }">
                <ion-button
                  color="light"
                  fill="clear"
                  :href="href"
                  @click="navigate"
                >
                  <icon name="person-circle" slot="start"></icon>
                  Sign Up
                </ion-button>
              </router-link>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      email: "",
      password: "",
      persist: true
    };
  },

  watch: {
    user: {
      handler: function(auth) {
        if (auth) {
          this.$router.replace(this.nextRoute);
        }
      },
      immediate: true
    }
  },

  methods: {
    submit() {
      let vm = this;
      vm.$store
        .dispatch("User/login", {
          email: vm.email,
          password: vm.password,
          persist: vm.persist
        })
        .catch(res => {
          return vm.$error(res.message, {
            buttons: [
              {
                text: "Ok",
                role: "cancel",
                cssClass: "primary"
              }
            ]
          });
        });
    }
  },

  computed: {
    ...mapGetters({ user: "User/user" }),
    nextRoute() {
      return this.$route.query.redirect || { name: "profile" };
    }
  }
};
</script>
