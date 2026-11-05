import {
  ConnectedDevice,
  InstagramReelItem,
  LibraBrandColor,
  PanchangamInfo,
  StudySubject,
  Task,
  TransferHistoryItem
} from '../types';

export const CONNECTED_DEVICES: ConnectedDevice[] = [
  {
    id: 'laptop',
    name: 'Laptop (Windows 11)',
    os: 'Windows 11 Pro 64-bit',
    location: 'Primary Desktop (This PC)',
    ip: '192.168.1.104',
    status: 'active',
    latencyMs: 0.8,
    isHost: true,
  },
  {
    id: 'mobile',
    name: 'Mobile (Android)',
    os: 'Android 15 (NIJO PVT Mobile App)',
    location: "Nijo's Galaxy (In Pocket)",
    ip: '192.168.1.112',
    status: 'paired',
    latencyMs: 2.4,
  },
  {
    id: 'tv',
    name: 'Smart TV (Living Room)',
    os: 'Google TV / Cast Receiver',
    location: 'Living Room 55" Display',
    ip: '192.168.1.120',
    status: 'standby',
    latencyMs: 5.1,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: "Maths I: Complete Euler's Theorem on Homogeneous Functions",
    description: 'Solve 6 problems from Module 2 (Partial differentiation & Euler theorem). Review previous year board questions.',
    category: 'today',
    priority: 'high',
    dueDate: '2026-11-03',
    dueTime: '17:00',
    completed: false,
    workspace: 'study',
    tags: ['Maths I', 'Semester 1', 'Board Exam'],
    voiceNoteUrl: 'voice_memo_maths_euler.wav',
    voiceNoteDuration: '0:42',
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Libra SMM: Finalize Reel 04 Hook & Minimalist Typography',
    description: 'Render 1080x1920 60fps vertical reel. Hook: "Why Navy & Platinum beats monochrome minimalism every single time."',
    category: 'today',
    priority: 'high',
    dueDate: '2026-11-03',
    dueTime: '20:30',
    completed: false,
    workspace: 'design',
    clientName: 'Libra',
    tags: ['Libra', 'Instagram Reels', 'SMM'],
    voiceNoteUrl: 'voice_memo_libra_hook.wav',
    voiceNoteDuration: '1:15',
    createdAt: '2026-11-02T11:20:00Z',
  },
  {
    id: 'task-3',
    title: 'PSPP Lab: Test Matrix Multiplication script in Python',
    description: 'Implement nested list comprehension and 2D matrix multiplication with input validation.',
    category: 'upcoming',
    priority: 'medium',
    dueDate: '2026-11-05',
    dueTime: '14:00',
    completed: false,
    workspace: 'study',
    tags: ['PSPP', 'Python', 'Lab Record'],
    createdAt: '2026-11-01T09:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Libra Brand Kit: Export Vector SVG Glyphs to Android Mobile',
    description: 'Push vector assets through NIJO PVT Local Mesh for mobile mockup inspection.',
    category: 'completed',
    priority: 'normal',
    dueDate: '2026-11-02',
    dueTime: '16:00',
    completed: true,
    workspace: 'design',
    clientName: 'Libra',
    tags: ['Brand Identity', 'Vectors'],
    createdAt: '2026-11-01T15:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Applied Chemistry: Revise EDTA Titration & Water Hardness',
    description: 'Calculate temporary vs permanent hardness and write buffer reaction notes (pH 10).',
    category: 'upcoming',
    priority: 'medium',
    dueDate: '2026-11-06',
    dueTime: '11:00',
    completed: false,
    workspace: 'study',
    tags: ['Chemistry', 'Semester 1'],
    createdAt: '2026-11-02T12:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Applied Physics: Numerical Aperture & Laser Modes Derivation',
    description: 'Derive NA formula: NA = sqrt(n1^2 - n2^2) and acceptance angle.',
    category: 'upcoming',
    priority: 'normal',
    dueDate: '2026-11-08',
    dueTime: '18:00',
    completed: false,
    workspace: 'study',
    tags: ['Physics', 'Fiber Optics'],
    createdAt: '2026-11-02T14:00:00Z',
  },
];

