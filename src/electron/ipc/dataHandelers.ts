import { BrowserWindow } from "electron";
import { createNewMatch, getConfig } from "../services/dataService.js";
import { ipcMainHandle, ipcMainOn } from "../utils/util.js";

export function setupDataHandelers(mainWindow: BrowserWindow) {
  ipcMainHandle("getConfig", () => {
    return getConfig();
  });

  ipcMainOn("createNewMatch", (matchName) => {
    createNewMatch(matchName, mainWindow);
  });
}
