import { BrowserWindow } from "electron";
import { ipcWebContentsSend } from "../utils/util.js";

export function getConfig() {
  const config = "match config 123";
  return { config };
}

export function createNewMatch(matchName: string, window: BrowserWindow) {
  const newMatch: Match = { matchName: matchName };

  console.log("Match ?saved? on back end:", newMatch);

  ipcWebContentsSend("onMatchCreated", window.webContents, newMatch);
}

export function loadConfig(window: BrowserWindow): void {
  const config: Config = { gasStationLogo: "nabizilogo.png" };
  console.log("Demo config loaded..." + JSON.stringify(config, null, 2));

  const demoFuelList: FuelItem[] = [
    { id: 1, name: "Gasoline", price: 3.45 },
    { id: 2, name: "Diesel", price: 3.89 },
    { id: 3, name: "Premium", price: 3.75 },
    { id: 4, name: "E85", price: 2.95 },
    { id: 5, name: "Kerosene", price: 4.2 },
    { id: 6, name: "Gasoline", price: 3.45 },
    { id: 7, name: "Diesel", price: 3.89 },
    { id: 8, name: "Premium", price: 3.75 },
    { id: 9, name: "E85", price: 2.95 },
    { id: 10, name: "Kerosene", price: 4.2 },
  ];

  ipcWebContentsSend("onFuelItemsLoaded", window.webContents, demoFuelList);
}
