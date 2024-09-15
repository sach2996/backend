const path = require("path");

module.exports = {
  mode: "production", // Change to 'development' for development builds
  entry: "./api/index.js", // Replace with your entry point
  output: {
    filename: "[name].js",
    // eslint-disable-next-line no-undef
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    clean: true,
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node modules/,
        loader: "babel-loader",
      },
    ],
  },
};
