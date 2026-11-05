import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function copilotApiPlugin(): Plugin {
  return {
    name: 'copilot-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/copilot', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const data = JSON.parse(body || '{}');
            const { message, context, mode, language } = data;
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              // Return helpful domain response if API key is not configured
              res.statusCode = 200;
              res.end(JSON.stringify({
                text: getFallbackResponse(message, mode, language),
                model: 'offline-smart-assistant'
              }));
              return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const systemPrompt = `You are "Nijo Copilot", the private desktop AI copilot embedded in NIJO PVT PC (Windows 11 Edition).
Target User: Nijo (nijo.media21@gmail.com), a Kerala Polytechnic AI & ML Diploma student (Semester 1) and freelance graphic designer/SMM manager for client brand "Libra".
Current Active Workspace Mode: ${mode === 'study' ? 'Polytechnic AI & ML Study Mode (Sem 1: Maths I, Applied Chemistry, PSPP/Python, Applied Physics)' : 'Freelance Designer & SMM Studio (Client: Libra luxury minimalism, Instagram Reels, palettes, copywriting)'}.
Context summary: ${JSON.stringify(context || {})}
Language instruction: Respond in English, but you may naturally mix Malayalam words or phrases when discussing Kerala Panchangam, dates, or greetings if appropriate. Always keep answers concise, practical, well-formatted, and strictly adhere to Nijo's Polytechnic syllabus and Libra brand standards.
Strict Rule: No red color references or red emoji indicators.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
              ]
            });

            const replyText = response.text || 'Copilot could not generate a response.';
            res.statusCode = 200;
            res.end(JSON.stringify({ text: replyText, model: 'gemini-3.8-flash' }));
          } catch (err: unknown) {
            console.error('Copilot API error:', err);
            const data = JSON.parse(body || '{}');
            res.statusCode = 200;
            res.end(JSON.stringify({
              text: getFallbackResponse(data.message || '', data.mode || 'study', data.language || 'en'),
              model: 'local-copilot-fallback'
            }));
          }
        });
      });
    }
  };
}

function getFallbackResponse(query: string, mode: string, _language?: string): string {
  const q = (query || '').toLowerCase();
  if (q.includes('math') || q.includes('formula') || q.includes('calculus')) {
    return `### 📐 Mathematics I (Semester 1 Polytechnic AI & ML)
1. **Euler's Theorem for Homogeneous Functions**:
   If $u = f(x, y)$ is homogeneous of degree $n$, then:
   $$x \\frac{\\partial u}{\\partial x} + y \\frac{\\partial u}{\\partial y} = n \\cdot u$$

2. **Characteristic Equation of Matrix $A$**:
   $$|A - \\lambda I| = 0 \\implies \\lambda^3 - S_1 \\lambda^2 + S_2 \\lambda - |A| = 0$$
   - $S_1$ = Sum of principal diagonal elements
   - $S_2$ = Sum of minors of principal diagonal elements

3. **Standard Derivatives**:
   - $\\frac{d}{dx}(\\sin^{-1} x) = \\frac{1}{\\sqrt{1 - x^2}}$
   - $\\frac{d}{dx}(\\tan^{-1} x) = \\frac{1}{1 + x^2}$

*Ready to test sample problems or calculate matrix eigenvalues?*`;
  }

  if (q.includes('chem') || q.includes('water') || q.includes('polymer')) {
    return `### 🧪 Applied Chemistry (Semester 1)
- **Hardness of Water (EDTA Titration)**:
  Total Hardness = $\\frac{V_1 \\times S \\times 1000}{\\text{Volume of Sample}} \\text{ ppm}$
  Buffer: $NH_4Cl + NH_4OH$ (pH 10), Indicator: Eriochrome Black T (Wine red to Steel blue).
- **Polymers**: Thermoplastics (linear, recyclable, e.g. Polythene, PVC) vs Thermosetting (cross-linked, non-recyclable, e.g. Bakelite, Epoxy).
- **Nanotechnology**: Materials with dimensions between 1 to 100 nm exhibiting quantum confinement effects.`;
  }

  if (q.includes('calendar') || q.includes('panchangam') || q.includes('tithi') || q.includes('kerala')) {
    return `### 📅 Kerala Malayalam Panchangam
- **Kollam Era**: 1202 ME
- **Auspicious Nakshatras**: രോഹിണി, തിരുവാതിര, പുണർതം, മകം, അത്തം.
- **Rahukalam Rule (Kerala)**:
  - Sunday: 4:30 PM - 6:00 PM
  - Monday: 7:30 AM - 9:00 AM
  - Tuesday: 3:00 PM - 4:30 PM
  - Wednesday: 12:00 PM - 1:30 PM
  - Thursday: 1:30 PM - 3:00 PM
  - Friday: 10:30 AM - 12:00 PM
  - Saturday: 9:00 AM - 10:30 AM`;
  }

  if (q.includes('libra') || q.includes('smm') || q.includes('reels') || q.includes('design')) {
    return `### ✨ Libra Client SMM & Design Strategy
- **Brand Palette**: Midnight Navy (\`#0F294A\`), Royal Blue (\`#1E3A8A\`), Platinum White (\`#F8FAFC\`), Charcoal (\`#0F172A\`). Strict Zero-Red elegance.
- **Next Reel Hook**:
  *"Stop styling luxury neutrals like it's 2023. Here is the 3-second Navy & Platinum contrast rule."*
- **Hashtags**: #LibraStudio #MinimalAesthetics #NavyLuxury #VisualIdentity #KeralaDesigners`;
  }

  if (q.includes('countdown') || q.includes('exam')) {
    return `### ⏳ Polytechnic Semester 1 Board Exam Countdown
- **Subject 1**: Mathematics I — Nov 24, 2026 (09:30 AM)
- **Subject 2**: Applied Physics — Nov 27, 2026 (09:30 AM)
- **Subject 3**: Applied Chemistry — Dec 01, 2026 (09:30 AM)
- **Subject 4**: PSPP (Python) Theory & Lab — Dec 04, 2026 (09:30 AM)
*Tip: Focus on Unit 2 Calculus and Unit 3 Matrices today!*`;
  }

  if (mode === 'study') {
    return `👋 നമസ്കാരം Nijo! I am your AI Copilot for Semester 1 Polytechnic AI & ML.
I can help you with:
- Maths I formulas, step-by-step calculus, matrix diagonalizations
- Applied Chemistry reactions, EDTA water hardness formulas
- Python PSPP algorithmic code snippets & debugging
- Exam schedules and study task priorities.
What subject shall we conquer right now?`;
  }

  return `👋 Hello Nijo! I'm your Copilot for the **Libra Design Studio**.
I'm ready to assist with:
- Crafting high-converting Instagram Reels hooks & scripts
- Curating Navy & Platinum color palettes (Strict Zero-Red)
- Generating prompt engineering recipes for Midjourney & Flux
- Managing client review deadlines and cross-device exports.`;
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), copilotApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
