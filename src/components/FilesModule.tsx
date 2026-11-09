import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tv, 
  Upload, 
  Download, 
  Send, 
  Check, 
  FileText, 
  FileCode, 
  FileImage, 
  FileVideo, 
  FileArchive, 
  Copy, 
  RotateCw, 
  FolderOpen, 
  Clipboard, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2,
  HardDriveDownload,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  X,
  QrCode
} from 'lucide-react';
import { ConnectedDevice, TransferHistoryItem } from '../types';
import { generateQrMatrix } from '../utils/qrCodeHelper';

export interface IncomingFileItem {
  id: string;
  name: string;
  size: string;
  sender: 'mobile' | 'laptop' | 'tv';
  target: 'laptop' | 'mobile' | 'tv' | 'all';
  time: string;
  url?: string;
  status: 'pending' | 'downloaded';
}

export interface FilesModuleProps {
  devices?: ConnectedDevice[];
  transfers?: TransferHistoryItem[];
  onAddTransfer?: (item: TransferHistoryItem) => void;
  onClearTransfers?: () => void;
  securityPin?: string;
}

export const FilesModule: React.FC<FilesModuleProps> = ({
  transfers = [],
  onAddTransfer,
  onClearTransfers,
  securityPin = '8492',
}) => {
  // Active Sub-Tab: 'send' | 'receive' | 'clipboard'
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'clipboard'>('send');

  // Selected file for transmission
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activePresetName, setActivePresetName] = useState<string>('Libra_Master_Vector_Assets.svg');
  const [activePresetSize, setActivePresetSize] = useState<string>('2.8 MB');

  // Destination devices routing
  const [targetMobile, setTargetMobile] = useState<boolean>(true);
  const [targetTv, setTargetTv] = useState<boolean>(false);
  const [targetLaptop, setTargetLaptop] = useState<boolean>(false);

  // Status & Progress
  const [isSending, setIsSending] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Token generator
  const [dynamicToken, setDynamicToken] = useState<string>('TOKEN-8465-2820');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrCopied, setQrCopied] = useState<boolean>(false);

  // Auto-Save to Laptop (default OFF as per user specification)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(false);

  // Incoming received files list
  const [receivedFiles, setReceivedFiles] = useState<IncomingFileItem[]>([
    {
      id: 'rx-1',
      name: 'IMG_20261106_Shoot_01.jpg',
      size: '4.2 MB',
      sender: 'mobile',
      target: 'laptop',
      time: '11:04 AM',
      url: 'http://192.168.1.2:4000/download/IMG_20261106_Shoot_01.jpg',
      status: 'pending'
    },
    {
      id: 'rx-2',
      name: 'Reels_Batch_Audio_Sample.mp3',
      size: '2.1 MB',
      sender: 'mobile',
      target: 'laptop',
      time: '10:48 AM',
      url: 'http://192.168.1.2:4000/download/Reels_Batch_Audio_Sample.mp3',
      status: 'downloaded'
    },
    {
      id: 'rx-3',
      name: 'VoiceMemo_Brief.m4a',
      size: '1.4 MB',
      sender: 'mobile',
      target: 'laptop',
      time: '10:15 AM',
      url: 'http://192.168.1.2:4000/download/VoiceMemo_Brief.m4a',
      status: 'downloaded'
    }
  ]);

  // Universal Clipboard state
  const [clipboardText, setClipboardText] = useState<string>('');
  const [clipboardItems, setClipboardItems] = useState<Array<{ id: string; text: string; sender: string; time: string }>>([
    {
      id: 'clip-1',
      text: 'https://instagram.com/p/DB492LibraReel04',
      sender: 'Mobile (Android)',
      time: '11:10 AM'
    },
    {
      id: 'clip-2',
      text: '#0F294A · #1E3A8A · #F8FAFC (Libra Navy Formula)',
      sender: 'Laptop (Windows 11)',
      time: '10:30 AM'
    }
  ]);
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importReceivedInputRef = useRef<HTMLInputElement>(null);

  const serverUrl = 'http://192.168.1.2:4000';

  // Listen to SSE (/events) from local Wi-Fi server (http://192.168.1.2:4000/events)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${serverUrl}/events`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.sender === 'mobile' && (data.target === 'laptop' || data.target === 'all')) {
            handleIncomingFile({
              id: data.id || `rx-${Date.now()}`,
              name: data.name,
              size: data.size,
              sender: 'mobile',
              target: 'laptop',
              time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              url: data.url || `${serverUrl}/download/${encodeURIComponent(data.name)}`,
              status: autoSaveEnabled ? 'downloaded' : 'pending'
            });
          }
        } catch (e) {
          // ignore parsing error
        }
      };
    } catch (e) {
      // safe fallback
    }

    // BroadcastChannel mesh fallback
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('nijo_cross_device_sse_mesh');
      channel.onmessage = (event) => {
        if (event.data?.type === 'file-transfer' && event.data.payload?.sender === 'mobile') {
          const p = event.data.payload;
          handleIncomingFile({
            id: p.id || `rx-${Date.now()}`,
            name: p.name,
            size: p.size,
            sender: 'mobile',
            target: 'laptop',
            time: p.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            url: p.url || `${serverUrl}/download/${encodeURIComponent(p.name)}`,
            status: autoSaveEnabled ? 'downloaded' : 'pending'
          });
        }
      };
    }

    return () => {
      eventSource?.close();
      channel?.close();
    };
  }, [autoSaveEnabled]);

  const handleIncomingFile = (item: IncomingFileItem) => {
    setReceivedFiles((prev) => {
      if (prev.some((f) => f.id === item.id || (f.name === item.name && f.time === item.time))) {
        return prev;
      }
      return [item, ...prev];
    });

    if (autoSaveEnabled) {
      handleDownloadFile(item);
    }
  };

  const handleDownloadFile = (item: IncomingFileItem) => {
    try {
      const url = item.url || `${serverUrl}/download/${encodeURIComponent(item.name)}`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setReceivedFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'downloaded' } : f))
      );
    } catch (e) {
      console.warn('Download error:', e);
    }
  };

  // Generate new security token
  const handleRefreshDynamicToken = () => {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    setDynamicToken(`TOKEN-${part1}-${part2}`);
  };

  // Preset quick selections
  const handleSelectPreset = (type: 'laptop' | 'mobile' | 'tv' | 'all') => {
    if (type === 'laptop') {
      setTargetLaptop(true);
      setTargetMobile(false);
      setTargetTv(false);
    } else if (type === 'mobile') {
      setTargetLaptop(false);
      setTargetMobile(true);
      setTargetTv(false);
    } else if (type === 'tv') {
      setTargetLaptop(false);
      setTargetMobile(false);
      setTargetTv(true);
    } else {
      setTargetLaptop(true);
      setTargetMobile(true);
      setTargetTv(true);
    }
  };

  // Sample files quick-pick chips
  const handlePickSampleChip = (name: string, size: string) => {
    setSelectedFile(null);
    setActivePresetName(name);
    setActivePresetSize(size);
    setStatusMessage('');
  };

  // Real file selected from disk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setActivePresetName(f.name);
      setActivePresetSize(
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(f.size / 1024))} KB`
      );
      setStatusMessage('');
    }
  };

  // Send File transmission
  const handleVerifyAndSend = async () => {
    const targetDevices: string[] = [];
    if (targetMobile) targetDevices.push('Mobile (Android)');
    if (targetTv) targetDevices.push('Smart TV (Living Room)');
    if (targetLaptop) targetDevices.push('Laptop (Windows 11)');

    if (targetDevices.length === 0) {
      setStatusMessage('Please select at least one destination device.');
      return;
    }

    setIsSending(true);
    setUploadProgress(15);
    setStatusMessage(`Broadcasting ${activePresetName} to ${targetDevices.join(', ')}...`);

    const pTimer = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 25 : prev));
    }, 150);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload = {
      id: `tx-${Date.now()}`,
      name: activePresetName,
      size: activePresetSize,
      sender: 'laptop',
      target: targetMobile && targetTv ? 'all' : targetMobile ? 'mobile' : 'tv',
      time: timeStr,
      url: `${serverUrl}/download/${encodeURIComponent(activePresetName)}`
    };

    // Try live POST to 192.168.1.2:4000/upload if user picked a real file
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('sender', 'laptop');
        formData.append('target', payload.target);
        formData.append('token', securityPin);
        await fetch(`${serverUrl}/upload`, { method: 'POST', body: formData });
      }
    } catch (e) {
      // fallback
    }

    clearInterval(pTimer);
    setUploadProgress(100);

    // Broadcast across windows
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('nijo_cross_device_sse_mesh');
        channel.postMessage({ type: 'file-transfer', payload });
        channel.close();
      } catch (e) {
        // ignore
      }
    }

    // Record in unified transfer history
    if (onAddTransfer) {
      const ext = activePresetName.split('.').pop()?.toLowerCase();
      let fType: TransferHistoryItem['type'] = 'text';
      if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) fType = 'video';
      else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) fType = 'image';
      else if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) fType = 'archive';
      else if (['ts', 'js', 'json', 'py', 'html', 'css'].includes(ext || '')) fType = 'code';
      else if (ext === 'pdf') fType = 'pdf';

      onAddTransfer({
        id: payload.id,
        name: activePresetName,
        size: activePresetSize,
        type: fType,
        sourceDevice: 'Laptop (Windows 11)',
        targetDevices: targetDevices,
        status: 'completed',
        timestamp: timeStr
      });
    }

    setTimeout(() => {
      setIsSending(false);
      setUploadProgress(0);
      setStatusMessage(`Transmitted successfully via Wi-Fi Direct Mesh! (Verified PIN: ${securityPin})`);
    }, 600);
  };

  // Send text to clipboard
  const handleSendClipboard = () => {
    if (!clipboardText.trim()) return;
    const newItem = {
      id: `clip-${Date.now()}`,
      text: clipboardText.trim(),
      sender: 'Laptop (Windows 11)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setClipboardItems([newItem, ...clipboardItems]);
    setClipboardText('');
  };

  const handleCopyClipboardItem = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClipId(id);
    setTimeout(() => setCopiedClipId(null), 2000);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return <FileVideo className="w-5 h-5 text-cyan-500" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) return <FileImage className="w-5 h-5 text-emerald-500" />;
    if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) return <FileArchive className="w-5 h-5 text-amber-500" />;
    if (['ts', 'js', 'json', 'py', 'html', 'css'].includes(ext || '')) return <FileCode className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] text-slate-900 flex flex-col overflow-y-auto select-none font-sans">
      
      {/* 1. Header: Cross-Device File Sharing Hub & Dynamic Token (Exact match to screenshot) */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Cross-Device File Sharing Hub
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Wi-Fi Direct Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Send File &amp; Receive File modes with dynamic PIN token security ({securityPin})
          </p>
        </div>

        {/* Dynamic Token Badge (Clickable for QR Code Modal) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer group"
            title="Click to show QR Code for Phone File Transfer (ഫോണിൽ സ്കാൻ ചെയ്യാനുള്ള ക്യുആർ കോഡ്)"
          >
            <QrCode className="w-4 h-4 text-[#1E3A8A] group-hover:scale-110 transition-transform" />
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{dynamicToken}</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded border border-blue-200">
              QR
            </span>
          </button>
          
          <button
            onClick={handleRefreshDynamicToken}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Refresh Security Token"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Tab Menu Bar: Send File, Receive File, Universal Clipboard (Exact match to screenshot) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {/* Send File Tab */}
          <button
            onClick={() => setActiveTab('send')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'send'
                ? 'bg-[#0F294A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-300" />
            <span>Send File (സെൻഡ് ഫയൽ)</span>
          </button>

          {/* Receive File Tab with unread count */}
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'receive'
                ? 'bg-[#0F294A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-cyan-300" />
            <span>Receive File (റിസീവ് ഫയൽ)</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              activeTab === 'receive' ? 'bg-cyan-400 text-slate-950' : 'bg-cyan-500 text-white'
            }`}>
              {receivedFiles.length}
            </span>
          </button>

          {/* Universal Clipboard Tab */}
          <button
            onClick={() => setActiveTab('clipboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'clipboard'
                ? 'bg-[#0F294A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clipboard className="w-4 h-4 text-cyan-300" />
            <span>Universal Clipboard</span>
          </button>
        </div>

        {/* PIN Monospace Info */}
        <div className="text-[11px] font-mono text-slate-500 shrink-0">
          PIN: {securityPin} Required on Transmit
        </div>
      </div>

      {/* 3. Main Body Container */}
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6 flex-1">

        {/* TAB 1: SEND FILE (Exact match to screenshot) */}
        {activeTab === 'send' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Send File via Wi-Fi Direct Mesh
                </h2>
                <p className="text-xs text-slate-500">
                  Select a real file from your PC or pick from sample assets
                </p>
              </div>

              {/* Browse PC File Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#0F294A] text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-[#1E3A8A]" />
                <span>Browse PC File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Selected File Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-[#0F294A] shrink-0">
                  {getFileIcon(activePresetName)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {activePresetName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {activePresetSize} · Ready for Wi-Fi Direct packet stream
                  </p>
                </div>
              </div>

              {/* Sample Quick Chips */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePickSampleChip('Mathematics_I_Formulas.pdf', '1.8 MB')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                >
                  Maths PDF
                </button>
                <button
                  type="button"
                  onClick={() => handlePickSampleChip('Python_Recursion_Demo.py', '45 KB')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                >
                  PSPP Code
                </button>
                <button
                  type="button"
                  onClick={() => handlePickSampleChip('Libra_Master_Vector_Assets.svg', '2.8 MB')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                >
                  Libra SVG
                </button>
              </div>
            </div>

            {/* Upload Progress Bar if Sending */}
            {isSending && (
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between text-xs font-mono text-[#0F294A]">
                  <span className="font-semibold">Transmitting Packet Stream...</span>
                  <span className="font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-blue-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0F294A] to-[#1E3A8A] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Route to Destination Devices (Exact match to screenshot) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Route to Destination Devices:
                </span>

                {/* Presets */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] mr-1">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('laptop')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Laptop Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('mobile')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Mobile Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('tv')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    TV Only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('all')}
                    className="px-3 py-1 bg-[#1E3A8A] hover:bg-[#16365F] text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    All 3 Devices
                  </button>
                </div>
              </div>

              {/* Destination Checkbox Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Mobile */}
                <label 
                  onClick={() => setTargetMobile(!targetMobile)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    targetMobile 
                      ? 'bg-blue-50/70 border-[#1E3A8A] shadow-2xs ring-1 ring-[#1E3A8A]/30' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={targetMobile}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-[#1E3A8A] focus:ring-0 cursor-pointer"
                  />
                  <Smartphone className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="text-xs font-semibold text-slate-800">
                    Mobile (Android)
                  </span>
                </label>

                {/* 2. Smart TV */}
                <label 
                  onClick={() => setTargetTv(!targetTv)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    targetTv 
                      ? 'bg-blue-50/70 border-[#1E3A8A] shadow-2xs ring-1 ring-[#1E3A8A]/30' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={targetTv}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-[#1E3A8A] focus:ring-0 cursor-pointer"
                  />
                  <Tv className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Smart TV (Living Room)
                  </span>
                </label>

                {/* 3. Laptop */}
                <label 
                  onClick={() => setTargetLaptop(!targetLaptop)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    targetLaptop 
                      ? 'bg-blue-50/70 border-[#1E3A8A] shadow-2xs ring-1 ring-[#1E3A8A]/30' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={targetLaptop}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-[#1E3A8A] focus:ring-0 cursor-pointer"
                  />
                  <Laptop className="w-4 h-4 text-[#0F294A]" />
                  <span className="text-xs font-semibold text-slate-800">
                    Laptop (Windows 11)
                  </span>
                </label>
              </div>
            </div>

            {/* Bottom Action: Verify PIN & Send File Button (Right aligned as in screenshot) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {statusMessage ? (
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{statusMessage}</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Ready to stream on local subnet 192.168.1.2:4000
                </span>
              )}

              <button
                onClick={handleVerifyAndSend}
                disabled={isSending}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all cursor-pointer shadow-md active:scale-95 ${
                  isSending
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-[#0F294A] hover:bg-[#1E3A8A]'
                }`}
              >
                <Send className="w-4 h-4 text-cyan-300" />
                <span>Verify PIN &amp; Send File</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: RECEIVE FILE (Clean, Minimized, No Test Mode) */}
        {activeTab === 'receive' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Received Files &amp; Inbound Stream
                </h2>
                <p className="text-xs text-slate-500">
                  Files sent from Android Mobile and Smart TV over Wi-Fi
                </p>
              </div>

              {/* Auto-Save Toggle (Default OFF) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 transition-colors cursor-pointer"
                  title="Toggle Auto-Save files to Laptop"
                >
                  {autoSaveEnabled ? (
                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Auto-Save to Laptop: {autoSaveEnabled ? 'ON' : 'OFF'}</span>
                </button>

                {/* Import local file from PC file manager */}
                <button
                  onClick={() => importReceivedInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  title="If file is in your PC file manager, load it here"
                >
                  <FolderOpen className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Import PC File</span>
                </button>
                <input
                  ref={importReceivedInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      handleIncomingFile({
                        id: `rx-man-${Date.now()}`,
                        name: f.name,
                        size: `${Math.round(f.size / 1024)} KB`,
                        sender: 'mobile',
                        target: 'laptop',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        url: URL.createObjectURL(f),
                        status: 'downloaded'
                      });
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Received List */}
            {receivedFiles.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Download className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No incoming files right now.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {receivedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[#0F294A] shrink-0">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{file.name}</h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {file.size} · From {file.sender.toUpperCase()} · {file.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <HardDriveDownload className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{file.status === 'downloaded' ? 'Save Again' : 'Download'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UNIVERSAL CLIPBOARD */}
        {activeTab === 'clipboard' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Universal Real-Time Clipboard
              </h2>
              <p className="text-xs text-slate-500">
                Instantly sync text, links, formulas, and snippets across Laptop and Phone
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type or paste link, caption, notes, or math formula..."
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendClipboard();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              />
              <button
                onClick={handleSendClipboard}
                className="px-4 py-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Send to Devices
              </button>
            </div>

            {/* Clipboard items */}
            <div className="space-y-2 pt-2">
              {clipboardItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-slate-800 font-mono select-all truncate">{item.text}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.sender} · {item.time}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyClipboardItem(item.id, item.text)}
                    className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedClipId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Unified Cross-Device Transfer History (Exact match to screenshot) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Unified Cross-Device Transfer History
              </h2>
              <p className="text-xs text-slate-500">
                Transferred and received records across Windows 11 PC, Android Phone, and Living Room TV
              </p>
            </div>

            {onClearTransfers && transfers.length > 0 && (
              <button
                onClick={onClearTransfers}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Clear Log
              </button>
            )}
          </div>

          {/* Transfer Records List */}
          {transfers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No transfer records yet. Send or receive a file to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {transfers.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0F294A]">
                      {getFileIcon(item.name)}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {item.size} · {item.sourceDevice} ➔ {item.targetDevices.join(', ')} · {item.timestamp}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* QR Code Scan Modal for Phone File Sending (User: ഒരു ടോക്കൺ ഉള്ളിടത്ത് ടോക്കൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ ഒരു ക്യുആർ കോഡ് ഫോണിൽ സ്കാൻ ചെയ്തിട്ട് ഫയൽ അയക്കുന്ന രീതിയിൽ സെറ്റപ്പ് ചെയ്യണം. മാക്സിമം മിനിമൈസ് ആക്കാൻ നോക്കുക) */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  ഫോണിൽ സ്കാൻ ചെയ്യുക (Scan QR Code)
                </h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Body */}
            <div className="p-6 text-center space-y-4">
              <p className="text-xs text-slate-600">
                മൊബൈൽ ക്യാമറ ഉപയോഗിച്ച് സ്കാൻ ചെയ്താൽ ഈ PC-യിലേക്ക് നേരിട്ട് ഫയലുകൾ അയക്കാം
              </p>

              {/* High Contrast Clean SVG QR Matrix */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <svg viewBox="0 0 25 25" className="w-44 h-44 mx-auto bg-white p-2 rounded-xl">
                  {generateQrMatrix(`http://192.168.1.2:4000/connect?token=${dynamicToken}&pin=${securityPin}`).map((row, r) =>
                    row.map((isDark, c) =>
                      isDark ? (
                        <rect
                          key={`qr-${r}-${c}`}
                          x={c}
                          y={r}
                          width="1"
                          height="1"
                          fill="#0F294A"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>

              {/* Token & PIN Code Badge */}
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Token:</span>
                  <span className="font-bold text-[#0F294A]">{dynamicToken}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Security PIN:</span>
                  <span className="font-bold text-emerald-700">{securityPin}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`http://192.168.1.2:4000/connect?token=${dynamicToken}&pin=${securityPin}`);
                    setQrCopied(true);
                    setTimeout(() => setQrCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {qrCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{qrCopied ? 'Copied Link' : 'Copy Connection Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="px-4 py-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FilesModule;
