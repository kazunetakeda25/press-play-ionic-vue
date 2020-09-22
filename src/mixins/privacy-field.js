export default {
  props: {
    describer: {
      type: String,
      required: true
    },
    disabledLevels: {
      type: Array,
      default: function() {
        return [];
      }
    },
    field: {
      type: Number,
      default: 3,
      required: true
    },
    maxLevel: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      value: 0
    };
  },
  created() {
    let unwatch = this.$watch(
      "field",
      function(field) {
        if (unwatch) {
          unwatch();
        } else {
          this.value = field;
        }
      },
      {
        immediate: true
      }
    );
  },
  watch: {
    value: {
      handler: function(value) {
        this.$emit("update:field", value);
      }
    },
    maxLevel: {
      handler: function(maxLevel) {
        if (maxLevel < this.value) {
          this.value = maxLevel;
        }
      },
      immediate: true
    }
  }
};
