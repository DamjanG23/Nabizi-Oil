const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  // ---------------------------------------------------------------------------
  // SCORE & MATCH DATA
  // ---------------------------------------------------------------------------

  getMatchSeconds: (callback) =>
    ipcOn("getMatchSeconds", (seconds) => {
      callback(seconds);
    }),

  getScoreboardState: () => {
    return ipcInvoke("getScoreboardState");
  },

  getConfig: () => {
    return ipcInvoke("getConfig");
  },

  createNewMatch: (matchName) => {
    ipcSend("createNewMatch", matchName);
  },

  onMatchCreated: (callback) =>
    ipcOn("onMatchCreated", (currentMatch) => {
      callback(currentMatch);
    }),

  // ---------------------------------------------------------------------------
  // SCOREBOARD WINDOW MANAGEMENT
  // ---------------------------------------------------------------------------

  getIsScoreboardOpen: () => {
    return ipcInvoke("getIsScoreboardOpen");
  },

  onScoreboardWindowClosed: (callback) =>
    ipcOn("onScoreboardWindowClosed", (isClosed) => {
      callback(isClosed);
    }),

  showScoreboardWindow: () => {
    return ipcInvoke("showScoreboardWindow");
  },

  closeScoreboardWindow: () => {
    return ipcInvoke("closeScoreboardWindow");
  },

  onScoreboardWindowOpened: (callback) =>
    ipcOn("onScoreboardWindowOpened", (isOpened) => {
      callback(isOpened);
    }),

  toggleScoreboardFullscreen: () => {
    return ipcInvoke("toggleScoreboardFullscreen");
  },

  onScoreboardFullscreenChange: (callback) =>
    ipcOn("onScoreboardFullscreenChange", (isFullscreen) => {
      callback(isFullscreen);
    }),

  // ---------------------------------------------------------------------------
  // MAIN WINDOW MANAGEMENT
  // ---------------------------------------------------------------------------

  toggleMainFullscreen: () => {
    return ipcInvoke("toggleMainFullscreen");
  },

  onMainFullscreenChange: (callback) =>
    ipcOn("onMainFullscreenChange", (isFullscreen) => {
      callback(isFullscreen);
    }),
} satisfies Window["electron"]);

function ipcInvoke<Key extends keyof EventPayloadMaping>(
  key: Key
): Promise<EventPayloadMaping[Key]> {
  return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMaping>(
  key: Key,
  callback: (payload: EventPayloadMaping[Key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayloadMaping>(
  key: Key,
  payload: EventPayloadMaping[Key]
) {
  electron.ipcRenderer.send(key, payload);
}
