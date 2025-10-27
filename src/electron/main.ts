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
import { sendDataToScreen } from "./services/screenService.js";

app.on("ready", async () => {
  // ------------------------------ Check what flag the exe has been called with ------------------------------ //

  const args = process.argv.slice(1);
  console.log("argv:", args);

  const hasScreenAutoUpdateFlag = args.includes("--screenAutoUpdate");

  // ------------------------------ Get what directory the app has been called from ------------------------------ //

  const launchDirectory = process.cwd();
  console.log("Current Working Dir.:", launchDirectory);

  // ------------------------------ Get the app exe path ------------------------------ //

  const exePath = app.getPath("exe");
  console.log("Executable Path:", exePath);

  // ------------------------------ Get the ini file's path, and then data from the launch directory ------------------------------ //

  const configDirPath = getConfigPath(launchDirectory);
  console.log("Config Dir Path loaded:", configDirPath);

  const config = await readConfigFromDirectory(configDirPath);

  console.log("Config loaded:", config);

  // ------------------------------ Get the last saved fuel items from local JSON storage ------------------------------ //

  const savedFuelItems: FuelItem[] = getSavedFuelItems();
  console.log("Saved Fuel Items loaded:", savedFuelItems);

  // ------------------------------ If the app has been called with a --screenAutoUpdate flag than skip windows and just send data to screen ------------------------------ //

  if (hasScreenAutoUpdateFlag) {
    const output = await sendDataToScreen(savedFuelItems, config);

    dialog.showMessageBoxSync({
      type: "info",
      title: "C++ Output",
      message: "Raw Output:",
      detail: output,
      buttons: ["OK"],
    });
    app.quit();
  } // ------------------------------ If the app was regulary opened than skip open main screen for data fuel items change and save ------------------------------ //
  else {
    console.log("screenAutoUpdate flag detected:", hasScreenAutoUpdateFlag);

    // ------------------------------ Check if regularUpdate is toggled on in local JSON storage, check if there is a task in OS schedulers, and then compare them ------------------------------ //

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

    // ------------------------------ Get the fuel names from config and fill them up with data from local storage to get CURRENT FUEL ITEMS ------------------------------ //

    const initialFuelItems: FuelItem[] = createCurrentFuelItems(
      savedFuelItems,
      config.fuelNames
    );
    console.log("Current Fuel Items:", initialFuelItems);

    // ------------------------------ Initialize window and prepare functions for Front-End ------------------------------ //

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