export const INITIAL_TRANSFERS: TransferHistoryItem[] = [
  {
    id: 'tr-1',
    name: 'AI_ML_Sem1_Maths_Notes.pdf',
    size: '4.8 MB',
    type: 'pdf',
    timestamp: 'Today at 09:12 AM',
    sourceDevice: 'Laptop (Windows 11)',
    targetDevices: ['Mobile (Android)'],
    status: 'completed',
    contentSnippet: 'Comprehensive handwritten and digitized notes covering Module 1 to 4 with solved question papers.',
  },
  {
    id: 'tr-2',
    name: 'Libra_Brand_Identity_Kit_v2.svg',
    size: '1.2 MB',
    type: 'image',
    timestamp: 'Today at 08:45 AM',
    sourceDevice: 'Laptop (Windows 11)',
    targetDevices: ['Mobile (Android)', 'Smart TV (Living Room)'],
    status: 'completed',
    contentSnippet: 'Client Libra vector logo master set, color palettes, and typographic scales.',
  },
  {
    id: 'tr-3',
    name: 'matrix_calc_pspp.py',
    size: '3.4 KB',
    type: 'code',
    timestamp: 'Yesterday at 07:30 PM',
    sourceDevice: 'Mobile (Android)',
    targetDevices: ['Laptop (Windows 11)'],
    status: 'completed',
    contentSnippet: 'def multiply_matrices(A, B):\n    return [[sum(a*b for a,b in zip(X_row, Y_col)) for Y_col in zip(*B)] for X_row in A]',
  },
  {
    id: 'tr-4',
    name: 'Reels_Color_Hex_Clipboard.txt',
    size: '512 B',
    type: 'clipboard',
    timestamp: 'Yesterday at 04:15 PM',
    sourceDevice: 'Laptop (Windows 11)',
    targetDevices: ['Mobile (Android)'],
    status: 'completed',
    contentSnippet: 'Primary: #0F294A | Secondary: #1E3A8A | Base: #F8FAFC | Accent: #06B6D4',
  },
];

