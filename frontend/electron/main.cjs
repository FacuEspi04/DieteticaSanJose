const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");

let backendProcess;

function getBackendRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend");
  }

  return path.join(__dirname, "../../backend");
}

function getBackendPath() {
  return path.join(getBackendRoot(), "dist", "main.js");
}

function getDbPath() {
  return path.join(app.getPath("userData"), "dietetica.db");
}

function getSeedDbPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "db", "dietetica.db");
  }

  return path.join(__dirname, "../../dietetica.db");
}

function ensureSeedDb(dbPath) {
  if (fs.existsSync(dbPath)) {
    return;
  }

  const seedPath = getSeedDbPath();

  if (!fs.existsSync(seedPath)) {
    return;
  }

  fs.copyFileSync(seedPath, dbPath);
}

function startBackend() {
  const backendPath = getBackendPath();
  const backendRoot = getBackendRoot();
  const dbPath = getDbPath();

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  ensureSeedDb(dbPath);

  backendProcess = fork(backendPath, [], {
    cwd: backendRoot,
    env: {
      ...process.env,
      PORT: "3000",
      DB_PATH: dbPath,
      ELECTRON_RUN: "1",
      NODE_ENV: "production",
    },
    stdio: "inherit",
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
