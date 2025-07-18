import { BrowserWindow } from "electron";
import {
  createNewMatch,
  getConfig,
  getConfigPath,
  getFuelItems,
  getLogoBase64,
  loadConfig,
  selectConfigPath,
  setConfigPathToDefault,
} from "../services/dataService.js";
import { ipcMainHandle, ipcMainOn } from "../utils/util.js";

export function setupDataHandelers(
  mainWindow: BrowserWindow,
  configDirPath: string | null,
  config: Config
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
    return getConfigPath();
  });

  ipcMainHandle("selectConfigPath", () => {
    return selectConfigPath(mainWindow);
  });

  ipcMainHandle("setConfigPathToDefault", () => {
    return setConfigPathToDefault(mainWindow);
  });

  ipcMainHandle("getLogoBase64", () => {
    return getLogoBase64(configDirPath, config.gasStationLogo);
  });

  ipcMainHandle("getFuelItems", () => {
    return getFuelItems(config);
  });
}
