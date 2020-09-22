module.exports = {
  pwa: {
    name: "PressPlay",
    themeColor: "#ffffff",
    msTileColor: "#603cba"
  },
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = "PressPlay";
      args[0].description =
        "An app that connects you with people through the universal languages of music, love, and friendship.";
      return args;
    });
  }
};
