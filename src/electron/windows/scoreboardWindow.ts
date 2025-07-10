import { app, BrowserWindow, screen } from "electron";
import path from "path";
import { getPreloadPath } from "../utils/pathResolver.js";
import { ipcWebContentsSend, isDev } from "../utils/util.js";
import { showCloseWindowDialog } from "../services/windowService.js";

export function initiateScoreboardWindow(
  mainWindow: BrowserWindow
): BrowserWindow {
  const displays = screen.getAllDisplays();
  const initialSecondaryDisplay =
    displays.length > 1 ? displays[1] : displays[0];

  const scoreboardWindow = new BrowserWindow({
    show: displays.length > 1 || isDev(),
    autoHideMenuBar: true,
    icon: path.join(app.getAppPath(), "desktopIcon.png"),
    x: initialSecondaryDisplay.bounds.x,
    y: initialSecondaryDisplay.bounds.y,
    fullscreen: displays.length > 1 ? true : false,
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    scoreboardWindow.loadURL("http://localhost:5123/#/scoreboard");
    //scoreboardWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(app.getAppPath(), "/dist-react/index.html");
    scoreboardWindow.loadURL(
      `file://${indexPath.replace(/\\/g, "/")}#/scoreboard`
    );
  }

  scoreboardWindow.on("close", (event) => {
    event.preventDefault();
    if (showCloseWindowDialog(scoreboardWindow)) {
      scoreboardWindow.hide();
      ipcWebContentsSend(
        "onScoreboardWindowClosed",
        mainWindow.webContents,
        true
      );
    }
  });

  scoreboardWindow.on("show", () => {
    ipcWebContentsSend(
      "onScoreboardWindowOpened",
      mainWindow.webContents,
      true
    );
  });

  scoreboardWindow.on("enter-full-screen", () => {
    ipcWebContentsSend(
      "onScoreboardFullscreenChange",
      mainWindow.webContents,
      true
    );
  });

  scoreboardWindow.on("leave-full-screen", () => {
    ipcWebContentsSend(
      "onScoreboardFullscreenChange",
      mainWindow.webContents,
      false
    );
  });

  return scoreboardWindow;
}
