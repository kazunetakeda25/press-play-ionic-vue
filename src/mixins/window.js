import debounce from "lodash/debounce";
export default {
  data() {
    return {
      windowHeight: Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      ),
      windowWidth: Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )
    };
  },
  mounted() {
    let vm = this;
    this.$nextTick().then(function() {
      window.resizeListener = debounce(vm.onResize, 300);
      window.addEventListener("resize", window.resizeListener);
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", window.resizeListener);
  },
  methods: {
    onResize() {
      this.windowHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );
      this.windowWidth = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      this.$emit("resize", {
        windowHeight: this.windowHeight,
        windowWidth: this.windowWidth
      });
    },
    setModalDimensions(e) {
      if (this.windowWidth >= 768) {
        e.style.setProperty(
          "--max-width",
          this.windowWidth > 1440 ? "60%" : "80%"
        );
        e.style.setProperty("--max-height", "80%");
        e.style.setProperty("--width", `${this.windowWidth}px`);
        e.style.setProperty("--height", `${this.windowHeight}px`);
      } else {
        e.style.removeProperty("--max-width");
        e.style.removeProperty("--max-height");
        e.style.removeProperty("--width");
        e.style.removeProperty("--height");
      }
    }
  }
};
