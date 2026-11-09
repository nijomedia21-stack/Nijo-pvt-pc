import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Columns, 
  CheckCircle2, 
  CalendarDays,
  X,
  Briefcase,
  GraduationCap,
  Calendar as CalendarIcon,
  Star,
  ArrowRight,
  CornerDownLeft,
  Edit2,
  Trash2
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { 
  getKeralaDayDetails, 
  MALAYALAM_MONTHS_NAMES,
  MALAYALAM_DAY_NAMES,
  KeralaCalendarDay 
} from '../utils/keralaCalendarHelper';

interface CalendarModuleProps {
  events: CalendarEvent[];
  onAddEvent: (newEvent: CalendarEvent) => void;
  onUpdateEvent?: (updatedEvent: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  selectedDateStr,
  onSelectDate,
}) => {
  // Split Work view toggle: 'split' (side-by-side) or 'full' (full-width calendar)
  const [viewLayout, setViewLayout] = useState<'split' | 'full'>('split');

  // Active view date
  const initialDate = useMemo(() => {
    if (selectedDateStr) {
      const parts = selectedDateStr.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    return new Date(2026, 10, 7); // Default Nov 7, 2026
  }, [selectedDateStr]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-indexed
  const [activeDayNum, setActiveDayNum] = useState<number>(initialDate.getDate());

  // Modal State for Add Event
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(selectedDateStr || '2026-11-07');
  const [eventTime, setEventTime] = useState<string>('10:00');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('reels');
  const [eventNotes, setEventNotes] = useState<string>('');

  // Universal Edit Event State (User: എന്ത് കാര്യങ്ങൾ ഉണ്ടെങ്കിലും എഡിറ്റ് ചെയ്യാനും ഡിലീറ്റ് ചെയ്യാനും സാധിക്കണം)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editEventTitle, setEditEventTitle] = useState<string>('');
  const [editEventDate, setEditEventDate] = useState<string>('');
  const [editEventTime, setEditEventTime] = useState<string>('10:00');
  const [editEventType, setEditEventType] = useState<CalendarEvent['type']>('reels');
  const [editEventNotes, setEditEventNotes] = useState<string>('');

  const handleOpenEditEvent = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setEditEventTitle(ev.title);
    setEditEventDate(ev.date);
    setEditEventTime(ev.time);
    setEditEventType(ev.type);
    setEditEventNotes(ev.notes || '');
  };

  const handleSaveEventEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editEventTitle.trim()) return;

    if (onUpdateEvent) {
      onUpdateEvent({
        ...editingEvent,
        title: editEventTitle.trim(),
        date: editEventDate,
        time: editEventTime,
        type: editEventType,
        notes: editEventNotes.trim() || undefined,
      });
    }
    setEditingEvent(null);
  };

  // Minimal Single-Icon Date Jump Popover State
  // User feedback: "അല്ലാണ്ട് വേറെ ഡബിൾ ഐക്കൺ ഒന്നും വേണ്ട. ഒറ്റ ഐക്കൺ. ജസ്റ്റ് 7/12/2026 എന്ന് പറഞ്ഞിട്ട് ഗോ എന്നാക്കുക. അല്ലെങ്കിൽ ഒരു എന്റർ ബട്ടൺ പോലത്തെ ഒരു സാധനം വെച്ചാൽ മതി. വേറെ ഒന്നും ഹെഡിങ്ങും വേണ്ട."
  const [isJumpOpen, setIsJumpOpen] = useState<boolean>(false);
  const [jumpDateInput, setJumpDateInput] = useState<string>(
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(activeDayNum).padStart(2, '0')}`
  );
  const jumpPopoverRef = useRef<HTMLDivElement>(null);

  // Close jump popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (jumpPopoverRef.current && !jumpPopoverRef.current.contains(e.target as Node)) {
        setIsJumpOpen(false);
      }
    };
    if (isJumpOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isJumpOpen]);

  // Keep jump input in sync when active day changes
  useEffect(() => {
    setJumpDateInput(
      `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(activeDayNum).padStart(2, '0')}`
    );
  }, [viewYear, viewMonth, activeDayNum]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => Math.max(1950, y - 1));
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => Math.min(2050, y + 1));
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const monthNamesEnglish = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesMalayalam = [
    'ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മേയ്', 'ജൂൺ',
    'ജൂലൈ', 'ഓഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ'
  ];

  // Weekday Headers: Full Malayalam & English names as requested:
  // "സൺഡേ എന്നുള്ളിടത്ത് സൺ എന്നുള്ളിടത്ത് സൺഡേ എന്നാകണം. സൺഡേ മലയാളം വേണം ഇംഗ്ലീഷും വേണം"
  const weekdayHeaders = [
    { ml: 'ഞായറാഴ്ച', en: 'SUNDAY', isSunday: true },
    { ml: 'തിങ്കളാഴ്ച', en: 'MONDAY', isSunday: false },
    { ml: 'ചൊവ്വാഴ്ച', en: 'TUESDAY', isSunday: false },
    { ml: 'ബുധനാഴ്ച', en: 'WEDNESDAY', isSunday: false },
    { ml: 'വ്യാഴാഴ്ച', en: 'THURSDAY', isSunday: false },
    { ml: 'വെള്ളിയാഴ്ച', en: 'FRIDAY', isSunday: false },
    { ml: 'ശനിയാഴ്ച', en: 'SATURDAY', isSunday: false },
  ];

  const handleSelectDay = (day: number) => {
    setActiveDayNum(day);
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(dateKey);
    setEventDate(dateKey);
  };

  // Jump to date execution ("Go" / "Enter")
  const handleExecuteJump = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jumpDateInput) return;
    const parts = jumpDateInput.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const y = parts[0];
      const m = parts[1] - 1;
      const d = parts[2];
      setViewYear(y);
      setViewMonth(m);
      setActiveDayNum(d);
      onSelectDate(jumpDateInput);
      setEventDate(jumpDateInput);
      setIsJumpOpen(false);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime,
      type: eventType,
      vibrationTrigger: 'poly',
      notes: eventNotes.trim() || undefined,
      workspace: 'design',
    };

    onAddEvent(newEv);
    setIsEventModalOpen(false);
    setEventTitle('');
    setEventNotes('');
  };

  // Active day Kerala Details computed dynamically
  const activeDayKerala = useMemo(() => {
    return getKeralaDayDetails(viewYear, viewMonth, activeDayNum);
  }, [viewYear, viewMonth, activeDayNum]);

  // Header Malayalam month range text (e.g. 1202 തുലാം - വൃശ്ചികം)
  const currentMonthSpan = useMemo(() => {
    const d1 = getKeralaDayDetails(viewYear, viewMonth, 1);
    const dLast = getKeralaDayDetails(viewYear, viewMonth, daysInMonth);
    if (d1.malayalamMonth === dLast.malayalamMonth) {
      return `${d1.malayalamMonth} · 1202`;
    }
    return `1202 ${d1.malayalamMonth} - ${dLast.malayalamMonth}`;
  }, [viewYear, viewMonth, daysInMonth]);

  const activeDateEvents = events.filter(
    (e) => e.date === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(activeDayNum).padStart(2, '0')}`
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden select-none font-sans text-slate-900">
      
      {/* 1. Clean Header: Single Calendar Icon, Centered Heading, No Duplicate Clutter */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-2xs relative">
        
        {/* Left: Single clean icon + Month Title */}
        <div className="flex items-center gap-3">
          
          {/* Single Calendar Jump Icon Button (User: 'ഒറ്റ ഐക്കൺ. ഡബിൾ ഐക്കൺ ഒന്നും വേണ്ട') */}
          <div className="relative" ref={jumpPopoverRef}>
            <button
              onClick={() => setIsJumpOpen(!isJumpOpen)}
              title="Click to Jump to Date (തിയതി തിരഞ്ഞെടുത്ത് Go ഞെക്കുക)"
              className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center ${
                isJumpOpen 
                  ? 'bg-[#1E3A8A] text-cyan-200 ring-2 ring-cyan-400/40' 
                  : 'bg-[#0F294A] hover:bg-[#1E3A8A] text-cyan-300'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
            </button>

            {/* Minimal Popover: Just input + Go button as explicitly requested */}
            {isJumpOpen && (
              <div className="absolute top-12 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-72 animate-in fade-in duration-150">
                <form onSubmit={handleExecuteJump} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={jumpDateInput}
                      onChange={(e) => setJumpDateInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      title="Go (Enter)"
                    >
                      <span>Go</span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-cyan-300" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Clean Main Month Title */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                {monthNamesEnglish[viewMonth]} {viewYear}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1E3A8A] border border-blue-200">
                {monthNamesMalayalam[viewMonth]} · {currentMonthSpan}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              കേരള കലണ്ടർ &middot; മലയാള മാസം &middot; നക്ഷത്രം &middot; അവധികൾ
            </p>
          </div>
        </div>

        {/* Right Navigation Controls: < >, Today, Split Work, Add Event */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Navigation < and > */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => {
              const now = new Date();
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
              const dStr = now.toISOString().split('T')[0];
              onSelectDate(dStr);
              setActiveDayNum(now.getDate());
            }}
            className="px-3 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Today
          </button>

          {/* Split Workspace View Toggle */}
          <button
            onClick={() => setViewLayout(viewLayout === 'split' ? 'full' : 'split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              viewLayout === 'split'
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
            title="Toggle Split Work Workspace"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{viewLayout === 'split' ? 'Split Work Active' : 'Full Calendar'}</span>
          </button>

          {/* Add Event Button */}
          <button
            onClick={() => {
              const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(activeDayNum).padStart(2, '0')}`;
              setEventDate(formatted);
              setIsEventModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workspace: Optimized for both Split View and Full Calendar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Calendar Grid Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white p-3 md:p-5 border-r border-slate-200">
          
          {/* Weekday Column Headers: SUNDAY to SATURDAY with Malayalam and English as requested */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2 text-center shrink-0">
            {weekdayHeaders.map((dh) => (
              <div 
                key={dh.ml}
                className={`py-1.5 px-1 rounded-lg border transition-colors ${
                  dh.isSunday 
                    ? 'bg-red-50/90 border-red-200 text-red-600 font-extrabold shadow-2xs' 
                    : 'bg-slate-50 border-slate-200/70 text-slate-700 font-bold'
                }`}
              >
                <span className={`text-[10px] sm:text-xs md:text-sm font-bold block truncate ${
                  dh.isSunday ? 'text-red-600' : 'text-slate-800'
                }`}>
                  {dh.ml}
                </span>
                <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-mono tracking-wider uppercase block truncate ${
                  dh.isSunday ? 'text-red-500 font-bold' : 'text-slate-400 font-medium'
                }`}>
                  {dh.en}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Grid (Days Matrix) */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2 flex-1 auto-rows-fr min-h-[460px]">
            
            {/* Previous month padding days */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => {
              const dNum = daysInPrevMonth - firstDayOfMonth + 1 + i;
              const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
              const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
              const prevDayInfo = getKeralaDayDetails(prevYear, prevM, dNum);
              return (
                <div
                  key={`prev-${i}`}
                  onClick={() => {
                    prevMonth();
                    handleSelectDay(dNum);
                  }}
                  className="p-1.5 md:p-2 rounded-xl bg-slate-100/40 border border-slate-200/40 text-slate-300 text-[10px] flex flex-col justify-between opacity-35 cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <span className="font-mono text-xs font-bold text-slate-400">{dNum}</span>
                  <span className="text-[9px] text-slate-400 truncate">{prevDayInfo.malayalamMonth} {prevDayInfo.malayalamDay}</span>
                </div>
              );
            })}

            {/* Current Month Days - Fully Optimized:
                1. Date number large (1/4 size of cell corner, clear on mobile and laptop)
                2. Sub-heading: Malayalam month & day
                3. Compact text: Nakshatram
                4. Sunday and Holidays in RED
            */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = activeDayNum === dayNum;
              const isToday = dateKey === new Date().toISOString().split('T')[0];
              const dayEvents = events.filter((e) => e.date === dateKey);
              const keralaDay = getKeralaDayDetails(viewYear, viewMonth, dayNum);

              return (
                <button
                  key={`cur-${dayNum}`}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`p-2 md:p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between border relative group ${
                    isSelected
                      ? 'bg-blue-50/40 border-[#0F294A] shadow-md ring-2 ring-[#0F294A]/30 z-10'
                      : isToday
                      ? 'bg-blue-50/70 border-[#1E3A8A] text-slate-900 shadow-2xs'
                      : keralaDay.isSunday
                      ? 'bg-red-50/25 border-red-100 hover:border-red-300 hover:bg-red-50/50 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                  title={`${dateKey} · ${keralaDay.dayOfWeekNameMl} · ${keralaDay.malayalamMonth} ${keralaDay.malayalamDay} · നക്ഷത്രം: ${keralaDay.nakshatra}${keralaDay.holidayName ? ` · ${keralaDay.holidayName}` : ''}`}
                >
                  {/* Top Area: Large 1/4 Size Date Number + Badges */}
                  <div className="flex items-start justify-between w-full">
                    
                    {/* Date Number: 1/4 size of cell corner, Bold & Crisp */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-mono font-bold leading-none tracking-tight text-base sm:text-lg md:text-xl transition-all ${
                          keralaDay.isSunday
                            ? 'text-red-600 font-extrabold'
                            : keralaDay.isHoliday
                            ? 'text-red-600 font-extrabold'
                            : isToday
                            ? 'text-[#0F294A] font-extrabold underline decoration-cyan-500 decoration-2'
                            : 'text-slate-800'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Malayalam Month start indicator */}
                      {keralaDay.malayalamDay === 1 && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#0F294A] text-cyan-200 scale-90 origin-left">
                          മാസാരംഭം
                        </span>
                      )}
                    </div>

                    {isToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#0F294A] text-white">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Sub-heading directly below date number: Malayalam Month & Day */}
                  <div className="mt-1">
                    <div className="text-[11px] md:text-xs font-bold text-slate-800 leading-tight">
                      {keralaDay.malayalamMonth} {keralaDay.malayalamDay}
                    </div>

                    {/* Compact text underneath: Nakshatram */}
                    <div className="text-[10px] md:text-[11px] font-medium text-slate-500 leading-tight truncate">
                      {keralaDay.nakshatra}
                    </div>
                  </div>

                  {/* Holidays & Observances (Red Badge) */}
                  {keralaDay.holidayName && (
                    <div className="mt-1">
                      <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded block truncate" title={keralaDay.holidayName}>
                        🚩 {keralaDay.holidayName}
                      </span>
                    </div>
                  )}

                  {/* Personal Scheduled Events list */}
                  <div className="mt-1 space-y-0.5 overflow-hidden w-full">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[9px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded truncate border border-slate-200 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] shrink-0" />
                        <span className="truncate">{ev.time} {ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-[#1E3A8A] font-semibold pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Kerala Calendar Legend */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 shrink-0">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-300" />
                <span className="text-red-700 font-bold">ഞായർ &amp; പൊതു അവധികൾ (Sundays &amp; Holidays)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-blue-50 border border-blue-200" />
                <span>മലയാള മാസം &amp; നക്ഷത്രം</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" />
                <span>Personal Tasks</span>
              </span>
            </div>

            <span className="font-mono text-slate-400 text-[11px]">
              Kollam Era 1202 · NIJO PVT PC
            </span>
          </div>
        </div>

        {/* 3. SPLIT WORK WORKSPACE (Right Panel) */}
        {viewLayout === 'split' && (
          <div className="w-full sm:w-80 md:w-96 bg-white flex flex-col overflow-y-auto shrink-0 shadow-lg border-l border-slate-200">
            
            {/* Split Panel Header */}
            <div className="p-4 bg-[#0F294A] text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    {monthNamesEnglish[viewMonth]} {activeDayNum}, {viewYear}
                  </span>
                  <span className="text-xs text-slate-300 font-bold">
                    {activeDayKerala.dayOfWeekNameMl}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  കൊല്ലവർഷം {activeDayKerala.kollamYear} {activeDayKerala.malayalamMonth} {activeDayKerala.malayalamDay}
                </h3>
              </div>

              <button
                onClick={() => {
                  const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(activeDayNum).padStart(2, '0')}`;
                  setEventDate(formatted);
                  setIsEventModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#2563eb] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-300" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Split Panel Content */}
            <div className="p-4 space-y-4 text-xs">
              
              {/* Detailed Kerala Day Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                  <span className="text-slate-500 font-semibold">ഇംഗ്ലീഷ് തീയതി:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {viewYear} {monthNamesMalayalam[viewMonth]} {activeDayNum} ({activeDayKerala.dayOfWeekNameMl})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">മലയാള മാസം &amp; തീയതി:</span>
                  <span className="font-bold text-[#0F294A] text-xs px-2 py-0.5 rounded bg-blue-100/60 border border-blue-200">
                    {activeDayKerala.malayalamMonth} {activeDayKerala.malayalamDay}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">നക്ഷത്രം (Nakshatram):</span>
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{activeDayKerala.nakshatra}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">കൊല്ലവർഷം:</span>
                  <span className="font-mono font-bold text-slate-800">{activeDayKerala.kollamYear}</span>
                </div>

                {/* Holiday status */}
                {activeDayKerala.holidayName ? (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 block text-center">
                      🚩 {activeDayKerala.holidayName}
                    </span>
                  </div>
                ) : activeDayKerala.isSunday ? (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 block text-center">
                      🚩 ഞായറാഴ്ച (Sunday Holiday)
                    </span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 text-center">
                    സാധാരണ പ്രവൃത്തിദിനം (Working Day)
                  </div>
                )}
              </div>

              {/* Day's Personal Tasks & Events */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Personal Work &amp; Schedule ({activeDateEvents.length})</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Deliverables</span>
                </div>

                {activeDateEvents.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    <CalendarDays className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">No events scheduled for this day.</p>
                    <button
                      onClick={() => {
                        const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(activeDayNum).padStart(2, '0')}`;
                        setEventDate(formatted);
                        setIsEventModalOpen(true);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-[#0F294A] text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Add Work for this Day</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeDateEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-slate-900 text-xs leading-snug">
                            {ev.title}
                          </h5>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono text-[10px] font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {ev.time}
                            </span>
                            <button
                              onClick={() => handleOpenEditEvent(ev)}
                              className="text-slate-400 hover:text-[#1E3A8A] p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Edit Event (ഇവന്റ് എഡിറ്റ് ചെയ്യുക)"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteEvent && onDeleteEvent(ev.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Event (ഇവന്റ് ഡിലീറ്റ് ചെയ്യുക)"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {ev.notes && (
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {ev.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span className="capitalize font-semibold text-slate-600 flex items-center gap-1">
                            {ev.type === 'reels' ? <Briefcase className="w-3 h-3 text-cyan-600" /> : <GraduationCap className="w-3 h-3 text-[#1E3A8A]" />}
                            <span>{ev.type}</span>
                          </span>
                          <span>Alarm: {ev.vibrationTrigger}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 4. Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Schedule Task / Event for {eventDate}
                </h3>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Task / Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maths Exam Revision / Libra Reel 05 Render"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="exam">Polytechnic Board Exam / Study</option>
                  <option value="reels">Instagram Reel Release</option>
                  <option value="deadline">Client Deliverable</option>
                  <option value="festival">Public Holiday / Observance</option>
                  <option value="class">Class / Meeting</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add details, formula topics, or client brief notes..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Event Modal (Universal Edit & Delete Requirement) */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Edit Event (ഇവന്റ് എഡിറ്റ് ചെയ്യുക)
                </h3>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEventEdits} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={editEventTitle}
                  onChange={(e) => setEditEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editEventTime}
                    onChange={(e) => setEditEventTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Type
                </label>
                <select
                  value={editEventType}
                  onChange={(e) => setEditEventType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                >
                  <option value="exam">Polytechnic Board Exam / Study</option>
                  <option value="reels">Instagram Reel Release</option>
                  <option value="deadline">Client Deliverable</option>
                  <option value="festival">Public Holiday / Observance</option>
                  <option value="class">Class / Meeting</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editEventNotes}
                  onChange={(e) => setEditEventNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteEvent && editingEvent) {
                      onDeleteEvent(editingEvent.id);
                    }
                    setEditingEvent(null);
                  }}
                  className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Save Changes
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

export default CalendarModule;
