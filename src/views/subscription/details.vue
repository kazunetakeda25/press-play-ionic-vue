<template>
  <ion-page>
    <ion-content fullscreen>
      <div class="background">
        <img src="../../assets/images/footer_back.png" class="footer_back" />
      </div>
      <div
        class="subscription_details_content"
        v-if="!subscriptions || subscriptions.length == 0"
      >
        <p class="no_subscription">You have not made any subscriptions.</p>
        <ion-row
          class="buttons_container ion-align-items-center ion-justify-content-between"
        >
          <ion-col size="12" size-md="6">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              @click="change_subscription_plan"
            >
              Make Subscription
            </ion-button>
          </ion-col>
        </ion-row>
      </div>
      <div
        class="subscription_details_content"
        v-if="subscriptions && subscriptions.length > 0"
      >
        <ion-row class="subscription_card">
          <img
            src="../../assets/images/ga-ticket.png"
            v-if="current_subscription.plan_option === 0"
          />
          <img
            src="../../assets/images/vip-badge.png"
            v-if="current_subscription.plan_option === 1"
          />
          <img
            src="../../assets/images/rock-star.png"
            v-if="current_subscription.plan_option === 2"
          />
          <div class="subscription_card_content">
            <h1>
              {{
                current_subscription.plan_option === 0
                  ? "GA "
                  : current_subscription.plan_option === 1
                  ? "VIP "
                  : "RockStar "
              }}
              Member
            </h1>
            <h3>
              Renews
              {{
                new Date(current_subscription.date.seconds * 1000).getMonth() +
                  1
              }}.{{
                new Date(current_subscription.date.seconds * 1000).getDate()
              }}.{{
                new Date(current_subscription.date.seconds * 1000).getFullYear()
              }}
            </h3>
            <ion-row>
              <ion-col size="6">2/3</ion-col>
              <ion-col size="6">2/5</ion-col>
              <ion-col size="6">8/10</ion-col>
              <ion-col size="6">11/60</ion-col>
            </ion-row>
          </div>
        </ion-row>
        <ion-row class="gift_subscription">
          <img src="../../assets/images/md-gift.png" />
          <span>gift subscription</span>
        </ion-row>
        <div class="payment_info">
          <h3>Payment Info</h3>
          <ion-row class="ion-justify-content-between payment_info_content">
            <h2>Visa ...{{ card_details.last4 }}</h2>
            <p @click="update_card_info">update</p>
          </ion-row>
        </div>
        <div class="billing_history">
          <h3>Billing History</h3>
          <div class="subscriptions_history">
            <ion-row
              v-for="(plan, index) in subscriptions_list"
              v-bind:key="index"
            >
              <h4>
                {{ new Date(plan.date.seconds * 1000).getMonth() + 1 }}.{{
                  new Date(plan.date.seconds * 1000).getDate()
                }}.{{
                  new Date(plan.date.seconds * 1000)
                    .getFullYear()
                    .toString()
                    .substring(2)
                }}
              </h4>
              <h5>
                {{ subscription_plan[plan.plan_option] }}
                Subscription
                {{ plan.plan_option === 0 ? "Free" : plan.plan_price }}
              </h5>
              <p v-if="plan.plan_option !== 0" @click="create_invoice(index)">View</p>
              <p v-if="plan.plan_option === 0" style="opacity: 0">View</p>
            </ion-row>
          </div>
          <h2 v-if="subscriptions.length > 3" @click="view_more_history">
            {{ show_all ? "View less" : "View more" }}
          </h2>
        </div>
        <ion-row
          class="buttons_container ion-align-items-center ion-justify-content-between"
        >
          <ion-col size="12" size-md="6">
            <ion-button
              class="bright-horizontal-gradient"
              expand="block"
              size="large"
              @click="change_subscription_plan"
            >
              Change Subscription
            </ion-button>
          </ion-col>
        </ion-row>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import merge from "lodash/merge";
