import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  Copy, 
  Check,
  Maximize2, 
  Minimize2, 
  BookOpen,
  Calendar,
  Layers,
  Zap,
  CheckCircle2,
  Share2
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
      text: `👋 **Hello Nijo!** I am your private AI Copilot for **NIJO PVT PC**.

I am primed with deep real-time knowledge of both your worlds:
1. 🎓 **Polytechnic AI & ML (Semester 1)**: Mathematics I, Chemistry, Physics & Python/PSPP.
2. 🎬 **NIJO SMM & Libra Studio**: Luxury minimalist branding, 60fps Reels, and client retainer deliverables.
3. 📱 **Local File Sharing Hub**: Wi-Fi cross-device transfer on \`192.168.1.2:4000\`.

Ask me any academic or SMM question in **English or Malayalam (മലയാളം)**, or click a quick prompt below!`,
      timestamp: 'Just now',
      actionChips: [
        'Euler\'s Theorem Formula',
        'EDTA Hardness Calculation',
        'Viral Luxury Reel Hook',
        'Today\'s Priority Tasks',
        'File Transfer Help'
      ]
    }
  ]);

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // High-Depth Knowledge Engine
  const generateCopilotResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Mathematics I: Euler's theorem, matrices, calculus
    if (q.includes('euler') || q.includes('homogeneous')) {
      return `### 📐 Euler's Theorem on Homogeneous Functions

If $u = f(x, y)$ is a homogeneous function of degree $n$ in $x$ and $y$, then:
$$x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = n \\cdot u$$

**Extension for Second Derivatives:**
$$x^2 \\frac{\\partial^2 u}{\\partial x^2} + 2xy \\frac{\\partial^2 u}{\\partial x \\partial y} + y^2 \\frac{\\partial^2 u}{\\partial y^2} = n(n-1)u$$

**Step-by-Step Problem Solving Rule:**
1. Check homogeneity: Substitute $x = tx$ and $y = ty$. If $f(tx, ty) = t^n f(x, y)$, degree is $n$.
2. For composite functions like $u = \\sin^{-1}\\left(\\frac{x+y}{\\sqrt{x}+\\sqrt{y}}\\right)$:
   - Let $z = \\sin(u) = \\frac{x+y}{\\sqrt{x}+\\sqrt{y}}$.
   - Here $z$ is homogeneous with degree $n = 1 - \\frac{1}{2} = \\frac{1}{2}$.
   - Apply theorem: $x \\frac{\\partial z}{\\partial x} + y \\frac{\\partial z}{\\partial y} = \\frac{1}{2} z$
   - Since $\\frac{\\partial z}{\\partial x} = \\cos(u) \\frac{\\partial u}{\\partial x}$, dividing by $\\cos(u)$ gives:
   $$x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = \\frac{1}{2} \\tan(u)$$`;
    }

    if (q.includes('matrix') || q.includes('matrices') || q.includes('eigen') || q.includes('rank')) {
      return `### 🔢 Matrix Theory & Eigenvalues (Maths I)

**1. Rank of a Matrix:**
- Convert matrix $[A]$ into Row Echelon Form using elementary row operations $(R_i \\leftrightarrow R_j, R_i \\to k R_i, R_i \\to R_i + k R_j)$.
- $\\text{Rank}(A)$ = Number of non-zero rows in echelon form.

**2. Eigenvalues and Eigenvectors:**
- Characteristic Equation: $|A - \\lambda I| = 0$
- Expanding for $3 \\times 3$ matrix:
  $$\\lambda^3 - S_1 \\lambda^2 + S_2 \\lambda - |A| = 0$$
  - $S_1$ = Trace of $A$ (Sum of principal diagonal elements)
  - $S_2$ = Sum of minors of principal diagonal elements
  - $|A|$ = Determinant of matrix $A$

**3. Cayley-Hamilton Theorem:**
- Every square matrix satisfies its own characteristic equation: $A^3 - S_1 A^2 + S_2 A - |A| I = 0$.
- Used for finding $A^{-1} = \\frac{1}{|A|}(A^2 - S_1 A + S_2 I)$ and higher powers $A^4, A^8$.`;
    }

    // 2. Chemistry: EDTA hardness, Zeolite, Polymers
    if (q.includes('edta') || q.includes('hardness') || q.includes('water')) {
      return `### 🧪 EDTA Titrimetric Estimation of Water Hardness

**Principle:**
- EDTA (Disodium ethylenediaminetetraacetate) forms stable, colorless chelate complexes with $\\text{Ca}^{2+}$ and $\\text{Mg}^{2+}$ ions at $\\text{pH } 10$.
- **Indicator:** Eriochrome Black T (EBT).
- **Buffer:** $\\text{NH}_4\\text{Cl} + \\text{NH}_4\\text{OH}$ (pH 10).
- **Color Change at End Point:** Wine Red $\\to$ Steel Blue.

**Formula for Total Hardness:**
$$\\text{Total Hardness (ppm of } \\text{CaCO}_3\\text{)} = \\frac{V_{\\text{EDTA}} \\times N_{\\text{EDTA}} \\times 50 \\times 1000}{V_{\\text{water sample}}}$$

**Temporary vs Permanent Hardness:**
- **Temporary Hardness:** Caused by bicarbonates $\\text{Ca(HCO}_3)_2, \\text{Mg(HCO}_3)_2$. Removed by boiling.
- **Permanent Hardness:** Caused by chlorides and sulfates $\\text{CaCl}_2, \\text{MgSO}_4$. Removed by Zeolite/Permutit process or Ion-exchange demineralization.`;
    }

    if (q.includes('polymer') || q.includes('corrosion')) {
      return `### 🔬 Polymers & Corrosion Control (Semester 1 Chemistry)

**1. Thermoplastics vs Thermosetting:**
- **Thermoplastics:** Linear or branched chains with weak Van der Waals forces. Soften upon heating, remoldable (e.g., Polyethylene, PVC, Polystyrene).
- **Thermosetting:** 3D cross-linked covalent network. Decompose rather than soften on heating, permanent set (e.g., Bakelite, Urea-formaldehyde).

**2. Corrosion Prevention Strategies:**
- **Sacrificial Anodic Protection:** The metal to be protected is connected to a more active/electropositive sacrificial metal (e.g., Zinc or Magnesium blocks attached to ship hulls and pipelines).
- **Impressed Current Cathodic Protection:** An external DC power source supplies negative potential to the structure, converting it into a continuous cathode.`;
    }

    // 3. PSPP / Python
    if (q.includes('python') || q.includes('pspp') || q.includes('code') || q.includes('recursion')) {
      return `### 🐍 Python / PSPP Core Concepts

**1. Recursion Example (Factorial & Fibonacci):**
\`\`\`python
# Recursive Fibonacci with memoization
def fib(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

print([fib(i) for i in range(10)]) # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

**2. Key Python Data Structures for Semester 1 Exam:**
- **List:** Mutable, ordered, allows duplicates \`[1, 2, 3]\`
- **Tuple:** Immutable, ordered, hashable \`(1, 2, 3)\`
- **Set:** Mutable, unordered, unique items only \`{1, 2, 3}\`
- **Dict:** Key-value mapping with $O(1)$ average lookup \`{"key": "value"}\``;
    }

    // 4. Libra Studio & SMM
    if (q.includes('libra') || q.includes('smm') || q.includes('reel') || q.includes('caption') || q.includes('hook') || q.includes('instagram')) {
      return `### 🎬 NIJO SMM — Luxury Minimalist Reel Deliverable

**Hook Concept (0.0s – 1.8s):**
> *"The difference between a ₹2,000 watch and a ₹20,000 timepiece isn't the metal. It's the restraint."*

**Visual Direction:**
- Deep Midnight Navy (\`#0F294A\`) background with sharp platinum highlight edges (\`#F8FAFC\`).
- Rendered in vertical **9:16 @ 60fps**, color-graded in DaVinci Resolve with film grain (16mm).

**Instagram Caption:**
\`\`\`text
True luxury never begs for attention. It demands silence.

Every millimeter of this piece is engineered to strip away noise until only pure intention remains. 

Client: @libra.studio
Creative Direction & Editing: NIJO SMM (@nijo.media21)

#LibraStudio #MinimalistLuxury #VisualDesign #KeralaCreatives #BrandAesthetics #NijoSMM
\`\`\``;
    }

    // 5. File Sharing & Server 4000
    if (q.includes('file') || q.includes('server') || q.includes('share') || q.includes('mobile') || q.includes('phone') || q.includes('upload') || q.includes('4000')) {
      return `### 📱 Laptop File Sharing Hub Help (\`192.168.1.2:4000\`)

**How the Cross-Device Mesh Works:**
1. **Server Status:** Runs on your Windows Laptop at \`http://192.168.1.2:4000\`.
2. **From Mobile ➔ Laptop:**
   - On your phone, connect to Wi-Fi and open \`http://192.168.1.2:4000\` (or scan the QR code in the Files module).
   - Pick any file and send it. It uploads to \`uploads/\` on your PC.
   - If it doesn't auto-appear in the app window, click **"🔄 Sync"** or **"📁 Import PC File"** in the **Received from Mobile** card!
3. **From Laptop ➔ Mobile:**
   - Drop your video edit (Reel MP4) or file in the Left Column of File Sharing.
   - Click **"📱 Send to Mobile"**.
   - A blue **Ready for Mobile Download** card will appear with a direct link (\`http://192.168.1.2:4000/download/...\`) that you can tap or scan on your phone!`;
    }

    // 6. Malayalam Queries
    if (q.includes('എനിക്ക്') || q.includes('കണക്ക്') || q.includes('റീൽസ്') || q.includes('സെർവർ') || q.includes('മലയാളം') || q.includes('നിജ')) {
      return `### നമസ്കാരം നിജോ! 🌟

നിങ്ങളുടെ **NIJO PVT PC** സിസ്റ്റത്തിലെ വിവരങ്ങൾ ഇതാ:

1. **മൊബൈൽ ➔ പിസി ഫയൽ ട്രാൻസ്ഫർ:**
   - മൊബൈലിൽ നിന്ന് ഫയൽ സെർവറിലേക്ക് അയച്ചു കഴിഞ്ഞാൽ ലാപ്ടോപ്പിലെ \`uploads\` ഫോൾഡറിൽ അത് കിട്ടും.
   - ആപ്പിൽ പെട്ടെന്ന് വരാൻ ഫയൽ ഷെയറിങ് പേജിൽ **"🔄 Sync"** ബട്ടൺ അമർത്തുക, അല്ലെങ്കിൽ **"📁 Import PC File"** വഴി നേരിട്ട് ആപ്പിലേക്ക് ചേർക്കാം.

2. **പിസി ➔ മൊബൈൽ ഫയൽ ട്രാൻസ്ഫർ:**
   - പിസിയിൽ ഫയൽ സെലക്ട് ചെയ്ത് **"📱 Send to Mobile"** ക്ലിക്ക് ചെയ്യുക.
   - ഉടൻ തന്നെ മൊബൈലിൽ ഡൗൺലോഡ് ചെയ്യാനുള്ള ഡയറക്റ്റ് ലിങ്കും QR കോഡും സ്ക്രീനിൽ ലഭ്യമാകും.

3. **ക്ലയന്റ് മാനേജ്‌മെന്റ്:**
   - ക്ലയന്റ്സ് ടാബിൽ പുതിയ ക്ലയന്റിനെ ചേർക്കാനും, വേണ്ടാത്ത ക്ലയന്റുകളെ **Delete Client (🗑️)** ബട്ടൺ വഴി പൂർണ്ണമായി ഒഴിവാക്കാനും സാധിക്കും!

നിങ്ങൾക്ക് ഏത് വിഷയത്തിലാണ് കൂടുതൽ സഹായം വേണ്ടത്? (കണക്ക്, കെമിസ്ട്രി, അല്ലെങ്കിൽ ഇൻസ്റ്റാഗ്രാം റീൽസ്?)`;
    }

    // 7. General Tasks & Schedule
    const pendingCount = tasks.filter(t => !t.completed).length;
    const todayList = tasks.filter(t => t.category === 'today').map(t => `• ${t.title}`).join('\n');
    return `### ⚡ Workspace Briefing for Nijo

- **Active Workspace:** **${workspaceMode === 'study' ? 'Polytechnic AI & ML (Sem 1)' : 'Libra Design Studio (Agency)'}**
- **Pending Tasks:** **${pendingCount} tasks remaining**
- **Selected Calendar Date:** \`${selectedDateStr}\`
- **Total Calendar Events:** **${events.length} scheduled**

**Today's Priorities:**
${todayList || '• All today tasks are completed!'}

**Quick Commands you can ask me:**
- *"Show me Euler's theorem step-by-step"*
- *"Explain EDTA hardness calculation with formula"*
- *"Draft a luxury reel caption for Libra"*
- *"How do I send files between phone and laptop?"*`;
  };

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
      // Check if server endpoint is available, otherwise use local high-depth engine
      let replyText = '';
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
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.text) replyText = data.text;
        }
      } catch (e) {
        // Fall through to local intelligent engine
      }

      if (!replyText) {
        replyText = generateCopilotResponse(text);
      }

      const assistantMsg: CopilotChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot request failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fastPromptChips = [
    { label: '📐 Euler\'s Theorem', query: 'Show me Euler\'s theorem formula and step-by-step problem solving rule' },
    { label: '🧪 EDTA Hardness', query: 'Explain EDTA water hardness calculation, principle, and formula' },
    { label: '🔢 Matrix & Eigen', query: 'Explain matrix rank, echelon form, and Cayley-Hamilton theorem' },
    { label: '✨ Libra Reel Hook', query: 'Give me a luxury caption and reel hook for client Libra identity' },
    { label: '📱 File Share Guide', query: 'How do I send and receive files between my Android phone and PC on 192.168.1.2:4000?' },
    { label: 'മലയാളം സഹായം', query: 'എനിക്ക് മൊബൈലിൽ നിന്നും പിസിയിലേക്കും തിരിച്ചുമുള്ള ഫയൽ ട്രാൻസ്ഫർ വിശദീകരിച്ചു തരൂ' }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-40 transition-all duration-200 bg-white shadow-2xl border border-slate-300 flex flex-col overflow-hidden ${
        isExpanded
          ? 'inset-6 sm:inset-10 rounded-2xl'
          : 'bottom-4 right-4 w-96 max-w-[calc(100vw-32px)] h-[580px] rounded-2xl'
      }`}
    >
      {/* Header (Windows 11 Copilot Flyout Style) */}
      <div className="bg-[#0F294A] text-white p-3.5 flex items-center justify-between border-b border-[#1E3A8A] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] text-cyan-300 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Nijo AI Copilot
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-[#1E3A8A] px-2 py-0.5 rounded">
                Pro Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {workspaceMode === 'study' ? 'Polytechnic AI & ML' : 'Libra Studio'} Specialist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fast Prompt Chips Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
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
              <div className="w-6 h-6 rounded-md bg-[#0F294A] text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-xl p-3 leading-relaxed shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-[#0F294A] text-white font-medium'
                  : 'bg-white text-slate-900 border border-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
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
                className={`text-[9px] mt-2 flex items-center justify-between font-mono ${
                  msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.text, msg.id)}
                    className="hover:text-slate-700 ml-2 inline-flex items-center gap-1 cursor-pointer"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
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
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2.5 bg-white rounded-lg border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-ping" />
            <span>Nijo Copilot is formulating answer...</span>
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
            placeholder="Ask anything in English or മലയാളം (Maths, Chemistry, SMM, File Hub)..."
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

export default CopilotWidget;