export const STUDY_SUBJECTS: StudySubject[] = [
  {
    code: '1001',
    name: 'Mathematics I',
    shortName: 'Maths I',
    instructor: 'Prof. Sreejith K. (HOD Basic Science)',
    credits: 4,
    units: [
      {
        unitNumber: 1,
        title: 'Matrices & Linear Algebra',
        topics: ['Rank of a matrix', 'Consistency of linear equations', 'Eigenvalues & Eigenvectors', 'Cayley-Hamilton Theorem'],
        isCompleted: true,
      },
      {
        unitNumber: 2,
        title: 'Differential Calculus & Partial Differentiation',
        topics: ["Successive differentiation", "Leibnitz's theorem", 'Partial derivatives', "Euler's theorem on homogeneous functions"],
        isCompleted: false,
      },
      {
        unitNumber: 3,
        title: 'Integral Calculus & Applications',
        topics: ['Integration by parts', 'Definite integrals', 'Reduction formulas', 'Area bounded by curves'],
        isCompleted: false,
      },
      {
        unitNumber: 4,
        title: 'Differential Equations',
        topics: ['First-order linear DE', "Exact differential equations", 'Applications to orthogonal trajectories'],
        isCompleted: false,
      },
    ],
    formulas: [
      {
        topic: "Euler's Theorem",
        title: "Homogeneous Functions of Degree n",
        formula: "x(∂u/∂x) + y(∂u/∂y) = n·u",
        explanation: 'For any homogeneous function u = f(x,y) of degree n in x and y.'
      },
      {
        topic: 'Cayley-Hamilton Theorem',
        title: 'Matrix Equation',
        formula: 'Aⁿ - S₁Aⁿ⁻¹ + S₂Aⁿ⁻² - ... + (-1)ⁿ|A|I = 0',
        explanation: 'Every square matrix satisfies its own characteristic equation. Crucial for finding A⁻¹ and higher powers.'
      },
      {
        topic: 'Leibnitz Rule',
        title: 'nth Derivative of a Product',
        formula: '(uv)ₙ = uₙv + nC₁ uₙ₋₁v₁ + nC₂ uₙ₋₂v₂ + ... + uvₙ',
        explanation: 'Used for solving nth derivatives of polynomial times trigonometric/exponential terms.'
      },
      {
        topic: 'Eigenvalue Characteristic Form',
        title: '3x3 Matrix Determinant Form',
        formula: 'λ³ - S₁λ² + S₂λ - |A| = 0',
        explanation: 'S₁ = Trace(A), S₂ = sum of minors of main diagonal elements, |A| = determinant.'
      }
    ],
    questionPapers: [
      { id: 'qp-m-1', year: '2025', term: 'Odd Sem Regular', subjectCode: '1001', title: 'Nov 2025 Board Exam Paper', pages: 4 },
      { id: 'qp-m-2', year: '2024', term: 'Odd Sem Supplementary', subjectCode: '1001', title: 'Dec 2024 Model Question Paper', pages: 4 },
      { id: 'qp-m-3', year: '2023', term: 'Odd Sem Regular', subjectCode: '1001', title: 'Nov 2023 Solved Paper with Key', pages: 6 },
    ]
  },
  {
    code: '1002',
    name: 'Applied Chemistry',
    shortName: 'Chemistry',
    instructor: 'Dr. Lekshmi R.',
    credits: 3,
    units: [
      {
        unitNumber: 1,
        title: 'Water Technology & Treatment',
        topics: ['Hardness of water', 'EDTA titration method', 'Zeolite & Demineralization processes', 'Boiler troubles (scale, sludge, priming)'],
        isCompleted: true,
      },
      {
        unitNumber: 2,
        title: 'Polymers & Composite Materials',
        topics: ['Classification of polymers', 'Thermoplastics vs Thermosetting', 'Bakelite synthesis & Teflon', 'Conducting polymers'],
        isCompleted: true,
      },
      {
        unitNumber: 3,
        title: 'Electrochemistry & Corrosion',
        topics: ['Galvanic cells & Nernst Equation', 'Electrochemical series', 'Mechanism of dry and wet corrosion', 'Cathodic protection'],
        isCompleted: false,
      },
      {
        unitNumber: 4,
        title: 'Nanomaterials & Green Chemistry',
        topics: ['Properties of nanomaterials', 'Carbon Nanotubes (CNTs)', 'Twelve principles of green chemistry'],
        isCompleted: false,
      },
    ],
    formulas: [
      {
        topic: 'Water Hardness',
        title: 'EDTA Titration Hardness Calculation',
        formula: 'Total Hardness (ppm) = (V₁ × S × 1000) / (Volume of water sample in mL)',
        explanation: 'V₁ = volume of EDTA consumed, S = strength of EDTA in terms of CaCO₃ equivalent.'
      },
      {
        topic: 'Electrochemistry',
        title: 'Nernst Equation at 298 K',
        formula: 'E = E° - (0.0591 / n) · log₁₀([Red] / [Ox])',
        explanation: 'Predicts electrode potential at non-standard ion concentrations and 25°C.'
      },
      {
        topic: 'Conductivity',
        title: 'Specific Conductivity',
        formula: 'κ = (1/R) · (l/A) = G · G*',
        explanation: 'G = Conductance (1/R), G* = Cell constant (l/A) in cm⁻¹.'
      }
    ],
    questionPapers: [
      { id: 'qp-c-1', year: '2025', term: 'Odd Sem Regular', subjectCode: '1002', title: 'Nov 2025 Chemistry Paper', pages: 3 },
      { id: 'qp-c-2', year: '2024', term: 'Odd Sem Model', subjectCode: '1002', title: 'Model Exam Paper with Answer Key', pages: 5 },
    ]
  },
  {
    code: '1003',
    name: 'Problem Solving and Python Programming (PSPP)',
    shortName: 'PSPP / Python',
    instructor: 'Er. Arun Kumar M. (AI & ML Lab)',
    credits: 4,
    units: [
      {
        unitNumber: 1,
        title: 'Algorithmic Problem Solving',
        topics: ['Algorithms, Flowcharts, Pseudo-code', 'Variables, Expressions, Statements', 'Precedence of operators'],
        isCompleted: true,
      },
      {
        unitNumber: 2,
        title: 'Control Flow & Functions',
        topics: ['Conditionals (if, elif, else)', 'Iteration (while, for, range)', 'Fruitful functions, Return values, Recursion'],
        isCompleted: true,
      },
      {
        unitNumber: 3,
        title: 'Compound Data: Lists, Tuples, Dictionaries',
        topics: ['List slicing, Mutability, List comprehensions', 'Tuples as keys, Dictionary operations', 'Sets and methods'],
        isCompleted: false,
      },
      {
        unitNumber: 4,
        title: 'Files, Modules & Exception Handling',
        topics: ['Reading and writing files', 'Command line arguments', 'try-except-finally blocks', 'Standard libraries (math, os, sys)'],
        isCompleted: false,
      },
    ],
    formulas: [
      {
        topic: 'List Comprehension',
        title: 'Syntax Template',
        formula: '[expression for item in iterable if condition]',
        explanation: 'Compact way to process lists. Example: [x**2 for x in range(10) if x % 2 == 0]'
      },
      {
        topic: 'Dictionary Comprehension',
        title: 'Key-Value Mapping',
        formula: '{k: v for (k, v) in zip(keys, values)}',
        explanation: 'Transforms two parallel lists or data streams into a hash map in O(N) time.'
      },
      {
        topic: 'Binary Search Time Complexity',
        title: 'Logarithmic Performance',
        formula: 'T(N) = O(log₂ N), Space = O(1)',
        explanation: 'Standard divide-and-conquer on sorted lists required in lab practical exam.'
      }
    ],
    questionPapers: [
      { id: 'qp-p-1', year: '2025', term: 'Odd Sem Lab & Theory', subjectCode: '1003', title: 'Dec 2025 Theory & Lab VIVA Questions', pages: 5 },
      { id: 'qp-p-2', year: '2024', term: 'Odd Sem Regular', subjectCode: '1003', title: 'Nov 2024 Question Bank', pages: 4 },
    ]
  },
  {
    code: '1004',
    name: 'Applied Physics',
    shortName: 'Physics',
    instructor: 'Prof. Anitha V.',
    credits: 3,
    units: [
      {
        unitNumber: 1,
        title: 'Wave Optics & Interference',
        topics: ['Huygens principle', "Young's double slit experiment", 'Interference in thin films', "Newton's rings"],
        isCompleted: true,
      },
      {
        unitNumber: 2,
        title: 'Lasers & Fiber Optics',
        topics: ['Spontaneous vs Stimulated emission', 'He-Ne laser & Semiconductor laser', 'Numerical aperture & acceptance angle', 'Optical fiber types'],
        isCompleted: false,
      },
      {
        unitNumber: 3,
        title: 'Ultrasonics & Acoustics',
        topics: ['Piezoelectric generator', 'Magnetostriction oscillator', "Acoustic grating method", "Sabine's formula for reverberation time"],
        isCompleted: false,
      },
      {
        unitNumber: 4,
        title: 'Quantum Physics',
        topics: ["De Broglie hypothesis", "Heisenberg's Uncertainty Principle", "Schrödinger time-independent wave equation", "Particle in a 1D box"],
        isCompleted: false,
      },
    ],
    formulas: [
      {
        topic: 'Fiber Optics',
        title: 'Numerical Aperture (NA)',
        formula: 'NA = sin(θ_a) = √(n₁² - n₂²)',
        explanation: 'n₁ = core refractive index, n₂ = cladding refractive index, θ_a = acceptance angle.'
      },
      {
        topic: 'Acoustics',
        title: "Sabine's Reverberation Formula",
        formula: 'T = (0.161 · V) / A = (0.161 · V) / (Σ aᵢ Sᵢ)',
        explanation: 'V = volume of hall (m³), A = total absorption (OWU or metric sabins).'
      },
      {
        topic: 'Quantum Mechanics',
        title: 'De Broglie Wavelength',
        formula: 'λ = h / p = h / (m · v) = h / √(2 m E)',
        explanation: 'Relates particle momentum p to its wave characteristics.'
      }
    ],
    questionPapers: [
      { id: 'qp-ph-1', year: '2025', term: 'Odd Sem Regular', subjectCode: '1004', title: 'Nov 2025 Physics Board Exam', pages: 4 },
    ]
  }
];

