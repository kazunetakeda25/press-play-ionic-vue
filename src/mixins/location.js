export default {
  data() {
    return {
      selected: {},
      position: {}
    };
  },
  methods: {
    getLocationText(location) {
      let text = "";
      if (Object.keys(location).length > 0) {
        text = location.text ? location.text : location.place_name;
        if (
          Object.prototype.hasOwnProperty.call(location, "place_type") &&
          location.place_type.length > 0
        ) {
          let placeType = location.place_type[0];
          switch (placeType) {
            case "postcode":
              text = `${location.context[0].text}, ${location.context[1].text}`;
              break;
            case "place":
              text = `${location.text}, ${location.context[0].text}`;
              break;
            case "address":
              text = `${location.context[1].text}, ${location.context[2].text}`;
              break;
          }
        }
      }
      return text;
    }
  },
  computed: {
    isSelected() {
      return Object.keys(this.selected).length > 0;
    },
    hasPosition() {
      return Object.keys(this.position).length > 0;
    }
  }
};
