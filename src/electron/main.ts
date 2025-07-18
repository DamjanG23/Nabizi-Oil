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

  readConfigFromDirectory(configDirPath === null ? "" : configDirPath).then(
    (config: Config) => {
      console.log(config);
      setupIPC(mainWindow, configDirPath, config);
    }
  );

  createMenu(mainWindow);
});

app.on("window-all-closed", () => {
  app.quit();
});
