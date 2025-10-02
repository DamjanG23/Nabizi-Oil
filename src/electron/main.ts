import { app } from "electron";
import { initiateMainWindow } from "./windows/mainWindow.js";
import { setupIPC } from "./ipc/ipcManager.js";
import { createMenu } from "./windows/menu.js";
import {
  createCurrentFuelItems,
  getConfigPath,
  getIsRegularUpdateEnabled,
  getSavedFuelItems,
  readConfigFromDirectory,
  setIsRegularUpdateEnabled,
} from "./services/dataService.js";
import { isUpdateSchedulerActive } from "./services/regularUpdateService.js";

app.on("ready", async () => {
  const savedIsSchedulerEnabled = getIsRegularUpdateEnabled();
  console.log("savedIsSchedulerEnabled: ", savedIsSchedulerEnabled);
  const isSchedulerActive = await isUpdateSchedulerActive();
  console.log("isSchedulerActive checked: ", isSchedulerActive);

  if (savedIsSchedulerEnabled !== isSchedulerActive) {
    setIsRegularUpdateEnabled(isSchedulerActive);
    console.log(
      "regular update enabled data missaligned, changed to: ",
      isSchedulerActive,
      "\n"
    );
  }

  const launchDirectory = process.cwd();
  console.log("Current Working Dir.:", launchDirectory);

  const exePath = process.execPath;
  console.log("Executable Path:", exePath);

  const mainWindow = initiateMainWindow();

  const configDirPath = getConfigPath(launchDirectory);
  console.log("Config Dir Path loaded:", configDirPath);

  const config = await readConfigFromDirectory(configDirPath);

  console.log("Config loaded:", config);

  const savedFuelItems: FuelItem[] = getSavedFuelItems();
  console.log("Saved Fuel Items loaded:", savedFuelItems);

  const initialFuelItems: FuelItem[] = createCurrentFuelItems(
    savedFuelItems,
    config.fuelNames
  );
  console.log("Current Fuel Items:", initialFuelItems);

  createMenu(mainWindow);

  setupIPC(
    mainWindow,
    configDirPath,
    config,
    launchDirectory,
    initialFuelItems,
    exePath
  );
});

app.on("window-all-closed", () => {
  app.quit();
});
