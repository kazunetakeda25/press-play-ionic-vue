<template>
  <ion-icon v-bind="elementProps"></ion-icon>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    }
  },
  watch: {
    name: {
      handler: function(name) {
        let vm = this;
        if (vm.isFile === false || name.startsWith("c-") === false) {
          vm.$addIcon(name);
        }
      },
      immediate: true
    }
  },
  computed: {
    elementProps() {
      let obj = {};
      if (this.isFile) {
        obj.src = this.name;
      } else {
        obj.name = this.name;
      }
      return obj;
    },
    isFile() {
      return this.name.endsWith(".svg");
    }
  }
};
</script>
