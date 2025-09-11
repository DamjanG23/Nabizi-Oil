import { app } from "electron";
import { initiateMainWindow } from "./windows/mainWindow.js";
import { setupIPC } from "./ipc/ipcManager.js";
import { createMenu } from "./windows/menu.js";
import {
  createCurrentFuelItems,
  getConfigPath,
  getSavedFuelItems,
  readConfigFromDirectory,
} from "./services/dataService.js";

app.on("ready", async () => {
  const launchDirectory = process.cwd();
  console.log("Current Working Dir.:", launchDirectory);

  const mainWindow = initiateMainWindow();

  const configDirPath = getConfigPath(launchDirectory);
  console.log("Config Dir Path loaded:", configDirPath);

  const config = await readConfigFromDirectory(configDirPath);

  console.log("Config loaded:", config);

  const savedFuelItems: FuelItem[] = getSavedFuelItems();
  console.log("Saved Fuel Items loaded:", savedFuelItems);

  const currentFuelItems: FuelItem[] = createCurrentFuelItems(
    savedFuelItems,
    config.fuelNames
  );
  console.log("Current Fuel Items:", currentFuelItems);

  createMenu(mainWindow);

  setupIPC(mainWindow, configDirPath, config, launchDirectory);
});

app.on("window-all-closed", () => {
  app.quit();
});
