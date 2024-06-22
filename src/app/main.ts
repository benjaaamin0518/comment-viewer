const path = require("path");
import { BrowserWindow, app, webFrame } from "electron";
const express = require("express");
const exp = express();
exp.listen(8080);
exp.use("/", express.static(path.join(__dirname)));
exp.get("/", (req, res) => {
  res.sendFile("index.html", {
    // ①追加
    root: path.join(__dirname, "/"),
  });
});

// 開発時には electron アプリをホットリロードする
if (process.env.NODE_ENV === "development") {
  // require("electron-reload")(__dirname, {
  //   electron: path.join(__dirname, "node_modules", ".bin", "electron"),
  // });
}

app.whenReady().then(() => {
  // アプリの起動イベント発火で BrowserWindow インスタンスを作成
  const mainWindow = new BrowserWindow({
    webPreferences: {
      // tsc or webpack が出力したプリロードスクリプトを読み込み
      preload: path.join("./preload.js"),
      nodeIntegration: true,
    },
    transparent: true,
    fullscreen: true,
    frame: false,
  });
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });
  mainWindow.setIgnoreMouseEvents(true);

  //mainWindow.webContents.openDevTools();
  // レンダラープロセスをロード
  // mainWindow.loadFile("dist/index.html");
  mainWindow.loadURL("http://localhost:8080");
});

// すべてのウィンドウが閉じられたらアプリを終了する
app.once("window-all-closed", () => app.quit());
