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
                <router-link :to="{ name: 'home' }" v-slot="{ href }">
                  <a :href="href" title="Go to PressPlay Home">
                    <i class="img logo-vertical-contrast">
                      <u>PressPlay</u>
                    </i>
                  </a>
                </router-link>
              </h1>
            </aspect-ratio>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <div class="ion-padding-vertical ion-text-center">
              <ion-text class="intro-text" color="light">
                <p class="text-large">
                  Connect with people through the universal languages of music,
                  love, and friendship
                </p>
              </ion-text>
            </div>
            <!-- <div class="ion-text-center">
              <ion-slides class="white-butllet" pager="true">
                <ion-slide>
                  <div class="ion-padding-vertical">
                    <ion-text class="intro-text" color="light">
                      <h2>
                        Music Lovers Unite
                      </h2>
                      <p class="text-large">
                        Connect with people through the universal language of music, love, and friendship
                      </p>
                    </ion-text>
                  </div>
                </ion-slide>
                <ion-slide>
                  <div class="ion-padding-vertical">
                    <ion-text class="intro-text" color="light">
                      <h2>
                        Build your SongStory
                      </h2>
                      <p class="text-large">
                        The "Soundtrack of Your Life": A simple way to make a personal audio-biography
                      </p>
                    </ion-text>
                  </div>
                </ion-slide>
                <ion-slide>
                  <div class="ion-padding-vertical">
                    <ion-text class="intro-text" color="light">
                      <h2>
                        Find your SongMate
                      </h2>
                      <p class="text-large">
                        Find people with similar interests that understand your vibe on a deeper level
                      </p>
                    </ion-text>
                  </div>
                </ion-slide>
                <ion-slide>
                  <div class="ion-padding-vertical">
                    <ion-text class="intro-text" color="light">
                      <h2>
                        Connect Instantly
                      </h2>
                      <p class="text-large">
                        Hassle-free, endless possibilities to creatively connect with like minded people
                      </p>
                    </ion-text>
                  </div>
                </ion-slide>
              </ion-slides>
            </div> -->
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <router-link :to="{ name: 'signup' }" v-slot="{ href, navigate }">
              <ion-button
                :href="href"
                class="bright-horizontal-gradient"
                expand="block"
                size="large"
                @click="navigate"
                >Let's Get Started</ion-button
              >
            </router-link>
            <router-link :to="{ name: 'login' }" v-slot="{ href, navigate }">
              <ion-button
                :href="href"
                class="ion-margin-top"
                color="light"
                expand="block"
                size="large"
                @click="navigate"
                >Sign In</ion-button
              >
            </router-link>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  watch: {
    user(auth) {
      // If user authenticated, move to profile
      if (auth) {
        this.$router.replace({ name: "profile" });
      }
    }
  },

  mounted() {},

  computed: {
    ...mapGetters({ user: "User/user" })
  }
};
</script>
