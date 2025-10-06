const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  // ------------------------------ CONFIG PATH ------------------------------ //
  getConfigPath: () => {
    return ipcInvoke("getConfigPath");
  },

  selectConfigPath: () => {
    return ipcInvoke("selectConfigPath");
  },

  onConfigPathChanged: (callback) =>
    ipcOn("onConfigPathChanged", (configPath) => {
      callback(configPath);
    }),

  setConfigPathToDefault: () => {
    return ipcInvoke("setConfigPathToDefault");
  },

  // ------------------------------ CONFIG DATA ------------------------------ //

  getLogoBase64: () => {
    return ipcInvoke("getLogoBase64");
  },

  // ------------------------------ FUEL ITEMS ------------------------------ //

  getFuelItems: () => {
    return ipcInvoke("getFuelItems");
  },

  saveFuelItems: (fuelItems) => {
    ipcSend("saveFuelItems", fuelItems);
  },

  // ------------------------------ SCREEN DATA ------------------------------ //

  sendDataToScreen: (fuelItems) => {
    ipcSend("sendDataToScreen", fuelItems);
  },

  // ------------- REGULAR UPDATE ----------------------

  regularUpdateData: (callback) =>
    ipcOn("regularUpdateData", (regularUpdateData) => {
      callback(regularUpdateData);
    }),

  getRegularUpdateData: () => {
    return ipcInvoke("getRegularUpdateData");
  },

  toggleRegularUpdate: () => {
    return ipcInvoke("toggleRegularUpdate");
  },

  setRegularUpdateTime: (regularUpdateTime) => {
    ipcSend("setRegularUpdateTime", regularUpdateTime);
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
