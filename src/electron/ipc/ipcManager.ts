import { BrowserWindow } from "electron";
import { setupDataHandelers } from "./dataHandelers.js";

export function setupIPC(
  mainWindow: BrowserWindow,
  configDirPath: string | null,
  config: Config
) {
  setupDataHandelers(mainWindow, configDirPath, config);
}
