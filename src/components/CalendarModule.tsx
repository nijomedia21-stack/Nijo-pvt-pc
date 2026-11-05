import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  Vibrate, 
  Plus, 
  CalendarDays,
  X
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarModuleProps {
  events: CalendarEvent[];
  onAddEvent: (newEvent: CalendarEvent) => void;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  events,
  onAddEvent,
  selectedDateStr,
  onSelectDate,
}) => {
  const selectedDate = new Date(selectedDateStr || '2026-11-03');
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth()); // 0-11

  // Modal State for Add Event / Task
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(selectedDateStr);
  const [eventTime, setEventTime] = useState<string>('10:00');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('reels');
  const [vibrationTrigger, setVibrationTrigger] = useState<CalendarEvent['vibrationTrigger']>('poly');
  const [eventNotes, setEventNotes] = useState<string>('');
  const [isVibratingPreview, setIsVibratingPreview] = useState<boolean>(false);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => Math.max(2024, y - 1));
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => Math.min(2100, y + 1));
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar Math
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // English day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Handle date cell click: selects date AND opens creation modal if desired!
  const handleDateClick = (dateKey: string) => {
    onSelectDate(dateKey);
    setEventDate(dateKey);
    setIsEventModalOpen(true);
  };

  const handleTestVibration = (pattern: CalendarEvent['vibrationTrigger']) => {
    setIsVibratingPreview(true);
    if ('vibrate' in navigator) {
      const patterns = {
        gentle: [100, 100, 100],
        rapid: [50, 50, 50, 50, 50],
        poly: [200, 100, 50, 50, 300],
        steady: [500]
      };
      try {
        navigator.vibrate(patterns[pattern]);
      } catch (e) {
        // Safe fallback
      }
    }
    setTimeout(() => {
      setIsVibratingPreview(false);
    }, 1200);
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
      vibrationTrigger,
      notes: eventNotes.trim() || undefined,
      workspace: 'design',
    };

    onAddEvent(newEv);
    setIsEventModalOpen(false);
    setEventTitle('');
    setEventNotes('');
  };

  const eventsForSelectedDate = events.filter((e) => e.date === selectedDateStr);
  const selectedDayIndex = new Date(selectedDateStr + 'T00:00:00').getDay();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#0F294A] text-white">
            <CalendarDays className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {monthNames[viewMonth]} {viewYear}
              </h2>
              <span className="text-xs font-semibold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Monthly View (70% Grid)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Click any calendar cell to instantly add an event or task
            </p>
          </div>
        </div>

        {/* Jumpers & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Month Navigation */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Year Jumper up to 2100 */}
          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="text-xs font-mono font-medium px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
            title="Jump Year (up to 2100)"
          >
            {Array.from({ length: 77 }, (_, i) => 2024 + i).map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>

          {/* Month Select */}
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="text-xs font-medium px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>

          {/* Today Button */}
          <button
            onClick={() => {
              const now = new Date();
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
              onSelectDate(now.toISOString().split('T')[0]);
            }}
            className="px-2.5 py-1 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-medium shadow-2xs"
          >
            Today
          </button>

          {/* Add Event Button */}
          <button
            onClick={() => {
              setEventDate(selectedDateStr);
              setIsEventModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-300" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Main Dominant Calendar Grid Area (Takes 70%+ of Screen) */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col overflow-hidden">
        {/* Day Headers (Sun-Sat in clean English) */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-600">
          {dayHeaders.map((dh, i) => (
            <div 
              key={dh} 
              className={`py-1.5 rounded-lg ${i === 0 ? 'bg-blue-50/60 text-[#1E3A8A] font-bold' : 'bg-slate-100/60'}`}
            >
              <div className="text-xs font-bold">{dh}</div>
            </div>
          ))}
        </div>

        {/* Days Matrix (Takes majority of height) */}
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
          {/* Previous month padding days */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => {
            const dNum = daysInPrevMonth - firstDayOfMonth + 1 + i;
            return (
              <div
                key={`prev-${i}`}
                className="p-2 rounded-xl bg-slate-100/40 border border-slate-200/50 text-slate-300 text-xs flex flex-col justify-between"
              >
                <span className="font-mono text-[11px]">{dNum}</span>
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = dateKey === selectedDateStr;
            const isToday = dateKey === new Date().toISOString().split('T')[0];
            const dayEvents = events.filter((e) => e.date === dateKey);

            return (
              <button
                key={`cur-${dayNum}`}
                onClick={() => handleDateClick(dateKey)}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between border relative group ${
                  isSelected
                    ? 'bg-white border-[#0F294A] shadow-md ring-2 ring-[#0F294A]/25'
                    : isToday
                    ? 'bg-blue-50/70 border-[#1E3A8A] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
                title="Click to add event/task for this date"
              >
                <div className="flex items-start justify-between w-full">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isToday
                        ? 'bg-[#0F294A] text-white'
                        : isSelected
                        ? 'bg-[#1E3A8A] text-cyan-200'
                        : 'text-slate-800'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#1E3A8A]" />
                  )}
                </div>

                {/* Event Tags inside cell */}
                <div className="mt-1 space-y-1 overflow-hidden w-full">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded truncate border border-slate-200"
                    >
                      {ev.time} {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-[#1E3A8A] font-semibold pl-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Bottom Day Schedule Strip (Replaced the 50% side panel!) */}
      <div className="bg-white border-t border-slate-200 px-6 py-2.5 shrink-0 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-[#0F294A] text-white text-xs font-bold">
            {dayNamesFull[selectedDayIndex] || 'Selected Day'}
          </div>
          <span className="text-xs font-medium text-slate-700">
            {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-mono">
            {eventsForSelectedDate.length} {eventsForSelectedDate.length === 1 ? 'event scheduled' : 'events scheduled'}
          </span>
        </div>

        {/* Horizontal Event Chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-xl">
          {eventsForSelectedDate.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              No alarms or events for this date. Click cell to add.
            </span>
          ) : (
            eventsForSelectedDate.map((ev) => (
              <div
                key={ev.id}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs flex items-center gap-2 shrink-0"
              >
                <span className="font-mono text-[#1E3A8A] font-bold text-[11px]">{ev.time}</span>
                <span className="font-semibold text-slate-800 truncate max-w-[140px]">{ev.title}</span>
                <span className="text-[10px] text-slate-400">({ev.vibrationTrigger} alarm)</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Schedule Event / Alarm for {eventDate}
                </h3>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event / Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Libra Reel 04 Launch / Client Review"
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

              {/* Vibration Trigger Preset */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Vibrate className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Vibration Alarm Trigger</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTestVibration(vibrationTrigger)}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300"
                  >
                    {isVibratingPreview ? 'Vibrating...' : 'Test Trigger'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gentle', label: 'Gentle Pulse (100ms)' },
                    { id: 'rapid', label: 'Rapid Alert (5x)' },
                    { id: 'poly', label: 'Poly-Rhythm' },
                    { id: 'steady', label: 'Continuous Steady' },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setVibrationTrigger(pat.id as any)}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        vibrationTrigger === pat.id
                          ? 'bg-white border-[#1E3A8A] ring-1 ring-[#1E3A8A] shadow-2xs font-semibold'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="text-[11px] text-slate-900">{pat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Client deliverable details, review links, or reminder notes..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white rounded-lg font-bold shadow-sm"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
