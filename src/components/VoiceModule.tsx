import React, { useEffect, useState } from 'react';
import { Mic, Play, Download, RefreshCw, Cloud, Laptop } from 'lucide-react';
import type { VoiceProfile } from '../electron.d';

interface Clip { id: string; text: string; dataUrl: string; duration: number; voice: string }
type Lang = 'en' | 'ml';
type Status = { ok: boolean; gpu?: string; mode?: string; error?: string } | null;

export const VoiceModule: React.FC = () => {
  const api = window.electronAPI;
  const [lang, setLang] = useState<Lang>('ml');
  const [status, setStatus] = useState<Status>(null);
  const [mlStatus, setMlStatus] = useState<Status>(null);
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [profileId, setProfileId] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [clips, setClips] = useState<Clip[]>([]);

  const refresh = async () => {
    if (!api) return;
    setError('');
    setMlStatus(null);
    api.voiceMlStatus().then(setMlStatus).catch((e) => setMlStatus({ ok: false, error: String(e?.message || e) }));
    const s = await api.voiceStatus().catch((e) => ({ ok: false, error: String(e?.message || e) }));
    setStatus(s);
    if (!s.ok) return;
    try {
      // Only Nijo's own cloned voice(s) - built-in/preset voices are never used here
      const list = (await api.voiceProfiles()).filter((p) => p.voice_type === 'cloned');
      setProfiles(list);
      if (!list.some((p) => p.id === profileId)) setProfileId(list[0]?.id ?? '');
    } catch (e) { setError(String((e as Error).message || e)); }
  };

  useEffect(() => { refresh(); }, []);

  if (!api) {
    return <div className="p-6 text-sm text-slate-500">Text to voice works in the desktop app (NIJO PVT PC).</div>;
  }

  const profile = profiles.find((p) => p.id === profileId);
  const canSpeak = !!text.trim() && !busy && (lang === 'ml' || !!profile);

  const speak = async () => {
    if (!canSpeak) return;
    const t = text.trim();
    setBusy(true); setError('');
    try {
      if (lang === 'ml') {
        const res = await api.voiceSpeakMl({ text: t });
        setClips((c) => [{ id: res.id, text: t, dataUrl: res.dataUrl, duration: res.duration, voice: 'My voice (Malayalam)' }, ...c]);
      } else if (profile) {
        const engine = profile.default_engine || 'qwen';
        const res = await api.voiceSpeak({ profileId: profile.id, text: t, engine, language: profile.language || 'en' });
        setClips((c) => [{ id: res.id, text: t, dataUrl: res.dataUrl, duration: res.duration, voice: `${profile.name} (English)` }, ...c]);
      }
    } catch (e) {
      setError(String((e as Error).message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''));
    } finally { setBusy(false); }
  };

  const st = lang === 'ml' ? mlStatus : status;
  const statusText = st === null ? 'Checking voice server…'
    : st.ok
      ? (lang === 'ml' ? `Malayalam voice server online (cloud GPU) · ${st.gpu}`
        : `Voice server online${st.mode === 'cloud' ? ' (cloud GPU)' : st.mode === 'local' ? ' (laptop GPU)' : ''} · ${st.gpu}`)
      : (lang === 'ml' ? 'Malayalam server offline. Open Kaggle notebook "nijo-malayalam-server" and run it.'
        : 'Voice server offline. Start Voicebox (or the Kaggle notebook) and press Refresh.');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Mic className="w-5 h-5 text-[#1E3A8A]" /> Text to my voice</h2>
          <p className="text-xs text-slate-500">Type text, get it spoken in your own cloned voice (private cloud GPU).</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {([['ml', 'മലയാളം (Malayalam)'], ['en', 'English']] as [Lang, string][]).map(([k, label]) => (
          <button key={k} onClick={() => { setLang(k); setError(''); }}
            className={`text-sm px-4 py-1.5 rounded-md ${lang === k ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className={`text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${st?.ok ? 'bg-blue-50 text-[#1E3A8A]' : 'bg-amber-50 text-amber-800'}`}>
        {lang === 'ml' || st?.mode === 'cloud' ? <Cloud className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
        {statusText}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        {lang === 'en' && (<>
          <label className="block text-xs font-semibold text-slate-600">Voice</label>
          <select value={profileId} onChange={(e) => setProfileId(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
            {profiles.length === 0 && <option value="">Your voice is not set up yet — record it in Voicebox: Create Voice → Clone from audio</option>}
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (my voice)</option>
            ))}
          </select>
        </>)}
        <label className="block text-xs font-semibold text-slate-600">Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
          placeholder={lang === 'ml' ? 'മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക… (write English words in Malayalam letters for best sound)' : 'Type what you want your voice to say…'}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none select-text resize-y" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">{text.length} characters{lang === 'ml' ? ' · about 30–60 s to generate' : ''}</span>
          <button onClick={speak} disabled={!canSpeak}
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
            <button onClick={() => api.voiceSave({ dataUrl: c.dataUrl, name: `my-voice-${c.id.slice(-8)}.wav` })}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50" title="Download WAV">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
