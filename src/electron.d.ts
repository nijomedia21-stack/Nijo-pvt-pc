import type { Task, CalendarEvent, Note } from './types';

export interface StoreData {
  initialized: boolean;
  tasks: Task[];
  events: CalendarEvent[];
  notes: Note[];
  notified: string[];
}

export interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  voice_type: string;
  default_engine?: string | null;
}

declare global {
  interface Window {
    electronAPI?: {
      isDesktopApp: boolean;
      platform: string;
      getVersion: () => Promise<string>;
      getLanIp: () => Promise<string>;
      openUploadsFolder: (folderPath?: string) => Promise<boolean>;
      saveFileDialog: (defaultName?: string) => Promise<unknown>;
      storeGet: () => Promise<StoreData>;
      storeSet: (patch: Partial<StoreData>) => Promise<StoreData>;
      onStoreChanged: (cb: (data: StoreData) => void) => () => void;
      agentChat: (message: string, mode: string) => Promise<{ text: string; model: string; changed?: boolean }>;
      agentReset: () => Promise<boolean>;
      agentHasKey: () => Promise<boolean>;
      agentSetKey: (key: string) => Promise<boolean>;
      voiceStatus: () => Promise<{ ok: boolean; gpu?: string; mode?: string; error?: string }>;
      voiceProfiles: () => Promise<VoiceProfile[]>;
      voiceSpeak: (args: { profileId: string; text: string; engine?: string; language?: string }) => Promise<{ id: string; duration: number; dataUrl: string }>;
      voiceSave: (args: { dataUrl: string; name?: string }) => Promise<string | false>;
      voiceMlStatus: () => Promise<{ ok: boolean; gpu?: string; error?: string }>;
      voiceSpeakMl: (args: { text: string }) => Promise<{ id: string; duration: number; dataUrl: string }>;
      voiceMlStart: () => Promise<{ ok: boolean; message: string }>;
    };
  }
}
