@echo off
setlocal

title NIJO PVT PC - Electron .exe Packager
color 0b

echo =====================================================================
echo           NIJO PVT PC - Electron Standalone .exe Packager
echo =====================================================================
echo.
echo [1/4] Checking Node.js and npm...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js is installed.
echo.

echo [2/4] Installing packaging tools (electron, electron-builder)...
call npm install electron electron-builder --save-dev

echo.
echo [3/4] Building production web assets (npm run build)...
call npm run build

echo.
echo [4/4] Packaging "NIJO PVT PC.exe" (Portable + Installer)...
call npx electron-builder --win portable --win nsis

echo.
echo =====================================================================
echo   DONE! "NIJO PVT PC.exe" has been created!
echo   Check the "dist-electron" directory:
echo   - dist-electron\NIJO PVT PC.exe (Portable Standalone Executable)
echo   - dist-electron\NIJO PVT PC Setup.exe (Windows 11 Installer)
echo =====================================================================
echo.
pause
