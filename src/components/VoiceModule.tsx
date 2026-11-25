import React, { useEffect, useState } from 'react';
import { Mic, Play, Download, RefreshCw, Cloud } from 'lucide-react';

interface Clip { id: string; text: string; dataUrl: string; duration: number; voice: string }
type Lang = 'en' | 'ml';
type Status = { ok: boolean; gpu?: string; error?: string } | null;

// Both languages use Nijo's own voice on the private Kaggle cloud GPU server
export const VoiceModule: React.FC = () => {
  const api = window.electronAPI;
  const [lang, setLang] = useState<Lang>('ml');
  const [status, setStatus] = useState<Status>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [clips, setClips] = useState<Clip[]>([]);
  const [starting, setStarting] = useState(false);
  const [startMsg, setStartMsg] = useState('');

  const refresh = async () => {
    if (!api) return;
    setError(''); setStatus(null);
    setStatus(await api.voiceMlStatus().catch((e) => ({ ok: false, error: String(e?.message || e) })));
  };

  useEffect(() => { refresh(); }, []);

  if (!api) {
    return <div className="p-6 text-sm text-slate-500">Text to voice works in the desktop app (NIJO PVT PC).</div>;
  }

  const canSpeak = !!text.trim() && !busy;

  const speak = async () => {
    if (!canSpeak) return;
    const t = text.trim();
    setBusy(true); setError('');
    try {
      const res = await api.voiceSpeakMl({ text: t });
      const voice = lang === 'ml' ? 'My voice (Malayalam)' : 'My voice (English)';
      setClips((c) => [{ id: res.id, text: t, dataUrl: res.dataUrl, duration: res.duration, voice }, ...c]);
    } catch (e) {
      setError(String((e as Error).message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''));
    } finally { setBusy(false); }
  };

  const startServer = async () => {
    setStarting(true); setStartMsg('');
    try { setStartMsg((await api.voiceMlStart()).message); }
    catch (e) { setStartMsg(String((e as Error).message || e)); }
    finally { setStarting(false); }
  };

  const statusText = status === null ? 'Checking voice server…'
    : status.ok ? `Voice server online (Kaggle cloud GPU) · ${status.gpu}`
    : 'Voice server is off. Press Start server.';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Mic className="w-5 h-5 text-[#1E3A8A]" /> Text to my voice</h2>
          <p className="text-xs text-slate-500">Type Malayalam or English, get it spoken in your own voice (private Kaggle cloud GPU).</p>
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

      <div className={`text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${status?.ok ? 'bg-blue-50 text-[#1E3A8A]' : 'bg-amber-50 text-amber-800'}`}>
        <Cloud className="w-3.5 h-3.5" />
        <span className="flex-1">{statusText}</span>
        {status && !status.ok && (
          <button onClick={startServer} disabled={starting}
            className="shrink-0 text-xs px-3 py-1 rounded-md bg-[#1E3A8A] text-white disabled:opacity-50">
            {starting ? 'Starting…' : 'Start server'}
          </button>
        )}
      </div>
      {startMsg && <p className="text-xs text-slate-600">{startMsg}</p>}

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-600">Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
          placeholder={lang === 'ml' ? 'മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക… (write English words in Malayalam letters for best sound)' : 'Type what you want your voice to say in English…'}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none select-text resize-y" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">{text.length} characters · about 30–60 s to generate</span>
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
