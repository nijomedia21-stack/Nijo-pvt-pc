import React from 'react';
import { 
  BookOpen, 
  Palette, 
  Check, 
  Sparkles, 
  X, 
  GraduationCap, 
  Instagram,
  ArrowRight
} from 'lucide-react';
import { WorkspaceMode } from '../types';

interface WorkspaceSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: WorkspaceMode;
  onSelectMode: (mode: WorkspaceMode) => void;
}

export const WorkspaceSwitcherModal: React.FC<WorkspaceSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F294A] text-white p-5 flex items-center justify-between border-b border-[#1E3A8A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center font-mono font-bold text-cyan-300 text-sm">
              &lt;/&gt;
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Switch Workspace Profile
              </h2>
              <p className="text-xs text-slate-300">
                Instagram-style dual persona environment for Nijo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Cards */}
        <div className="p-4 space-y-3 bg-[#F8FAFC]">
          {/* Profile 1: Polytechnic AI & ML */}
          <button
            onClick={() => {
              onSelectMode('study');
              onClose();
            }}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
              currentMode === 'study'
                ? 'bg-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/20'
                : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  currentMode === 'study' ? 'bg-[#0F294A] text-cyan-300' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Polytechnic AI & ML Study Mode
                    </h3>
                    {currentMode === 'study' && (
                      <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Semester 1 syllabus (Maths I, Chemistry, PSPP/Python, Physics), formula sheets, board exam countdown, and lab code.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <span className="font-medium text-[#1E3A8A]">4 Subjects</span>
                    <span>·</span>
                    <span>Board Exam Countdown</span>
                    <span>·</span>
                    <span>Formula Sheets</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 mt-1">
                {currentMode === 'study' ? (
                  <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-slate-400">
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Profile 2: Freelance Designer & SMM Studio */}
          <button
            onClick={() => {
              onSelectMode('design');
              onClose();
            }}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
              currentMode === 'design'
                ? 'bg-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/20'
                : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  currentMode === 'design' ? 'bg-[#0F294A] text-cyan-300' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}>
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Freelance Designer & SMM Studio
                    </h3>
                    {currentMode === 'design' && (
                      <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Client brand "Libra" luxury identity, Instagram Reels scheduler, zero-red color palettes, and Midjourney prompt engineering.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <span className="font-medium text-[#1E3A8A]">Client: Libra</span>
                    <span>·</span>
                    <span>Reels Planner</span>
                    <span>·</span>
                    <span>Prompt Studio</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 mt-1">
                {currentMode === 'design' ? (
                  <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-slate-400">
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Fast Switch: Long-press &lt;/&gt; anytime</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            nijo.media21@gmail.com
          </span>
        </div>
      </div>
    </div>
  );
};
