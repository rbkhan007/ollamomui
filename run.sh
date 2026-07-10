#!/bin/bash
# Ollama Emulator Desktop Ultimate - One-click launcher
# Auto-starts: Backend + Frontend + Database
set -e

echo "============================================"
echo "  Ollama Emulator Desktop Ultimate v0.6.0"
echo "  Auto-start: Backend + Frontend + Database"
echo "  Copyright (c) 2024-2026 Rhasan@dev"
echo "============================================"
echo

# Auto-install Python dependencies
echo "[>] Installing Python dependencies..."
pip3 install -r requirements.txt -q 2>/dev/null
echo "[>] Dependencies ready."

# Build frontend if Node.js is available and build is missing
if command -v npm &> /dev/null; then
    if [ ! -f "frontend/out/index.html" ]; then
        echo "[>] Building frontend..."
        cd frontend
        npm install --silent 2>/dev/null
        npm run build 2>&1
        cd ..
        if [ -f "frontend/out/index.html" ]; then
            echo "[>] Frontend built successfully."
        else
            echo "[!] Frontend build may have failed."
        fi
    else
        echo "[>] Frontend already built."
    fi
else
    echo "[!] Node.js not found. Install Node.js to build the dashboard."
fi

# Start backend server
echo
echo -e "\033[92m  Starting server on http://localhost:11434\033[0m"
echo -e "\033[92m  Press Ctrl+C to stop\033[0m"
echo

python3 ollama_emu_desktop.py
