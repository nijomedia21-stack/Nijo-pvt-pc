import React, { useEffect, useState } from 'react';
import { Mic, Play, Download, RefreshCw, Cloud, Laptop } from 'lucide-react';
import type { VoiceProfile } from '../electron.d';

interface Clip { id: string; text: string; dataUrl: string; duration: number; voice: string }

export const VoiceModule: React.FC = () => {
  const api = window.electronAPI;
  const [status, setStatus] = useState<{ ok: boolean; gpu?: string; mode?: string; error?: string } | null>(null);
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [profileId, setProfileId] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [clips, setClips] = useState<Clip[]>([]);

  const refresh = async () => {
    if (!api) return;
    setError('');
    const s = await api.voiceStatus();
    setStatus(s);
    if (!s.ok) return;
    try {
      const list = await api.voiceProfiles();
      setProfiles(list);
      if (!list.some((p) => p.id === profileId)) {
        const mine = list.find((p) => p.voice_type === 'cloned') ?? list[0];
        setProfileId(mine?.id ?? '');
      }
    } catch (e) { setError(String((e as Error).message || e)); }
  };

  useEffect(() => { refresh(); }, []);

  if (!api) {
    return <div className="p-6 text-sm text-slate-500">Text to voice works in the desktop app (NIJO PVT PC).</div>;
  }

  const profile = profiles.find((p) => p.id === profileId);

  const speak = async () => {
    if (!profile || !text.trim()) return;
    setBusy(true); setError('');
    try {
      const engine = profile.default_engine || (profile.voice_type === 'cloned' ? 'qwen' : undefined);
      const res = await api.voiceSpeak({ profileId: profile.id, text: text.trim(), engine, language: profile.language || 'en' });
      setClips((c) => [{ id: res.id, text: text.trim(), dataUrl: res.dataUrl, duration: res.duration, voice: profile.name }, ...c]);
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally { setBusy(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Mic className="w-5 h-5 text-[#1E3A8A]" /> Text to my voice</h2>
          <p className="text-xs text-slate-500">Type text, get it spoken in your cloned voice (Voicebox on your private cloud GPU).</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className={`text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${status?.ok ? 'bg-blue-50 text-[#1E3A8A]' : 'bg-amber-50 text-amber-800'}`}>
        {status?.mode === 'cloud' ? <Cloud className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
        {status === null ? 'Checking voice server…'
          : status.ok ? `Voice server online${status.mode === 'cloud' ? ' (cloud GPU)' : status.mode === 'local' ? ' (laptop GPU)' : ''} · ${status.gpu}`
          : 'Voice server offline. Start the Kaggle notebook (cell 1) and make sure NIJO CloudLink is running.'}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-600">Voice</label>
        <select value={profileId} onChange={(e) => setProfileId(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          {profiles.length === 0 && <option value="">No voices yet — create one in the Voicebox app</option>}
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name} {p.voice_type === 'cloned' ? '(my voice clone)' : '(built-in)'}</option>
          ))}
        </select>
        <label className="block text-xs font-semibold text-slate-600">Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Type what you want your voice to say (English works best)…"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none select-text resize-y" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">{text.length} characters</span>
          <button onClick={speak} disabled={busy || !profile || !text.trim()}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[#1E3A8A] text-white disabled:opacity-50">
            <Play className="w-4 h-4" /> {busy ? 'Generating…' : 'Generate voice'}
          </button>
        </div>
        {error && <p className="text-xs text-amber-700">{error}</p>}
      </div>

      {clips.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
          <p className="text-xs text-slate-700"><span className="font-semibold">{c.voice}</span> · {c.duration.toFixed(1)}s</p>
          <p className="text-xs text-slate-500 line-clamp-2">{c.text}</p>
          <div className="flex items-center gap-2">
            <audio controls src={c.dataUrl} className="flex-1 h-9" />
            <button onClick={() => api.voiceSave({ dataUrl: c.dataUrl, name: `my-voice-${c.id.slice(0, 8)}.wav` })}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50" title="Save WAV">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
