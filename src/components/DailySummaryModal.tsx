import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  Flame 
} from 'lucide-react';
import { Task, CalendarEvent, PanchangamInfo, WorkspaceMode } from '../types';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  events: CalendarEvent[];
  workspaceMode: WorkspaceMode;
  panchangam?: PanchangamInfo;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  isOpen,
  onClose,
  tasks,
  events,
  workspaceMode,
  panchangam,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Filter tasks for today
  const todayTasks = tasks.filter(t => t.category === 'today' || t.dueDate === todayStr);
  const completedToday = todayTasks.filter(t => t.completed);
  const pendingToday = todayTasks.filter(t => !t.completed);
  const completionRate = todayTasks.length > 0 
    ? Math.round((completedToday.length / todayTasks.length) * 100) 
    : 100;

  // Filter events for today or next upcoming
  const todayEvents = events.filter(e => e.date === todayStr);
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Formatted snapshot text for clipboard export
  const buildSnapshotText = () => {
    let summary = `📋 NIJO PVT PC — DAILY SUMMARY SNAPSHOT\n`;
    summary += `📅 Date: ${dateFormatted}\n`;
    if (panchangam) {
      summary += `🌟 Panchangam: ${panchangam.malayalamDate} (${panchangam.malayalamMonth} ${panchangam.malayalamDay}) · Nakshatram: ${panchangam.nakshatra}\n`;
    }
    summary += `📊 Progress: ${completedToday.length}/${todayTasks.length} Completed (${completionRate}%)\n\n`;

    summary += `✅ COMPLETED TODAY (${completedToday.length}):\n`;
    if (completedToday.length === 0) {
      summary += `  - No tasks marked completed yet today.\n`;
    } else {
      completedToday.forEach(t => {
        summary += `  ✓ ${t.title} [${t.workspace === 'study' ? 'Polytechnic' : (t.clientName || 'Work')}]\n`;
      });
    }

    summary += `\n⚡ PENDING TODAY PRIORITIES (${pendingToday.length}):\n`;
    if (pendingToday.length === 0) {
      summary += `  - All today's priorities are complete! 🎉\n`;
    } else {
      pendingToday.forEach(t => {
        summary += `  • ${t.title} (${t.priority.toUpperCase()}) ${t.dueTime ? `at ${t.dueTime}` : ''}\n`;
      });
    }

    summary += `\n🗓️ UPCOMING EVENTS & RELEASES:\n`;
    upcomingEvents.forEach(e => {
      summary += `  📌 ${e.date} ${e.time}: ${e.title} (${e.type})\n`;
    });

    summary += `\nGenerated via NIJO SMM PC Hub`;
    return summary;
  };

  const handleCopySnapshot = () => {
    navigator.clipboard.writeText(buildSnapshotText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F294A] text-white p-5 flex items-center justify-between border-b border-[#1E3A8A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-cyan-300 flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Daily Summary Snapshot
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  Today
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {dateFormatted} {panchangam ? `· ${panchangam.malayalamDate}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#16365F] text-white text-xs font-semibold rounded-xl border border-cyan-400/30 shadow-xs transition-all cursor-pointer"
              title="Copy Daily Summary to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Copy Snapshot</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Completion Rate
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-[#0F294A] font-mono">
                  {completionRate}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">done</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Completed
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-emerald-700 font-mono">
                  {completedToday.length}
                </span>
                <span className="text-[11px] text-slate-500">of {todayTasks.length}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Pending Priorities
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-amber-700 font-mono">
                  {pendingToday.length}
                </span>
                <span className="text-[11px] text-slate-500">remaining</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Upcoming Events
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-[#1E3A8A] font-mono">
                  {upcomingEvents.length}
                </span>
                <span className="text-[11px] text-slate-500">scheduled</span>
              </div>
            </div>
          </div>

          {/* AI Executive Briefing Snippet */}
          <div className="bg-gradient-to-r from-blue-50/70 to-slate-50 border border-blue-200/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
              <h4 className="text-xs font-bold text-[#0F294A]">
                Nijo's Day Briefing (നിജോയുടെ ഇന്നത്തെ സമ്മറി)
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {pendingToday.length === 0 ? (
                <>
                  ഗ്രേറ്റ് വർക്ക് നിജോ! ഇന്നത്തെ എല്ലാ പ്രയോറിറ്റി ടാസ്കുകളും നിങ്ങൾ പൂർത്തിയാക്കി കഴിഞ്ഞു. റീൽസ് ഷെഡ്യൂളും പോളിടെക്നിക് റിവിഷനും കൃത്യമായി മുന്നേറുന്നുണ്ട്.
                </>
              ) : (
                <>
                  നിജോ, ഇന്ന് നിങ്ങൾ <strong className="text-slate-900">{completedToday.length} ടാസ്കുകൾ</strong> പൂർത്തിയാക്കി. ഇനി <strong className="text-slate-900">{pendingToday.length} പ്രയോറിറ്റികൾ</strong> ബാക്കിയുണ്ട്. മാത്സ് / ഫിസിക്സ് റിവിഷനും ലിബ്ര ക്ലയന്റ് ഡെലിവറബിളുകളും കൃത്യ സമയത്ത് തീർക്കാൻ ശ്രദ്ധിക്കുക.
                </>
              )}
            </p>
          </div>

          {/* Section 1: Completed Tasks Today */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed Tasks ({completedToday.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Today's Accomplishments</span>
            </div>

            {completedToday.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No tasks checked off yet today. Mark them complete in Tasks view to see them here!
              </p>
            ) : (
              <div className="space-y-1.5">
                {completedToday.map(task => (
                  <div 
                    key={task.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-900 line-through text-slate-500 truncate">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shrink-0">
                      {task.workspace === 'study' ? '🎓 Study' : (task.clientName || '💼 Work')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Pending Today Priorities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Pending Today Priorities ({pendingToday.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Immediate Action Items</span>
            </div>

            {pendingToday.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium py-2">
                All today's tasks completed! No pending items remaining.
              </p>
            ) : (
              <div className="space-y-1.5">
                {pendingToday.map(task => (
                  <div 
                    key={task.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#1E3A8A] shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.dueTime && (
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.dueTime}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                        {task.clientName || (task.workspace === 'study' ? 'Polytechnic' : 'Work')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Upcoming Calendar Events */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0F294A]" />
                <span>Upcoming Events &amp; Milestones ({upcomingEvents.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Calendar Schedule</span>
            </div>

            <div className="space-y-1.5">
              {upcomingEvents.map(event => (
                <div 
                  key={event.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shrink-0">
                      {event.date} {event.time}
                    </span>
                    <span className="font-medium text-slate-900 truncate">
                      {event.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100/70 text-[#0F294A] shrink-0">
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            NIJO SMM PC Desktop Suite
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
