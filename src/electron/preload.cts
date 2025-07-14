const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
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

  // REAL FUNCTIONS ----------------------------------------------------------

  onFuelItemsLoaded: (callback) =>
    ipcOn("onFuelItemsLoaded", (fuelItems) => {
      callback(fuelItems);
    }),

  loadConfig: () => {
    return ipcInvoke("loadConfig");
  },
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
