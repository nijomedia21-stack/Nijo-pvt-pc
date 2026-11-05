// electron/main.cjs - NIJO PVT PC Desktop Application
const { app, BrowserWindow, ipcMain, Tray, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

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

app.whenReady().then(() => {
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

ipcMain.handle('app:save-file-dialog', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'NIJO-Export.bin',
    properties: ['showOverwriteConfirmation']
  });
  return result;
});
