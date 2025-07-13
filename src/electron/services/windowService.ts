import { app, BrowserWindow, dialog } from "electron";

export function showCloseAppDialog(
  window: BrowserWindow,
  e: {
    preventDefault: () => void;
    readonly defaultPrevented: boolean;
  }
) {
  const response = dialog.showMessageBoxSync(window!, {
    type: "question",
    buttons: ["Close", "Cancel"],
    title: "Confirm Close",
    message: "Close Nabizi-Oil App?",
  });

  if (response === 0) {
    BrowserWindow.getAllWindows().forEach((window) => window.destroy());
    app.quit();
  } else {
    e.preventDefault();
  }
}