export const LIBRA_PALETTE: LibraBrandColor[] = [
  { name: 'Midnight Navy', hex: '#0F294A', cmyk: '80, 44, 0, 71', role: 'Primary Brand Tone' },
  { name: 'Electric Royal', hex: '#1E3A8A', cmyk: '78, 57, 0, 46', role: 'Interactive & Accents' },
  { name: 'Pure Platinum', hex: '#F8FAFC', cmyk: '2, 1, 0, 1', role: 'Negative Space & Canvas' },
  { name: 'Slate Deep', hex: '#0F172A', cmyk: '64, 44, 0, 84', role: 'Primary Typography' },
  { name: 'Ice Cyan', hex: '#06B6D4', cmyk: '97, 14, 0, 17', role: 'Subtle Highlights (Zero-Red)' },
];

export const LIBRA_REELS: InstagramReelItem[] = [
  {
    id: 'reel-1',
    hook: 'Stop choosing boring black & white. The Luxury Navy formula will transform your personal brand in 5 seconds.',
    concept: 'Quick-cut split screens comparing high-contrast Navy (#0F294A) with Platinum (#F8FAFC) against generic grayscale branding.',
    caption: 'Why high-end architecture and luxury tech studios choose deep midnight navy over flat black.\n\nSave this 3-color palette for your next pitch deck or personal portfolio.\n\nBrand: @libra.studio\nCreative Director: @nijo.media21',
    hashtags: ['#LibraStudio', '#BrandIdentity', '#NavyPalette', '#KeralaDesigners', '#MinimalAesthetics', '#GraphicDesignLife'],
    audioTrack: 'Original Sound - Libra Ambient Luxury Beats (85 BPM)',
    scheduledDate: '2026-11-04',
    status: 'scheduled',
  },
  {
    id: 'reel-2',
    hook: '3 font pairings you are not using yet that scream $10k retainer.',
    concept: 'Pairing Syne Display (Weight 700) with Plus Jakarta Sans (Weight 400). Showing real mobile UI mockups.',
    caption: 'Font pairing is 70% of UI hierarchy. Here is the exact typography stack we built for the Libra identity system.\n\nDrop "STACK" in comments for the full vector template.',
    hashtags: ['#TypographyDesign', '#UIDesign', '#SyneFont', '#DesignInspiration', '#VisualDesigner'],
    audioTrack: 'Atmospheric Lo-Fi Synth by Nijo',
    scheduledDate: '2026-11-07',
    status: 'recorded',
  },
  {
    id: 'reel-3',
    hook: 'How an AI & ML student built a client brand system in 48 hours.',
    concept: 'BTS timelapse showing Python automated image crops, prompt engineering in Midjourney, and vector assembly in Figma.',
    caption: 'Blending algorithmic logic with high-end aesthetic restraint. Poly AI student by day, brand designer by night.',
    hashtags: ['#StudentCreator', '#PolytechnicAI', '#FreelanceDesigner', '#CrossDeviceWorkflow'],
    audioTrack: 'Upbeat Tech Minimalist Groove',
    scheduledDate: '2026-11-10',
    status: 'draft',
  }
];

