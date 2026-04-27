const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  isElectron: true,
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  relaunch: () => ipcRenderer.send("app-relaunch"),
  updater: {
    check: () => ipcRenderer.invoke("updater-check"),
    download: () => ipcRenderer.invoke("updater-download"),
    quitAndInstall: () => ipcRenderer.send("updater-quit-and-install"),
    onEvent: (cb) => {
      const listener = (_e, data) => cb(data);
      ipcRenderer.on("updater-event", listener);
      return () => ipcRenderer.removeListener("updater-event", listener);
    },
  },
  diskFlows: {
    download: (url, id) => ipcRenderer.invoke("disk-flows-download", url, id),
    openFolder: () => ipcRenderer.invoke("disk-flows-open-folder"),
    showInFolder: (filePath) => ipcRenderer.invoke("disk-flows-show-in-folder", filePath),
    moveToDownloads: (filePath) => ipcRenderer.invoke("disk-flows-move-to-downloads", filePath),
    onEvent: (cb) => {
      const listener = (_e, data) => cb(data);
      ipcRenderer.on("disk-flow-event", listener);
      return () => ipcRenderer.removeListener("disk-flow-event", listener);
    },
  },
  codeStudio: {
    openInVSCode: (filename, code, language) =>
      ipcRenderer.invoke("code-studio-open-vscode", filename, code, language),
  },
});
