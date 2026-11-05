import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tv, 
  Settings, 
  Lock, 
  Sparkles, 
  Layers, 
  Minus, 
  Square, 
  X,
  ShieldCheck,
  Download,
  Wifi
} from 'lucide-react';
import { WorkspaceMode, PanchangamInfo } from '../types';

interface Windows11HeaderProps {
  workspaceMode: WorkspaceMode;
  onOpenWorkspaceSwitcher: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onOpenSettings: () => void;
  onLockApp: () => void;
  onOpenExportExe?: () => void;
  panchangam?: PanchangamInfo;
}

export const Windows11Header: React.FC<Windows11HeaderProps> = ({
  workspaceMode,
  onOpenWorkspaceSwitcher,
  onToggleCopilot,
  isCopilotOpen,
  onOpenSettings,
  onLockApp,
  onOpenExportExe,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMaximized, setIsMaximized] = useState<boolean>(true);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

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
    <header className="h-11 bg-[#0F294A] text-white flex items-center justify-between px-3 select-none border-b border-[#1E3A8A] shadow-sm z-30 shrink-0">
      {/* Left: Branding & Instagram-style Switcher Trigger */}
      <div className="flex items-center gap-3">
        {/* Logo with Long-Press or Click for Workspace switch */}
        <button
          onClick={onOpenWorkspaceSwitcher}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Click or Long-Press to Switch Workspace (Polytechnic AI & ML ⇄ Libra Studio)"
          className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#1E3A8A]/60 hover:bg-[#1E3A8A] transition-all cursor-pointer group active:scale-95"
        >
          <span className="font-mono font-bold text-sm text-cyan-300 tracking-tighter group-hover:text-cyan-200">
            &lt;/&gt;
          </span>
          <span className="text-xs font-bold tracking-wider text-white">
            NIJO PVT <span className="text-cyan-300 font-medium">PC</span>
          </span>
          <span className="text-[10px] text-slate-300 font-normal hidden sm:inline">
            · {workspaceMode === 'study' ? 'Polytechnic AI & ML' : 'Libra Studio'}
          </span>
          <Layers className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
        </button>

        {/* Local Mesh Status */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300 pl-2 border-l border-white/10">
          <div className="flex items-center gap-1.5" title="Laptop Windows 11 (This PC - Host)">
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium text-slate-200">This PC</span>
          </div>
          <span className="text-slate-500">·</span>
          <div className="flex items-center gap-1.5" title="Mobile Android (NIJO PVT Paired)">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-300">Android</span>
          </div>
          <span className="text-slate-500">·</span>
          <div className="flex items-center gap-1.5" title="Smart TV (Living Room Ready)">
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Smart TV</span>
          </div>
          <span className="text-slate-500">·</span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <Wifi className="w-3 h-3" />
            <span>Mesh 0.8ms</span>
          </div>
        </div>
      </div>

      {/* Right: Clock, Copilot, Settings, Lock, Window Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Real-time Clock */}
        <div className="text-xs font-mono text-slate-200 px-2 py-0.5 rounded bg-black/20 hidden sm:block">
          {currentTime || '09:16:29'}
        </div>

        {/* NIJO PVT PC .exe Button */}
        {onOpenExportExe && (
          <button
            onClick={onOpenExportExe}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Convert into NIJO PVT PC .exe file for Windows 11"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono">NIJO PVT PC .exe</span>
            <span className="sm:hidden font-mono">.exe</span>
          </button>
        )}

        {/* Nijo Copilot Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
            isCopilotOpen 
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' 
              : 'bg-[#1E3A8A] text-slate-200 hover:text-white hover:bg-[#2563eb]/50'
          }`}
          title="Toggle Nijo AI Copilot (Windows 11 Copilot Pane)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Copilot</span>
        </button>

        {/* PIN Security Badge */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Security PIN: 8492 Active"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline text-[11px]">PIN: 8492</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Workspace Settings & Mesh Config"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Lock Screen */}
        <button
          onClick={onLockApp}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Lock PC Workspace"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>

        {/* Windows 11 Standard Window Controls */}
        <div className="flex items-center ml-1 border-l border-white/15 pl-1.5">
          <button 
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={isMaximized ? "Restore Down" : "Maximize"}
          >
            <Square className="w-3 h-3" />
          </button>
          <button 
            onClick={onLockApp}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1E3A8A] rounded transition-colors"
            title="Lock & Exit Workspace"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
