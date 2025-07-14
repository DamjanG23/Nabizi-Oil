import { BrowserWindow } from "electron";
import {
  createNewMatch,
  getConfig,
  loadConfig,
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
}
