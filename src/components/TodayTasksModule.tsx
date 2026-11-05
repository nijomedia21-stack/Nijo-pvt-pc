import React, { useState } from 'react';
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
  LayoutGrid, 
  List, 
  Trash2, 
  Search,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  UserPlus
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
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('today');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2nd Row Filter: 'both' | 'study' | <client_name>
  const [selectedContext, setSelectedContext] = useState<string>('both');

  // Dynamic Clients list (Starts with 'Libra', can add more)
  const [clients, setClients] = useState<string[]>(() => {
    const saved = localStorage.getItem('nijo_pvt_clients');
    return saved ? JSON.parse(saved) : ['Libra'];
  });

  // Modal State for Add Client
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState<boolean>(false);
  const [newClientInput, setNewClientInput] = useState<string>('');

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

  // Voice playback simulation
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

  const handleAddClientDirectly = (nameToAdd: string) => {
    const trimmed = nameToAdd.trim();
    if (!trimmed) return;
    if (!clients.includes(trimmed)) {
      const updated = [...clients, trimmed];
      setClients(updated);
      localStorage.setItem('nijo_pvt_clients', JSON.stringify(updated));
    }
    setSelectedContext(trimmed);
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
      tags: newTags.length > 0 ? newTags : [taskType === 'study' ? 'Polytechnic' : (resolvedClient || 'Client Work')],
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
    // 1. Category filter
    if (activeCategory === 'today' && t.category !== 'today') return false;
    if (activeCategory === 'upcoming' && t.category !== 'upcoming') return false;
    if (activeCategory === 'completed' && !t.completed) return false;

    // 2. Second Row Context Filter (Both / Study / Client Name)
    if (selectedContext === 'study') {
      if (t.workspace !== 'study') return false;
    } else if (selectedContext !== 'both') {
      // Must match specific client name
      const matchesClient = t.clientName?.toLowerCase() === selectedContext.toLowerCase() ||
        t.tags.some(tag => tag.toLowerCase() === selectedContext.toLowerCase()) ||
        t.title.toLowerCase().includes(selectedContext.toLowerCase());
      if (!matchesClient) return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchClient = t.clientName?.toLowerCase().includes(q);
      const matchTag = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchClient && !matchTag) return false;
    }

    return true;
  });

  // Kanban Columns
  const kanbanColumns = [
    { id: 'todo', title: 'To Do Priorities', filter: (t: Task) => !t.completed && t.category === 'today' },
    { id: 'in_progress', title: 'Active & In Progress', filter: (t: Task) => !t.completed && t.priority === 'high' },
    { id: 'upcoming', title: 'Upcoming Deadlines', filter: (t: Task) => !t.completed && t.category === 'upcoming' },
    { id: 'completed', title: 'Completed Tasks', filter: (t: Task) => t.completed },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Top Action Bar (Optimized: Title on Left, New Task centered, Search on Right) */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        {/* Left: Title & Count */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
            Today & Priorities
          </h1>
          <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Center: Prominent "New Task" Button */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>New Task</span>
          </button>
        </div>

        {/* Right: Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] w-36 sm:w-48 text-slate-800"
            />
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-[#0F294A] shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-[#0F294A] shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Primary Category Tabs (Today / Upcoming / Completed / All) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 overflow-x-auto text-xs shrink-0">
        <div className="flex items-center gap-1">
          {(['today', 'all', 'upcoming', 'completed'] as TaskCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0F294A] text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Tasks' : cat}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          NIJO PVT PC Task Suite
        </span>
      </div>

      {/* Row 2: Secondary Context Filter (Both, Study, Clients: Libra, etc.) */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
          Filter:
        </span>

        {/* 1. Both */}
        <button
          onClick={() => setSelectedContext('both')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            selectedContext === 'both'
              ? 'bg-[#1E3A8A] text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
          }`}
        >
          Both
        </button>

        {/* 2. Study */}
        <button
          onClick={() => setSelectedContext('study')}
          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedContext === 'study'
              ? 'bg-[#1E3A8A] text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Study</span>
        </button>

        {/* 3. Clients Chips */}
        {clients.map((client) => (
          <button
            key={client}
            onClick={() => setSelectedContext(client)}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedContext === client
                ? 'bg-[#1E3A8A] text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3 h-3 text-cyan-600" />
            <span>{client}</span>
          </button>
        ))}

        {/* Add Client Quick Button */}
        <button
          onClick={() => setIsAddClientModalOpen(true)}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-[#1E3A8A] hover:bg-blue-50 border border-dashed border-[#1E3A8A]/40 flex items-center gap-1 transition-colors cursor-pointer"
          title="Add New Client"
        >
          <Plus className="w-3 h-3" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'kanban' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full items-start">
            {kanbanColumns.map((col) => {
              const colTasks = filteredTasks.filter(col.filter);
              return (
                <div 
                  key={col.id} 
                  className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/80 flex flex-col max-h-[calc(100vh-230px)]"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 tracking-wide">
                      {col.title}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">
                        No tasks in this lane
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={onToggleTask}
                          onDelete={onDeleteTask}
                          playingVoiceTaskId={playingVoiceTaskId}
                          onPlayVoice={handlePlayVoice}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="max-w-4xl mx-auto space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">No tasks found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust your search or add a new task for Polytechnic or your Clients.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  playingVoiceTaskId={playingVoiceTaskId}
                  onPlayVoice={handlePlayVoice}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Add New Client
                </h3>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Client / Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Studio, Nexa Brand, Vertex..."
                  value={newClientInput}
                  onChange={(e) => setNewClientInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddClientDirectly(newClientInput);
                    setNewClientInput('');
                    setIsAddClientModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation & Voice Note Modal */}
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
                  Create New Task
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
              {/* Context Selector: Study vs Client Task */}
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
                  <span>Polytechnic Study</span>
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
                  <span>Client Deliverable</span>
                </button>
              </div>

              {/* If Client Task: Pick or Add Client */}
              {taskType === 'client' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                  <label className="block font-semibold text-slate-800">
                    Assign to Client
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
                          {c}
                        </option>
                      ))}
                      <option value="new">+ Type New Client...</option>
                    </select>

                    {taskClientName === 'new' && (
                      <input
                        type="text"
                        placeholder="Client Name..."
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
                  placeholder="Add details, client requirements, formulas, or review notes..."
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
                    Priority (Strict Zero-Red)
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

              {/* Voice Notes Modal Simulator */}
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

              {/* Footer Buttons */}
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

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  playingVoiceTaskId: string | null;
  onPlayVoice: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onDelete,
  playingVoiceTaskId,
  onPlayVoice,
}) => {
  const isPlayingThisVoice = playingVoiceTaskId === task.id;

  const priorityBadge = {
    high: { text: 'text-[#0F294A]', label: 'High Priority' },
    medium: { text: 'text-[#1E3A8A]', label: 'Medium' },
    normal: { text: 'text-slate-600', label: 'Normal' },
  }[task.priority];

  return (
    <div
      className={`bg-white rounded-xl p-3.5 border transition-all shadow-2xs group hover:shadow-xs ${
        task.completed ? 'opacity-65 border-slate-200 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 text-slate-400 hover:text-[#0F294A] transition-colors cursor-pointer shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-[#0F294A]" />
          ) : (
            <Circle className="w-4 h-4 hover:stroke-[#1E3A8A]" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-xs font-semibold tracking-tight text-slate-900 leading-snug ${
                task.completed ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h4>

            {task.clientName && (
              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200 shrink-0">
                {task.clientName}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Voice Memo Player Bar */}
          {task.voiceNoteDuration && (
            <div className="mt-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <button
                onClick={() => onPlayVoice(task.id)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  isPlayingThisVoice ? 'bg-[#0F294A] text-cyan-300' : 'bg-[#1E3A8A] text-white hover:bg-[#16365F]'
                }`}
              >
                {isPlayingThisVoice ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Playing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play Voice ({task.voiceNoteDuration})</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Volume2 className="w-3 h-3 text-slate-400" />
                <span>Audio Memo</span>
              </div>
            </div>
          )}

          {/* Clean Unboxed Metadata */}
          <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
            <span className={`font-semibold ${priorityBadge.text}`}>
              {priorityBadge.label}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {task.dueDate}
            </span>
            {task.dueTime && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {task.dueTime}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="text-[#1E3A8A] font-medium capitalize">
              {task.workspace === 'study' ? 'Polytechnic Study' : (task.clientName || 'Client')}
            </span>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800 p-1 transition-all rounded cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
