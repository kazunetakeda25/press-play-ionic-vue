import WindowMixin from "@/mixins/window.js";
export default {
  dimensions: {
    original: 1024,
    xl: 256,
    lg: 128,
    md: 64,
    sm: 48,
    xs: 32
  },

  props: {
    images: {
      type: Object,
      default: function() {
        return {};
      }
    },
    size: {
      type: String,
      default: "md"
    },
    sizeSm: String,
    sizeMd: String,
    sizeLg: String,
    sizeXl: String
  },

  data() {
    return {
      selected: ""
    };
  },

  created() {
    this.setSize();
    this.$on("resize", function() {
      this.setSize();
    });
  },

  methods: {
    setSize() {
      let size = this.size;

      if (this.windowWidth >= 576 && this.sizeSm) {
        size = this.sizeSm;
      }
      if (this.windowWidth >= 768 && this.sizeMd) {
        size = this.sizeMd;
      }
      if (this.windowWidth >= 992 && this.sizeLg) {
        size = this.sizeLg;
      }
      if (this.windowWidth >= 1200 && this.sizeXl) {
        size = this.sizeXl;
      }

      this.selected = size;
    }
  },

  computed: {
    dimension() {
      return this.$options.dimensions[this.selected];
    },

    dimensionUnit() {
      return this.dimension + "px";
    }
  },

  mixins: [WindowMixin]
};
