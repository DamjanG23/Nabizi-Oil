import { app, BrowserWindow, Menu } from "electron";
import { isDev } from "../utils/util.js";

export function createMenu(window: BrowserWindow) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Nabizi-Oil",
        type: "submenu",
        submenu: [
          {
            label: "Close App",
            click: app.quit,
          },
        ],
      },
      {
        label: "Theme",
        type: "submenu",
        submenu: [
          {
            label: "Light",
            //click: {}
          },
          {
            label: "Dark",
            //click: {}
          },
        ],
      },
      {
        label: "DevTools",
        click: () => window.webContents.openDevTools(),
        visible: isDev(),
      },
    ])
  );
}
