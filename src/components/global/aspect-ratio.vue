<template>
  <div class="aspect-ratio" :style="componentStyle">
    <div class="aspect-ratio-inner" :style="innerStyle">
      <div class="aspect-ratio-content">
        <slot />
      </div>
    </div>
  </div>
</template>
<script>
import WindowMixin from "@/mixins/window.js";
export default {
  props: {
    ratio: {
      type: String,
      default: "1:1"
    },
    ratioSm: String,
    ratioMd: String,
    ratioLg: String,
    ratioXl: String,
    width: String
  },

  data() {
    return {
      w: null, // width of the aspect ratio
      h: null // height of the aspect ratio
    };
  },

  created() {
    this.setDimensions();
    this.$on("resize", function() {
      this.setDimensions();
    });
  },

  methods: {
    setDimensions() {
      let dimensions = this.ratioParser(this.ratio);

      if (this.windowWidth >= 576 && this.ratioSm) {
        dimensions = this.ratioParser(this.ratioSm);
      }
      if (this.windowWidth >= 768 && this.ratioMd) {
        dimensions = this.ratioParser(this.ratioMd);
      }
      if (this.windowWidth >= 992 && this.ratioLg) {
        dimensions = this.ratioParser(this.ratioLg);
      }
      if (this.windowWidth >= 1200 && this.ratioXl) {
        dimensions = this.ratioParser(this.ratioXl);
      }

      this.w = dimensions[0];
      this.h = dimensions[1];
    },

    ratioValidator(v) {
      let [w, h] = v.split(":").map(v => parseInt(v));
      return !Number.isNaN(w) && !Number.isNaN(h);
    },

    ratioParser(ratio) {
      return ratio.split(":").map(v => parseInt(v));
    }
  },

  computed: {
    componentStyle() {
      return this.width ? { width: this.width } : {};
    },

    innerStyle() {
      return {
        paddingTop: (this.h / this.w) * 100 + "%"
      };
    }
  },

  mixins: [WindowMixin]
};
</script>
<style lang="scss">
.aspect-ratio-inner {
  position: relative;
}
.aspect-ratio-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.aspect-ratio-inner,
.aspect-ratio-content {
  align-items: inherit;
  justify-content: inherit;
}
</style>
