import { app } from "electron";
import { initiateMainWindow } from "./windows/mainWindow.js";
import { setupIPC } from "./ipc/ipcManager.js";
import { createMenu } from "./windows/menu.js";
import {
  getConfigPath,
  initiateConfigPathIfUnavailable,
  readConfigFromDirectory,
} from "./services/dataService.js";

app.on("ready", () => {
  const mainWindow = initiateMainWindow();

  initiateConfigPathIfUnavailable(mainWindow);
  const configDirPath = getConfigPath();
  //initiateConfigFileIfUnavaiable(configDirPath);

  readConfigFromDirectory(configDirPath === null ? "" : configDirPath)
    .then((config: Config) => {
      console.log("Config loaded successfully:", config);
      setupIPC(mainWindow, configDirPath, config);
    })
    .catch((error) => {
      console.error("Failed to load config:", error);
      const fallbackConfig: Config = {};
      setupIPC(mainWindow, configDirPath, fallbackConfig);
    });

  createMenu(mainWindow);
});

app.on("window-all-closed", () => {
  app.quit();
});
