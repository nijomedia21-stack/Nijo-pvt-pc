import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Search, StickyNote } from 'lucide-react';
import { Note } from '../types';

interface NotesModuleProps {
  notes: Note[];
  onChange: (notes: Note[]) => void;
}

export const NotesModule: React.FC<NotesModuleProps> = ({ notes, onChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => (n.title + ' ' + n.body).toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const addNote = () => {
    const note: Note = { id: `note-${Date.now()}`, title: 'Untitled note', body: '', updatedAt: new Date().toISOString() };
    onChange([note, ...notes]);
    setSelectedId(note.id);
  };

  const updateSelected = (patch: Partial<Note>) => {
    if (!selected) return;
    onChange(notes.map((n) => (n.id === selected.id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)));
  };

  const deleteSelected = () => {
    if (!selected || !window.confirm(`Delete note "${selected.title}"?`)) return;
    const rest = notes.filter((n) => n.id !== selected.id);
    onChange(rest);
    setSelectedId(rest[0]?.id ?? null);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-3 flex gap-2 border-b border-slate-200">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-lg px-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes"
              className="flex-1 bg-transparent text-xs py-2 outline-none select-text" />
          </div>
          <button onClick={addNote} className="p-2 rounded-lg bg-[#1E3A8A] text-white hover:bg-[#0F294A]" title="New note">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && <p className="p-4 text-xs text-slate-400">No notes yet. Click + or ask Copilot to save one.</p>}
          {filtered.map((n) => (
            <button key={n.id} onClick={() => setSelectedId(n.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-slate-100 ${n.id === selectedId ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
              <p className="text-xs font-semibold text-slate-800 truncate">{n.title || 'Untitled'}</p>
              <p className="text-[11px] text-slate-500 truncate">{n.body.split('\n')[0] || ' '}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.updatedAt).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        {selected ? (
          <>
            <div className="flex items-center gap-2 p-3 border-b border-slate-200 bg-white">
              <input value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })}
                className="flex-1 text-sm font-semibold text-slate-800 outline-none select-text" />
              <button onClick={deleteSelected} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" title="Delete note">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea value={selected.body} onChange={(e) => updateSelected({ body: e.target.value })}
              placeholder="Write your note..."
              className="flex-1 p-4 text-sm text-slate-800 bg-transparent outline-none resize-none font-mono select-text" />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
            <StickyNote className="w-8 h-8" />
            <p className="text-xs">Select or create a note</p>
          </div>
        )}
      </div>
    </div>
  );
};
