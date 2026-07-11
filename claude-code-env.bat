@echo off
title Ollama Emulator + Claude Code
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo  Ollama Emulator + Claude Code Launcher
echo  v1.0.2 - Copyright (c) 2024-2026 Rhasan@dev
echo ============================================
echo.
echo  Features: Free models, RAG knowledge base,
echo  usage analytics, persistent memory, local auth.
echo.

if "%OLLAMA_EMU_API_KEY%"=="" (
  echo [!] OLLAMA_EMU_API_KEY is not set.
  echo.
  echo  Get a free API key from https://openrouter.ai/keys
  echo.
  echo  Then run:
  echo    set OLLAMA_EMU_API_KEY=sk-or-v1-your-key-here
  echo    %~nx0
  echo.
  pause
  exit /b 1
)

set OLLAMA_EMU_PROVIDER=openrouter
set ANTHROPIC_BASE_URL=http://localhost:11434
set ANTHROPIC_API_KEY=sk-local
set ANTHROPIC_MODEL=openrouter/auto

echo [1/2] Starting Ollama Emulator on http://localhost:11434 ...
start "OllamaEmu" /B python ollama_emu_desktop.py
timeout /t 5 >nul

echo [2/2] Launching Claude Code (model: %ANTHROPIC_MODEL%)...
echo   Endpoint: %ANTHROPIC_BASE_URL%
echo   Model: %ANTHROPIC_MODEL% ($0 free tier via OpenRouter)
echo.
echo   Monitor usage at http://localhost:11434/usage
echo.
claude

echo.
echo Claude Code exited. Stopping emulator...
taskkill /FI "WINDOWTITLE eq OllamaEmu" >nul 2>&1
echo Done.
pause
