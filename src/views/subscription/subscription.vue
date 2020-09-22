<template>
  <ion-page>
    <ion-content fullscreen>
      <div class="background">
        <img src="../../assets/images/footer_back.png" class="footer_back" />
      </div>
      <div class="subscription_plan">
        <h3 v-if="plan_option === 0">a face in the crowd</h3>
        <h3 v-if="plan_option === 1">you're meant to be...</h3>
        <h3 v-if="plan_option === 2">party like a...</h3>
        <ion-slides
          :options="slideOpts"
          @ionSlideDidChange="change_plan"
          @ionSlidesDidLoad="init_slider"
        >
          <ion-slide value="slide1">
            <img src="../../assets/images/ga-ticket.png" />
          </ion-slide>
          <ion-slide value="slide2">
            <img src="../../assets/images/vip-badge.png" />
          </ion-slide>
          <ion-slide>
            <img src="../../assets/images/rock-star.png" />
          </ion-slide>
        </ion-slides>
      </div>
      <div class="subscription_content">
        <ion-row
          class="ion-justify-content-center content_header ion-margin-top"
        >
          <h2>song story</h2>
          <icon
            class="songstory-cat-icon ion-margin-start ion-margin-end"
            :name="`c-songstory`"
          ></icon>
          <h2>high notes</h2>
        </ion-row>
        <ion-list>
          <ion-item>
            <h3>
              <icon name="checkmark-circle"></icon>
              <span>{{
                plan_option === 0 ? "Six answers" : "Unlimited Answers"
              }}</span>
            </h3>
          </ion-item>
          <ion-item>
            <h3>
              <icon name="checkmark-circle"></icon>
              <span>Submit Questions</span>
            </h3>
          </ion-item>
          <ion-item>
            <h3>
              <icon name="checkmark-circle"></icon>
              <span>View cleared questions</span>
            </h3>
          </ion-item>
          <ion-item>
            <h3>
              <icon
                v-bind:style="
                  plan_option == 2 ? 'color: #2A82EC' : 'color: #BDBDBD'
                "
                :name="plan_option == 2 ? 'checkmark-circle' : 'close-circle'"
              ></icon>
              <span>Rock me vault</span>
            </h3>
          </ion-item>
        </ion-list>
        <ion-row class="ion-justify-content-center ion-margin-top">
          <div
            v-for="(i, k) in [1, 2, 3]"
            :key="k"
            class="dot"
            v-bind:class="{ active: k === plan_option }"
          />
        </ion-row>
        <ion-row
          class="ion-justify-content-center ion-margin-top"
          v-if="this.plan_option !== 0"
        >
          <ion-button
            v-for="(period, i) in ['weekly', 'monthly', 'quarterly']"
            :key="i"
            :fill="plan_period === period ? 'outline' : 'clear'"
            @click="set_plan_period(period)"
          >
            {{ period }}
          </ion-button>
        </ion-row>
      </div>
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              @click="subscribe_plan"
            >
              {{
                plan_option == 0 ? "Free" : "$" + plan_price + " " + plan_period
              }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import merge from "lodash/merge";
export default {
  layout: {
    header: {
      class: "no-style-lg-down"
    },
    content: {
      fullscreen: true
    },
    menubar: {
      navPosition: "bottom"
    }
  },
  data() {
    return {
      slideOpts: {
        initialSlide: 2,
        speed: 400
      },
      plan_option: 0,
      plan_period: "weekly",
      plan_price: 0
    };
  },
  watch: {
    "$navigator.windowWidth": {
      handler: function(windowWidth) {
        let vm = this;
        // Handle navigator layout
        if (windowWidth <= 992) {
          vm.$nextTick().then(() => {
            vm.setLayoutVars();
          });
        } else {
          vm.$nextTick().then(() => {
            vm.removeLayoutVars();
          });
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.plan_option = !this.$route.params.plan_option
      ? 0
      : this.$route.params.plan_option;
  },
  methods: {
    init_slider(evt) {
      evt.target.slideTo(this.plan_option);
    },
    change_plan(evt) {
      evt.target.getActiveIndex().then(i => {
        this.plan_option = i;
        this.set_subscription_price();
      });
    },
    set_subscription_price() {
      if (this.plan_option == 0) {
        this.plan_price = 0;
      } else if (this.plan_option == 1) {
        if (this.plan_period == "weekly") {
          this.plan_price = 3.99;
        } else if (this.plan_period == "monthly") {
          this.plan_price = 12.99;
        } else if (this.plan_period == "quarterly") {
          this.plan_price = 36.99;
        }
      } else if (this.plan_option == 2) {
        if (this.plan_period == "weekly") {
          this.plan_price = 6.99;
        } else if (this.plan_period == "monthly") {
          this.plan_price = 24.99;
        } else if (this.plan_period == "quarterly") {
          this.plan_price = 72.99;
        }
      }
    },
    set_plan_period(period) {
      this.plan_period = period;
      this.set_subscription_price();
    },
    subscribe_plan() {
      if (this.plan_option === 0) {
        this.$store.dispatch("Subscription/saveSubscription", {
          plan_option: this.plan_option,
          date: new Date()
        });
        this.$router.push({
          name: "subscription_complete",
          params: {
            plan_option: this.plan_option,
            plan_period: this.plan_period,
            plan_price: this.plan_price
          }
        });
      } else {
        this.$router.push({
          name: "subscription_payment",
          params: {
            plan_option: this.plan_option,
            plan_period: this.plan_period,
            plan_price: this.plan_price
          }
        });
      }
    },
    setLayoutVars() {
      let header = merge(this.$navigator.layoutVars.header, {
        class: "no-style-lg-down",
        title: {
          color: "light"
        },
        toolbar: {
          color: "transparent"
        }
      });
      let sidebar = merge(this.$navigator.layoutVars.sidebar, {
        icon: {
          color: "light"
        }
      });
      this.$set(this.$navigator.layout, "header", header);
      this.$set(this.$navigator.layout, "sidebar", sidebar);
      this.$navigator.$refs.app.style.setProperty("--content-height", "100vh");
      this.$navigator.$refs.header.style.setProperty("position", "absolute");
    }
  }
};
</script>

<style lang="scss" scoped>
.background {
  background: radial-gradient(
    90.14% 73.52% at 50% 27.42%,
    #aa2986 0%,
    #751a8a 27.08%,
    #5d148c 66.15%,
    #471b74 100%
  );
  width: 100%;
  height: 35%;
  position: absolute;
  z-index: 0;
  .footer_back {
    position: absolute;
    bottom: 0;
    z-index: 2;
  }
}
.subscription_plan {
  margin-top: 60px;
  text-align: center;
  h3 {
    font-size: 20px;
    color: white;
    position: relative;
  }
}
.subscription_content {
  .content_header {
    h2 {
      font-size: 24px;
      color: #f2c94c;
      z-index: 99;
    }
    ion-icon {
      font-size: 56px;
      color: #9b51e0;
    }
  }
  ion-item {
    h3 {
      display: flex;
      align-items: center;
      ion-icon {
        color: #2a82ec;
      }
      span {
        margin-left: 5px;
        font-size: 16px;
      }
    }
  }
}
.title {
  text-align: center;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background: #ddd;
  margin-right: 6px;
  &:last-child {
    margin-right: 0;
  }
  &.active {
    background: #dd0;
  }
}
ion-slides {
  width: 100%;
  color: white;
  img {
    height: 100px;
  }
}
</style>
