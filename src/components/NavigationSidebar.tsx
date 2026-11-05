import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  FolderSync, 
  Briefcase, 
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Lock,
  Shield,
  Download
} from 'lucide-react';
import { WorkspaceMode } from '../types';

export type NavigationTab = 'tasks' | 'calendar' | 'files' | 'adaptive';

interface NavigationSidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  workspaceMode: WorkspaceMode;
  onOpenWorkspaceSwitcher: () => void;
  pendingTasksCount: number;
  onOpenSettings: () => void;
  onLockApp: () => void;
  onOpenExportExe?: () => void;
  securityPin: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  workspaceMode,
  onOpenWorkspaceSwitcher,
  pendingTasksCount,
  onOpenSettings,
  onLockApp,
  onOpenExportExe,
  securityPin,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-16' : 'w-56'
      } bg-[#0F294A] text-white flex flex-col justify-between shrink-0 border-r border-[#1E3A8A]/60 shadow-lg select-none transition-all duration-200 z-20`}
    >
      {/* Top: Header & Navigation Items */}
      <div className="flex flex-col">
        {/* Sidebar Header with Expand/Collapse */}
        <div className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#1E3A8A]/60`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center font-bold text-cyan-300 text-xs">
                NIJO
              </div>
              <span className="text-xs font-extrabold tracking-wider text-white">
                NIJO SMM <span className="text-cyan-300 font-medium">PC</span>
              </span>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-cyan-300" /> : <PanelLeftClose className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1.5">
          {/* 1. Today (Tasks) */}
          <button
            onClick={() => onSelectTab('tasks')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
              activeTab === 'tasks'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Tasks"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className={`w-4 h-4 ${activeTab === 'tasks' ? 'text-cyan-300' : 'text-slate-400'}`} />
              {!isCollapsed && <span>Tasks</span>}
            </div>
            {pendingTasksCount > 0 && (
              <span className={`${
                isCollapsed 
                  ? 'absolute -top-1 -right-1 w-4 h-4 text-[9px] flex items-center justify-center rounded-full bg-cyan-400 text-slate-950 font-bold' 
                  : 'text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#16365F] text-cyan-200'
              }`}>
                {pendingTasksCount}
              </span>
            )}
          </button>

          {/* 2. Calendar */}
          <button
            onClick={() => onSelectTab('calendar')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Calendar"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className={`w-4 h-4 ${activeTab === 'calendar' ? 'text-cyan-300' : 'text-slate-400'}`} />
              {!isCollapsed && <span>Calendar</span>}
            </div>
          </button>

          {/* 3. File Sharing (Socket.io Laptop/Mobile/TV) */}
          <button
            onClick={() => onSelectTab('files')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
              activeTab === 'files'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="File Sharing (Laptop · Mobile · TV)"
          >
            <div className="flex items-center gap-3">
              <FolderSync className={`w-4 h-4 ${activeTab === 'files' ? 'text-cyan-300' : 'text-slate-400'}`} />
              {!isCollapsed && <span>File Sharing</span>}
            </div>
            <div className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse ${isCollapsed ? 'absolute top-1.5 right-1.5' : ''}`} />
          </button>

          {/* 4. Clients & Studio (Nijo SMM Studio with Libra) */}
          <button
            onClick={() => onSelectTab('adaptive')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'adaptive'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Clients & Studio (Libra SMM)"
          >
            <div className="flex items-center gap-3">
              <Briefcase className={`w-4 h-4 ${activeTab === 'adaptive' ? 'text-cyan-300' : 'text-slate-400'}`} />
              {!isCollapsed && <span>Clients & Studio</span>}
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom Profile Area: Logo is 'NIJO' in English */}
      <div className="p-2.5 border-t border-[#1E3A8A]/80 bg-[#0A1C33]/60 relative">
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-start p-2 gap-3'} rounded-xl hover:bg-white/10 transition-colors cursor-pointer group`}
          title="Nijo Profile (Click to open settings)"
        >
          {/* Logo is 'NIJO' in English */}
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-cyan-300 font-extrabold flex items-center justify-center text-xs border border-cyan-400/40 shrink-0">
            NIJO
          </div>

          {!isCollapsed && (
            <div className="truncate text-left">
              <div className="text-xs font-bold text-white truncate leading-tight">
                Nijo
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">
                PIN: {securityPin}
              </div>
            </div>
          )}
        </button>

        {/* Profile Popover if clicked */}
        {isProfileMenuOpen && (
          <div 
            className="absolute bottom-14 left-2 w-52 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0F294A] text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0">
                NIJO
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">
                  Nijo
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  nijo.media21@gmail.com
                </div>
              </div>
            </div>

            <div className="py-2 space-y-1 text-xs">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-left"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>Settings & Security PIN</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onLockApp();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-left"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Lock Workspace</span>
              </button>

              {onOpenExportExe && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenExportExe();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 text-cyan-900 font-semibold transition-colors cursor-pointer text-left"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600" />
                  <span>NIJO PVT PC .exe</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>PIN: {securityPin}</span>
              </span>
              <span className="font-mono text-cyan-700">NIJO SMM</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