export const LIBRA_AI_PROMPTS = [
  {
    id: 'prompt-1',
    category: 'Product Mockup',
    title: 'Minimalist Matte Navy Tech Device on White Quartz',
    prompt: 'Ultra-minimalist modern laptop device made of deep midnight navy anodized aluminum, resting on polished white quartz marble slab, soft directional daylight, subtle cyan ambient reflection, strict zero red tones, 8k resolution, architectural photography --ar 16:9 --style raw'
  },
  {
    id: 'prompt-2',
    category: 'Editorial Portrait',
    title: 'High-Fashion Editorial with Architectural Navy Shadows',
    prompt: 'High fashion editorial photography of a modern subject wearing a structured midnight navy blazer, crisp white background, geometric angular daylight shadows, natural skin texture, serene confidence, Leica 50mm f/1.4 aesthetic --ar 4:5 --stylize 150'
  },
  {
    id: 'prompt-3',
    category: 'Abstract Visual',
    title: 'Fluid Glass Ribbons in Deep Ocean Indigo & Ice Blue',
    prompt: 'Abstract 3D render of sweeping translucent glass ribbons, refraction and caustic caustic highlights, navy blue #0F294A core with frosted ice blue edges, white studio backdrop, pristine octane render --ar 1:1 --v 6.1'
  }
];

