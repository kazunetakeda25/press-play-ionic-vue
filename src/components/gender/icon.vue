<template>
  <aspect-ratio :class="genderActiveClass">
    <ion-avatar class="gender-identity">
      <icon :name="`c-gender-${gender.identity}`"></icon>
    </ion-avatar>
  </aspect-ratio>
</template>
<script>
export default {
  props: {
    gender: {
      type: Object,
      default: function() {
        return {
          identity: "",
          expression: "",
          orientation: "",
          pronoun: ""
        };
      }
    },
    size: {
      type: Number,
      default: 40
    }
  },

  computed: {
    genderActiveClass() {
      let classes = ["gender-icon-wrapper"];
      if (this.gender.identity) {
        classes.push(this.gender.identity + "-identity");
      }
      if (this.gender.expression) {
        classes.push(this.gender.expression + "-expression");
      }
      if (this.gender.orientation) {
        classes.push(this.gender.orientation + "-orientation");
      }
      return classes.join(" ");
    }
  }
};
</script>
