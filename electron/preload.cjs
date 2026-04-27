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
    getFormats: (url) => ipcRenderer.invoke("disk-flows-get-formats", url),
    download: (url, id, formatId) => ipcRenderer.invoke("disk-flows-download", url, id, formatId),
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
    openWorkspace: () => ipcRenderer.invoke("workspace-open"),
    fsList: (dirPath) => ipcRenderer.invoke("fs-list", dirPath),
    fsRead: (filePath) => ipcRenderer.invoke("fs-read", filePath),
    fsWrite: (filePath, content) => ipcRenderer.invoke("fs-write", filePath, content),
    fsMkdir: (dirPath) => ipcRenderer.invoke("fs-mkdir", dirPath),
    fsDelete: (targetPath) => ipcRenderer.invoke("fs-delete", targetPath),
    fsRun: (cmd, args, cwd) => ipcRenderer.invoke("fs-run", cmd, args, cwd),
    onFsRunData: (runId, cb) => {
      const listener = (_e, data) => cb(data);
      ipcRenderer.on(`fs-run-data-${runId}`, listener);
      return () => ipcRenderer.removeListener(`fs-run-data-${runId}`, listener);
    },
    onFsRunExit: (runId, cb) => {
      const listener = (_e, code) => cb(code);
      ipcRenderer.on(`fs-run-exit-${runId}`, listener);
      return () => ipcRenderer.removeListener(`fs-run-exit-${runId}`, listener);
    }
  },
});