// Malayalam Panchangam Calendar Engine (Supports fast year jumping up to 2100)
const MALAYALAM_MONTHS = [
  { en: 'Chingam', ml: 'Chingam', days: 31 },
  { en: 'Kanni', ml: 'Kanni', days: 30 },
  { en: 'Thulam', ml: 'Thulam', days: 30 },
  { en: 'Vrischikam', ml: 'Vrischikam', days: 30 },
  { en: 'Dhanu', ml: 'Dhanu', days: 30 },
  { en: 'Makaram', ml: 'Makaram', days: 30 },
  { en: 'Kumbham', ml: 'Kumbham', days: 30 },
  { en: 'Meenam', ml: 'Meenam', days: 30 },
  { en: 'Medam', ml: 'Medam', days: 31 },
  { en: 'Edavam', ml: 'Edavam', days: 31 },
  { en: 'Mithunam', ml: 'Mithunam', days: 32 },
  { en: 'Karkkidakam', ml: 'Karkkidakam', days: 31 },
];

const NAKSHATRAS = [
  'Ashwathi', 'Bharani', 'Karthika', 'Rohini',
  'Makayiram', 'Thiruvathira', 'Punartham', 'Pooyam',
  'Ayilyam', 'Makam', 'Pooram', 'Uthram',
  'Atham', 'Chithira', 'Chothi', 'Visakham',
  'Anizham', 'Thrikketta', 'Moolam', 'Pooradam',
  'Uthradam', 'Thiruvonam', 'Avittam', 'Chathayam',
  'Pooruruttathi', 'Uthrattathi', 'Revathi'
];

const TITHIS = [
  'Shukla Prathama', 'Shukla Dwitheeya', 'Shukla Thritheeya',
  'Shukla Chaturthi', 'Shukla Panchami', 'Shukla Shashti',
  'Shukla Saptami', 'Shukla Ashtami', 'Shukla Navami',
  'Shukla Dashami', 'Shukla Ekadashi', 'Shukla Dwadashi',
  'Shukla Trayodashi', 'Shukla Chaturdashi', 'Pournami',
  'Krishna Prathama', 'Krishna Dwitheeya', 'Krishna Thritheeya',
  'Krishna Chaturthi', 'Krishna Panchami', 'Krishna Shashti',
  'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami',
  'Krishna Dashami', 'Krishna Ekadashi', 'Krishna Dwadashi',
  'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasi'
];

const RAHUKALAM_TABLE: Record<number, string> = {
  0: '04:30 PM - 06:00 PM', // Sunday
  1: '07:30 AM - 09:00 AM', // Monday
  2: '03:00 PM - 04:30 PM', // Tuesday
  3: '12:00 PM - 01:30 PM', // Wednesday
  4: '01:30 PM - 03:00 PM', // Thursday
  5: '10:30 AM - 12:00 PM', // Friday
  6: '09:00 AM - 10:30 AM', // Saturday
};

