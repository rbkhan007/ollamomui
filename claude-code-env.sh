#!/bin/bash
# === Ollama Emulator + Claude Code turnkey launcher ===
# v1.0.2 - Copyright (c) 2024-2026 Rhasan@dev
set -e

echo "============================================"
echo " Ollama Emulator + Claude Code Launcher"
echo " v1.0.2 - Copyright (c) 2024-2026 Rhasan@dev"
echo "============================================"
echo
echo " Features: \$0 free models, RAG knowledge base,"
echo " usage analytics, persistent memory, local auth."
echo

if [ -z "$OLLAMA_EMU_API_KEY" ]; then
  echo "[!] OLLAMA_EMU_API_KEY is not set."
  echo
  echo " Get a free API key from https://openrouter.ai/keys"
  echo
  echo " Then run:"
  echo "   export OLLAMA_EMU_API_KEY=sk-or-v1-your-key-here"
  echo "   $0"
  echo
  exit 1
fi

export OLLAMA_EMU_PROVIDER=openrouter
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_API_KEY=sk-local
export ANTHROPIC_MODEL=openrouter/auto

echo "[1/2] Starting Ollama Emulator on http://localhost:11434 ..."
python3 ollama_emu_desktop.py &
EMU_PID=$!
sleep 5

echo "[2/2] Launching Claude Code (model: $ANTHROPIC_MODEL)..."
echo "  Endpoint: $ANTHROPIC_BASE_URL"
echo "  Model: $ANTHROPIC_MODEL (\$0 free tier via OpenRouter)"
echo
echo "  Monitor usage at http://localhost:11434/usage"
echo
claude

echo
echo "Claude Code exited. Stopping emulator (pid $EMU_PID)..."
kill $EMU_PID 2>/dev/null || true
echo "Done."
