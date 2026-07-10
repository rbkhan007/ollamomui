@echo off
title Ollama Emulator Desktop - Build EXE
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo  Building Ollama Emulator Desktop EXE
echo  v0.6.0 - Copyright (c) 2024-2026 Rhasan@dev
echo ============================================
echo.

:: Ensure frontend is built
echo [1/5] Building frontend...
pushd frontend
call npm install --silent 2>nul
call npm run build 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Frontend build failed!
    pause
    exit /b 1
)
popd
echo [OK] Frontend built.

:: Install Python build deps
echo [2/5] Installing build dependencies...
pip install pyinstaller -q 2>nul
echo [OK] Dependencies installed.

:: Clean previous builds
echo [3/5] Cleaning previous builds...
if exist "dist\OllamaEmu" rmdir /s /q "dist\OllamaEmu"
if exist "build\OllamaEmu" rmdir /s /q "build\OllamaEmu"
echo [OK] Cleaned.

:: Build EXE
echo [4/5] Building executable (this may take a while)...
python -m PyInstaller --onefile --console ^
    --name "OllamaEmu" ^
    --add-data "frontend\out;frontend\out" ^
    --add-data "rag.py;." ^
    --add-data "memory.py;." ^
    --add-data "README.md;." ^
    --hidden-import numpy ^
    --collect-data numpy ^
    --hidden-import python_multipart ^
    --hidden-import multipart ^
    --hidden-import uvicorn.workers ^
    --hidden-import uvicorn.logging ^
    --distpath "dist" ^
    --workpath "build" ^
    --specpath "." ^
    --clean ^
    ollama_emu_desktop.py 2>&1

if %errorlevel% neq 0 (
    echo [FAIL] PyInstaller build failed!
    pause
    exit /b 1
)
echo [OK] Executable built.

:: Copy docs
echo [5/5] Finalizing...
copy README.md dist\README.md 2>nul
copy .env.example dist\.env.example 2>nul
copy opencode.example.json dist\opencode.example.json 2>nul
echo [OK] Done!

echo.
echo ============================================
echo  Build complete!
echo  Executable: dist\OllamaEmu.exe
echo  Includes: Frontend dashboard, RAG, Memory
echo ============================================
echo.
echo  To run: dist\OllamaEmu.exe
echo  Then open http://localhost:11434
echo  Configure your API key in Settings ^> Login
echo.
pause