export function getKeralaPanchangamForDate(dateStr: string): PanchangamInfo {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 to 11
  const day = d.getDate();
  const dayOfWeek = d.getDay();

  // Malayalam Kollam Era calculation: Kollam Era begins in 825 AD (Aug-Sept is Chingam 1).
  // If month is >= August (7), kollamYear = year - 824. Else kollamYear = year - 825.
  const kollamYear = month >= 7 ? year - 824 : year - 825;

  // Approximate Malayalam month index based on day of year
  // Chingam starts ~Aug 17, Kanni ~Sep 17, Thulam ~Oct 17, Vrischikam ~Nov 16, Dhanu ~Dec 16,
  // Makaram ~Jan 15, Kumbham ~Feb 14, Meenam ~Mar 15, Medam ~Apr 14, Edavam ~May 15, Mithunam ~Jun 16, Karkkidakam ~Jul 17
  const startDayOfMonth = [
    { mIndex: 5, startDay: 15 }, // Jan -> Makaram starts ~15
    { mIndex: 6, startDay: 14 }, // Feb -> Kumbham starts ~14
    { mIndex: 7, startDay: 15 }, // Mar -> Meenam starts ~15
    { mIndex: 8, startDay: 14 }, // Apr -> Medam starts ~14 (Vishu)
    { mIndex: 9, startDay: 15 }, // May -> Edavam starts ~15
    { mIndex: 10, startDay: 16 }, // Jun -> Mithunam starts ~16
    { mIndex: 11, startDay: 17 }, // Jul -> Karkkidakam starts ~17
    { mIndex: 0, startDay: 17 }, // Aug -> Chingam starts ~17 (Onam season)
    { mIndex: 1, startDay: 17 }, // Sep -> Kanni starts ~17
    { mIndex: 2, startDay: 17 }, // Oct -> Thulam starts ~17
    { mIndex: 3, startDay: 16 }, // Nov -> Vrischikam starts ~16 (Mandala season)
    { mIndex: 4, startDay: 16 }, // Dec -> Dhanu starts ~16
  ];

  const currentMonthConfig = startDayOfMonth[month];
  let malayalamMonthIndex = currentMonthConfig.mIndex;
  let malayalamDay = day - currentMonthConfig.startDay + 1;

  if (malayalamDay <= 0) {
    // Previous Malayalam month
    malayalamMonthIndex = (currentMonthConfig.mIndex - 1 + 12) % 12;
    malayalamDay = 30 + malayalamDay;
  }

  const mlMonthObj = MALAYALAM_MONTHS[malayalamMonthIndex];

  // Algorithmic Nakshatra & Tithi based on day offset
  const dayOfYear = Math.floor((d.getTime() - new Date(year, 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const nakshatraIndex = Math.abs((year * 365 + dayOfYear + 7) % NAKSHATRAS.length);
  const tithiIndex = Math.abs((year * 365 + dayOfYear + 3) % TITHIS.length);

  // Check major Kerala festivals
  let festival: string | undefined;
  if (malayalamMonthIndex === 0 && malayalamDay >= 8 && malayalamDay <= 12) {
    festival = 'Thiruvonam / Onam Celebrations';
  } else if (malayalamMonthIndex === 8 && malayalamDay === 1) {
    festival = 'Vishu Kani & Meda Sankramam';
  } else if (malayalamMonthIndex === 3 && malayalamDay === 1) {
    festival = 'Mandala Kalam Begins';
  } else if (malayalamMonthIndex === 4 && malayalamDay === 28) {
    festival = 'Makaravilakku';
  } else if (malayalamMonthIndex === 6 && (malayalamDay === 14 || tithiIndex === 28)) {
    festival = 'Maha Shivaratri';
  } else if (tithiIndex === 14) {
    festival = 'Full Moon / Pournami';
  } else if (tithiIndex === 29) {
    festival = 'New Moon / Amavasi';
  }

  return {
    date: dateStr,
    malayalamDate: `Kollam Year ${kollamYear} ${mlMonthObj.en} ${malayalamDay}`,
    kollamYear,
    malayalamMonth: mlMonthObj.en,
    malayalamDay,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    tithi: TITHIS[tithiIndex],
    festival,
    rahukalam: RAHUKALAM_TABLE[dayOfWeek] || '12:00 PM - 01:30 PM',
    auspiciousTime: '06:15 AM - 07:30 AM (Auspicious Window)',
  };
}
