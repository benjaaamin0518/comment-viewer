const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const Dotenv = require("dotenv-webpack");
const mode =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const isDev = process.env.NODE_ENV === "development";
module.exports = {
  mode: mode,
  devtool: mode === "production" ? false : "inline-source-map",
  entry: {
    app: "./src/web/index.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./public/web/assets/js/"),
  },
  module: {
    rules: [
      {
        test: /\.ts$|\.tsx$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src/ts"),
    },
    extensions: [".ts", ".tsx", ".js"],
  },
  devServer: {
    open: false,
    contentBase: path.resolve(__dirname, "./public/web"),
    watchContentBase: true,
    historyApiFallback: true,
    writeToDisk: true,
  },
  optimization:
    mode === "production"
      ? {
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                ecma: 6,
                compress: {
                  warnings: false,
                  drop_console: true,
                },
              },
            }),
          ],
        }
      : {},
  plugins:
    mode === "production"
      ? [
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: path.join(__dirname, "./analyzer/report.html"),
          }),
          new Dotenv(),
        ]
      : [new Dotenv()],
};
