@echo off
title OllamoMUI — Build EXE
chcp 65001 >nul
cd /d "%~dp0\..\.."

echo ============================================
echo  Building OllamoMUI Desktop EXE
echo  v1.0.4 - Copyright (c) 2024-2026 Rhasan@dev
echo ============================================
echo.

:: Check for --desktop flag (builds the QML desktop app)
if /i "%1"=="--desktop" goto build_desktop
if /i "%1"=="-d" goto build_desktop

:build_server
echo  Mode: Backend Server (headless)
echo.
call :ensure_frontend
if %errorlevel% neq 0 exit /b 1

echo [2/5] Installing build dependencies...
pip install pyinstaller -q 2>nul
echo [OK]

echo [3/5] Cleaning...
if exist "dist\OllamaEmu" rmdir /s /q "dist\OllamaEmu"
if exist "build\OllamaEmu" rmdir /s /q "build\OllamaEmu"
echo [OK]

echo [4/5] Building executable...
python -m PyInstaller --onefile --console ^
    --name "OllamoMUI" ^
    --add-data "frontend\out;frontend\out" ^
    --add-data "backend\src\ollama_emu;ollama_emu" ^
    --hidden-import numpy ^
    --collect-data numpy ^
    --hidden-import psycopg2 ^
    --hidden-import psycopg2._psycopg ^
    --hidden-import psycopg2.extensions ^
    --hidden-import psycopg2.pool ^
    --hidden-import psycopg2.extras ^
    --hidden-import psycopg2.errors ^
    --collect-submodules psycopg2 ^
    --hidden-import pgvector ^
    --hidden-import pgvector.psycopg2 ^
    --collect-submodules pgvector ^
    --hidden-import dotenv ^
    --collect-data dotenv ^
    --hidden-import python_multipart ^
    --hidden-import multipart ^
    --hidden-import uvicorn.workers ^
    --hidden-import uvicorn.logging ^
    --distpath "dist" ^
    --workpath "build" ^
    --specpath "." ^
    --clean ^
    --icon "resources\brand-mark.ico" ^
    backend\src\ollama_emu\main.py 2>&1

if %errorlevel% neq 0 (
    echo [FAIL] PyInstaller build failed!
    pause
    exit /b 1
)
echo [OK]
goto finalize

:build_desktop
echo  Mode: Desktop App (PySide6 + QML)
echo.
call :ensure_frontend
if %errorlevel% neq 0 exit /b 1

echo [2/5] Installing build dependencies...
pip install pyinstaller pyside6 -q 2>nul
if %errorlevel% neq 0 (
    echo [FAIL] Failed to install PySide6. Make sure Qt is available.
    pause
    exit /b 1
)
echo [OK]

echo [3/5] Cleaning...
if exist "dist\OllamaEmuDesktop" rmdir /s /q "dist\OllamaEmuDesktop"
if exist "dist\OllamaEmuDesktop.exe" del "dist\OllamaEmuDesktop.exe"
if exist "build\OllamaEmuDesktop" rmdir /s /q "build\OllamaEmuDesktop"
echo [OK]

echo [4/5] Building desktop executable...
python desktop\build.py --skip-frontend 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Desktop build failed!
    pause
    exit /b 1
)
echo [OK]

:finalize
echo [5/5] Finalizing...
copy docs\README.md dist\README.md 2>nul
copy configs\.env.example dist\.env.example 2>nul
echo [OK]

echo.
echo ============================================
echo  Build complete!
if /i "%1"=="--desktop" (
    echo  Executable: dist\OllamaEmuDesktop.exe
    echo  Includes: QML GUI + Backend + Frontend
) else (
    echo  Executable: dist\OllamaEmu.exe
    echo  Includes: Backend Server + Frontend
)
echo ============================================
echo.
pause
exit /b 0

:ensure_frontend
echo [1/5] Building frontend...
pushd frontend
set "NEXT_PUBLIC_BASE_PATH="
set "NEXT_PUBLIC_SITE_URL="
call npm install --silent 2>nul
call npm run build 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Frontend build failed!
    popd
    exit /b 1
)
popd
echo [OK]
exit /b 0
