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
    message: "Close ScoreTable App?",
  });

  if (response === 0) {
    BrowserWindow.getAllWindows().forEach((window) => window.destroy());
    app.quit();
  } else {
    e.preventDefault();
  }
}

export function showCloseWindowDialog(window: BrowserWindow): boolean {
  const response = dialog.showMessageBoxSync(window!, {
    type: "question",
    buttons: ["Close", "Cancel"],
    title: "Confirm Close",
    message: "Close Window?",
  });

  if (response === 0) {
    return true;
  } else {
    return false;
  }
}

export function getIsScoreboardOpen(scoreboardWindow: BrowserWindow): boolean {
  return scoreboardWindow.isVisible();
}

export function showScoreboardWindow(scoreboardWindow: BrowserWindow): boolean {
  scoreboardWindow.show();
  return true;
}

export function closeScoreboardWindow(
  scoreboardWindow: BrowserWindow
): boolean {
  scoreboardWindow.close();
  return true;
}

export function toggleScoreboardFullscreen(
  scoreboardWindow: BrowserWindow
): boolean {
  const currentState = scoreboardWindow.isFullScreen();
  scoreboardWindow.setFullScreen(!currentState);
  return !currentState;
}

export function toggleMainFullscreen(mainWindow: BrowserWindow): boolean {
  const currentState = mainWindow.isFullScreen();
  mainWindow.setFullScreen(!currentState);
  return !currentState;
}
