import { BrowserWindow } from "electron";
import { setupDataHandelers } from "./dataHandelers.js";

export function setupIPC(
  mainWindow: BrowserWindow,
  configDirPath: string,
  config: Config,
  launchDirectory: string,
  initialFuelItems: FuelItem[]
) {
  setupDataHandelers(
    mainWindow,
    configDirPath,
    config,
    launchDirectory,
    initialFuelItems
  );
}
