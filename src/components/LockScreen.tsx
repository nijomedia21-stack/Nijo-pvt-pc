import React, { useState } from 'react';
import { ShieldCheck, KeyRound, ArrowRight, Check, Laptop } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
  securityPin: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  securityPin,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPinMode, setIsPinMode] = useState<boolean>(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === securityPin) {
      onUnlock();
    } else {
      setErrorMsg('Incorrect 4-digit PIN. Please try again.');
      setPin('');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleGoogleSignIn = () => {
    // Authenticate as Nijo
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1C33] text-white select-none">
      {/* Background Ambient Glow (Navy and Cyan, Strictly Zero-Red) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#1E3A8A] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-700 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center p-8 bg-[#0F294A]/80 backdrop-blur-xl rounded-3xl border border-[#1E3A8A] shadow-2xl">
        {/* Ultra-minimal </> Logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A] border border-cyan-400/40 flex items-center justify-center shadow-lg mb-4">
          <span className="font-mono font-bold text-2xl text-cyan-300 tracking-tighter">
            &lt;/&gt;
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-white tracking-wider">
          NIJO PVT <span className="text-cyan-300 font-semibold">PC</span>
        </h1>
        <p className="text-xs text-slate-300 mt-1 mb-6">
          Private Multi-Surface Workspace · Windows 11 Edition
        </p>

        {!isPinMode ? (
          /* Ultra-minimal Login Screen with "Sign in with Google" */
          <div className="w-full space-y-3">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-semibold text-xs shadow-md transition-all transform active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#1E3A8A"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Quick Profile Tag */}
            <div className="text-[11px] text-slate-300 font-mono pt-1">
              nijo.media21@gmail.com
            </div>

            {/* Switch to PIN Unlock */}
            <button
              onClick={() => setIsPinMode(true)}
              className="text-xs text-cyan-300 hover:text-cyan-200 transition-colors pt-2 block mx-auto underline cursor-pointer"
            >
              Or unlock with 4-digit PIN ({securityPin})
            </button>
          </div>
        ) : (
          /* 4-Digit PIN Unlock Form */
          <form onSubmit={handlePinSubmit} className="w-full space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
              <span>Enter Security PIN</span>
            </div>

            <input
              type="password"
              autoFocus
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full py-2.5 px-4 font-mono text-center text-xl font-bold tracking-widest bg-[#16365F] border border-[#1E3A8A] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-500"
            />

            {errorMsg && (
              <p className="text-[11px] text-slate-200 bg-slate-800/80 p-1.5 rounded border border-slate-700">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPinMode(false)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors pt-1 block mx-auto"
            >
              Back to Google Sign-In
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-white/10 w-full flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Laptop className="w-3 h-3 text-cyan-400" />
            <span>Windows 11 Companion</span>
          </div>
          <span className="font-mono">Local Mesh Ready</span>
        </div>
      </div>
    </div>
  );
};
