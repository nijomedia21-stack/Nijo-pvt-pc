import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Wifi, 
  Laptop, 
  Smartphone, 
  Tv, 
  X, 
  LogOut, 
  Check, 
  HelpCircle,
  Info,
  Lock,
  Globe,
  Download
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityPin: string;
  onUpdateSecurityPin: (newPin: string) => void;
  devices: ConnectedDevice[];
  onSignOut: () => void;
  onOpenExportExe?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  securityPin,
  onUpdateSecurityPin,
  devices,
  onSignOut,
  onOpenExportExe,
}) => {
  const [pinInput, setPinInput] = useState<string>(securityPin);
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);
  const [testPinInput, setTestPinInput] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length === 4 && /^\d+$/.test(pinInput)) {
      onUpdateSecurityPin(pinInput);
      setPinSuccessMsg('4-Digit Security PIN successfully updated!');
      setTimeout(() => setPinSuccessMsg(null), 3000);
    }
  };

  const handleVerifyTestPin = () => {
    if (testPinInput === securityPin) {
      setTestResult('Verified: PIN Accepted. Transfers and Vault Authorized.');
    } else {
      setTestResult('Error: Incorrect PIN. Verification Failed.');
    }
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F294A] text-white p-4 flex items-center justify-between border-b border-[#1E3A8A]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1E3A8A] text-cyan-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                NIJO PVT PC — System & Security Settings
              </h3>
              <p className="text-[10px] text-slate-300">
                Cross-device sync preferences and security PIN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* User Account Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F294A] text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-400/20">
                N
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Nijo
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  nijo.media21@gmail.com
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                  <span>Polytechnic AI & ML</span>
                  <span>·</span>
                  <span>Libra Studio SMM</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-600" />
              <span>Lock / Sign Out</span>
            </button>
          </div>

          {/* 4-digit Security Transfer PIN Configuration */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Key className="w-4 h-4 text-[#1E3A8A]" />
                <span>4-Digit Security Transfer PIN</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                Current: {securityPin}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Required for authorising private file transfers, vault access, and QuickShare permissions between Windows 11 PC, Android Phone, and Living Room TV.
            </p>

            <form onSubmit={handleSavePin} className="flex items-center gap-2">
              <input
                type="password"
                maxLength={4}
                placeholder="New 4-digit PIN (e.g. 8492)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-36 px-3 py-1.5 font-mono text-center text-sm font-bold tracking-widest bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
              <button
                type="submit"
                disabled={pinInput.length !== 4}
                className="px-4 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                Update PIN
              </button>
            </form>

            {pinSuccessMsg && (
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{pinSuccessMsg}</span>
              </div>
            )}

            {/* Test PIN verification */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
              <input
                type="password"
                maxLength={4}
                placeholder="Test PIN..."
                value={testPinInput}
                onChange={(e) => setTestPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-24 px-2 py-1 text-center font-mono text-xs border border-slate-300 rounded-md bg-white"
              />
              <button
                type="button"
                onClick={handleVerifyTestPin}
                className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-medium"
              >
                Verify Challenge
              </button>
              {testResult && (
                <span className={`text-[11px] font-medium ${
                  testResult.includes('Verified') ? 'text-emerald-700' : 'text-slate-800 font-bold'
                }`}>
                  {testResult}
                </span>
              )}
            </div>
          </div>

          {/* Local Mesh Network Information */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Wifi className="w-4 h-4 text-[#1E3A8A]" />
              <span>Mesh Device Topology</span>
            </div>
            <div className="space-y-1.5 pt-1">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    {d.id === 'laptop' && <Laptop className="w-3.5 h-3.5 text-[#0F294A]" />}
                    {d.id === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-[#0F294A]" />}
                    {d.id === 'tv' && <Tv className="w-3.5 h-3.5 text-[#0F294A]" />}
                    <span className="font-semibold text-slate-800">{d.name}</span>
                  </div>
                  <span className="font-mono text-slate-500">{d.ip} ({d.status})</span>
                </div>
              ))}
            </div>
          </div>

          {/* NIJO PVT PC .exe Export Option */}
          {onOpenExportExe && (
            <div className="p-3 bg-cyan-50/80 rounded-xl border border-cyan-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F294A] text-cyan-300 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Convert to "NIJO PVT PC .exe"</p>
                  <p className="text-[11px] text-slate-600">Export native Windows 11 executable builder & launcher</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenExportExe();
                }}
                className="px-3 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
              >
                Get .exe
              </button>
            </div>
          )}

          {/* App Build Version & Compliance */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>NIJO PVT PC Desktop Edition</span>
              <span className="font-mono text-cyan-700">v2.4.0 (Windows 11 Build)</span>
            </div>
            <p>
              Strict Zero-Red Rule enforced · Kerala Malayalam Panchangam Engine (2024–2100) · Real-time Gemini Copilot Integration.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
