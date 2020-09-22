<template>
  <ion-page>
    <ion-content fullscreen>
      <div class="background">
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
        <h2>rock on!</h2>
        <p>you're in - let's get jammin'</p>
      </div>
      <img src="../../assets/images/footer_back.png" class="footer_back" />
      <ion-row
        class="buttons_container ion-align-items-center ion-justify-content-between"
      >
        <h4 v-if="$route.params.plan_option !== 0" @click="create_invoice()">View Receipt</h4>
        <h4 v-if="$route.params.plan_option === 0" style="opacity: 0">View Receipt</h4>
        <ion-button class="bright-horizontal-gradient" @click="goToPlay">
          Play
        </ion-button>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script>
import merge from "lodash/merge";
import jsPDF from "jspdf";
export default {
  data() {
    return {
      subscription_plan: ["GA", "VIP", "RockStar"]
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
    },
    goToPlay() {
      this.$router.push({ name: "songstory" });
    },
    create_invoice() {
      const doc = new jsPDF();
      const selected_subscription = { 
        plan_option: this.$route.params.plan_option,
        plan_price: this.$route.params.plan_price,
        plan_period: this.$route.params.plan_period,
        date: this.$route.params.date
      }
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
      doc.text(this.$route.params.card_info.brand + ' ending in ' + this.$route.params.card_info.last4, 15, 91);
      doc.text((selected_subscription.date.getMonth() + 1) + '.' + selected_subscription.date.getDate() + '.' + selected_subscription.date.getFullYear(), 192, 61, 'right');
      
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
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  text-align: center;
  img {
    width: 200px;
    margin-top: 50px;
  }
  h2 {
    margin-top: 30px;
    margin-bottom: 0;
    font-size: 29px;
    font-weight: bold;
    color: #fff;
  }
  p {
    margin: 5px 0;
    font-size: 16px;
    font-weight: bold;
    color: #f2c94c;
  }
}
.footer_back {
  position: absolute;
  bottom: 63px;
}
.buttons_container {
  position: absolute;
  bottom: 75px;
  width: 100%;
  padding: 0 30px;
  h4 {
    margin: 0;
    color: var(--ion-color-primary);
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  ion-button {
    text-transform: uppercase;
  }
}
</style>
