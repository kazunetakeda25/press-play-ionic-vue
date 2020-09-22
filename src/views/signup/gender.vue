<template>
  <form class="ion-page" @submit.prevent="saveProfile">
    <ion-content color="transparent" fullscreen>
      <ion-grid class="align-content-space-between">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <aspect-ratio
              ratio="16:9"
              class="ion-justify-content-center ion-align-items-center"
            >
              <ion-text color="light" class="ion-text-center">
                <h1>
                  ...getting to know<br />
                  all about you...
                </h1>
              </ion-text>
            </aspect-ratio>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <ion-text
              class="ion-text-center"
              v-if="!userData.profile.gender.identity"
            >
              <h3>Gender Identity</h3>
              <p>
                Swipe left or right to find the icon you most identify with
              </p>
            </ion-text>
            <div
              class="slide-container"
              v-show="!userData.profile.gender.identity"
            >
              <ion-slides
                class="ion-padding-bottom"
                :scrollbar="true"
                ref="identitySlides"
                @ionSlidesDidLoad="setIdentitySwiperOptions"
              >
                <ion-slide
                  v-for="(identity, i) in identities"
                  :key="'identities' + i"
                >
                  <div
                    class="slide"
                    @click.prevent="setGenderIdentity(identity.id)"
                  >
                    <gender-icon
                      class="ion-margin-bottom"
                      :gender="{
                        identity: identity.id,
                        expression: '',
                        orientation: '',
                        pronoun: ''
                      }"
                    ></gender-icon>
                    <ion-text class="ion-text-nowrap" color="medium">
                      {{ identity.text }}
                    </ion-text>
                  </div>
                </ion-slide>
              </ion-slides>
              <div class="slide-nav ion-hide-md-down">
                <ion-fab-button
                  class="prev"
                  color="light"
                  size="small"
                  style="margin-top: -25px;"
                  type="button"
                  @click.prevent="$refs.identitySlides.slidePrev()"
                >
                  <icon name="arrow-back-outline"></icon>
                </ion-fab-button>
                <ion-fab-button
                  class="next"
                  color="light"
                  size="small"
                  style="margin-top: -25px;"
                  type="button"
                  @click.prevent="$refs.identitySlides.slideNext()"
                >
                  <icon name="arrow-forward-outline"></icon>
                </ion-fab-button>
              </div>
            </div>
            <ion-grid
              class="ion-margin-top"
              v-if="userData.profile.gender.identity !== ''"
            >
              <ion-row class="ion-justify-content-center">
                <ion-col size="8">
                  <div @click.prevent="setGenderIdentity('')">
                    <gender-icon
                      :gender.sync="userData.profile.gender"
                    ></gender-icon>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-col>
        </ion-row>
        <ion-row
          class="ion-justify-content-center ion-align-items-center"
          v-if="
            identitySelected &&
              (!expressionSelected || !pronounSelected || !orientationSelected)
          "
        >
          <ion-col size="12" size-md="6" size-xl="4">
            <template v-if="!expressionSelected">
              <ion-text class="ion-text-center">
                <h3>Gender Expression</h3>
                <p>Select an expression to show how you tend to appear</p>
              </ion-text>
              <ion-grid>
                <ion-row class="ion-justify-content-center">
                  <ion-col
                    size="3"
                    v-for="(expression, i) in expressions"
                    :key="'expression' + i"
                  >
                    <div
                      class="ion-text-center"
                      @click.prevent="setGenderExpression(expression.id)"
                    >
                      <ion-avatar :class="'gender-expression ' + expression.id">
                        <icon :name="expression.icon" size="large"></icon>
                      </ion-avatar>
                      <ion-text color="medium">{{ expression.text }}</ion-text>
                    </div>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </template>

            <template v-if="expressionSelected && !pronounSelected">
              <ion-text class="ion-text-center">
                <h3>Gender Pronoun</h3>
                <p>Select your preferred pronoun</p>
              </ion-text>
              <div class="ion-text-center">
                <ion-chip
                  v-for="(pronoun, i) in pronouns"
                  :key="'pronoun' + i"
                  :color="
                    userData.profile.gender.pronoun == pronoun.id
                      ? 'primary'
                      : ''
                  "
                  @click.prevent="setGenderPronoun(pronoun.id)"
                >
                  <ion-label>{{ pronoun.text }}</ion-label>
                </ion-chip>
              </div>
            </template>

            <template
              v-if="
                expressionSelected && pronounSelected && !orientationSelected
              "
            >
              <ion-text class="ion-text-center">
                <h3>Seuxal Orientation</h3>
                <p>Select your sexual preference</p>
              </ion-text>
              <div class="slide-container">
                <ion-slides
                  class="ion-padding-bottom"
                  :scrollbar="true"
                  ref="orientationSlides"
                  @ionSlidesDidLoad="setOrientationSwiperOptions"
                >
                  <ion-slide
                    v-for="(orientation, i) in orientations"
                    :key="'orientation' + i"
                  >
                    <div
                      class="slide"
                      @click.prevent="setGenderOrientation(orientation.id)"
                    >
                      <aspect-ratio class="ion-margin-bottom">
                        <ion-avatar class="sexual-orientation">
                          <icon
                            :name="`c-orientation-${orientation.id}`"
                          ></icon>
                        </ion-avatar>
                      </aspect-ratio>
                      <ion-text class="ion-text-nowrap" color="medium">
                        {{ orientation.text }}
                      </ion-text>
                    </div>
                  </ion-slide>
                </ion-slides>
                <div class="slide-nav ion-hide-md-down">
                  <ion-fab-button
                    class="prev"
                    color="light"
                    size="small"
                    style="margin-top: -25px;"
                    type="button"
                    @click.prevent="$refs.orientationSlides.slidePrev()"
                  >
                    <icon name="arrow-back-outline"></icon>
                  </ion-fab-button>
                  <ion-fab-button
                    class="next"
                    color="light"
                    size="small"
                    style="margin-top: -25px;"
                    type="button"
                    @click.prevent="$refs.orientationSlides.slideNext()"
                  >
                    <icon name="arrow-forward-outline"></icon>
                  </ion-fab-button>
                </div>
              </div>
            </template>
          </ion-col>
        </ion-row>
        <ion-row
          class="ion-justify-content-center ion-align-items-center"
          v-if="
            identitySelected &&
              expressionSelected &&
              pronounSelected &&
              orientationSelected
          "
        >
          <ion-col size="12" size-md="6" size-xl="4">
            <settings-gender></settings-gender>
          </ion-col>
        </ion-row>
        <ion-row> </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="no-style fade-to-bottom">
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6" size-xl="4">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              type="submit"
              :disabled="savingProfile || !validGender"
            >
              <ion-spinner
                v-if="savingProfile || savingSetup"
                slot="start"
              ></ion-spinner>
              Continue
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </form>
</template>
<script>
import GenderIcon from "@/components/gender/icon.vue";
import SettingsGender from "@/components/settings/gender.vue";

