import { BrowserWindow } from "electron";
import {
  createNewMatch,
  getConfig,
  getConfigPath,
  getFuelItems,
  getLogoBase64,
  getRegularUpdateData,
  getRegularUpdateTime,
  loadConfig,
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
  ipcMainHandle("getConfig", () => {
    return getConfig();
  });

  ipcMainHandle("loadConfig", () => {
    return loadConfig(mainWindow);
  });

  ipcMainOn("createNewMatch", (matchName) => {
    createNewMatch(matchName);
  });

  ipcMainHandle("getConfigPath", () => {
    return getConfigPath(undefined);
  });

  ipcMainHandle("selectConfigPath", () => {
    return selectConfigPath(mainWindow);
  });

  ipcMainHandle("setConfigPathToDefault", () => {
    return setConfigPathToDefault(mainWindow, launchDirectory);
  });

  ipcMainHandle("getLogoBase64", () => {
    return getLogoBase64(configDirPath, config.gasStationLogo);
  });

  ipcMainHandle("getFuelItems", () => {
    return getFuelItems(initialFuelItems);
  });

  ipcMainOn("sendDataToScreen", (fuelItems) => {
    saveFuelItems(fuelItems);
    sendDataToScreen(fuelItems, config);
  });

  ipcMainOn("saveFuelItems", (fuelItems) => {
    saveFuelItems(fuelItems);
  });

  // REGULAR UPDATE -----------------------------------------------

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
    sendRegularUpdateData(regularUpdateData, mainWindow);
  });
}
