import React, { useState, useEffect, useRef } from 'react';
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
  Check, 
  Edit2, 
  RotateCcw, 
  Headphones, 
  Square,
  SlidersHorizontal,
  FileAudio
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, WorkspaceMode } from '../types';
import { voiceAudioEngine, startMicrophoneRecording, ActiveRecordingSession } from '../utils/audioPlayerHelper';

interface TodayTasksModuleProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  currentWorkspace: WorkspaceMode;
}

export const TodayTasksModule: React.FC<TodayTasksModuleProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onUpdateTask,
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

  // Modal State for Edit Task (Universal Edit Requirement)
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [editPriority, setEditPriority] = useState<TaskPriority>('high');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDueTime, setEditDueTime] = useState<string>('');
  const [editTaskType, setEditTaskType] = useState<'study' | 'client'>('study');
  const [editClientName, setEditClientName] = useState<string>('Libra');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState<string>('');
  const [editVoiceUrl, setEditVoiceUrl] = useState<string | undefined>(undefined);
  const [editVoiceDuration, setEditVoiceDuration] = useState<string | undefined>(undefined);

  // Voice Note Recording State (Real Mic & Waveform)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [voiceAttached, setVoiceAttached] = useState<boolean>(false);
  const activeRecordingRef = useRef<ActiveRecordingSession | null>(null);

  // Dedicated Voice Memo Studio Preview Modal
  const [activeVoiceMemoModal, setActiveVoiceMemoModal] = useState<{
    isOpen: boolean;
    title: string;
    duration: string;
    url?: string;
    taskId?: string;
    notes?: string;
  } | null>(null);

  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [voiceCurrentSec, setVoiceCurrentSec] = useState<number>(0);
  const [voiceTotalSec, setVoiceTotalSec] = useState<number>(42);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1);
  const stopAudioFnRef = useRef<(() => void) | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (stopAudioFnRef.current) {
        stopAudioFnRef.current();
      }
      voiceAudioEngine.stop();
    };
  }, []);

  // Parse duration string e.g. "0:42" -> 42
  const parseDurationStringToSec = (dStr?: string): number => {
    if (!dStr) return 30;
    const parts = dStr.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    const num = parseInt(dStr, 10);
    return isNaN(num) ? 30 : num;
  };

  // Start Real Microphone / Simulated Recording
  const startVoiceRecording = async () => {
    setIsRecording(true);
    setRecordedDuration(0);
    setRecordedAudioUrl(null);

    const session = await startMicrophoneRecording((dur) => {
      setRecordedDuration(dur);
    });
    activeRecordingRef.current = session;
  };

  // Stop Recording & Show Instant In-Modal Preview Player
  const stopVoiceRecording = async () => {
    setIsRecording(false);
    if (activeRecordingRef.current) {
      const result = await activeRecordingRef.current.stop();
      activeRecordingRef.current = null;
      setRecordedAudioUrl(result.url || null);
      setVoiceAttached(true);
      if (result.duration) {
        setRecordedDuration(result.duration);
      }
    } else {
      setVoiceAttached(true);
    }
  };

  // Open Edit Task Modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setEditDueTime(task.dueTime || '18:00');
    setEditTaskType(task.workspace === 'study' ? 'study' : 'client');
    setEditClientName(task.clientName || 'Libra');
    setEditTags(task.tags || []);
    setEditVoiceUrl(task.voiceNoteUrl);
    setEditVoiceDuration(task.voiceNoteDuration);
  };

  // Save Task Edits (Universal Edit Option)
  const handleSaveTaskEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    const updated: Task = {
      ...editingTask,
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      priority: editPriority,
      dueDate: editDueDate,
      dueTime: editDueTime,
      workspace: editTaskType === 'study' ? 'study' : 'design',
      clientName: editTaskType === 'client' ? editClientName : undefined,
      tags: editTags,
      voiceNoteUrl: editVoiceUrl,
      voiceNoteDuration: editVoiceDuration,
    };

    onUpdateTask(updated);
    setEditingTask(null);
  };

  // Open Full Voice Memo Studio Preview
  const handleOpenVoicePreview = (task: Task) => {
    if (stopAudioFnRef.current) {
      stopAudioFnRef.current();
    }
    voiceAudioEngine.stop();
    setIsPlayingVoice(false);

    const totalSec = parseDurationStringToSec(task.voiceNoteDuration);
    setVoiceTotalSec(totalSec);
    setVoiceCurrentSec(0);

    setActiveVoiceMemoModal({
      isOpen: true,
      title: task.title,
      duration: task.voiceNoteDuration || '0:42',
      url: task.voiceNoteUrl,
      taskId: task.id,
      notes: task.description || 'Voice memo audio note attached to this task.'
    });

    // Auto-start playback
    startVoicePlayback(totalSec, task.voiceNoteUrl);
  };

  // Play / Pause Voice Memo
  const startVoicePlayback = (durationSec: number, url?: string) => {
    if (stopAudioFnRef.current) {
      stopAudioFnRef.current();
    }
    setIsPlayingVoice(true);

    if (url && url.startsWith('blob:')) {
      stopAudioFnRef.current = voiceAudioEngine.playAudioUrl(
        url,
        (curr) => setVoiceCurrentSec(Math.min(durationSec, Math.round(curr))),
        () => {
          setIsPlayingVoice(false);
          setVoiceCurrentSec(durationSec);
        }
      );
    } else {
      stopAudioFnRef.current = voiceAudioEngine.playSynthesizedVoiceMemo(
        durationSec,
        (curr) => setVoiceCurrentSec(Math.min(durationSec, Math.round(curr))),
        () => {
          setIsPlayingVoice(false);
          setVoiceCurrentSec(durationSec);
        }
      );
    }
  };

  const handleTogglePlayPause = () => {
    if (isPlayingVoice) {
      if (stopAudioFnRef.current) {
        stopAudioFnRef.current();
      }
      voiceAudioEngine.stop();
      setIsPlayingVoice(false);
    } else {
      startVoicePlayback(voiceTotalSec, activeVoiceMemoModal?.url);
    }
  };

  const handleRestartVoice = () => {
    setVoiceCurrentSec(0);
    startVoicePlayback(voiceTotalSec, activeVoiceMemoModal?.url);
  };

  // Add Tag in Form
  const handleAddTag = () => {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      setNewTags([...newTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter((t) => t !== tagToRemove));
  };

  // Submit New Task
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
      voiceNoteUrl: voiceAttached ? (recordedAudioUrl || 'voice_memo_attachment.wav') : undefined,
      voiceNoteDuration: voiceAttached ? `0:${recordedDuration < 10 ? '0' : ''}${recordedDuration || 42}` : undefined,
    });

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setCustomClientName('');
    setNewTags([]);
    setVoiceAttached(false);
    setRecordedDuration(0);
    setRecordedAudioUrl(null);
    setIsAddModalOpen(false);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeCategory === 'today' && task.category !== 'today') return false;
    if (activeCategory === 'upcoming' && task.category !== 'upcoming') return false;
    if (activeCategory === 'completed' && !task.completed) return false;

    if (selectedSector === 'study' && task.workspace !== 'study') return false;
    if (selectedSector === 'work') {
      if (task.workspace !== 'design') return false;
      if (selectedClientFolder !== 'all_work' && task.clientName !== selectedClientFolder) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q));
      const matchClient = task.clientName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchClient) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden select-none font-sans text-slate-900">
      
      {/* 1. Header & Actions Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Tasks &amp; Deliverables
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-line clean hierarchy &middot; Edit &amp; Delete enabled &middot; Voice Memo Preview
          </p>
        </div>

        {/* Action Controls: Voice Preview Quick Trigger & Add Task */}
        <div className="flex items-center gap-2">
          
          {/* Quick Voice Recording & Preview Button (Requested: വോയിസ് റെക്കോർഡിങ് പ്രിവ്യൂ കാണണം) */}
          <button
            onClick={() => {
              const taskWithVoice = tasks.find((t) => t.voiceNoteDuration) || tasks[0];
              if (taskWithVoice) {
                handleOpenVoicePreview(taskWithVoice);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0F294A] border border-blue-200 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Preview Voice Recording with Animated Waveform & Audio (വോയിസ് റെക്കോർഡിങ് പ്രിവ്യൂ)"
          >
            <Headphones className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>വോയിസ് പ്രിവ്യൂ (Voice Preview)</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-300" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Folder Navigation & Filter Strip */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        
        {/* Sector Tabs: All, Study Mode (Polytechnic), Work (Clients) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => {
              setSelectedSector('all');
              setSelectedClientFolder('all_work');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedSector === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Folders
          </button>

          <button
            onClick={() => setSelectedSector('study')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedSector === 'study'
                ? 'bg-white text-[#0F294A] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Study (Polytechnic)</span>
          </button>

          <button
            onClick={() => setSelectedSector('work')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedSector === 'work'
                ? 'bg-white text-[#0F294A] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
            <span>Work (Clients)</span>
          </button>
        </div>

        {/* Client Sub-folders (if Work selected) */}
        {selectedSector === 'work' && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Client Folder:</span>
            <button
              onClick={() => setSelectedClientFolder('all_work')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                selectedClientFolder === 'all_work'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Clients
            </button>
            {clients.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClientFolder(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedClientFolder === c
                    ? 'bg-[#0F294A] text-white border-[#0F294A]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📁 {c}
              </button>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, tags, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* 3. Task List Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No tasks in this view</h3>
            <p className="text-xs text-slate-400 mt-1">Create a new task or choose another folder.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F294A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1E3A8A] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-300" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group ${
                task.completed ? 'opacity-60 bg-slate-50/60' : ''
              }`}
            >
              {/* Left: Checkbox + Title + Metadata */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="text-slate-400 hover:text-[#1E3A8A] cursor-pointer shrink-0 transition-colors"
                  title={task.completed ? 'Mark pending' : 'Mark completed'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-xs font-bold truncate ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </h3>

                    {/* Sector / Client badge */}
                    {task.workspace === 'study' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                        Study
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        📁 {task.clientName || 'Work'}
                      </span>
                    )}

                    {/* Priority badge */}
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      task.priority === 'high' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Voice Memo Player, Due Date, Edit Button, Delete Button */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
                
                {/* Voice Memo Audio Button (Clicks to open Voice Memo Studio Preview) */}
                {task.voiceNoteDuration && (
                  <button
                    onClick={() => handleOpenVoicePreview(task)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0F294A] border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-2xs group/vm"
                    title="Click to Preview Voice Recording (വോയിസ് കേൾക്കാൻ ക്ലിക്ക് ചെയ്യുക)"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#1E3A8A] group-hover/vm:scale-110 transition-transform" />
                    <span>{task.voiceNoteDuration}</span>
                    <span className="text-[9px] bg-[#1E3A8A] text-white px-1 rounded font-normal">
                      Play
                    </span>
                  </button>
                )}

                {/* Due Date */}
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 hidden md:flex">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{task.dueDate}</span>
                  {task.dueTime && <span>&middot; {task.dueTime}</span>}
                </div>

                {/* EDIT BUTTON (Universal Edit Option requested by user) */}
                <button
                  onClick={() => handleOpenEditModal(task)}
                  className="text-slate-500 hover:text-[#1E3A8A] p-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                  title="Edit Task (ടാസ്ക് എഡിറ്റ് ചെയ്യുക)"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title="Delete Task (ഡിലീറ്റ് ചെയ്യുക)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. VOICE MEMO STUDIO PREVIEW MODAL (User: വോയിസ് റെക്കോർഡിങ് ഒന്ന് പ്രിവ്യൂ കാണണം) */}
      {activeVoiceMemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1E3A8A] text-cyan-300">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    വോയിസ് റെക്കോർഡിങ് പ്രിവ്യൂ (Voice Memo Preview)
                  </h3>
                  <p className="text-[10px] text-cyan-300 font-mono">
                    High-Fidelity Audio Playback &middot; Waveform Visualizer
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (stopAudioFnRef.current) stopAudioFnRef.current();
                  voiceAudioEngine.stop();
                  setIsPlayingVoice(false);
                  setActiveVoiceMemoModal(null);
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualizer & Waveform Body */}
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {activeVoiceMemoModal.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  🎙️ {activeVoiceMemoModal.notes}
                </p>
              </div>

              {/* Dynamic Animated Waveform Visualizer */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="h-16 flex items-center justify-between gap-1 px-2">
                  {[
                    40, 65, 30, 85, 95, 60, 45, 90, 100, 75,
                    55, 80, 92, 48, 70, 88, 62, 78, 50, 68
                  ].map((heightPct, idx) => {
                    const isPassed = (idx / 20) <= (voiceCurrentSec / voiceTotalSec);
                    const isWaveActive = isPlayingVoice;
                    return (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full transition-all duration-150"
                        style={{
                          height: isWaveActive 
                            ? `${Math.max(15, (heightPct * (0.6 + 0.4 * Math.sin(voiceCurrentSec * 3 + idx))))}%` 
                            : `${heightPct * 0.45}%`,
                          backgroundColor: isPassed ? '#22d3ee' : '#334155'
                        }}
                      />
                    );
                  })}
                </div>

                {/* Time & Progress Scrubber */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={voiceTotalSec}
                    value={voiceCurrentSec}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setVoiceCurrentSec(val);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-cyan-300 font-bold">
                      0:{voiceCurrentSec < 10 ? '0' : ''}{voiceCurrentSec}
                    </span>
                    <span>
                      0:{voiceTotalSec < 10 ? '0' : ''}{voiceTotalSec}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between pt-1">
                {/* Restart */}
                <button
                  onClick={handleRestartVoice}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>

                {/* Main Play / Pause Circle */}
                <button
                  onClick={handleTogglePlayPause}
                  className="w-12 h-12 rounded-full bg-[#0F294A] hover:bg-[#1E3A8A] text-white flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  {isPlayingVoice ? (
                    <Pause className="w-5 h-5 text-cyan-300" />
                  ) : (
                    <Play className="w-5 h-5 text-cyan-300 fill-cyan-300 translate-x-0.5" />
                  )}
                </button>

                {/* Speed Toggle */}
                <button
                  onClick={() => {
                    const next = voiceSpeed === 1 ? 1.5 : voiceSpeed === 1.5 ? 2 : 1;
                    setVoiceSpeed(next);
                  }}
                  className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  {voiceSpeed}x Speed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD TASK MODAL (With In-Modal Voice Recording & Preview) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Create New Task / Deliverable
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics I Revision / Libra Reel 05 Render"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Add notes, formula references, or client deliverables..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {/* Sector Selection (Study vs Client Work) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Folder Sector
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as 'study' | 'client')}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="study">Study (Polytechnic AI &amp; ML)</option>
                    <option value="client">Client Work (Freelance SMM)</option>
                  </select>
                </div>

                {taskType === 'client' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Client Folder
                    </label>
                    <select
                      value={taskClientName}
                      onChange={(e) => setTaskClientName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                    >
                      {clients.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
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
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Real Voice Recording & Preview Area */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Mic className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Attach Voice Memo (വോയിസ് റെക്കോർഡിങ്)</span>
                  </div>
                  {voiceAttached && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Memo Ready (0:{recordedDuration < 10 ? '0' : ''}{recordedDuration || 42})
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
                      <span>{voiceAttached ? 'Re-record Voice Memo' : 'Start Recording Voice'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors cursor-pointer animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop Recording ({recordedDuration}s)</span>
                    </button>
                  )}

                  {/* Instant In-Modal Audio Preview if recorded */}
                  {voiceAttached && (
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenVoicePreview({
                          id: 'preview-new',
                          title: newTitle || 'New Task Voice Memo',
                          completed: false,
                          category: 'today',
                          priority: 'high',
                          workspace: 'study',
                          dueDate: newDueDate,
                          tags: ['Voice Memo'],
                          createdAt: new Date().toISOString(),
                          voiceNoteDuration: `0:${recordedDuration < 10 ? '0' : ''}${recordedDuration || 42}`,
                          voiceNoteUrl: recordedAudioUrl || undefined,
                          description: 'Voice note preview recorded inside task creation modal.'
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0F294A] font-bold rounded-lg border border-blue-300 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current text-[#1E3A8A]" />
                      <span>പ്രിവ്യൂ കേൾക്കുക (Preview Audio)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. UNIVERSAL EDIT TASK MODAL (User: എന്ത് കാര്യങ്ങൾ ഉണ്ടെങ്കിലും എഡിറ്റ് ചെയ്യാനും ഡിലീറ്റ് ചെയ്യാനും സാധിക്കണം) */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Edit Task (ടാസ്ക് എഡിറ്റ് ചെയ്യുക)
                </h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTaskEdits} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sector
                  </label>
                  <select
                    value={editTaskType}
                    onChange={(e) => setEditTaskType(e.target.value as 'study' | 'client')}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="study">Study (Polytechnic)</option>
                    <option value="client">Client Work</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={editDueTime}
                    onChange={(e) => setEditDueTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Voice memo on task */}
              {editVoiceDuration && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#1E3A8A]" />
                    <span className="font-semibold text-slate-900">
                      Attached Voice Memo ({editVoiceDuration})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenVoicePreview(editingTask)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#1E3A8A] font-bold rounded-lg border border-blue-200 text-[10px] cursor-pointer"
                    >
                      Play Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditVoiceUrl(undefined);
                        setEditVoiceDuration(undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 text-[10px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Actions: Delete Task & Save Changes */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTask(editingTask.id);
                    setEditingTask(null);
                  }}
                  className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Save Changes (മാറ്റങ്ങൾ വരുത്തുക)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TodayTasksModule;
