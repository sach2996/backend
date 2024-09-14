const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.js",
  output: {
    // eslint-disable-next-line no-undef
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "final.js",
  },
  target: "node",
};
