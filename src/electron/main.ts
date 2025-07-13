import { app } from "electron";
import { initiateMainWindow } from "./windows/mainWindow.js";
import { setupIPC } from "./ipc/ipcManager.js";
import { createMenu } from "./windows/menu.js";

app.on("ready", () => {
  const mainWindow = initiateMainWindow();

  createMenu(mainWindow);
  setupIPC(mainWindow);
});

app.on("window-all-closed", () => {
  app.quit();
});
