// electron/main.cjs - NIJO PVT PC Desktop Application
const { app, BrowserWindow, ipcMain, Tray, Menu, shell, dialog, Notification, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { DataStore } = require('./store.cjs');
const { NijoAgent } = require('./agent.cjs');

// Voicebox via NIJO CloudLink (laptop-only proxy to the private cloud GPU)
const VOICE_URL = 'http://127.0.0.1:17493';
let store = null;
let agent = null;

// ---- Claude API key: encrypted with Windows DPAPI (safeStorage), never in the repo ----
function keyFile() { return path.join(app.getPath('userData'), 'claude-key.bin'); }
function getApiKey() {
  try {
    if (!fs.existsSync(keyFile())) return process.env.ANTHROPIC_API_KEY || '';
    return safeStorage.decryptString(fs.readFileSync(keyFile()));
  } catch { return ''; }
}
function setApiKey(key) {
  if (!key) { if (fs.existsSync(keyFile())) fs.unlinkSync(keyFile()); return true; }
  fs.writeFileSync(keyFile(), safeStorage.encryptString(key.trim()));
  return true;
}

// ---- Task reminder notifications ----
function checkReminders() {
  if (!store) return;
  const d = store.get();
  const now = new Date();
  const notified = new Set(d.notified || []);
  let changed = false;
  for (const t of d.tasks) {
    if (t.completed || !t.dueDate || notified.has(t.id)) continue;
    const due = new Date(`${t.dueDate}T${t.dueTime || '09:00'}:00`);
    if (isNaN(due.getTime())) continue;
    if (due <= now && now - due < 6 * 3600 * 1000) {
      new Notification({ title: `Task: ${t.title}`, body: t.description || `Due ${t.dueDate} ${t.dueTime || ''}`.trim() }).show();
      notified.add(t.id);
      changed = true;
    }
  }
  if (changed) store.set({ notified: [...notified] }, 'system');
}

// ---- Voice (text to my voice) ----
async function voiceJson(p, opts) {
  const r = await fetch(VOICE_URL + p, { ...opts, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`Voice server ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

let mainWindow = null;
let tray = null;
let localServer = null;

// Determine if running in development or packaged build
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = process.env.PORT || 3000;
const HUB_PORT = 4000;

// Start integrated local file transfer hub on port 4000
function startLocalHubServer() {
  try {
    const express = require('express');
    const cors = require('cors');
    const multer = require('multer');

    const hubApp = express();
    hubApp.use(cors());
    hubApp.use(express.json());

    const uploadDir = path.join(app.getPath('userData'), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => cb(null, file.originalname)
    });
    const upload = multer({ storage });

    let sseClients = [];

    hubApp.get('/status', (req, res) => {
      res.json({
        app: 'NIJO PVT PC Desktop Hub',
        status: 'online',
        port: HUB_PORT,
        platform: 'win32',
        version: '1.0.0'
      });
    });

    hubApp.get('/events', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Laptop Hub Active' })}\n\n`);
      sseClients.push(res);

      req.on('close', () => {
        sseClients = sseClients.filter((client) => client !== res);
      });
    });

    hubApp.post('/upload', upload.single('file'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileData = {
        name: req.file.originalname,
        size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
        sender: req.body.sender || 'laptop',
        target: req.body.target || 'mobile',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        url: `/download/${encodeURIComponent(req.file.originalname)}`
      };

      sseClients.forEach((client) => {
        try {
          client.write(`data: ${JSON.stringify(fileData)}\n\n`);
        } catch (e) {
          // ignore dead client
        }
      });

      res.json({ success: true, file: fileData });
    });

    hubApp.get('/download/:name', (req, res) => {
      const filePath = path.join(uploadDir, req.params.name);
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    });

    localServer = hubApp.listen(HUB_PORT, '0.0.0.0', () => {
      console.log(`[NIJO PVT PC] Local Hub Server running at http://0.0.0.0:${HUB_PORT}`);
    });
    // Without this, "port already in use" is an uncaught error that crashes the whole app
    localServer.on('error', (err) => {
      console.warn(`[NIJO PVT PC] Hub server not started (${err.code || err.message}); file sharing hub disabled.`);
      localServer = null;
    });
  } catch (err) {
    console.warn('[NIJO PVT PC] Embedded hub server fallback:', err.message);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'NIJO PVT PC',
    backgroundColor: '#0F294A',
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Minimize to tray behavior
  mainWindow.on('minimize', (event) => {
    // optional tray behavior
  });
}

