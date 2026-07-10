@echo off
title Ollama Emulator Desktop Ultimate
chcp 65001 >nul
cd /d "%~dp0"

echo [95m============================================[0m
echo [95m  Ollama Emulator Desktop Ultimate v0.6.0[0m
echo [95m  Auto-start: Backend + Frontend + Database[0m
echo [95m  Copyright (c) 2024-2026 Rhasan@dev[0m
echo [95m============================================[0m
echo.

:: Auto-install Python dependencies
echo [^>] Installing Python dependencies...
pip install -r requirements.txt -q 2>nul
echo [^>] Dependencies ready.

:: Auto-start SQLite databases (they are created on first access)
echo [^>] Database engine ready.

:: Build frontend if Node.js is available and build is missing
where npm >nul 2>&1
if %errorlevel% equ 0 (
    if not exist "frontend\out\index.html" (
        echo [^>] Building frontend...
        pushd frontend
        call npm install --silent 2>nul
        call npm run build 2>&1
        popd
        if exist "frontend\out\index.html" (
            echo [^>] Frontend built successfully.
        ) else (
            echo [!] Frontend build may have failed. Check errors above.
        )
    ) else (
        echo [^>] Frontend already built.
    )
) else (
    echo [!] Node.js not found. Install Node.js to build the dashboard frontend.
    echo [!] The server will still run but without the GUI.
)

:: Start backend server
echo.
echo [92m  Starting server on http://localhost:11434[0m
echo [92m  Press Ctrl+C to stop[0m
echo.

python ollama_emu_desktop.py
pause
