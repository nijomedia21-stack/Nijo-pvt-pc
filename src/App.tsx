import React, { useState, useEffect } from 'react';
import { 
  WorkspaceMode, 
  Task, 
  CalendarEvent, 
  TransferHistoryItem, 
  ConnectedDevice 
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_TRANSFERS, 
  CONNECTED_DEVICES, 
  getKeralaPanchangamForDate 
} from './data/initialData';
import { Windows11Header } from './components/Windows11Header';
import { NavigationSidebar, NavigationTab } from './components/NavigationSidebar';
import { WorkspaceSwitcherModal } from './components/WorkspaceSwitcherModal';
import { TodayTasksModule } from './components/TodayTasksModule';
import { CalendarModule } from './components/CalendarModule';
import { FilesModule } from './components/FilesModule';
import { AdaptiveStudyDesignModule } from './components/AdaptiveStudyDesignModule';
import { CopilotWidget } from './components/CopilotWidget';
import { SettingsModal } from './components/SettingsModal';
import { LockScreen } from './components/LockScreen';
import { DailySummaryModal } from './components/DailySummaryModal';

export default function App() {
  // Authentication & Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [securityPin, setSecurityPin] = useState<string>(() => {
    return localStorage.getItem('nijo_pvt_pin') || '8492';
  });

  // Workspace Mode (Dual Persona: Study Mode vs Freelance Design Studio)
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(() => {
    return (localStorage.getItem('nijo_pvt_workspace') as WorkspaceMode) || 'study';
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('tasks');

  // Modals
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState<boolean>(false);

  // Core Data
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('nijo_pvt_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: 'ev-1',
      title: 'Mathematics I: Semester 1 Board Exam',
      date: '2026-11-24',
      time: '09:30',
      type: 'exam',
      vibrationTrigger: 'poly',
      notes: 'Hall 4, Polytechnic Campus. Carry Scientific Calculator and Hall Ticket.',
      workspace: 'study'
    },
    {
      id: 'ev-2',
      title: 'Libra Reel 04 Launch (Navy Aesthetics)',
      date: '2026-11-04',
      time: '19:30',
      type: 'reels',
      vibrationTrigger: 'rapid',
      notes: 'Push 60fps vertical render to Instagram and verify audio licensing.',
      workspace: 'design'
    },
    {
      id: 'ev-3',
      title: 'Applied Physics Board Exam',
      date: '2026-11-27',
      time: '09:30',
      type: 'exam',
      vibrationTrigger: 'poly',
      notes: 'Revise Numerical Aperture and Laser equations.',
      workspace: 'study'
    },
    {
      id: 'ev-4',
      title: 'Mandala Kalam Begins (Vrischikam 1)',
      date: '2026-11-16',
      time: '06:00',
      type: 'festival',
      vibrationTrigger: 'gentle',
      notes: 'Kerala traditional observance.',
      workspace: 'general'
    }
  ]);

  const [transfers, setTransfers] = useState<TransferHistoryItem[]>(() => {
    const saved = localStorage.getItem('nijo_pvt_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [devices] = useState<ConnectedDevice[]>(CONNECTED_DEVICES);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('nijo_pvt_workspace', workspaceMode);
  }, [workspaceMode]);

  useEffect(() => {
    localStorage.setItem('nijo_pvt_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nijo_pvt_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('nijo_pvt_pin', securityPin);
  }, [securityPin]);

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Calendar Event Handler
  const handleAddCalendarEvent = (newEvent: CalendarEvent) => {
    setCalendarEvents((prev) => [...prev, newEvent]);
  };

  // Transfer Handlers
  const handleAddTransfer = (item: TransferHistoryItem) => {
    setTransfers((prev) => [item, ...prev]);
  };

  const handleClearTransfers = () => {
    setTransfers([]);
  };

  // Panchangam for Selected Date
  const currentPanchangam = getKeralaPanchangamForDate(selectedDateStr);
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0F294A] text-slate-900 select-none overflow-hidden font-sans">
      {/* Lock Screen if Locked */}
      {isLocked && (
        <LockScreen
          onUnlock={() => setIsLocked(false)}
          securityPin={securityPin}
        />
      )}

      {/* Windows 11 Title Bar & Header */}
      <Windows11Header
        workspaceMode={workspaceMode}
        onOpenWorkspaceSwitcher={() => setIsWorkspaceSwitcherOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isCopilotOpen={isCopilotOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLockApp={() => setIsLocked(true)}
        panchangam={currentPanchangam}
      />

      {/* Windows 11 Desktop Main Workspace (Sidebar + Module Canvas) */}
      <div className="flex-1 flex overflow-hidden bg-[#F8FAFC]">
        {/* Navigation Rail / Sidebar */}
        <NavigationSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          workspaceMode={workspaceMode}
          onOpenWorkspaceSwitcher={() => setIsWorkspaceSwitcherOpen(true)}
          pendingTasksCount={pendingTasksCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLockApp={() => setIsLocked(true)}
          onOpenDailySummary={() => setIsDailySummaryOpen(true)}
          securityPin={securityPin}
        />

        {/* Dynamic Navigation Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'tasks' && (
            <TodayTasksModule
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              currentWorkspace={workspaceMode}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarModule
              events={calendarEvents}
              onAddEvent={handleAddCalendarEvent}
              selectedDateStr={selectedDateStr}
              onSelectDate={setSelectedDateStr}
            />
          )}

          {activeTab === 'files' && (
            <FilesModule
              devices={devices}
              transfers={transfers}
              onAddTransfer={handleAddTransfer}
              onClearTransfers={handleClearTransfers}
              securityPin={securityPin}
            />
          )}

          {activeTab === 'adaptive' && (
            <AdaptiveStudyDesignModule
              workspaceMode={workspaceMode}
              onOpenWorkspaceSwitcher={() => setIsWorkspaceSwitcherOpen(true)}
            />
          )}

          {/* Floating AI Copilot Widget */}
          <CopilotWidget
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
            workspaceMode={workspaceMode}
            tasks={tasks}
            events={calendarEvents}
            selectedDateStr={selectedDateStr}
          />
        </main>
      </div>

      {/* Daily Summary Modal Snapshot */}
      <DailySummaryModal
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
        tasks={tasks}
        events={calendarEvents}
        workspaceMode={workspaceMode}
        panchangam={currentPanchangam}
      />

      {/* Instagram-Style Dual Workspace Profile Switcher Modal */}
      <WorkspaceSwitcherModal
        isOpen={isWorkspaceSwitcherOpen}
        onClose={() => setIsWorkspaceSwitcherOpen(false)}
        currentMode={workspaceMode}
        onSelectMode={(mode) => setWorkspaceMode(mode)}
      />

      {/* Settings & System Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        securityPin={securityPin}
        onUpdateSecurityPin={(newPin) => setSecurityPin(newPin)}
        devices={devices}
        onSignOut={() => setIsLocked(true)}
      />
    </div>
  );
}
