import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Lock, 
  Sparkles, 
  Layers,
  Wifi,
  WifiOff
} from 'lucide-react';
import { WorkspaceMode, PanchangamInfo } from '../types';

interface Windows11HeaderProps {
  workspaceMode: WorkspaceMode;
  onOpenWorkspaceSwitcher: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onOpenSettings: () => void;
  onLockApp: () => void;
  panchangam?: PanchangamInfo;
}

export const Windows11Header: React.FC<Windows11HeaderProps> = ({
  workspaceMode,
  onOpenWorkspaceSwitcher,
  onToggleCopilot,
  isCopilotOpen,
  onOpenSettings,
  onLockApp,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Automatic Wi-Fi Connection State
  const [isWifiConnected, setIsWifiConnected] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [localHubOnline, setLocalHubOnline] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Automatic Wi-Fi state listener
  useEffect(() => {
    const handleOnline = () => {
      setIsWifiConnected(true);
      checkLocalHub();
    };

    const handleOffline = () => {
      setIsWifiConnected(false);
      setLocalHubOnline(false);
    };

    const checkLocalHub = async () => {
      try {
        const res = await fetch('http://192.168.1.2:4000/status', { 
          signal: AbortSignal.timeout(2000) 
        });
        if (res.ok) setLocalHubOnline(true);
      } catch (e) {
        // Hub offline or on different subnet, but Wi-Fi remains online
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const pingInterval = setInterval(checkLocalHub, 8000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, []);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      onOpenWorkspaceSwitcher();
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <header className="h-11 bg-[#0F294A] text-white flex items-center justify-between px-4 select-none border-b border-[#1E3A8A]/80 shadow-xs z-30 shrink-0">
      {/* Left: Clean Minimalist Branding (NIJO PVT PC with Layers icon right beside PC, no Polytechnic AML) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenWorkspaceSwitcher}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Click to Switch Workspace"
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1E3A8A]/60 hover:bg-[#1E3A8A] transition-all cursor-pointer group active:scale-95"
        >
          <span className="font-mono font-bold text-sm text-cyan-300 tracking-tighter">
            &lt;/&gt;
          </span>
          <span className="text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
            <span>NIJO PVT <span className="text-cyan-300 font-medium">PC</span></span>
            <Layers className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
          </span>
        </button>
      </div>

      {/* Right: Clock, Copilot Toggle, Settings (No Wi-Fi icon, no Lock icon as requested) */}
      <div className="flex items-center gap-2">
        {/* Real-time Clock */}
        <div className="text-xs font-mono text-slate-200 px-2.5 py-1 rounded-lg bg-black/25 hidden sm:block">
          {currentTime || '09:16:29'}
        </div>

        {/* Nijo Copilot Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isCopilotOpen 
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' 
              : 'bg-[#1E3A8A] text-slate-200 hover:text-white hover:bg-[#2563eb]/60'
          }`}
          title="Toggle Nijo AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Copilot</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="Workspace Settings & Account"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Windows11Header;
