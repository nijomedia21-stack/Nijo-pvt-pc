import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2, 
  Trash2, 
  Search,
  GraduationCap,
  Briefcase,
  Folder,
  FolderOpen,
  Filter,
  X,
  ChevronDown,
  Sparkles,
  Check
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, WorkspaceMode } from '../types';

interface TodayTasksModuleProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt'>) => void;
  onDeleteTask: (taskId: string) => void;
  currentWorkspace: WorkspaceMode;
}

export const TodayTasksModule: React.FC<TodayTasksModuleProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  currentWorkspace,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Active Category: 'today' | 'upcoming' | 'completed' | 'all'
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('today');

  // Main Sector: 'all' | 'study' | 'work'
  const [selectedSector, setSelectedSector] = useState<'all' | 'study' | 'work'>('all');

  // Specific Client Folder under Work: e.g. 'all_work' | 'Libra' | <client_name>
  const [selectedClientFolder, setSelectedClientFolder] = useState<string>('all_work');

  // Clients list (sync with localStorage)
  const [clients, setClients] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nijo_pvt_clients');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return ['Libra'];
  });

  // Modal State for Add Task
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newDueDate, setNewDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState<string>('18:00');
  const [taskType, setTaskType] = useState<'study' | 'client'>('study');
  const [taskClientName, setTaskClientName] = useState<string>('Libra');
  const [customClientName, setCustomClientName] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [newTags, setNewTags] = useState<string[]>([]);

  // Voice Note Recorder Simulation State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [voiceAttached, setVoiceAttached] = useState<boolean>(false);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [playingVoiceTaskId, setPlayingVoiceTaskId] = useState<string | null>(null);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordedDuration(0);
    const interval = setInterval(() => {
      setRecordedDuration((prev) => prev + 1);
    }, 1000);
    setRecordingInterval(interval);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    setVoiceAttached(true);
  };

  const handlePlayVoice = (taskId: string) => {
    if (playingVoiceTaskId === taskId) {
      setPlayingVoiceTaskId(null);
    } else {
      setPlayingVoiceTaskId(taskId);
      setTimeout(() => {
        setPlayingVoiceTaskId(null);
      }, 4000);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      setNewTags([...newTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let resolvedClient: string | undefined = undefined;
    if (taskType === 'client') {
      resolvedClient = customClientName.trim() || taskClientName;
      if (resolvedClient && !clients.includes(resolvedClient)) {
        const updated = [...clients, resolvedClient];
        setClients(updated);
        localStorage.setItem('nijo_pvt_clients', JSON.stringify(updated));
      }
    }

    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate,
      dueTime: newDueTime,
      completed: false,
      workspace: taskType === 'study' ? 'study' : 'design',
      clientName: resolvedClient,
      tags: newTags.length > 0 ? newTags : [taskType === 'study' ? 'Polytechnic' : (resolvedClient || 'Work')],
      voiceNoteUrl: voiceAttached ? 'voice_memo_attachment.wav' : undefined,
      voiceNoteDuration: voiceAttached ? `0:${recordedDuration < 10 ? '0' : ''}${recordedDuration}` : undefined,
    });

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setCustomClientName('');
    setNewTags([]);
    setVoiceAttached(false);
    setRecordedDuration(0);
    setIsAddModalOpen(false);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    // 1. Timeline Category filter
    if (activeCategory === 'today' && t.category !== 'today') return false;
    if (activeCategory === 'upcoming' && t.category !== 'upcoming') return false;
    if (activeCategory === 'completed' && !t.completed) return false;

    // 2. Sector Filter (Study vs Work)
    if (selectedSector === 'study') {
      if (t.workspace !== 'study') return false;
    } else if (selectedSector === 'work') {
      if (t.workspace === 'study') return false;
      // Client subfolder filter
      if (selectedClientFolder !== 'all_work') {
        const matchesClient = 
          t.clientName?.toLowerCase() === selectedClientFolder.toLowerCase() ||
          t.tags?.some(tag => tag.toLowerCase() === selectedClientFolder.toLowerCase()) ||
          t.title.toLowerCase().includes(selectedClientFolder.toLowerCase());
        if (!matchesClient) return false;
      }
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchClient = t.clientName?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchClient && !matchTag) return false;
    }

    return true;
  });

  // Study & Work Counts
  const studyTasksCount = tasks.filter(t => t.workspace === 'study' && !t.completed).length;
  const workTasksCount = tasks.filter(t => t.workspace !== 'study' && !t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden select-none">
      {/* 1. Header: NIJO PVT Task Suite & Today Priorities + New Task button on Right */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        {/* Left: App Title, Subtitle, and Task Count */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
              NIJO PVT Task Suite
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0F294A] text-cyan-200 font-mono shadow-2xs">
              {pendingCount} Pending · {tasks.length} Total
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today Priorities
            </h2>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-500 font-mono">
              Study: {studyTasksCount} | Work: {workTasksCount}
            </span>
          </div>
        </div>

        {/* Right: + New Task Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-cyan-300" />
          <span>New Task</span>
        </button>
      </div>

      {/* 2. Directly Below Header: Search bar + Filter Toggle (Minimized, Zero Bloat) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          {/* Search Input right under Today Priorities */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search today priorities, study topics, client deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Minimal Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              isFilterOpen || selectedSector !== 'all' || activeCategory !== 'today'
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Toggle Filter Options"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(selectedSector !== 'all' || activeCategory !== 'today') && (
              <span className="w-2 h-2 rounded-full bg-cyan-300" />
            )}
          </button>
        </div>

        {/* Timeline Tabs Pills (Today / Upcoming / Completed / All) */}
        <div className="flex items-center gap-1 text-xs">
          {(['today', 'upcoming', 'completed', 'all'] as TaskCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0F294A] text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conditional Filter Panel (Opened ONLY when Filter button is pressed) */}
      {isFilterOpen && (
        <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-3 space-y-3 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Filter by Category: Study (പഠനം) ⇄ Work (വർക്ക് &amp; ക്ലയന്റുകൾ)
            </span>
            <button
              onClick={() => {
                setSelectedSector('all');
                setSelectedClientFolder('all_work');
                setActiveCategory('today');
              }}
              className="text-[11px] font-semibold text-[#1E3A8A] hover:underline self-start sm:self-auto"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Column 1: Study (Polytechnic AI/ML) */}
            <div 
              onClick={() => setSelectedSector('study')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedSector === 'study'
                  ? 'bg-white border-[#1E3A8A] shadow-xs ring-1 ring-[#1E3A8A]/30'
                  : 'bg-white/80 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="font-bold text-slate-900">
                    Study (പഠിക്കാനുള്ളത്)
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A]">
                  {studyTasksCount} Tasks
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Semester 1: Maths I, Applied Physics, Chemistry, Python/PSPP
              </p>
            </div>

            {/* Column 2: Work (Client Folders like Libra) */}
            <div 
              className={`p-3 rounded-xl border transition-all ${
                selectedSector === 'work'
                  ? 'bg-white border-[#1E3A8A] shadow-xs ring-1 ring-[#1E3A8A]/30'
                  : 'bg-white/80 border-slate-200'
              }`}
            >
              <div 
                onClick={() => setSelectedSector('work')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="font-bold text-slate-900">
                    Work (ക്ലയന്റ് ഫോൾഡറുകൾ)
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A]">
                  {workTasksCount} Tasks
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Deliverables organized by Client Folders (Libra, etc.)
              </p>

              {/* Client Folders Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedSector('work');
                    setSelectedClientFolder('all_work');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    selectedSector === 'work' && selectedClientFolder === 'all_work'
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Clients
                </button>
                {clients.map(client => (
                  <button
                    key={client}
                    onClick={() => {
                      setSelectedSector('work');
                      setSelectedClientFolder(client);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      selectedSector === 'work' && selectedClientFolder === client
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{client}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Single-Line List View (No 4 fragmented columns! "നാല് കഷ്ണമായിട്ട് വേണ്ട, ഒറ്റ ലൈൻസിലായിട്ട് മതി") */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No tasks in this view</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new task for Polytechnic Study or your Client Folders.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <TaskSingleLineItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                playingVoiceTaskId={playingVoiceTaskId}
                onPlayVoice={handlePlayVoice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-300" />
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Create Task (Study or Client Work)
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="p-5 space-y-4 text-xs">
              {/* Category: Study vs Client Work */}
              <div className="p-2.5 bg-slate-100 rounded-xl flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTaskType('study')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    taskType === 'study'
                      ? 'bg-white text-[#0F294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Polytechnic Study (പഠനം)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTaskType('client')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    taskType === 'client'
                      ? 'bg-white text-[#0F294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Client Work (ലിബ്ര / ക്ലയന്റ്)</span>
                </button>
              </div>

              {/* If Client Task: Pick or Add Client */}
              {taskType === 'client' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                  <label className="block font-semibold text-slate-800">
                    Assign to Client Folder
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={taskClientName}
                      onChange={(e) => {
                        setTaskClientName(e.target.value);
                        setCustomClientName('');
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                    >
                      {clients.map((c) => (
                        <option key={c} value={c}>
                          📁 {c}
                        </option>
                      ))}
                      <option value="new">+ Type New Client Folder...</option>
                    </select>

                    {taskClientName === 'new' && (
                      <input
                        type="text"
                        placeholder="Client Folder Name..."
                        value={customClientName}
                        onChange={(e) => setCustomClientName(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder={taskType === 'study' ? 'e.g. Maths I: Solve Leibnitz theorem problems' : 'e.g. Libra Reel: Render 60fps vertical hook'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-slate-900 text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Deliverable Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add details, formulas, client instructions, or review notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-slate-900 text-xs"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Timeline Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="today">Today (Priority)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="high">High Priority (Navy Deep)</option>
                    <option value="medium">Medium Priority (Slate Teal)</option>
                    <option value="normal">Normal (Slate Standard)</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Time
                  </label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Voice Note Simulation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Mic className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Attach Voice Memo (Simulation)</span>
                  </div>
                  {voiceAttached && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Memo Ready (0:{recordedDuration < 10 ? '0' : ''}{recordedDuration})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F294A] text-white rounded-lg hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{voiceAttached ? 'Re-record Memo' : 'Record Audio Note'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer animate-pulse"
                    >
                      <MicOff className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Stop Recording ({recordedDuration}s)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tags
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Maths, Calculus, Libra, Reels"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
                  >
                    Add
                  </button>
                </div>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {newTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 border border-slate-200"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-slate-950 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white rounded-lg font-bold shadow-sm transition-all"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Single-Line Task Item Component
interface TaskSingleLineItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  playingVoiceTaskId: string | null;
  onPlayVoice: (taskId: string) => void;
}

const TaskSingleLineItem: React.FC<TaskSingleLineItemProps> = ({
  task,
  onToggle,
  onDelete,
  playingVoiceTaskId,
  onPlayVoice,
}) => {
  const isPlayingThisVoice = playingVoiceTaskId === task.id;

  return (
    <div
      className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-all group hover:bg-slate-50/80 ${
        task.completed ? 'bg-slate-50/40 text-slate-400' : 'bg-white text-slate-900'
      }`}
    >
      {/* Left: Checkbox + Title + Badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => onToggle(task.id)}
          className="text-slate-400 hover:text-[#0F294A] transition-colors cursor-pointer shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-[#0F294A]" />
          ) : (
            <Circle className="w-5 h-5 hover:stroke-[#1E3A8A]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold tracking-tight truncate ${
                task.completed ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </span>

            {/* Folder / Sector Badge */}
            {task.workspace === 'study' ? (
              <span className="text-[10px] font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>Polytechnic Study</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 shrink-0 flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span>{task.clientName || 'Work Deliverable'}</span>
              </span>
            )}

            {/* Priority Indicator */}
            {task.priority === 'high' && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#0F294A] border border-slate-300">
                High
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xl">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Due Date/Time, Voice Memo, Delete */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Voice Memo Player */}
        {task.voiceNoteDuration && (
          <button
            onClick={() => onPlayVoice(task.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
              isPlayingThisVoice 
                ? 'bg-[#0F294A] text-cyan-300' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Play Audio Memo"
          >
            {isPlayingThisVoice ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Playing...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>{task.voiceNoteDuration}</span>
              </>
            )}
          </button>
        )}

        {/* Due Time / Date */}
        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 hidden sm:flex">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{task.dueDate}</span>
          {task.dueTime && (
            <>
              <span>·</span>
              <span>{task.dueTime}</span>
            </>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
