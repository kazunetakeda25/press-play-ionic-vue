<template>
  <ion-page>
    <ion-content fullscreen>
      <div class="subscription_content">
        <img
          src="../../assets/images/ga-ticket.png"
          v-if="$route.params.plan_option === 0"
        />
        <img
          src="../../assets/images/vip-badge.png"
          v-if="$route.params.plan_option === 1"
        />
        <img
          src="../../assets/images/rock-star.png"
          v-if="$route.params.plan_option === 2"
        />
        <ion-row class="ion-justify-content-center" v-if="$route.params.type !== 'update_card'">
          <h2>
            <b>${{ $route.params.plan_price }}</b> billed today
          </h2>
        </ion-row>
        <ion-row
          class="ion-justify-content-center ion-margin-top"
          v-if="$route.params.plan_option !== 0 && $route.params.type !== 'update_card'"
        >
          <ion-button
            v-for="(period, i) in ['weekly', 'monthly', 'quarterly']"
            :key="i"
            :fill="$route.params.plan_period === period ? 'outline' : 'clear'"
            @click="set_plan_period(period)"
          >
            {{ period }}
          </ion-button>
        </ion-row>
        <ion-row>
          <ion-col size="12">
            <ion-input
              autocapitalize="on"
              enterkeyhint="done"
              placeholder="Cardholder name"
              minlength="1"
              maxlength="35"
              required
              type="text"
              :value="card_info.name"
              @ionChange="card_info.name = $event.target.value"
            ></ion-input>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="12">
            <div id="card-number-element"></div>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <div id="card-expiry-element"></div>
          </ion-col>
          <ion-col size="6">
            <div id="card-cvc-element"></div>
          </ion-col>
        </ion-row>
        <p>
          <icon name="lock-closed-outline" color="primary"></icon>
          <span>Your payment is secure and confidential</span>
        </p>
        <ion-row class="ion-justify-content-center">
          <ion-col size="12" size-md="6">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              v-if="$route.params.type !== 'update_card'"
              @click="show_subscription_alert"
            >
              Subscribe
            </ion-button>
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              v-if="$route.params.type === 'update_card'"
              @click="update_card_info"
            >
              Update Card
            </ion-button>
          </ion-col>
        </ion-row>
      </div>
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
        initialSlide: 1,
        speed: 400
      },
      plan_type: ["GA", "VIP", "RockStar"],
      plan_period: "weekly",
      card_info: {
        name: "",
        number: "",
        exp: "",
        cvv: ""
      },
      stripe_key:
        "pk_test_51GxNVoBe3cLUBg30BiiFdOWsToslnWHdGkhvhHaYsOXqQIwdtWuMbgXO00ns3SCNnd1FeM66UNqK1XwjS7wl8MI700r6roZNMn",
      stripe: "",
      elements: "",
      card: undefined,
      stripeValidationError: "",
      cardNumberElement: "",
      cardCvcElement: ""
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
    this.includeStripe(
      "js.stripe.com/v3/",
      function() {
        this.configureStripe();
      }.bind(this)
    );
  },
  methods: {
    includeStripe(URL, callback) {
      let documentTag = document,
        tag = "script",
        object = documentTag.createElement(tag),
        scriptTag = documentTag.getElementsByTagName(tag)[0];
      object.src = "//" + URL;
      if (callback) {
        object.addEventListener(
          "load",
          function(e) {
            callback(null, e);
          },
          false
        );
      }
      scriptTag.parentNode.insertBefore(object, scriptTag);
    },
    configureStripe() {
      this.stripe = window.Stripe(this.stripe_key);
      this.elements = this.stripe.elements();
      this.cardNumberElement = this.elements.create("cardNumber");
      this.cardNumberElement.mount("#card-number-element");

      this.cardExpiryElement = this.elements.create("cardExpiry");
      this.cardExpiryElement.mount("#card-expiry-element");

      this.cardCvcElement = this.elements.create("cardCvc");
      this.cardCvcElement.mount("#card-cvc-element");

      this.cardNumberElement.on("change", this.setValidationError);
      this.cardExpiryElement.on("change", this.setValidationError);
      this.cardCvcElement.on("change", this.setValidationError);
    },
    setValidationError(event) {
      this.stripeValidationError = event.error ? event.error.message : "";
    },
    setLayoutVars() {
      let header = merge(this.$navigator.layoutVars.header, {
        class: "no-style-lg-down",
        title: {
          color: "primary",
          text: this.$route.params.type === "update_card" ? "Update Card Info" : this.plan_type[this.$route.params.plan_option] + " Subscription"
        },
        toolbar: {
          icon: {
            name: "back"
          }
        }
      });
      let sidebar = merge(this.$navigator.layoutVars.sidebar, {
        icon: {
          color: "primary"
        }
      });
      this.$set(this.$navigator.layout, "header", header);
      this.$set(this.$navigator.layout, "sidebar", sidebar);
      this.$navigator.$refs.app.style.setProperty("--content-height", "100vh");
      this.$navigator.$refs.header.style.setProperty("position", "absolute");
    },
    set_plan_period(period) {
      this.plan_period = period;
    },
    update_card_info() {
      this.stripe
      .createToken(this.cardNumberElement)
      .then(response => {
        if (response.error) {
          this.stripeValidationError = response.error.message;
          console.log(this.stripeValidationError);
        } else {
          console.log(response);
          this.$store.dispatch(
            "Subscription/saveCardDetails",
            { ...response.token.card, holder_name: this.card_info.name }
          );
          this.$router.push({
            name: "subscription.details"
          });
        }
      });
    },
    show_subscription_alert() {
      let subscription_date = new Date().getDate().toString();
      let subscription_date_str = "";
      if (subscription_date.charAt(subscription_date.length - 1) == "1") {
        subscription_date_str = subscription_date + "st";
      } else if (
        subscription_date.charAt(subscription_date.length - 1) == "2"
      ) {
        subscription_date_str = subscription_date + "nd";
      } else if (
        subscription_date.charAt(subscription_date.length - 1) == "3"
      ) {
        subscription_date_str = subscription_date + "rd";
      } else {
        subscription_date_str = subscription_date + "th";
      }
      return this.$ionic.alertController
        .create({
          cssClass: "subscription_dialog",
          header: "Confirm Subscription",
          message:
            "You’ll be billed on the " +
            subscription_date_str +
            " of each month. You can cancel whenever. <br/><br/> You’re gonna have a good time!",
          buttons: [
            {
              text: "Return",
              role: "cancel",
              cssClass: "return_button",
              handler: blah => {
                console.log("Confirm Cancel:", blah);
              }
            },
            {
              text: "Continue",
              cssClass: "confirm_button",
              handler: () => {
                let vm = this;
                let makePayment = vm.$fireFunc.httpsCallable("payment-payment");
                if (this.stripeValidationError === "") {
                  this.stripe
                    .createToken(this.cardNumberElement)
                    .then(response => {
                      if (response.error) {
                        this.stripeValidationError = response.error.message;
                        console.log(this.stripeValidationError);
                      } else {
                        console.log(response);
                        makePayment({
                          amount: vm.$route.params.plan_price * 100,
                          currency: "USD",
                          source: response.token.id
                        })
                          .then(res => {
                            this.$store.dispatch(
                              "Subscription/saveSubscription",
                              {
                                plan_option: this.$route.params.plan_option,
                                plan_price: this.$route.params.plan_price,
                                plan_period: this.$route.params.plan_period,
                                date: new Date()
                              }
                            );
                            this.$store.dispatch(
                              "Subscription/saveCardDetails",
                              { ...response.token.card, holder_name: this.card_info.name }
                            );
                            this.$router.push({
                              name: "subscription_complete",
                              params: {
                                plan_option: this.$route.params.plan_option,
                                plan_price: this.$route.params.plan_price,
                                plan_period: this.$route.params.plan_period,
                                date: new Date(),
                                card_info: { ...response.token.card, holder_name: this.card_info.name }
                              }
                            });
                            console.log(res);
                          })
                          .catch(err => {
                            console.log(err);
                          });
                      }
                    });
                } else {
                  console.log(this.stripeValidationError);
                }
              }
            }
          ]
        })
        .then(a => a.present());
    }
  }
};
</script>

<style lang="scss" scoped>
.subscription_content {
  margin-top: 80px;
  margin-bottom: 80px;
  text-align: center;
  overflow: auto;
  img {
    width: 100px;
  }
  ion-row {
    width: 100%;
  }
  ion-input,
  .StripeElement {
    text-align: left;
    border: 1px solid #ddd;
    box-shadow: 1px 1px 1px #ddd;
    border-radius: 30px;
    color: black;
  }
  ion-input {
    padding: 0 5px !important;
  }
  .StripeElement {
    padding: 10px;
  }
  p {
    margin: 5px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    ion-icon {
      font-size: 20px;
    }
    span {
      font-size: 14px;
      margin-left: 2px;
      color: gray;
      letter-spacing: 0.5px;
    }
  }
}
</style>
