export type WorkspaceMode = 'study' | 'design';

export type TaskCategory = 'all' | 'today' | 'upcoming' | 'completed';

export type TaskPriority = 'high' | 'medium' | 'normal';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'today' | 'upcoming' | 'completed';
  priority: TaskPriority;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  workspace: 'study' | 'design' | 'general';
  clientName?: string;
  tags: string[];
  voiceNoteUrl?: string;
  voiceNoteDuration?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: 'exam' | 'deadline' | 'festival' | 'class' | 'reels';
  vibrationTrigger: 'gentle' | 'rapid' | 'poly' | 'steady';
  notes?: string;
  panchangamNote?: string;
  workspace?: 'study' | 'design' | 'general';
}

export interface PanchangamInfo {
  date: string;
  malayalamDate: string;
  kollamYear: number;
  malayalamMonth: string;
  malayalamDay: number;
  nakshatra: string;
  tithi: string;
  festival?: string;
  rahukalam: string;
  auspiciousTime: string;
}

export type TargetDevice = 'laptop' | 'mobile' | 'tv';

export interface ConnectedDevice {
  id: TargetDevice;
  name: string;
  os: string;
  location: string;
  ip: string;
  status: 'active' | 'paired' | 'standby';
  latencyMs: number;
  isHost?: boolean;
}

export interface TransferHistoryItem {
  id: string;
  name: string;
  size: string;
  type: 'code' | 'pdf' | 'image' | 'video' | 'archive' | 'text' | 'clipboard';
  timestamp: string;
  sourceDevice: string;
  targetDevices: string[];
  status: 'completed' | 'transferring' | 'queued';
  contentSnippet?: string;
  fileDataUrl?: string;
}

export interface SubjectUnit {
  unitNumber: number;
  title: string;
  topics: string[];
  isCompleted: boolean;
}

export interface SubjectFormula {
  topic: string;
  title: string;
  formula: string;
  explanation: string;
}

export interface QuestionPaper {
  id: string;
  year: string;
  term: string;
  subjectCode: string;
  title: string;
  pages: number;
}

export interface StudySubject {
  code: string;
  name: string;
  shortName: string;
  instructor: string;
  credits: number;
  units: SubjectUnit[];
  formulas: SubjectFormula[];
  questionPapers: QuestionPaper[];
}

export interface LibraBrandColor {
  name: string;
  hex: string;
  cmyk: string;
  role: string;
}

export interface InstagramReelItem {
  id: string;
  hook: string;
  concept: string;
  caption: string;
  hashtags: string[];
  audioTrack: string;
  scheduledDate: string;
  status: 'draft' | 'scripted' | 'recorded' | 'edited' | 'scheduled';
}

export interface CopilotChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionChips?: string[];
}
