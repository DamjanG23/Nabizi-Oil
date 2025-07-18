import { BrowserWindow } from "electron";
import {
  createNewMatch,
  getConfig,
  getConfigPath,
  loadConfig,
  selectConfigPath,
  setConfigPathToDefault,
} from "../services/dataService.js";
import { ipcMainHandle, ipcMainOn } from "../utils/util.js";

export function setupDataHandelers(mainWindow: BrowserWindow) {
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
}
