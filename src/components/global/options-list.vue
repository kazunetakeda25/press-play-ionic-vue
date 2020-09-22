<template>
  <ion-list lines="none">
    <ion-item
      v-for="(option, index) in options"
      :key="index"
      button
      :color="isActive(option.value) ? 'light' : ''"
      :detail="false"
      @click.prevent="selected = option.value"
    >
      <ion-label>{{ option.text }}</ion-label>
    </ion-item>
  </ion-list>
</template>
<script>
export default {
  props: {
    options: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selected: ""
    };
  },
  watch: {
    selected: {
      handler: function(value) {
        this.$emit("optionListSelect", value);
      }
    }
  },
  methods: {
    isActive(value) {
      return this.selected === value;
    }
  }
};
</script>
