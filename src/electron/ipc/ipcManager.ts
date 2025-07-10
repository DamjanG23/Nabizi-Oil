import { BrowserWindow } from "electron";
import { setupDataHandelers } from "./dataHandelers.js";
import { setupWindowHandlers } from "./windowHandlers.js";

export function setupIPC(
  mainWindow: BrowserWindow,
  scoreboardWindow: BrowserWindow
) {
  setupWindowHandlers(mainWindow, scoreboardWindow);
  setupDataHandelers(mainWindow);
}
