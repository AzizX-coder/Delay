const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
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
const fs = require("fs");
const https = require("https");

function getYtDlpPath() {
  return path.join(app.getPath("userData"), process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
}

ipcMain.handle("disk-flows-check-dependency", async () => {
  return new Promise((resolve) => {
    const binPath = getYtDlpPath();
    if (fs.existsSync(binPath)) {
      resolve({ ok: true, path: binPath });
      return;
    }

    const url = process.platform === "win32" 
      ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
      : process.platform === "darwin"
        ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
        : "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

    const file = fs.createWriteStream(binPath);
    
    // Simple redirect handler for github releases
    function download(urlToFetch) {
      https.get(urlToFetch, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          return download(response.headers.location);
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          if (process.platform !== "win32") {
             fs.chmodSync(binPath, "755");
          }
          resolve({ ok: true, path: binPath });
        });
      }).on("error", (err) => {
        fs.unlink(binPath, () => {});
        resolve({ ok: false, error: err.message });
      });
    }
    download(url);
  });
});

ipcMain.handle("disk-flows-get-formats", async (_event, url) => {
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    const binPath = getYtDlpPath();
    if (!fs.existsSync(binPath)) {
      resolve({ ok: false, error: "yt-dlp not found. Please wait for it to download." });
      return;
    }
    
    exec(`"${binPath}" -j "${url}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout) => {
      if (error) {
        resolve({ ok: false, error: String(error) });
        return;
      }
      try {
        const info = JSON.parse(stdout);
        const formats = (info.formats || []).filter((f) => f.vcodec !== 'none' || f.acodec !== 'none').map((f) => ({
          format_id: f.format_id,
          ext: f.ext,
          resolution: f.resolution || (f.width ? `${f.width}x${f.height}` : "audio only"),
          vcodec: f.vcodec,
          acodec: f.acodec,
          filesize: f.filesize || f.filesize_approx,
          format_note: f.format_note,
        }));
        resolve({ ok: true, formats, title: info.title, thumbnail: info.thumbnail });
      } catch (e) {
        resolve({ ok: false, error: "Failed to parse info" });
      }
    });
  });
});

ipcMain.handle("disk-flows-download", async (_event, url, downloadId, formatId) => {
  const videosDir = path.join(app.getPath("videos"), "Delay");
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

  return new Promise((resolve) => {
    const outputTemplate = path.join(videosDir, "%(title)s.%(ext)s");
    
    // Default to 'best' if no formatId is provided, otherwise target the specific format+bestaudio
    const formatArgs = formatId && formatId !== "best" ? ["-f", `${formatId}+bestaudio/best`] : ["-f", "best"];
    const binPath = getYtDlpPath();
    
    const bin = process.platform === "win32" ? "cmd.exe" : binPath;
    const args = process.platform === "win32" 
      ? ["/c", `"${binPath}"`, "--progress", "--newline", ...formatArgs, "-o", `"${outputTemplate}"`, `"${url}"`]
      : ["--progress", "--newline", ...formatArgs, "-o", outputTemplate, url];

    const proc = spawn(bin, args, { shell: process.platform === "win32" });

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
      
      const mergeMatch = line.match(/Merging formats into "(.+)"/);
      if (mergeMatch) lastTitle = path.basename(mergeMatch[1]);
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
          file_path: lastTitle ? path.join(videosDir, lastTitle) : videosDir,
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

// ── Code Studio IDE Extensions (Phase 3) ──
ipcMain.handle("open-preview-window", async (_event, url) => {
  const previewWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: "Preview",
    backgroundColor: "#ffffff",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  previewWindow.setMenuBarVisibility(false);
  previewWindow.loadURL(url);
  return { ok: true };
});

ipcMain.handle("workspace-open", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("fs-list", async (_event, dirPath) => {
  const fs = require("fs").promises;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map(e => ({ name: e.name, path: path.join(dirPath, e.name), isDir: e.isDirectory() }));
  } catch (err) {
    return { error: String(err) };
  }
});

ipcMain.handle("fs-read", async (_event, filePath) => {
  const fs = require("fs").promises;
  try {
    return { content: await fs.readFile(filePath, "utf-8") };
  } catch (err) {
    return { error: String(err) };
  }
});

ipcMain.handle("fs-write", async (_event, filePath, content) => {
  const fs = require("fs").promises;
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
    return { ok: true };
  } catch (err) {
    return { error: String(err) };
  }
});

ipcMain.handle("fs-mkdir", async (_event, dirPath) => {
  const fs = require("fs").promises;
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { ok: true };
  } catch (err) {
    return { error: String(err) };
  }
});

ipcMain.handle("fs-delete", async (_event, targetPath) => {
  const fs = require("fs").promises;
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    return { ok: true };
  } catch (err) {
    return { error: String(err) };
  }
});

ipcMain.handle("fs-run", async (_event, cmd, cmdArgs, cwd) => {
  return new Promise((resolve) => {
    const runId = Math.random().toString(36).substring(7);
    const proc = spawn(process.platform === "win32" ? "cmd.exe" : "/bin/sh", [
      process.platform === "win32" ? "/c" : "-c", 
      [cmd, ...cmdArgs].join(" ")
    ], { cwd: cwd || process.cwd(), shell: false });

    proc.stdout.on("data", (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`fs-run-data-${runId}`, data.toString());
      }
    });

    proc.stderr.on("data", (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`fs-run-data-${runId}`, data.toString());
      }
    });

    proc.on("close", (code) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`fs-run-exit-${runId}`, code);
      }
    });

    proc.on("error", (err) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`fs-run-data-${runId}`, `ERROR: ${err.message}\n`);
      }
    });

    resolve({ runId });
  });
});


function sendDiskFlowEvent(type, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("disk-flow-event", { type, ...data });
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
