import { BrowserWindow } from "electron";
import {
  closeScoreboardWindow,
  getIsScoreboardOpen,
  showScoreboardWindow,
  toggleMainFullscreen,
  toggleScoreboardFullscreen,
} from "../services/windowService.js";
import { ipcMainHandle } from "../utils/util.js";

export function setupWindowHandlers(
  mainWindow: BrowserWindow,
  scoreboardWindow: BrowserWindow
) {
  ipcMainHandle("getIsScoreboardOpen", () => {
    return getIsScoreboardOpen(scoreboardWindow);
  });

  ipcMainHandle("showScoreboardWindow", () => {
    return showScoreboardWindow(scoreboardWindow);
  });

  ipcMainHandle("closeScoreboardWindow", () => {
    return closeScoreboardWindow(scoreboardWindow);
  });

  ipcMainHandle("toggleScoreboardFullscreen", () => {
    return toggleScoreboardFullscreen(scoreboardWindow);
  });

  ipcMainHandle("toggleMainFullscreen", () => {
    return toggleMainFullscreen(mainWindow);
  });
}
