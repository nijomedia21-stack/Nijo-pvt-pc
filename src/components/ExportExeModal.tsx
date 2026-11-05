import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Download, 
  Check, 
  Copy, 
  Laptop, 
  Package, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  Zap,
  FolderOpen,
  Code2
} from 'lucide-react';

interface ExportExeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostAddress?: string;
}

export const ExportExeModal: React.FC<ExportExeModalProps> = ({
  isOpen,
  onClose,
  hostAddress = 'http://192.168.1.2:4000'
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'electron' | 'pwa'>('instant');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2200);
  };

  // Helper to trigger browser download of dynamic text file
  const triggerDownload = (fileName: string, content: string, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // 1. One-click Batch file to build NIJO PVT PC.exe via Windows 11 csc.exe
  const batBuilderScript = `@echo off
setlocal enabledelayedexpansion

title NIJO PVT PC - Windows .exe Builder
color 0b

echo =====================================================================
echo              NIJO PVT PC - Windows Executable (.exe) Builder
echo =====================================================================
echo.
echo [1/3] Locating built-in Windows C# compiler (csc.exe)...

set "CSC_PATH="
if exist "%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe" (
    set "CSC_PATH=%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"
) else if exist "%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe" (
    set "CSC_PATH=%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"
)

if "%CSC_PATH%"=="" (
    echo [ERROR] Windows .NET Framework C# compiler was not found!
    pause
    exit /b 1
)

echo [OK] Compiler located at: "%CSC_PATH%"
echo.

echo [2/3] Writing self-contained C# 5 launcher source code...
set "TEMP_CS=%TEMP%\\NijoPvtPcSource_%RANDOM%.cs"
set "OUT_EXE=%USERPROFILE%\\Desktop\\NIJO PVT PC.exe"

(
echo using System;
echo using System.Diagnostics;
echo using System.IO;
echo using System.Windows.Forms;
echo namespace NijoPvtPc {
echo   static class Program {
echo     [STAThread]
echo     static void Main^(string[] args^) {
echo       Application.EnableVisualStyles^(^);
echo       Application.SetCompatibleTextRenderingDefault^(false^);
echo       string appUrl = "${window.location.origin}";
echo       string edge = Path.Combine^(Environment.GetFolderPath^(Environment.SpecialFolder.ProgramFilesX86^), @"Microsoft\\Edge\\Application\\msedge.exe"^);
echo       if ^(!File.Exists^(edge^)^) edge = Path.Combine^(Environment.GetFolderPath^(Environment.SpecialFolder.ProgramFiles^), @"Microsoft\\Edge\\Application\\msedge.exe"^);
echo       string profile = Path.Combine^(Environment.GetFolderPath^(Environment.SpecialFolder.LocalApplicationData^), "NijoPvtPcProfile"^);
echo       if ^(File.Exists^(edge^)^) {
echo         ProcessStartInfo psi = new ProcessStartInfo^(^);
echo         psi.FileName = edge;
echo         psi.Arguments = "--app=\\"" + appUrl + "\\" --user-data-dir=\\"" + profile + "\\" --window-size=1366,850";
echo         psi.UseShellExecute = false;
echo         Process.Start^(psi^);
echo         return;
echo       }
echo       Process.Start^(new ProcessStartInfo^(appUrl^) { UseShellExecute = true }^);
echo     }
echo   }
echo }
) > "%TEMP_CS%"

echo [3/3] Compiling "%OUT_EXE%"...
"%CSC_PATH%" /nologo /target:winexe /out:"%OUT_EXE%" "%TEMP_CS%" System.Windows.Forms.dll System.Drawing.dll
if exist "%TEMP_CS%" del "%TEMP_CS%"

if not exist "%OUT_EXE%" (
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo   SUCCESS! "NIJO PVT PC.exe" has been created on your Desktop!
echo   Location: %OUT_EXE%
echo =====================================================================
echo.
pause
`;

  // 2. Direct standalone Windows CMD launcher
  const cmdLauncherScript = `@echo off
title NIJO PVT PC
start "" msedge.exe --app="${window.location.origin}" --window-size=1366,850 --user-data-dir="%LOCALAPPDATA%\\NijoPvtPcProfile"
exit
`;

  // 3. Electron Windows packager script
  const electronBuildBat = `@echo off
title NIJO PVT PC - Electron Packager
color 0b
echo =====================================================================
echo           Packaging "NIJO PVT PC.exe" with Electron
echo =====================================================================
echo.
echo [1/3] Installing electron and electron-builder...
call npm install electron electron-builder --save-dev

echo.
echo [2/3] Building web bundle...
call npm run build

echo.
echo [3/3] Generating NIJO PVT PC.exe (Portable + Installer)...
call npx electron-builder --win portable --win nsis

echo.
echo =====================================================================
echo   DONE! Check the "dist-electron" folder:
echo   - dist-electron\\NIJO PVT PC.exe (Portable standalone)
echo   - dist-electron\\NIJO PVT PC Setup.exe (Installer)
echo =====================================================================
pause
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Convert into "NIJO PVT PC .exe"
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Windows 11 / 10
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate a standalone desktop executable file for your laptop
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-slate-900 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex items-center gap-1.5 pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'instant'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Instant .exe Builder (Windows 11 Native)</span>
          </button>

          <button
            onClick={() => setActiveTab('electron')}
            className={`flex items-center gap-1.5 pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'electron'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>📦 Full Electron Standalone .exe</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-1.5 pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>📱 Edge / Chrome App Window</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200">
          
          {/* TAB 1: Instant Windows 11 Native .exe */}
          {activeTab === 'instant' && (
            <div className="space-y-5">
              {/* Smart App Control Notice */}
              <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-200">Got "Smart App Control blocked a file"?</p>
                  <p className="text-slate-300 leading-relaxed">
                    Windows 11 Smart App Control automatically blocks unsigned <code className="text-amber-300 font-mono">.bat</code> or <code className="text-amber-300 font-mono">.exe</code> files downloaded from the web.
                  </p>
                  <p className="text-slate-300 leading-relaxed pt-1">
                    <strong className="text-white">Quick Fix 1 (Instant):</strong> Right-click the downloaded file &gt; select <strong className="text-white">Properties</strong> &gt; at the bottom check <strong className="text-amber-300">☑ Unblock</strong> &gt; click <strong className="text-white">OK</strong>.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-white">Quick Fix 2 (100% Microsoft-Signed):</strong> Use the <strong className="text-cyan-300">Edge / Chrome App Window</strong> tab — it is digitally signed by Microsoft Corporation so Smart App Control never blocks it!
                  </p>
                </div>
              </div>

              <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-white">Zero Extra Installs Required</p>
                  <p className="text-slate-300 leading-relaxed">
                    Windows 11 includes Microsoft's built-in C# compiler (<code className="text-cyan-300 font-mono">csc.exe</code>). 
                    You can compile an actual standalone <strong className="text-white">NIJO PVT PC.exe</strong> right on your laptop in 3 seconds!
                  </p>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1-Click Builder */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                        Option 1 (Recommended)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                        Instant
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">One-Click .exe Compiler Script</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Downloads <code className="text-slate-300 font-mono">build-nijo-exe.bat</code>. Double-click it on your laptop and it generates <strong>NIJO PVT PC.exe</strong> and a desktop shortcut immediately.
                    </p>
                  </div>

                  <button
                    onClick={() => triggerDownload('build-nijo-pvt-pc-exe.bat', batBuilderScript, 'application/x-bat')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>⬇️ Download build-nijo-exe.bat</span>
                  </button>
                </div>

                {/* Direct App Launcher */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                        Option 2
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        Portable
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">Direct Windows App Launcher</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Downloads <code className="text-slate-300 font-mono">NIJO PVT PC.cmd</code>. Runs NIJO PVT PC in a dedicated native window without browser address bars or tabs.
                    </p>
                  </div>

                  <button
                    onClick={() => triggerDownload('NIJO PVT PC.cmd', cmdLauncherScript, 'application/x-bat')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>⬇️ Download NIJO PVT PC.cmd</span>
                  </button>
                </div>
              </div>

              {/* Direct 1-Line Self-Contained Command (No Missing Files) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Copy &amp; Paste into PowerShell or Terminal (Creates .exe on Desktop instantly):
                  </span>
                  <button
                    onClick={() => handleCopy(
                      `powershell -Command "$s=\\"using System;using System.Diagnostics;using System.IO;using System.Windows.Forms;namespace N{static class P{[STAThread]static void Main(){Application.EnableVisualStyles();string u='${window.location.origin}';string e=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),@'Microsoft\\Edge\\Application\\msedge.exe');if(!File.Exists(e))e=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),@'Microsoft\\Edge\\Application\\msedge.exe');string p=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),'NijoPvtPcProfile');if(File.Exists(e)){Process.Start(new ProcessStartInfo{FileName=e,Arguments='--app=\\"'+u+'\\" --user-data-dir=\\"'+p+'\\" --window-size=1366,850'});return;}Process.Start(new ProcessStartInfo(u){UseShellExecute=true});}}}\\\";$f=\\"$env:TEMP\\NijoLauncher.cs\\";[System.IO.File]::WriteAllText($f,$s);$c=\\"$env:SystemRoot\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe\\";if(-not(Test-Path $c)){$c=\\"$env:SystemRoot\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe\\"};$o=\\"$env:USERPROFILE\\Desktop\\NIJO PVT PC.exe\\";& $c /nologo /target:winexe /out:$o $f System.Windows.Forms.dll System.Drawing.dll;Remove-Item $f -Force;Write-Host 'SUCCESS! NIJO PVT PC.exe created on your Desktop!' -ForegroundColor Green"`,
                      'cmd'
                    )}
                    className="flex items-center gap-1 text-[11px] bg-cyan-700 hover:bg-cyan-600 text-white font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedText === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'cmd' ? 'Copied!' : 'Copy 1-Line Command'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-cyan-300 p-3 bg-slate-900/90 rounded-lg overflow-x-auto select-all leading-relaxed whitespace-pre-wrap break-all">
                  {`powershell -Command "$s=\\"using System;using System.Diagnostics;using System.IO;using System.Windows.Forms;namespace N{static class P{[STAThread]static void Main(){Application.EnableVisualStyles();string u='${window.location.origin}';string e=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),@'Microsoft\\Edge\\Application\\msedge.exe');if(!File.Exists(e))e=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),@'Microsoft\\Edge\\Application\\msedge.exe');string p=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),'NijoPvtPcProfile');if(File.Exists(e)){Process.Start(new ProcessStartInfo{FileName=e,Arguments='--app=\\"'+u+'\\" --user-data-dir=\\"'+p+'\\" --window-size=1366,850'});return;}Process.Start(new ProcessStartInfo(u){UseShellExecute=true});}}}\\\";$f=\\"$env:TEMP\\NijoLauncher.cs\\";[System.IO.File]::WriteAllText($f,$s);$c=\\"$env:SystemRoot\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe\\";if(-not(Test-Path $c)){$c=\\"$env:SystemRoot\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe\\"};$o=\\"$env:USERPROFILE\\Desktop\\NIJO PVT PC.exe\\";& $c /nologo /target:winexe /out:$o $f System.Windows.Forms.dll System.Drawing.dll;Remove-Item $f -Force;Write-Host 'SUCCESS! NIJO PVT PC.exe created on your Desktop!' -ForegroundColor Green"`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  This command writes the launcher code directly to temporary memory and compiles <strong className="text-white">NIJO PVT PC.exe</strong> to your Desktop without needing any source files pre-downloaded.
                </p>
              </div>

              {/* 100% Smart App Control Safe: Create Desktop Shortcut (.lnk) */}
              <div className="bg-slate-950 border border-emerald-900/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    100% Smart App Control Safe: Create Desktop Shortcut (.lnk)
                  </span>
                  <button
                    onClick={() => handleCopy(
                      `powershell -Command "$ws=New-Object -ComObject WScript.Shell;$s=$ws.CreateShortcut(\\"$env:USERPROFILE\\Desktop\\NIJO PVT PC.lnk\\");$s.TargetPath=\\"msedge.exe\\";$s.Arguments=\\"--app=${window.location.origin} --user-data-dir=\\\`\"$env:LOCALAPPDATA\\NijoPvtPcProfile\\\`\"\\";$s.Description=\\"NIJO PVT PC Hub\\";$s.Save();Write-Host 'SUCCESS! Desktop App Shortcut Created on your Desktop!' -ForegroundColor Green"`,
                      'lnk'
                    )}
                    className="flex items-center gap-1 text-[11px] bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedText === 'lnk' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'lnk' ? 'Copied!' : 'Copy Shortcut Command'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 p-3 bg-slate-900/90 rounded-lg overflow-x-auto select-all leading-relaxed whitespace-pre-wrap break-all">
                  {`powershell -Command "$ws=New-Object -ComObject WScript.Shell;$s=$ws.CreateShortcut(\\"$env:USERPROFILE\\Desktop\\NIJO PVT PC.lnk\\");$s.TargetPath=\\"msedge.exe\\";$s.Arguments=\\"--app=${window.location.origin} --user-data-dir=\\\`\"$env:LOCALAPPDATA\\NijoPvtPcProfile\\\`\"\\";$s.Description=\\"NIJO PVT PC Hub\\";$s.Save();Write-Host 'SUCCESS! Desktop App Shortcut Created on your Desktop!' -ForegroundColor Green"`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  Windows Shortcuts (<code className="text-emerald-300 font-mono">.lnk</code>) are never blocked by Smart App Control because they launch through Microsoft's signed application runtime.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Full Electron Standalone .exe */}
          {activeTab === 'electron' && (
            <div className="space-y-5">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Full Electron Desktop Package</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Packages the complete Node.js hub server, system tray icon, and offline storage into an official Windows executable installer.
                    </p>
                  </div>
                  <button
                    onClick={() => triggerDownload('package-electron-win.bat', electronBuildBat, 'application/x-bat')}
                    className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-900/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download package-electron.bat</span>
                  </button>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-blue-900/50 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0">1</span>
                    <div className="space-y-1">
                      <strong className="text-white">Pre-configured Electron Configuration Files:</strong>
                      <p className="text-slate-400">
                        <code className="text-cyan-300 font-mono">electron/main.cjs</code> and <code className="text-cyan-300 font-mono">electron/preload.cjs</code> are already created and configured with the port 4000 hub server and system tray.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-blue-900/50 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0">2</span>
                    <div className="space-y-1 flex-1">
                      <strong className="text-white">One-Command Build:</strong>
                      <div className="mt-1 flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-cyan-300">
                        <code>npm run build:exe</code>
                        <button
                          onClick={() => handleCopy('npm run build:exe', 'npm')}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded cursor-pointer"
                        >
                          {copiedText === 'npm' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-blue-900/50 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0">3</span>
                    <div className="space-y-1">
                      <strong className="text-white">Generated Windows Output Files:</strong>
                      <ul className="text-slate-400 space-y-1 list-disc list-inside font-mono text-[11px]">
                        <li><span className="text-emerald-400 font-bold">dist-electron/NIJO PVT PC.exe</span> (Single portable executable)</li>
                        <li><span className="text-cyan-300">dist-electron/NIJO PVT PC Setup.exe</span> (Full Windows 11 installer)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Edge / Chrome App Window */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Instant Windows Desktop App via Microsoft Edge</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  On Windows 11, Microsoft Edge lets you run NIJO PVT PC as an installed desktop app with its own taskbar icon and independent window:
                </p>

                <ol className="space-y-2.5 text-xs text-slate-300 pt-1">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-900/50 text-cyan-300 flex items-center justify-center font-bold text-[11px]">1</span>
                    <span>Click the <strong>Menu (⋯)</strong> in Microsoft Edge (top-right).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-900/50 text-cyan-300 flex items-center justify-center font-bold text-[11px]">2</span>
                    <span>Select <strong>Apps &gt; Install this site as an app</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-900/50 text-cyan-300 flex items-center justify-center font-bold text-[11px]">3</span>
                    <span>Name it <strong className="text-white font-mono">NIJO PVT PC</strong> and check <strong>"Pin to taskbar"</strong> and <strong>"Create Desktop shortcut"</strong>.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Target Platform: Windows 11 Laptop (x64)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportExeModal;