function createTray() {
  // If icon exists, initialize system tray
  try {
    const iconPath = path.join(__dirname, '../public/favicon.ico');
    if (fs.existsSync(iconPath)) {
      tray = new Tray(iconPath);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open NIJO PVT PC',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            } else {
              createWindow();
            }
          }
        },
        {
          label: 'Hub Status: Active (Port 4000)',
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Quit NIJO PVT PC',
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]);
      tray.setToolTip('NIJO PVT PC - Local Hub Active');
      tray.setContextMenu(contextMenu);
      tray.on('double-click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }
  } catch (err) {
    // tray fallback
  }
}

// Only one copy of the app: a second launch just brings the existing window to the front
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

process.on('uncaughtException', (err) => {
  console.error('[NIJO PVT PC] Unexpected error (app kept running):', err);
});

app.whenReady().then(() => {
  if (!app.hasSingleInstanceLock()) return;
  app.setAppUserModelId('com.nijo.pvt.pc'); // needed for Windows notifications
  store = new DataStore(app.getPath('userData'));
  agent = new NijoAgent(store, getApiKey);
  store.on('change', (source) => {
    if (source !== 'ui' && mainWindow) mainWindow.webContents.send('store:changed', store.get());
  });
  setInterval(checkReminders, 30 * 1000);
  setTimeout(checkReminders, 5000);
  startLocalHubServer();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (localServer) {
      try {
        localServer.close();
      } catch (e) {
        // ignore
      }
    }
    app.quit();
  }
});

// IPC handlers for native Windows dialogs and explorer actions
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:open-folder', async (event, folderPath) => {
  if (folderPath && fs.existsSync(folderPath)) {
    shell.openPath(folderPath);
    return true;
  }
  const defaultDir = path.join(app.getPath('userData'), 'uploads');
  shell.openPath(defaultDir);
  return true;
});

// ---- Data store ----
ipcMain.handle('store:get', () => store.get());
ipcMain.handle('store:set', (event, patch) => store.set(patch || {}, 'ui'));

// ---- Agent ----
ipcMain.handle('agent:chat', (event, { message, mode }) => agent.chat(String(message || ''), mode || 'study'));
ipcMain.handle('agent:reset', () => { agent.reset(); return true; });
ipcMain.handle('agent:has-key', () => !!getApiKey());
ipcMain.handle('agent:set-key', (event, key) => setApiKey(String(key || '')));

// ---- Voice ----
ipcMain.handle('voice:status', async () => {
  try {
    const h = await voiceJson('/health');
    let mode = 'unknown';
    try { mode = (await voiceJson('/__cloudlink')).mode; } catch {}
    return { ok: true, gpu: h.gpu_type || '', mode };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('voice:profiles', async () => voiceJson('/profiles'));
ipcMain.handle('voice:speak', async (event, { profileId, text, engine, language }) => {
  const gen = await voiceJson('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId, text, language: language || 'en', ...(engine ? { engine } : {}) }),
  });
  for (let i = 0; i < 300; i++) {
    const h = await voiceJson(`/history/${gen.id}`);
    if (h.status === 'completed') {
      const r = await fetch(`${VOICE_URL}/audio/${gen.id}`);
      const buf = Buffer.from(await r.arrayBuffer());
      return { id: gen.id, duration: h.duration, dataUrl: `data:audio/wav;base64,${buf.toString('base64')}` };
    }
    if (h.status === 'failed' || h.error) throw new Error(h.error || 'Generation failed');
    await new Promise((res) => setTimeout(res, 2000));
  }
  throw new Error('Voice generation timed out');
});
ipcMain.handle('voice:save', async (event, { dataUrl, name }) => {
  const res = await dialog.showSaveDialog(mainWindow, { defaultPath: name || 'my-voice.wav', filters: [{ name: 'WAV audio', extensions: ['wav'] }] });
  if (res.canceled || !res.filePath) return false;
  fs.writeFileSync(res.filePath, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return res.filePath;
});

ipcMain.handle('app:save-file-dialog', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'NIJO-Export.bin',
    properties: ['showOverwriteConfirmation']
  });
  return result;
});
