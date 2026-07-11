@echo off
title OllamaEmu — Desktop Ultimate
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ============================================
echo   OllamaEmu Desktop Ultimate v1.0.2
echo   Backend + Frontend + Database — all in one
echo   Copyright (c) 2024-2026 Rhasan@dev
echo  ============================================
echo.

:: ── Python dependencies ──────────────────────────────
echo  [1/4] Installing Python dependencies...
pip install -r requirements.txt -q 2>nul
if %errorlevel% neq 0 (
    echo  [!] pip install failed. Make sure Python 3.11+ is on PATH.
    pause
    exit /b 1
)
echo        Done.
echo.

:: ── Build frontend (only if missing or stale) ────────
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo  [2/4] Checking frontend build...
    if not exist "frontend\out\index.html" (
        echo        Building frontend (first run)...
        pushd frontend
        set "NEXT_PUBLIC_BASE_PATH="
        set "NEXT_PUBLIC_SITE_URL="
        set "NEXT_PUBLIC_FREETIER_DOMAIN="
        call npm install --silent 2>nul
        call npm run build 2>&1
        popd
        if exist "frontend\out\index.html" (
            echo        Frontend built successfully.
        ) else (
            echo  [!] Frontend build failed. The server will run without the GUI.
        )
    ) else (
        :: Force rebuild if built with wrong basePath
        findstr /C:"Ollama-Emulator-Desktop-Ultimate" "frontend\out\index.html" >nul 2>&1
        if %errorlevel% equ 0 (
            echo        Rebuilding frontend (wrong basePath detected)...
            rmdir /s /q "frontend\out" 2>nul
            pushd frontend
            set "NEXT_PUBLIC_BASE_PATH="
            set "NEXT_PUBLIC_SITE_URL="
            set "NEXT_PUBLIC_FREETIER_DOMAIN="
            call npm install --silent 2>nul
            call npm run build 2>&1
            popd
            echo        Frontend rebuilt for local use.
        ) else (
            echo        Frontend already built correctly.
        )
    )
) else (
    echo  [2/4] Node.js not found — skipping frontend build.
    echo         Install Node.js 18+ to build the dashboard.
    echo         The server will still run but without the GUI.
)
echo.

:: ── Start server ─────────────────────────────────────
echo  [3/4] Database engine ready (SQLite, auto-created).
echo.
echo  [4/4] Starting server...
echo.
echo  ┌──────────────────────────────────────────┐
echo  │  Open in browser:                         │
echo  │  http://localhost:11434                    │
echo  │                                            │
echo  │  API endpoint:                            │
echo  │  http://localhost:11434/v1/chat/completions│
echo  │                                            │
echo  │  Press Ctrl+C to stop                      │
echo  └──────────────────────────────────────────┘
echo.

python ollama_emu_desktop.py
if %errorlevel% neq 0 (
    echo.
    echo  [!] Server exited with an error.
    pause
)
