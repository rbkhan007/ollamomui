#!/bin/bash
# OllamaEmu Desktop Ultimate - One-click launcher
# Starts: Backend + Frontend + Database (all in one)
set -e

echo ""
echo "  ============================================"
echo "   OllamaEmu Desktop Ultimate v1.0.2"
echo "   Backend + Frontend + Database — all in one"
echo "   Copyright (c) 2024-2026 Rhasan@dev"
echo "  ============================================"
echo ""

# ── Python dependencies ──────────────────────────────
echo "  [1/4] Installing Python dependencies..."
pip3 install -r requirements.txt -q 2>/dev/null
echo "        Done."
echo ""

# ── Load .env if present ─────────────────────────────
if [ -f ".env" ]; then
    echo "  [>] Loading .env..."
    set -a
    source .env
    set +a
fi

# ── Build frontend (only if missing or stale) ────────
if command -v npm &> /dev/null; then
    echo "  [2/4] Checking frontend build..."
    if [ ! -f "frontend/out/index.html" ]; then
        echo "        Building frontend (first run)..."
        cd frontend
        NEXT_PUBLIC_BASE_PATH="" NEXT_PUBLIC_SITE_URL="" NEXT_PUBLIC_FREETIER_DOMAIN="" npm run build 2>&1
        cd ..
        if [ -f "frontend/out/index.html" ]; then
            echo "        Frontend built successfully."
        else
            echo "  [!] Frontend build failed. The server will run without the GUI."
        fi
    elif grep -q "Ollama-Emulator-Desktop-Ultimate" frontend/out/index.html 2>/dev/null; then
        echo "        Rebuilding frontend (wrong basePath detected)..."
        rm -rf frontend/out
        cd frontend
        NEXT_PUBLIC_BASE_PATH="" NEXT_PUBLIC_SITE_URL="" NEXT_PUBLIC_FREETIER_DOMAIN="" npm run build 2>&1
        cd ..
        echo "        Frontend rebuilt for local use."
    else
        echo "        Frontend already built correctly."
    fi
else
    echo "  [2/4] Node.js not found — skipping frontend build."
    echo "         Install Node.js 18+ to build the dashboard."
    echo "         The server will still run but without the GUI."
fi
echo ""

# ── Start server ─────────────────────────────────────
echo "  [3/4] Database engine ready (SQLite, auto-created)."
echo ""
echo "  [4/4] Starting server..."
echo ""
echo "  ┌──────────────────────────────────────────┐"
echo "  │  Open in browser:                         │"
echo "  │  http://localhost:11434                    │"
echo "  │                                            │"
echo "  │  API endpoint:                            │"
echo "  │  http://localhost:11434/v1/chat/completions│"
echo "  │                                            │"
echo "  │  Press Ctrl+C to stop                      │"
echo "  └──────────────────────────────────────────┘"
echo ""

python3 ollama_emu_desktop.py
