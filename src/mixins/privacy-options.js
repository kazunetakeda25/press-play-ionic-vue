import orderBy from "lodash/orderBy";
export default {
  birthdateDisplay: [
    {
      title: "Full Date",
      value: 0
    },
    {
      title: "Age Only",
      value: 1
    }
  ],
  lastNameDisplay: [
    {
      title: "Full Name",
      value: 0
    },
    {
      title: "First Letter",
      value: 1
    }
  ],
  privacyLevels: [
    {
      description: "Anyone can see %s%.",
      icon: "earth",
      title: "Public",
      value: 3
    },
    {
      description: "Only other users can see %s%.",
      icon: "person",
      title: "Authenticated",
      value: 2
    },
    {
      description: "Only matched users can see %s%.",
      icon: "heart",
      title: "Matches",
      value: 1
    },
    {
      description: "You're the only one who can see %s%.",
      icon: "person-circle",
      title: "Only Me",
      value: 0
    }
  ],
  computed: {
    birthdateDisplayOptions() {
      return orderBy(this.$options.birthdateDisplay, ["value"], ["asc"]);
    },
    lastNameDisplayOptions() {
      return orderBy(this.$options.lastNameDisplay, ["value"], ["asc"]);
    },
    privacyLevelOptions() {
      return orderBy(this.$options.privacyLevels, ["value"], ["desc"]);
    }
  }
};
