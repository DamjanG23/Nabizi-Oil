import { app } from "electron";
import { initiateMainWindow } from "./windows/mainWindow.js";
import { setupIPC } from "./ipc/ipcManager.js";
import { createMenu } from "./windows/menu.js";
import {
  getConfigPath,
  readConfigFromDirectory,
} from "./services/dataService.js";

app.on("ready", async () => {
  const launchDirectory = process.cwd();
  console.log("Current Working Dir.:", launchDirectory);

  const mainWindow = initiateMainWindow();

  const configDirPath = getConfigPath(launchDirectory, mainWindow);
  console.log("Config Dir Path loaded:", configDirPath);

  const config = await readConfigFromDirectory(configDirPath);

  console.log("Config loaded:", config);

  setupIPC(mainWindow, configDirPath, config, launchDirectory);

  createMenu(mainWindow);
});

app.on("window-all-closed", () => {
  app.quit();
});