import Gender from "@/mixins/gender.js";
import UserData from "@/mixins/userData.js";

export default {
  next: "signup.seeking",

  created() {
    this.$on("profileSaved", function(saved) {
      if (saved) {
        this.saveSetup();
      }
    });
  },

  watch: {
    "userData.profile": {
      handler: function(profile) {
        if (profile.gender.identity == "none") {
          this.userData.profile.gender.expression = "none";
          this.userData.profile.gender.orientation = "none";
          this.userData.profile.gender.pronoun = "ambiguous";
        }
      },
      deep: true
    }
  },

  methods: {
    async setIdentitySwiperOptions() {
      const swiper = await this.$refs.identitySlides.getSwiper();
      Object.assign(swiper.params, this.slideOpts);
      await swiper.update();
    },

    async setOrientationSwiperOptions() {
      const swiper = await this.$refs.orientationSlides.getSwiper();
      Object.assign(swiper.params, this.slideOpts);
      await swiper.update();
    },

    setGenderIdentity(gender) {
      this.userData.profile.gender.identity = gender;
    },

    setGenderExpression(expression) {
      this.userData.profile.gender.expression = expression;
    },

    setGenderOrientation(orientation) {
      this.userData.profile.gender.orientation = orientation;
    },

    setGenderPronoun(pronoun) {
      this.userData.profile.gender.pronoun = pronoun;
    }
  },

  computed: {
    identitySelected() {
      return (
        this.userData.profile.gender.identity !== "" &&
        this.userData.profile.gender.identity !== "none"
      );
    },
    expressionSelected() {
      return this.userData.profile.gender.expression !== "";
    },
    pronounSelected() {
      return this.userData.profile.gender.pronoun !== "";
    },
    orientationSelected() {
      return this.userData.profile.gender.orientation !== "";
    },
    slideOpts() {
      return {
        slidesPerView: 3,
        spaceBetween: 8,
        centeredSlides: true,
        centeredSlidesBounds: true
      };
    }
  },

  components: {
    GenderIcon,
    SettingsGender
  },

  mixins: [Gender, UserData]
};
</script>
<style lang="scss" scoped>
ion-slides {
  ion-slide {
    .slide {
      width: 100%;
      height: 100%;
    }
    &.swiper-slide-active {
      cursor: pointer;
      z-index: 5;
      ion-text {
        color: var(--ion-color-dark, #222428) !important;
      }
    }
    &:not(.swiper-slide-active) {
      transform: scale(0.8);
      ion-text {
        color: var(--ion-color-medium, #92949c) !important;
      }
    }
  }
}
</style>
