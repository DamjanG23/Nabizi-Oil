import { app } from "electron";
//import { getMatchSeconds } from "./services/dataService.js";
import { initiateMainWindow } from "./windows/mainWindow.js";
import { initiateScoreboardWindow } from "./windows/scoreboardWindow.js";
import { setupIPC } from "./ipc/ipcManager.js";
import { createMenu } from "./windows/menu.js";

app.on("ready", () => {
  const mainWindow = initiateMainWindow();
  const scoreboardWindow = initiateScoreboardWindow(mainWindow);

  createMenu(mainWindow);
  setupIPC(mainWindow, scoreboardWindow);

  // getMatchSeconds(mainWindow);
  // getMatchSeconds(scoreboardWindow);
});

app.on("window-all-closed", () => {
  app.quit();
});
