<template>
  <div class="gesture-container" ref="container">
    <slot />
  </div>
</template>
<script>
import { createGesture } from "@ionic/core";
export default {
  props: {
    direction: {
      type: String,
      default: "x"
    },
    options: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  created() {
    let vm = this;
    vm.$watch(
      function() {
        return vm.direction + vm.options;
      },
      function() {
        vm.$nextTick().then(function() {
          const options = Object.assign(
            {
              el: vm.$refs.container,
              direction: vm.direction,
              canStart: ev => {
                vm.$emit("canStart", ev);
              },
              onStart: ev => {
                vm.$emit("start", ev);
              },
              onMove: ev => {
                vm.$emit("move", ev);
              },
              onEnd: ev => {
                if (vm.direction == "x") {
                  if (Math.sign(ev.deltaX) == 1) {
                    vm.$emit("left", ev);
                  } else if (Math.sign(ev.deltaX) == -1) {
                    vm.$emit("right", ev);
                  }
                }
                if (vm.direction == "y") {
                  if (Math.sign(ev.deltaY) == -1) {
                    vm.$emit("up", ev);
                  } else if (Math.sign(ev.deltaY) == 1) {
                    vm.$emit("down", ev);
                  }
                }
                vm.$emit("end", ev);
              },
              notCaptured: ev => {
                vm.$emit("notCaptured", ev);
              }
            },
            vm.options
          );
          vm.gesture = createGesture(options);
          vm.gesture.enable();
        });
      },
      {
        deep: true,
        immediate: true
      }
    );
  },
  beforeDestroy() {
    if (this.gesture) {
      this.gesture.destroy();
    }
  }
};
</script>
