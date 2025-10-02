import { app, dialog } from "electron";
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
// import { sendDataToScreen } from "./services/screenService.js";

app.on("ready", async () => {
  const args = process.argv.slice(1);
  console.log("argv:", args);
  const hasScreenAutoUpdateFlag = args.includes("--screenAutoUpdate");

  const launchDirectory = process.cwd();
  console.log("Current Working Dir.:", launchDirectory);

  const exePath = app.getPath("exe");
  console.log("Executable Path:", exePath);

  const configDirPath = getConfigPath(launchDirectory);
  console.log("Config Dir Path loaded:", configDirPath);

  const config = await readConfigFromDirectory(configDirPath);

  console.log("Config loaded:", config);

  const savedFuelItems: FuelItem[] = getSavedFuelItems();
  console.log("Saved Fuel Items loaded:", savedFuelItems);

  if (hasScreenAutoUpdateFlag) {
    //TODO: call the screen update function
    //sendDataToScreen(savedFuelItems, config);
    dialog.showMessageBoxSync({
      type: "info",
      title: "Screen Auto Update",
      message: "App started with --screenAutoUpdate flag!",
      buttons: ["OK"],
    });
    app.quit();
  } else {
    console.log("screenAutoUpdate flag detected:", hasScreenAutoUpdateFlag);

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

    const initialFuelItems: FuelItem[] = createCurrentFuelItems(
      savedFuelItems,
      config.fuelNames
    );
    console.log("Current Fuel Items:", initialFuelItems);

    const mainWindow = initiateMainWindow();
    createMenu(mainWindow);

    setupIPC(
      mainWindow,
      configDirPath,
      config,
      launchDirectory,
      initialFuelItems
    );
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
