const path = require("path");
const Dotenv = require("dotenv-webpack");
const CopyFilePlugin = require("copy-webpack-plugin");

// 開発者モードか否かで処理を分岐する
const isDev = process.env.NODE_ENV === "development";
// 共通設定
const common = {
  // モード切替
  mode: isDev ? "development" : "production",
  // モジュール解決に参照するファイル拡張子
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  /**
   * macOS でビルドに失敗する場合のワークアラウンド
   * https://github.com/yan-foto/electron-reload/issues/71
   */
  externals: ["fsevents"],
  // 出力先：デフォルトは 'dist'
  module: {
    // ファイル種別ごとのコンパイル & バンドルのルール
    rules: [
      {
        /**
         * 拡張子 '.ts' または '.tsx' （正規表現）のファイルを 'ts-loader' で処理
         * ただし node_modules ディレクトリは除外する
         */
        test: /\.ts$|\.tsx$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [
    // CSS を JS へバンドルせず別ファイルとして出力するプラグイン
    new Dotenv(),
  ],
  // 開発時には watch モードでファイルの変化を監視する
  watch: isDev,
  /**
   * development モードではソースマップを付ける
   *
   * なお、開発時のレンダラープロセスではソースマップがないと
   * electron のデベロッパーコンソールに 'Uncaught EvalError' が
   * 表示されてしまうことに注意
   */
  devtool: isDev ? "source-map" : undefined,
  node: {
    __dirname: false,
  },
};

// メインプロセス向け設定
const main = {
  // 共通設定を読み込み
  ...common,
  target: "electron-main",
  // エントリーファイル（チャンク名の 'main.js' として出力される）
  entry: {
    main: "./src/app/main.ts",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist/"),
  },
  plugins: [
    // CSS を JS へバンドルせず別ファイルとして出力するプラグイン
    new Dotenv(),
  ],
  node: {
    __dirname: false,
  },
};

// プリロードスクリプト向け設定
const preload = {
  ...common,
  target: "electron-preload",
  entry: {
    preload: "./src/app/preload.ts",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist/"),
  },
  plugins: [
    // CSS を JS へバンドルせず別ファイルとして出力するプラグイン
    new Dotenv(),
  ],
  node: {
    __dirname: false,
  },
};

// レンダラープロセス向け設定
const renderer = {
  ...common,
  // セキュリティ対策として 'electron-renderer' ターゲットは使用しない
  target: "web",
  entry: {
    // React アプリのエントリーファイル
    app: "./src/app/index.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist/"),
  },
  plugins: [
    // CSS を JS へバンドルせず別ファイルとして出力するプラグイン
    new Dotenv(),
    new CopyFilePlugin({
      patterns: [
        {
          context: path.resolve(__dirname, "./"),
          from: path.resolve(__dirname, "public/app"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
  ],
  node: {
    __dirname: false,
  },
};

module.exports = [main, preload, renderer];
