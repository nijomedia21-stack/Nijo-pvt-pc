@echo off
setlocal enabledelayedexpansion

title NIJO PVT PC - Windows .exe Builder
color 0b

echo =====================================================================
echo              NIJO PVT PC - Windows Executable (.exe) Builder
echo =====================================================================
echo.
echo [1/4] Locating built-in Windows C# compiler (csc.exe)...

set "CSC_PATH="
if exist "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
    set "CSC_PATH=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
) else if exist "%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe" (
    set "CSC_PATH=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

if "%CSC_PATH%"=="" (
    echo [ERROR] Windows .NET Framework C# compiler was not found!
    echo Please install Microsoft .NET Framework 4.8 or Node.js to package.
    pause
    exit /b 1
)

echo [OK] Compiler located at: "%CSC_PATH%"
echo.

echo [2/4] Generating embedded C# 5 application source...
set "TEMP_CS=%TEMP%\NijoPvtPcSource_%RANDOM%.cs"
set "OUT_EXE=%USERPROFILE%\Desktop\NIJO PVT PC.exe"

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
echo       string appUrl = "https://ais-dev-5gq2466pxljt37hijjvpr6-771692029145.asia-southeast1.run.app";
echo       if ^(args.Length ^> 0 ^&^& !string.IsNullOrEmpty^(args[0]^)^) appUrl = args[0];
echo       string edge = Path.Combine^(Environment.GetFolderPath^(Environment.SpecialFolder.ProgramFilesX86^), @"Microsoft\Edge\Application\msedge.exe"^);
echo       if ^(!File.Exists^(edge^)^) edge = Path.Combine^(Environment.GetFolderPath^(Environment.SpecialFolder.ProgramFiles^), @"Microsoft\Edge\Application\msedge.exe"^);
echo       string profile = Path.Combine^(Environment.GetFolderPath^(Environment.SpecialFolder.LocalApplicationData^), "NijoPvtPcProfile"^);
echo       if ^(File.Exists^(edge^)^) {
echo         ProcessStartInfo psi = new ProcessStartInfo^(^);
echo         psi.FileName = edge;
echo         psi.Arguments = "--app=\"" + appUrl + "\" --user-data-dir=\"" + profile + "\" --window-size=1366,850";
echo         psi.UseShellExecute = false;
echo         Process.Start^(psi^);
echo         return;
echo       }
echo       Process.Start^(new ProcessStartInfo^(appUrl^) { UseShellExecute = true }^);
echo     }
echo   }
echo }
) > "%TEMP_CS%"

echo [OK] Source code prepared in temporary storage.
echo.

echo [3/4] Compiling "%OUT_EXE%"...
"%CSC_PATH%" /nologo /target:winexe /out:"%OUT_EXE%" "%TEMP_CS%" System.Windows.Forms.dll System.Drawing.dll

set "BUILD_STATUS=%ERRORLEVEL%"
if exist "%TEMP_CS%" del "%TEMP_CS%"

if not exist "%OUT_EXE%" (
    echo [ERROR] Compilation failed with error code: %BUILD_STATUS%
    pause
    exit /b 1
)

echo.
echo [4/4] Verifying generated executable...
echo [OK] Executable created successfully!
echo.
echo =====================================================================
echo   SUCCESS! "NIJO PVT PC.exe" has been created directly on your Desktop!
echo   
echo   Location: %OUT_EXE%
echo   
echo   You can now double-click "NIJO PVT PC.exe" on your Desktop to run.
echo =====================================================================
echo.
pause
