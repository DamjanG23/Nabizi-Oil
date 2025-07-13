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
