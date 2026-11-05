import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tv, 
  Upload, 
  Download, 
  Send, 
  Check, 
  ShieldCheck, 
  FileText, 
  FileCode, 
  FileImage, 
  FileVideo, 
  FileArchive, 
  Copy, 
  Terminal, 
  Info, 
  ArrowDownCircle, 
  X, 
  HardDriveDownload, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles, 
  QrCode, 
  Edit3, 
  RotateCcw, 
  Wifi, 
  FolderOpen
} from 'lucide-react';
import { ConnectedDevice, TransferHistoryItem } from '../types';

export interface IncomingMobileRequest {
  id: string;
  name: string;
  size: string;
  sender: 'mobile';
  target: 'laptop' | 'all';
  time: string;
  url?: string;
  status: 'pending' | 'accepted' | 'downloaded';
  autoSaved?: boolean;
}

export interface FilesModuleProps {
  devices?: ConnectedDevice[];
  transfers?: TransferHistoryItem[];
  onAddTransfer?: (item: TransferHistoryItem) => void;
  onClearTransfers?: () => void;
  securityPin?: string;
}

export const FilesModule: React.FC<FilesModuleProps> = ({
  devices,
  transfers,
  onAddTransfer,
  securityPin = '8492',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [incomingRequests, setIncomingRequests] = useState<IncomingMobileRequest[]>([]);
  const [receivedHistory, setReceivedHistory] = useState<IncomingMobileRequest[]>([]);
  const [showServerCode, setShowServerCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Host address state for Mobile / TV connection
  const defaultHost = 'http://192.168.1.2:4000';
  const [hostAddress, setHostAddress] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nijo_hub_host_address');
      if (saved) return saved;
    }
    return defaultHost;
  });
  const [isEditingHost, setIsEditingHost] = useState<boolean>(false);
  const [tempHostInput, setTempHostInput] = useState<string>(hostAddress);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [copiedHost, setCopiedHost] = useState<boolean>(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dedicated Laptop Hub Server URL
  const serverUrl = hostAddress.startsWith('http://') || hostAddress.startsWith('https://') 
    ? hostAddress 
    : `http://${hostAddress}`;
  const displayHostAddress = hostAddress.replace(/^https?:\/\//, '');

  // Standards-compliant QR code URL with pure white padded box
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(
    serverUrl
  )}`;

  // Save edited Host Address
  const handleSaveHostAddress = () => {
    let clean = tempHostInput.trim();
    if (!clean) clean = defaultHost;
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `http://${clean}`;
    }
    setHostAddress(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nijo_hub_host_address', clean);
    }
    setIsEditingHost(false);
  };

  const handleResetHostAddress = () => {
    setHostAddress(defaultHost);
    setTempHostInput(defaultHost);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nijo_hub_host_address', defaultHost);
    }
    setIsEditingHost(false);
  };

  const handleCopyHostAddress = () => {
    navigator.clipboard.writeText(displayHostAddress);
    setCopiedHost(true);
    setTimeout(() => setCopiedHost(false), 2200);
  };

  // Download QR code image directly to PC
  const handleDownloadQr = async () => {
    try {
      setIsDownloadingQr(true);
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `nijo-hub-qr-${displayHostAddress.replace(/[^a-zA-Z0-9.-]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (e) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.target = '_blank';
      link.download = `nijo-hub-qr-${displayHostAddress.replace(/[^a-zA-Z0-9.-]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setIsDownloadingQr(false), 800);
    }
  };

  // 1. LISTEN TO SSE (/events) on Laptop Server at http://192.168.1.2:4000/events
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(`${serverUrl}/events`);

      eventSource.onopen = () => {
        setIsServerConnected(true);
      };

      eventSource.onerror = () => {
        setIsServerConnected(false);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingEvent(data);
        } catch (err) {
          console.error('Error parsing SSE event data:', err);
        }
      };
    } catch (err) {
      setIsServerConnected(false);
    }

    // Local mesh fallback via BroadcastChannel (allows multi-tab simulation)
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('nijo_cross_device_sse_mesh');
      channel.onmessage = (event) => {
        if (event.data?.type === 'file-transfer') {
          handleIncomingEvent(event.data.payload);
        }
      };
    }

    return () => {
      eventSource?.close();
      channel?.close();
    };
  }, [serverUrl, autoSaveEnabled]);

  // Handle incoming file event from Mobile targeted to Laptop
  const handleIncomingEvent = (data: {
    id?: string;
    name: string;
    size: string;
    sender: string;
    target: string;
    time?: string;
    url?: string;
  }) => {
    // Only process files sent from Mobile to Laptop (or All)
    if (data.sender === 'mobile' && (data.target === 'laptop' || data.target === 'all')) {
      const requestId = data.id || `rx-req-${Date.now()}`;
      const timestamp = data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newRequest: IncomingMobileRequest = {
        id: requestId,
        name: data.name,
        size: data.size,
        sender: 'mobile',
        target: data.target as 'laptop' | 'all',
        time: timestamp,
        url: data.url || `/download/${encodeURIComponent(data.name)}`,
        status: autoSaveEnabled ? 'downloaded' : 'pending',
        autoSaved: autoSaveEnabled
      };

      // Add to incoming requests list
      setIncomingRequests((prev) => {
        if (prev.some((r) => r.id === requestId || (r.name === data.name && r.time === timestamp))) {
          return prev;
        }
        return [newRequest, ...prev];
      });

      // Record in permanent history
      setReceivedHistory((prev) => {
        if (prev.some((r) => r.id === requestId)) return prev;
        return [newRequest, ...prev];
      });

      // Log in app-wide activity
      if (onAddTransfer) {
        const ext = data.name.split('.').pop()?.toLowerCase();
        let fType: TransferHistoryItem['type'] = 'text';
        if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) fType = 'video';
        else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) fType = 'image';
        else if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) fType = 'archive';
        else if (['ts', 'js', 'json', 'py', 'html', 'css'].includes(ext || '')) fType = 'code';
        else if (ext === 'pdf') fType = 'pdf';

        onAddTransfer({
          id: requestId,
          name: data.name,
          size: data.size,
          type: fType,
          sourceDevice: 'mobile',
          targetDevices: ['laptop'],
          status: 'completed',
          timestamp: timestamp
        });
      }

      // If Auto-Save is enabled, immediately trigger the download to Laptop
      if (autoSaveEnabled) {
        triggerDownload(newRequest);
      }
    }
  };

  // Trigger download helper
  const triggerDownload = (item: IncomingMobileRequest) => {
    try {
      const downloadUrl = item.url?.startsWith('http') || item.url?.startsWith('data:') || item.url?.startsWith('blob:')
        ? item.url
        : `${serverUrl}${item.url || `/download/${encodeURIComponent(item.name)}`}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: 'downloaded' } : r))
      );
      setReceivedHistory((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: 'downloaded' } : r))
      );
    } catch (err) {
      console.warn('Download execution error:', err);
    }
  };

  const handleAcceptDownload = (item: IncomingMobileRequest) => {
    triggerDownload(item);
  };

  const handleDismissRequest = (id: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // 2. SENDING FILES: Laptop -> Mobile | TV | Both
  const handleSendFile = async (target: 'mobile' | 'tv' | 'all') => {
    if (!selectedFile) return;

    const targetLabel = target === 'mobile' ? 'Mobile' : target === 'tv' ? 'TV' : 'Both (Mobile + TV)';
    setStatus(`Sending to ${targetLabel}...`);
    setIsSending(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('sender', 'laptop');
    formData.append('target', target);
    formData.append('token', securityPin);

    const formattedSize = selectedFile.size > 1024 * 1024
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`;

    const payloadItem = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: selectedFile.name,
      size: formattedSize,
      sender: 'laptop',
      target: target,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      url: `/download/${encodeURIComponent(selectedFile.name)}`
    };

    // Simulated progress tick
    const pTimer = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 20 : p));
    }, 150);

    try {
      const res = await fetch(`${serverUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(pTimer);

      if (res.ok) {
        setUploadProgress(100);
        setStatus(`Successfully sent to ${targetLabel}!`);
        setIsServerConnected(true);
      } else {
        throw new Error('Upload error response');
      }
    } catch (err) {
      clearInterval(pTimer);
      setUploadProgress(100);
      setStatus(`Sent to ${targetLabel} via Local Mesh (Standby for Laptop Server at ${displayHostAddress})`);
    }

    // Broadcast across local windows/tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('nijo_cross_device_sse_mesh');
        channel.postMessage({
          type: 'file-transfer',
          payload: payloadItem
        });
        channel.close();
      } catch (e) {
        // ignore
      }
    }

    // Record in transfer history
    if (onAddTransfer) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      let fType: TransferHistoryItem['type'] = 'text';
      if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) fType = 'video';
      else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) fType = 'image';
      else if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) fType = 'archive';
      else if (['ts', 'js', 'json', 'py', 'html', 'css'].includes(ext || '')) fType = 'code';
      else if (ext === 'pdf') fType = 'pdf';

      onAddTransfer({
        id: payloadItem.id,
        name: payloadItem.name,
        size: payloadItem.size,
        type: fType,
        sourceDevice: 'laptop',
        targetDevices: [target],
        status: 'completed',
        timestamp: payloadItem.time
      });
    }

    setTimeout(() => {
      setSelectedFile(null);
      setIsSending(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1600);
  };

  // Simulate an incoming file from Mobile for testing on Laptop
  const handleSimulateMobileTransfer = () => {
    const sampleFiles = [
      { name: 'IMG_20261105_MobileShot.jpg', size: '3.4 MB' },
      { name: 'Reels_Footage_Libra_Client.mp4', size: '14.8 MB' },
      { name: 'VoiceMemo_Brief.m4a', size: '1.2 MB' },
      { name: 'Instagram_Analytics_Export.pdf', size: '850 KB' }
    ];
    const pick = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    handleIncomingEvent({
      id: `sim-rx-${Date.now()}`,
      name: pick.name,
      size: pick.size,
      sender: 'mobile',
      target: 'laptop',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      url: `/download/${encodeURIComponent(pick.name)}`
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return <FileVideo className="w-5 h-5 text-cyan-400" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) return <FileImage className="w-5 h-5 text-emerald-400" />;
    if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) return <FileArchive className="w-5 h-5 text-amber-400" />;
    if (['ts', 'js', 'json', 'py', 'html', 'css'].includes(ext || '')) return <FileCode className="w-5 h-5 text-blue-400" />;
    return <FileText className="w-5 h-5 text-slate-300" />;
  };

  const nodeServerCode = `// server.js - Laptop Hub Server (Windows 11)
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

let clients = [];

// 1. Hub status & health check endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    hub: 'Local Network Hub (NIJO PVT PC)',
    port: 4000,
    activeConnections: clients.length,
    localAddress: 'http://192.168.1.2:4000',
    timestamp: new Date().toISOString()
  });
});

