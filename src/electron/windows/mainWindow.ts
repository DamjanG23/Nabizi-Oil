import { app, BrowserWindow, screen } from "electron";
import path from "path";
import { getPreloadPath } from "../utils/pathResolver.js";
import { ipcWebContentsSend, isDev } from "../utils/util.js";
import { showCloseAppDialog } from "../services/windowService.js";

export function initiateMainWindow(): BrowserWindow {
  const displays = screen.getAllDisplays();
  const primaryDisplay = displays[0];

  const mainWindow = new BrowserWindow({
    autoHideMenuBar: !isDev(),
    icon: path.join(app.getAppPath(), "desktopIcon.png"),
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  mainWindow.maximize();

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
    //mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  mainWindow.on("close", (e) => {
    showCloseAppDialog(mainWindow, e);
  });

  mainWindow.on("enter-full-screen", () => {
    ipcWebContentsSend("onMainFullscreenChange", mainWindow.webContents, true);
  });

  mainWindow.on("leave-full-screen", () => {
    ipcWebContentsSend("onMainFullscreenChange", mainWindow.webContents, false);
  });

  return mainWindow;
}