import jsPDF from "jspdf";
export default {
  data() {
    return {
      subscriptions: [],
      subscriptions_list: [],
      card_details: {},
      show_all: false,
      subscription_plan: ["GA", "VIP", "RockStar"]
    };
  },
  computed: {
    current_subscription: {
      get() {
        return this.subscriptions && this.subscriptions.length > 0
          ? this.subscriptions[this.subscriptions.length - 1]
          : {};
      }
    }
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
    this.$store.dispatch("Subscription/getSubscription").then(res => {
      this.subscriptions = res.subscriptions.reverse();
      this.subscriptions_list = this.subscriptions.slice(0, 3);
      this.card_details = res.card;
    });
  },
  methods: {
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
    },
    create_invoice(index) {
      const doc = new jsPDF();
      const selected_subscription = this.subscriptions_list[index];
      const selected_plan_date = new Date(selected_subscription.date.seconds * 1000);
      console.log(selected_subscription);
      doc.setFontSize(25);
      doc.setTextColor(30, 30, 30);
      doc.text("PressPlay", 10, 25);
      doc.setFontSize(30);
      doc.text("INVOICE", 200, 25, 'right');

      doc.setFontSize(16);
      doc.text("[Street Address]", 10, 40);
      doc.text("[City State Zipcode]", 10, 50);
      
      doc.setFillColor(0, 150, 200);
      doc.rect(10, 73, 90, 10, 'F');
      doc.rect(110, 43, 90, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Bill To', 15, 80);
      doc.text("Invoice Date", 192, 50, 'right');
      
      doc.setTextColor(30, 30, 30);
      doc.text(this.card_details.brand + ' ending in ' + this.card_details.last4, 15, 91);
      doc.text((selected_plan_date.getMonth() + 1) + '.' + selected_plan_date.getDate() + '.' + selected_plan_date.getFullYear(), 192, 61, 'right');
      
      doc.setFillColor(0, 150, 200);
      doc.rect(110, 73, 90, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("Amount", 140, 80, 'right');
      doc.text("Method", 192, 80, 'right');
      
      doc.setTextColor(30, 30, 30);
      doc.text('$' + selected_subscription.plan_price, 140, 91, 'right');
      doc.text('Pay with Card', 192, 91, 'right');
      
      doc.setFillColor(0, 150, 200);
      doc.rect(10, 110, 190, 10, 'F');

      doc.setTextColor(255, 255, 255);
      doc.text('Description', 15, 117);
      doc.text('Type', 140, 117, 'right');
      doc.text('Price', 192, 117, 'right');

      doc.setTextColor(30, 30, 30);
      doc.text(this.subscription_plan[selected_subscription.plan_option] + ' Subscription', 15, 128);
      doc.text(selected_subscription.plan_period.charAt(0).toUpperCase() + selected_subscription.plan_period.slice(1), 140, 128, 'right');
      doc.text('$' + selected_subscription.plan_price, 192, 128, 'right');
      doc.text('Total', 140, 150, 'right');
      doc.text('$' + selected_subscription.plan_price, 192, 150, 'right');

      let string = doc.output("datauristring");
      let embed = "<embed width='100%' height='100%' src='" + string + "'/>";
      let x = window.open();
      x.document.open();
      x.document.write(embed);
      x.document.close();
    },
    update_card_info() {
      this.$router.push({
        name: "subscription_payment",
        params: { type: "update_card" }
      });
    },
    view_more_history() {
      if (this.show_all === false) {
        this.show_all = true;
        this.subscriptions_list = this.subscriptions;
      } else {
        this.show_all = false;
        this.subscriptions_list = this.subscriptions.slice(0, 3);
      }
    },
    change_subscription_plan() {
      this.$router.push({
        name: "subscription",
        params: {
          plan_option: this.current_subscription.plan_option
        }
      });
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
  height: 30%;
  position: absolute;
  z-index: 0;
  .footer_back {
    position: absolute;
    bottom: 0;
    z-index: 2;
  }
}
.subscription_details_content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99;
  .no_subscription {
    font-size: 20px;
  }
}
.subscription_card {
  background: linear-gradient(
    171.01deg,
    #471b74 0.36%,
    #5d148c 56.93%,
    #aa2986 100%
  );
  box-shadow: 0px 0px 8px #9b51e0;
  border-radius: 23px;
  width: 90%;
  left: 5%;
  z-index: 99;
  align-items: center;
  padding: 16px;
  img {
    width: 100px;
  }
  .subscription_card_content {
    margin-left: 16px;
    width: calc(100% - 116px);
    h1 {
      color: white;
      font-size: 30px;
      margin: 0;
      font-weight: bold;
    }
    h3 {
      color: #f5de79;
      font-size: 15px;
      margin: 0;
    }
    ion-row {
      margin-top: 10px;
      color: white;
    }
  }
}
.gift_subscription {
  align-items: center;
  margin: 0 5%;
  justify-content: flex-end;
  z-index: 99;
  width: 90%;
  img {
    margin-right: 5px;
  }
  span {
    color: #f2c94c;
    letter-spacing: 0.08em;
  }
}
.payment_info {
  padding: 0 5%;
  width: 100%;
  z-index: 99;
  h3 {
    font-size: 16px;
    color: #333333;
    margin-bottom: 0;
  }
  .payment_info_content {
    border-bottom: 1px solid rgba(0, 0, 0, 0.13);
    h2 {
      font-size: 15px;
      color: #4f4f4f;
    }
    p {
      font-size: 16px;
      letter-spacing: 0.08em;
      color: #e49062;
    }
  }
}
.billing_history {
  padding: 0 5%;
  width: 100%;
  h3 {
    font-size: 16px;
    color: #333333;
    margin-bottom: 0;
  }
  h2 {
    font-size: 16px;
    font-weight: bold;
    color: #5d148c;
    text-align: center;
  }
  .subscriptions_history {
    overflow-y: auto;
    height: 165px;
  }
  ion-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.13);
    justify-content: space-between;
    align-items: center;
    h4 {
      font-size: 20px;
      color: #bdbdbd;
    }
    h5 {
      font-size: 15px;
      color: #4f4f4f;
      font-weight: bold;
    }
    p {
      font-size: 16px;
      letter-spacing: 0.08em;
      font-weight: bold;
      color: #5d148c;
    }
  }
}
.buttons_container {
  width: 100%;
}
</style>
