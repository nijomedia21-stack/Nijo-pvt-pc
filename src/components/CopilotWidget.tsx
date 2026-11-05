import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Layers, 
  Check, 
  Copy, 
  RotateCcw,
  Maximize2,
  Minimize2,
  Terminal,
  Calculator,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { CopilotChatMessage, WorkspaceMode, Task, CalendarEvent } from '../types';

interface CopilotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceMode: WorkspaceMode;
  tasks: Task[];
  events: CalendarEvent[];
  selectedDateStr: string;
}

export const CopilotWidget: React.FC<CopilotWidgetProps> = ({
  isOpen,
  onClose,
  workspaceMode,
  tasks,
  events,
  selectedDateStr,
}) => {
  const [messages, setMessages] = useState<CopilotChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      text: `👋 Welcome Nijo! I am your private AI Copilot for **NIJO PVT PC** (Windows 11 Edition).

I have full real-time awareness of your:
- **Polytechnic AI & ML (Sem 1)**: Maths I, Chemistry, PSPP/Python, Physics.
- **Libra Studio**: Luxury minimalist SMM, Instagram Reels, and vector guidelines.
- **Calendar & Schedule**: Today's priorities, alarms, and deadlines.

Click any quick prompt chip below or ask me anything!`,
      timestamp: 'Just now',
      actionChips: [
        'Maths I Formulas',
        'Chemistry Concepts',
        'Check Calendar',
        'Libra SMM Plan',
        'Exam Countdown'
      ]
    }
  ]);

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: CopilotChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: workspaceMode,
          context: {
            user: 'Nijo (nijo.media21@gmail.com)',
            pendingTasksCount: tasks.filter(t => !t.completed).length,
            todayTasks: tasks.filter(t => t.category === 'today').map(t => t.title),
            eventsCount: events.length,
            selectedDate: selectedDateStr,
          }
        }),
      });

      const data = await response.json();
      const assistantMsg: CopilotChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'Copilot generated a response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot request failed:', err);
      // Fallback response
      const fallbackMsg: CopilotChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        text: `Here is the relevant data from your workspace:
- Current Mode: **${workspaceMode === 'study' ? 'Polytechnic AI & ML' : 'Libra Design Studio'}**
- Active Tasks: **${tasks.filter(t => !t.completed).length} pending**
- Selected Date: **${selectedDateStr}**
You can ask for Euler's Theorem, EDTA Hardness formulas, or Libra Reel 04 caption!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const fastPromptChips = [
    { label: '📐 Maths I Formulas', query: 'Show me key formulas for Maths I Semester 1 (Euler theorem, matrices, calculus)' },
    { label: '🧪 Chemistry Concepts', query: 'Explain EDTA water hardness calculation and polymer classification' },
    { label: '📅 Check Calendar', query: 'What is today\'s Kerala Malayalam Panchangam, Nakshatra, and Rahukalam?' },
    { label: '✨ Libra SMM Plan', query: 'Give me a luxury caption and reel hook for client Libra identity' },
    { label: '⏳ Exam Countdown', query: 'Give me the Semester 1 board exam schedule countdown and revision tips' },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-40 transition-all duration-200 bg-white shadow-2xl border border-slate-300 flex flex-col overflow-hidden ${
        isExpanded
          ? 'inset-6 sm:inset-12 rounded-2xl'
          : 'bottom-4 right-4 w-96 max-w-[calc(100vw-32px)] h-[580px] rounded-2xl'
      }`}
    >
      {/* Header (Windows 11 Copilot Flyout Style) */}
      <div className="bg-[#0F294A] text-white p-3.5 flex items-center justify-between border-b border-[#1E3A8A] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Nijo Copilot</span>
              <span className="text-[10px] text-cyan-300 font-mono font-normal">
                (PC AI Logic)
              </span>
            </h3>
            <p className="text-[10px] text-slate-300">
              Context-Aware: {workspaceMode === 'study' ? 'Polytechnic AI & ML' : 'Libra Studio'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="Close Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fast Prompt Chips Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        {fastPromptChips.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleSendMessage(chip.query)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-800 hover:text-[#0F294A] border border-slate-200 rounded-md whitespace-nowrap font-medium transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAFC] text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-[#0F294A] text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3 leading-relaxed shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-[#0F294A] text-white font-medium'
                  : 'bg-white text-slate-900 border border-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs">
                {msg.text}
              </div>

              {/* Action chips if assistant sent them */}
              {msg.actionChips && (
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-100">
                  {msg.actionChips.map((chipText) => (
                    <button
                      key={chipText}
                      onClick={() => handleSendMessage(chipText)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                    >
                      {chipText}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[9px] mt-1.5 flex items-center justify-between font-mono ${
                  msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="hover:text-slate-700 ml-2"
                    title="Copy Answer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                N
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-lg border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-ping" />
            <span>Nijo Copilot is generating response via Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about Maths I, Chemistry, Python, Libra SMM, or Panchangam..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-[#0F294A] hover:bg-[#1E3A8A] text-white rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            title="Send Message"
          >
            <Send className="w-4 h-4 text-cyan-300" />
          </button>
        </form>
      </div>
    </div>
  );
};
