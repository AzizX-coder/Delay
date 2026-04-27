const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const { spawn } = require("child_process");

let mainWindow;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    frame: false,
    backgroundColor: "#161618",
    icon: path.join(__dirname, process.env.VITE_DEV_SERVER_URL ? "../public/logo.ico" : "../dist/logo.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (!process.env.VITE_DEV_SERVER_URL) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch(() => {});
      }, 3000);
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on("window-close", () => mainWindow?.close());

ipcMain.handle("get-app-version", () => app.getVersion());

ipcMain.handle("updater-check", async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { ok: true, updateInfo: result?.updateInfo ?? null };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("updater-download", async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.on("updater-quit-and-install", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on("app-relaunch", () => {
  app.relaunch();
  app.exit(0);
});

// ── Disk Flows: yt-dlp download ──
ipcMain.handle("disk-flows-download", async (_event, url, downloadId) => {
  const videosDir = path.join(app.getPath("videos"), "Delay");
  const fs = require("fs");
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

  return new Promise((resolve) => {
    const outputTemplate = path.join(videosDir, "%(title)s.%(ext)s");
    const proc = spawn("yt-dlp", [
      "--progress",
      "--newline",
      "-o", outputTemplate,
      url,
    ]);

    let lastTitle = "";
    proc.stdout.on("data", (data) => {
      const line = data.toString();
      // Parse progress
      const progressMatch = line.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
        const percent = parseFloat(progressMatch[1]);
        sendDiskFlowEvent("progress", { id: downloadId, progress: Math.round(percent) });
      }
      // Parse title
      const titleMatch = line.match(/\[download\] Destination: (.+)/);
      if (titleMatch) lastTitle = path.basename(titleMatch[1]);
    });

    proc.stderr.on("data", (data) => {
      const errLine = data.toString();
      if (errLine.includes("ERROR")) {
        sendDiskFlowEvent("error", { id: downloadId, error: errLine.trim() });
      }
    });

    proc.on("close", (code) => {
      if (code === 0) {
        sendDiskFlowEvent("completed", {
          id: downloadId,
          title: lastTitle || "Downloaded",
          file_path: videosDir,
        });
        resolve({ ok: true });
      } else {
        sendDiskFlowEvent("error", { id: downloadId, error: `yt-dlp exited with code ${code}` });
        resolve({ ok: false });
      }
    });

    proc.on("error", (err) => {
      sendDiskFlowEvent("error", {
        id: downloadId,
        error: `yt-dlp not found. Install it: pip install yt-dlp`,
      });
      resolve({ ok: false });
    });
  });
});

ipcMain.handle("disk-flows-open-folder", async () => {
  const videosDir = path.join(app.getPath("videos"), "Delay");
  const fs = require("fs");
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
  shell.openPath(videosDir);
});

ipcMain.handle("disk-flows-show-in-folder", async (_event, filePath) => {
  if (filePath) {
    shell.showItemInFolder(filePath);
  }
});

ipcMain.handle("disk-flows-move-to-downloads", async (_event, filePath) => {
  const fs = require("fs");
  if (!filePath || !fs.existsSync(filePath)) return { ok: false };
  try {
    const downloadsDir = app.getPath("downloads");
    const dest = path.join(downloadsDir, path.basename(filePath));
    fs.copyFileSync(filePath, dest);
    shell.showItemInFolder(dest);
    return { ok: true, dest };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

// ── Code Studio: open file in VS Code ──
ipcMain.handle("code-studio-open-vscode", async (_event, filename, code, language) => {
  const fs = require("fs");
  const os = require("os");
  const tmpDir = path.join(os.tmpdir(), "delay-code-studio");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const extMap = {
    javascript: ".js", typescript: ".ts", python: ".py", html: ".html",
    css: ".css", json: ".json", sql: ".sql", markdown: ".md",
    bash: ".sh", rust: ".rs", go: ".go", java: ".java", plaintext: ".txt",
  };
  const ext = extMap[language] || ".txt";
  const safeName = (filename || "untitled").replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(tmpDir, safeName.endsWith(ext) ? safeName : safeName + ext);
  fs.writeFileSync(filePath, code, "utf-8");
  // Try to open in VS Code
  const { exec } = require("child_process");
  exec(`code "${filePath}"`, (err) => {
    if (err) {
      // Fallback: just open the file with the default app
      shell.openPath(filePath);
    }
  });
  return { ok: true, path: filePath };
});

function sendDiskFlowEvent(event, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("disk-flow-event", { event, payload });
  }
}

function sendUpdaterEvent(event, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updater-event", { event, payload });
  }
}

autoUpdater.on("checking-for-update", () => sendUpdaterEvent("checking"));
autoUpdater.on("update-available", (info) => sendUpdaterEvent("available", info));
autoUpdater.on("update-not-available", (info) => sendUpdaterEvent("not-available", info));
autoUpdater.on("error", (err) => sendUpdaterEvent("error", String(err?.message || err)));
autoUpdater.on("download-progress", (p) => sendUpdaterEvent("progress", p));
autoUpdater.on("update-downloaded", (info) => sendUpdaterEvent("downloaded", info));

app.whenReady().then(() => {
  app.setAppUserModelId("com.delay.app");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
