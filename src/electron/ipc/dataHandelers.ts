import { BrowserWindow } from "electron";
import {
  getConfigPath,
  getFuelItems,
  getLogoBase64,
  getRegularUpdateData,
  getRegularUpdateTime,
  saveFuelItems,
  selectConfigPath,
  sendRegularUpdateData,
  setConfigPathToDefault,
  setRegularUpdateTime,
  toggleRegularUpdate,
} from "../services/dataService.js";
import { ipcMainHandle, ipcMainOn } from "../utils/util.js";
import { sendDataToScreen } from "../services/screenService.js";
import {
  createScheduledTask,
  removeScheduledTask,
} from "../services/regularUpdateService.js";

export function setupDataHandelers(
  mainWindow: BrowserWindow,
  configDirPath: string | null,
  config: Config,
  launchDirectory: string,
  initialFuelItems: FuelItem[]
) {
  // ------------------------------ CONFIG PATH ------------------------------ //
  ipcMainHandle("getConfigPath", () => {
    return getConfigPath(undefined);
  });

  ipcMainHandle("selectConfigPath", () => {
    return selectConfigPath(mainWindow);
  });

  ipcMainHandle("setConfigPathToDefault", () => {
    return setConfigPathToDefault(mainWindow, launchDirectory);
  });

  // ------------------------------ CONFIG DATA ------------------------------ //

  ipcMainHandle("getLogoBase64", () => {
    return getLogoBase64(configDirPath, config.gasStationLogo);
  });

  // ------------------------------ FUEL ITEMS ------------------------------ //

  ipcMainHandle("getFuelItems", () => {
    return getFuelItems(initialFuelItems);
  });

  ipcMainOn("saveFuelItems", (fuelItems) => {
    saveFuelItems(fuelItems);
  });

  // ------------------------------ SCREEN DATA ------------------------------ //

  ipcMainOn("sendDataToScreen", (fuelItems) => {
    saveFuelItems(fuelItems);
    sendDataToScreen(fuelItems, config);
  });

  // ------------------------------ REGULAR UPDATE ------------------------------ //

  ipcMainHandle("getRegularUpdateData", () => {
    return getRegularUpdateData();
  });

  ipcMainHandle("toggleRegularUpdate", () => {
    const regularUpdateData = toggleRegularUpdate();
    const time = getRegularUpdateTime();
    if (regularUpdateData.isRegularUpdateEnabled) {
      createScheduledTask(time);
    } else {
      removeScheduledTask();
    }
    sendRegularUpdateData(regularUpdateData, mainWindow);
  });

  ipcMainOn("setRegularUpdateTime", (regularUpdateTime) => {
    const regularUpdateData = setRegularUpdateTime(regularUpdateTime);
    if (regularUpdateData.isRegularUpdateEnabled) {
      createScheduledTask(regularUpdateData.regularUpdateTime);
    }
    sendRegularUpdateData(regularUpdateData, mainWindow);
  });
}
