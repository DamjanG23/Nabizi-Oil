import { BrowserWindow } from "electron";
import { setupDataHandelers } from "./dataHandelers.js";

export function setupIPC(mainWindow: BrowserWindow) {
  setupDataHandelers(mainWindow);
}
