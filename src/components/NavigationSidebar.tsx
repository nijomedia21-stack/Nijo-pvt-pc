import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  FolderSync, 
  Briefcase, 
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
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
  onOpenDailySummary: () => void;
  securityPin: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingTasksCount,
  onOpenDailySummary,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              Menu
            </span>
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

          {/* 4. Studio (Previously Clients & Studio, renamed to just Studio) */}
          <button
            onClick={() => onSelectTab('adaptive')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'adaptive'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Studio (NIJO SMM & Clients)"
          >
            <div className="flex items-center gap-3">
              <Briefcase className={`w-4 h-4 ${activeTab === 'adaptive' ? 'text-cyan-300' : 'text-slate-400'}`} />
              {!isCollapsed && <span>Studio</span>}
            </div>
          </button>
        </nav>

        {/* Dedicated Daily Summary Button */}
        <div className="px-2 pt-2 pb-1 border-t border-[#1E3A8A]/50 mt-1">
          <button
            onClick={onOpenDailySummary}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-start px-3 py-2.5 gap-3'} rounded-xl text-xs font-semibold bg-gradient-to-r from-[#16365F] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#2563eb] text-cyan-200 border border-cyan-400/30 shadow-sm transition-all cursor-pointer group active:scale-95`}
            title="Daily Summary Snapshot (Completed tasks & upcoming events)"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            {!isCollapsed && (
              <div className="text-left">
                <span className="block font-bold text-white text-xs">Daily Summary</span>
                <span className="block text-[10px] text-cyan-300 font-mono">Today's Snapshot</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
