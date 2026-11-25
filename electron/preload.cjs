// electron/preload.cjs - Secure IPC bridge for NIJO PVT PC
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktopApp: true,
  platform: 'win32',
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getLanIp: () => ipcRenderer.invoke('app:lan-ip'),
  openUploadsFolder: (folderPath) => ipcRenderer.invoke('app:open-folder', folderPath),
  saveFileDialog: (defaultName) => ipcRenderer.invoke('app:save-file-dialog', defaultName),

  // Local data store (tasks, events, notes)
  storeGet: () => ipcRenderer.invoke('store:get'),
  storeSet: (patch) => ipcRenderer.invoke('store:set', patch),
  onStoreChanged: (cb) => {
    const handler = (_e, data) => cb(data);
    ipcRenderer.on('store:changed', handler);
    return () => ipcRenderer.removeListener('store:changed', handler);
  },

  // Local Claude agent
  agentChat: (message, mode) => ipcRenderer.invoke('agent:chat', { message, mode }),
  agentReset: () => ipcRenderer.invoke('agent:reset'),
  agentHasKey: () => ipcRenderer.invoke('agent:has-key'),
  agentSetKey: (key) => ipcRenderer.invoke('agent:set-key', key),

  // Text to my voice
  voiceStatus: () => ipcRenderer.invoke('voice:status'),
  voiceProfiles: () => ipcRenderer.invoke('voice:profiles'),
  voiceSpeak: (args) => ipcRenderer.invoke('voice:speak', args),
  voiceSave: (args) => ipcRenderer.invoke('voice:save', args),
  voiceMlStatus: () => ipcRenderer.invoke('voice:ml-status'),
  voiceSpeakMl: (args) => ipcRenderer.invoke('voice:speak-ml', args),
  voiceMlStart: () => ipcRenderer.invoke('voice:ml-start'),
});
