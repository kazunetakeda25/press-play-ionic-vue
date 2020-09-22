<template>
  <span>{{ genderText }}</span>
</template>
<script>
import find from "lodash/find";
import GenderMixin from "@/mixins/gender.js";
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
    showExpression: {
      type: Boolean,
      default: true
    },
    showIdentity: {
      type: Boolean,
      default: true
    },
    showOrientation: {
      type: Boolean,
      default: true
    },
    showPronoun: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    genderText() {
      let strings = [];
      let expression = find(this.expressions, { id: this.gender.expression });
      let identity = find(this.identities, { id: this.gender.identity });
      let orientation = find(this.orientations, {
        id: this.gender.orientation
      });
      let pronoun = find(this.pronouns, { id: this.gender.pronoun });
      if (this.showOrientation && orientation && orientation.id !== "none") {
        strings.push(orientation.text);
      }
      if (this.showIdentity && identity && identity.id !== "none") {
        strings.push(identity.text);
      }
      if (this.showExpression && expression && expression.id !== "none") {
        strings.push(expression.text);
      }
      if (this.showPronoun && pronoun && pronoun.id !== "none") {
        strings.push(pronoun.text);
      }
      return strings.join(", ");
    }
  },

  mixins: [GenderMixin]
};
</script>