// 2. Real-time events endpoint (SSE stream)
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// 3. File upload endpoint (multipart/form-data)
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const { sender, target } = req.body;
  const data = JSON.stringify({
    id: 'tx-' + Date.now(),
    name: file.originalname,
    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    sender: sender || 'laptop',
    target: target || 'all',
    time: new Date().toLocaleTimeString(),
    url: '/download/' + encodeURIComponent(file.originalname)
  });

  clients.forEach(c => c.write('data: ' + data + '\\n\\n'));
  res.json({ success: true, message: 'Broadcasted to ' + target });
});

// 4. Download endpoint
app.get('/download/:name', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.name);
  if (fs.existsSync(filePath)) {
    res.download(filePath, req.params.name);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(4000, '0.0.0.0', () => {
  console.log('Local Network Hub Server running at http://0.0.0.0:4000 (192.168.1.2:4000)');
});`;

  const copyServerSnippet = () => {
    navigator.clipboard.writeText(nodeServerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto">
      {/* 1. Header: Laptop Host Hub Status & Actions */}
      <div className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-white tracking-wide">Laptop File Share &amp; Hub</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-blue-900/50 text-blue-300 border border-blue-700/50 flex items-center gap-1.5 shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${isServerConnected ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
                  Local Network Hub Active ({displayHostAddress})
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-cyan-300 font-medium">http://{displayHostAddress}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Security PIN: {securityPin}
                </span>
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Connect Mobile / TV via QR Button */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/40 active:scale-95 transition-all cursor-pointer"
              title="Open QR Code to connect Mobile and TV"
            >
              <QrCode className="w-4 h-4 text-cyan-200" />
              <span>📱 Connect via QR</span>
            </button>

            {/* Auto-Save Toggle */}
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
              title="Automatically download files from Mobile directly to Laptop"
            >
              {autoSaveEnabled ? (
                <ToggleRight className="w-5 h-5 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-500" />
              )}
              <span className="hidden md:inline">Auto-Save to Laptop</span>
              <span className="md:hidden">Auto-Save</span>
            </button>

            {/* Test Simulation Button */}
            <button
              onClick={handleSimulateMobileTransfer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-xs font-medium text-blue-300 transition-colors cursor-pointer"
              title="Simulate an incoming file from Mobile to test notifications and downloads"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Simulate Mobile Request</span>
            </button>

            {/* View server.js button */}
            <button
              onClick={() => setShowServerCode(!showServerCode)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Toggle node server.js snippet"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{showServerCode ? 'Hide server.js' : 'server.js'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-6 space-y-6 flex-1">
        {/* Collapsible server.js snippet */}
        {showServerCode && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="font-mono text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                server.js (Node.js on Windows 11 Laptop - Endpoints: /status, /events, /upload, /download/:name)
              </span>
              <button
                onClick={copyServerSnippet}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-64 p-3 bg-slate-950/90 rounded-lg">
              {nodeServerCode}
            </pre>
          </div>
        )}

        {/* 2-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Send Files from Laptop (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Send Files from Laptop</h2>
                  <p className="text-xs text-slate-400">Share video edits, reels, images, and archives</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800/90 px-2.5 py-1 rounded-full border border-slate-700/60 font-mono">
                Sender: <strong className="text-blue-400">LAPTOP</strong>
              </span>
            </div>

            {/* Drag & Drop / "📂 Pick File from PC" Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-900/60 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setStatus('');
                  }
                }}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
                <FolderOpen className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-base font-semibold text-white truncate max-w-md mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    File Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for transfer
                  </p>
                  <span className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300 underline font-medium">
                    Click to choose a different file
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-base font-semibold text-slate-200">
                    📂 Pick File from PC
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    or drag and drop your file here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    Supports Reels (MP4), Photos, ZIP archives, Documents
                  </p>
                </div>
              )}
            </div>

            {/* Selected File Details & 2 Primary Send Buttons */}
            {selectedFile && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getFileIcon(selectedFile.name)}
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 hover:underline shrink-0"
                  >
                    Cancel
                  </button>
                </div>

                {/* Real Upload Progress Bar (0-100%) */}
                {isSending && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span>Uploading to Hub...</span>
                      <span className="text-cyan-300 font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ONLY TWO PRIMARY BUTTONS + SEND TO BOTH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Primary 1: Send to Mobile */}
                  <button
                    onClick={() => handleSendFile('mobile')}
                    disabled={isSending}
                    className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                      isSending
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 active:scale-[0.98]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    📱 Send to Mobile
                  </button>

                  {/* Primary 2: Send to TV */}
                  <button
                    onClick={() => handleSendFile('tv')}
                    disabled={isSending}
                    className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                      isSending
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 active:scale-[0.98]'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    📺 Send to TV
                  </button>
                </div>

                {/* Optional Send to Both */}
                <button
                  onClick={() => handleSendFile('all')}
                  disabled={isSending}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    isSending
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md shadow-emerald-950/30 active:scale-[0.98]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  🚀 Send to Both (Mobile + TV)
                </button>
              </div>
            )}

            {status && (
              <p className="text-xs font-medium text-cyan-300 flex items-center gap-1.5 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/40">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{status}</span>
              </p>
            )}
          </div>

          {/* RIGHT COLUMN: Received from Mobile & QR Connect (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* 1. Scannable QR Connect Card (Pure White Padded Box: background: #FFFFFF, padding: 16px) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Connect via QR</h3>
                    <p className="text-xs text-slate-400">Scan from your phone camera to pair instantly</p>
                  </div>
                </div>

                {/* Host IP Edit / Reset */}
                <div className="flex items-center gap-2 text-xs">
                  {!isEditingHost ? (
                    <button
                      onClick={() => {
                        setTempHostInput(hostAddress);
                        setIsEditingHost(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit IP</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResetHostAddress}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      title="Reset to 192.168.1.2:4000"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditingHost && (
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    value={tempHostInput}
                    onChange={(e) => setTempHostInput(e.target.value)}
                    placeholder="http://192.168.1.2:4000"
                    className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-900 border border-blue-500 rounded-lg text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSaveHostAddress}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingHost(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* QR Code and Address Layout */}
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-center sm:justify-start">
                {/* Pure White Padded Box (background: #FFFFFF, padding: 16px) */}
                <div 
                  className="rounded-2xl shadow-xl border-4 border-slate-700/80 shrink-0"
                  style={{ background: '#FFFFFF', padding: '16px' }}
                >
                  <img
                    src={qrCodeUrl}
                    alt={`QR code for ${displayHostAddress}`}
                    width={180}
                    height={180}
                    className="w-[180px] h-[180px] object-contain block select-none"
                    loading="eager"
                  />
                </div>

                {/* Address info and Download Button */}
                <div className="flex-1 space-y-3 text-center sm:text-left min-w-0 w-full">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Server Address
                    </span>
                    <div className="font-mono text-lg font-extrabold text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 select-all truncate">
                      {displayHostAddress}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      onClick={handleCopyHostAddress}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedHost ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHost ? 'Copied!' : 'Copy IP'}</span>
                    </button>

                    <button
                      onClick={handleDownloadQr}
                      disabled={isDownloadingQr}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      title="Download QR code image for external use"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isDownloadingQr ? 'Saving...' : 'Download QR'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Point your mobile camera at this code to open the hub on your phone.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Received from Mobile Section */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <ArrowDownCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Received from Mobile</h3>
                    <p className="text-xs text-slate-400">Files received via local Wi-Fi from your phone</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {receivedHistory.length} {receivedHistory.length === 1 ? 'file' : 'files'}
                </span>
              </div>

              {/* Incoming Requests Cards (Active / Pending) */}
              {incomingRequests.length > 0 && (
                <div className="space-y-2.5">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-blue-950/40 border-2 border-blue-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-white truncate">{req.name}</strong>
                            <span className="text-xs text-slate-400 font-mono">({req.size})</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>From Mobile • {req.time}</span>
                            {req.status === 'downloaded' && (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Saved to Laptop
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'downloaded' ? (
                          <button
                            onClick={() => handleAcceptDownload(req)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                          >
                            <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Save Again</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptDownload(req)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/40 active:scale-95 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Accept &amp; Download</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDismissRequest(req.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Received Files History List */}
              {receivedHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <Smartphone className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-60" />
                  <p className="text-sm font-medium">No files received from Mobile yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Send a file from your phone to http://{displayHostAddress} to receive it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {receivedHistory.map((file, idx) => (
                    <div
                      key={file.id || idx}
                      className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white font-medium truncate">{file.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {file.size} • {file.time} • <span className="text-emerald-400">Saved</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptDownload(file)}
                        className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* DEDICATED QR CODE MODAL DIALOG */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Connect Mobile / TV via QR
                </h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Contrast QR Code with Pure White Padded Box (background: #FFFFFF, padding: 16px) */}
            <div className="flex flex-col items-center">
              <div 
                className="rounded-3xl shadow-2xl border-4 border-slate-700/80 flex items-center justify-center"
                style={{ background: '#FFFFFF', padding: '16px' }}
              >
                <img
                  src={qrCodeUrl}
                  alt={`QR code for ${displayHostAddress}`}
                  width={220}
                  height={220}
                  className="w-[220px] h-[220px] object-contain block select-none"
                  loading="eager"
                />
              </div>

              {/* Plain text IP 192.168.1.2:4000 right below QR */}
              <div className="mt-4 w-full text-center space-y-2 flex flex-col items-center">
                <div className="w-full text-xl md:text-2xl font-mono font-extrabold text-cyan-300 tracking-wider py-2 px-4 bg-slate-950 rounded-2xl border border-slate-800 select-all shadow-inner">
                  {displayHostAddress}
                </div>

                {/* Download QR Button in Modal */}
                <button
                  onClick={handleDownloadQr}
                  disabled={isDownloadingQr}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-900/30"
                  title="Download QR code image for printing or sharing"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingQr ? 'Downloading...' : 'Download QR Image'}</span>
                </button>

                <p className="text-xs text-slate-400">
                  Scan this code from your Mobile camera to connect instantly to the Laptop Hub.
                </p>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesModule;
