// electron/preload.cjs - Secure IPC bridge for NIJO PVT PC
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktopApp: true,
  platform: 'win32',
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  openUploadsFolder: (folderPath) => ipcRenderer.invoke('app:open-folder', folderPath),
  saveFileDialog: (defaultName) => ipcRenderer.invoke('app:save-file-dialog', defaultName)
});
