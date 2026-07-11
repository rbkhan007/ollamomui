# 🦄 OllamaEmu — The Ultimate Free-LLM Desktop Router

<p align="center">
  <img src="https://raw.githubusercontent.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/main/logo.svg" alt="OllamaEmu" width="320" />
</p>

<p align="center">
  <a href="https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/releases/latest"><img src="https://img.shields.io/github/v/release/rbkhan007/Ollama-Emulator-Desktop-Ultimate?color=2da44e&label=release&style=flat-square" alt="Release" /></a>
  <img src="https://img.shields.io/github/downloads/rbkhan007/Ollama-Emulator-Desktop-Ultimate/total?style=flat-square" alt="Downloads" />
  <img src="https://img.shields.io/github/license/rbkhan007/Ollama-Emulator-Desktop-Ultimate?style=flat-square" alt="License" />
  <img src="https://img.shields.io/npm/v/@rbkhan007/ollama-emulator-desktop-ultimate?color=blue&style=flat-square" alt="npm" />
  <img src="https://img.shields.io/badge/python-3.11%2B-blue?style=flat-square" alt="Python" />
  <a href="https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/stargazers"><img src="https://img.shields.io/github/stars/rbkhan007/Ollama-Emulator-Desktop-Ultimate?style=social" alt="Stars" /></a>
</p>

<p align="center">
  <b>Stop paying $20/mo for Claude & ChatGPT. Turn <i>any</i> free API key into a local Ollama / OpenAI / Anthropic-compatible server.</b>
</p>

**OllamaEmu** (repo: `Ollama-Emulator-Desktop-Ultimate`) runs a *fake* Ollama server on your machine that silently routes to **real, 100% FREE LLMs** — OpenRouter, OpenAI, Anthropic, Gemini, DeepSeek, Groq, Mistral, Together — and gives you RAG, persistent memory, usage analytics, and a polished dashboard.

> 🔌 Works with **Claude Code**, **OpenCode**, **Cursor**, **Continue.dev**, and every Ollama-compatible AI coding tool — all on a single port (`localhost:11434`).

<p align="center">
  <img src="https://raw.githubusercontent.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/main/Rhasan%40dev.png" alt="Developed by Rhasan@dev" width="220" />
</p>

---

## 🚀 Why OllamaEmu?

- 💸 **$0 forever free tier** — 10+ free models (Gemini Flash, DeepSeek, Llama, Qwen, Phi-4…) through OpenRouter.
- 🧩 **Drop-in replacement** — speak Ollama `/api/*`, OpenAI `/v1/*`, *and* Anthropic `/v1/messages` from one box.
- 🖥️ **One executable** — `run.bat` / `run.sh` and you're live on `http://localhost:11434`.
- 🧠 **Built-in brains** — RAG knowledge base (FTS5 + TF-IDF) and auto-saving memory, all local.
- 📊 **Analytics** — real-time token tracking, resonance, accuracy, hourly activity.
- 🔒 **Private by design** — your keys & docs never leave your machine; SSRF-protected, hashed auth.

If this saves you a subscription, ⭐ **[star the repo](https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate)** and tell a friend. Virality is the only price.

---

## ⚡ Quick Start

```bash
# Windows
run.bat

# macOS / Linux
bash run.sh
```

Opens `http://localhost:11434` automatically. Add your API key in **Settings** and pick a free model. Done.

---

## 📥 Download & Install

| Option | What you get | Link |
|--------|--------------|------|
| **Windows EXE** | Single-file `OllamaEmu.exe` (embedded frontend, no install) | [📦 Releases → `software.exe`](https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/releases/latest) |
| **From source** | `run.bat` / `run.sh` | clone + run (see below) |
| **npm (GitHub Packages)** | `@rbkhan007/ollama-emulator-desktop-ultimate` | see [Install from GitHub Packages](#-install-from-github-packages) |

> 🌐 **Free Tier gateway** — the hosted zero-setup experience lives at **`https://ollamaemu.pages.dev`** (a free Cloudflare Pages domain — deploy the landing pages there, or change `FREETIER_DOMAIN` in [`frontend/src/lib/config.ts`](https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/blob/main/frontend/src/lib/config.ts) to your own).
>
> 💡 Running the app? Visit the in-app **landing page** at **`http://localhost:11434/landing`** — it surfaces the repo, the download, and the Free Tier link.

---

## 📦 Install from GitHub Packages

The project is also published to GitHub Packages as an npm package:

```bash
# 1. Point the @rbkhan007 scope at GitHub Packages (project .npmrc already does this)
@rbkhan007:registry=https://npm.pkg.github.com

# 2. Authenticate with a GitHub token that has read:packages
npm login --scope=@rbkhan007 --auth-type=legacy --registry=https://npm.pkg.github.com

# 3. Install
npm install @rbkhan007/ollama-emulator-desktop-ultimate
```

> Requires a GitHub personal access token (classic) with the `read:packages` scope.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Ollama-compatible API** | `/api/tags`, `/api/chat`, `/api/generate`, `/api/show` — drop-in replacement |
| **OpenAI-compatible proxy** | `/v1/models`, `/v1/chat/completions`, `/v1/completions` |
| **Anthropic-compatible proxy** | `/v1/messages` — works with Claude Code via `ANTHROPIC_BASE_URL` |
| **Multi-provider routing** | OpenAI, Anthropic, Gemini, Groq, DeepSeek, OpenRouter, Mistral, Together |
| **$0 Free Tier** | 10+ free models through OpenRouter (Gemini Flash, DeepSeek, Llama, Qwen, Phi-4, etc.) |
| **RAG Knowledge Base** | Upload docs, paste text, FTS5 + TF-IDF search |
| **Persistent Memory** | Auto-saves conversations, facts, sessions to SQLite |
| **Usage Analytics** | Real-time token tracking, resonance, accuracy, hourly activity |
| **Local Auth System** | Email/password login, all data stored locally |
| **Theme Support** | Dark/light mode with system preference detection |
| **SPA Dashboard** | 10 pages: Home, Playground, Usage, Settings, RAG, Memory, Login, Register, Setup, Knowledge |

---

## 🏗️ Architecture

<p align="center">
  <img src="https://raw.githubusercontent.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/main/architecture.svg" alt="OllamaEmu architecture" width="780" />
</p>

---

## 🖧 Server Layout

<p align="center">
  <img src="https://raw.githubusercontent.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/main/server-layout.svg" alt="OllamaEmu server layout" width="780" />
</p>

---

## 🔌 API Endpoints

### Ollama-compatible
| Route | Method | Description |
|-------|--------|-------------|
| `/api/tags` | GET | List available models |
| `/api/chat` | POST | Streaming chat completion |
| `/api/generate` | POST | Text generation |
| `/api/show` | GET | Model details |
| `/api/version` | GET | Server version |

### OpenAI-compatible
| Route | Method | Description |
|-------|--------|-------------|
| `/v1/models` | GET | List models |
| `/v1/chat/completions` | POST | Chat completion |
| `/v1/completions` | POST | Text completion |

### Anthropic-compatible
| Route | Method | Description |
|-------|--------|-------------|
| `/v1/messages` | POST | Messages API (streaming) |

### RAG (Knowledge Base)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/rag/stats` | GET | Collection statistics |
| `/api/rag/documents` | GET | List documents |
| `/api/rag/collections` | GET | List collections |
| `/api/rag/upload` | POST | Upload file for indexing |
| `/api/rag/add-text` | POST | Add plain text |
| `/api/rag/search` | POST | Semantic search |
| `/api/rag/context` | GET | Build RAG context |
| `/api/rag/documents/{id}` | DELETE | Remove document |

### Memory
| Route | Method | Description |
|-------|--------|-------------|
| `/api/memory/stats` | GET | Memory statistics |
| `/api/memory/messages` | GET | Conversation messages |
| `/api/memory/facts` | GET/POST | Stored facts |
| `/api/memory/facts/{id}` | DELETE | Remove fact |
| `/api/memory/search` | POST | Search memory |
| `/api/memory/sessions` | GET | List sessions |
| `/api/memory/clear` | POST | Clear memory |

### Usage & Config
| Route | Method | Description |
|-------|--------|-------------|
| `/api/usage/stats` | GET | Real-time usage analytics |
| `/api/status` | GET | Server status |
| `/api/providers` | GET | List provider configs |
| `/api/providers/list` | GET | Detailed provider list |
| `/api/providers/add` | POST | Add custom provider |
| `/api/providers/{name}` | DELETE | Remove provider |
| `/api/config` | POST | Save active provider config |

---

## 🤖 Using with AI Coding Tools

### Claude Code
```bash
# Set your OpenRouter API key
set OLLAMA_EMU_API_KEY=sk-or-v1-your-key-here

# Point Claude to the emulator
set ANTHROPIC_BASE_URL=http://localhost:11434
set ANTHROPIC_API_KEY=sk-local

# Run Claude with a free model
ANTHROPIC_MODEL=openrouter/auto claude
```

### OpenCode
```json
{
  "provider": {
    "emu": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama Emulator",
      "options": {
        "baseURL": "http://localhost:11434/v1",
        "apiKey": "sk-local"
      },
      "models": {
        "openrouter/auto": { "name": "OpenRouter Auto (best free)" }
      }
    }
  }
}
```

### Cursor / Continue.dev
```
OpenAI-compatible endpoint:
  Base URL: http://localhost:11434/v1
  API Key:  sk-local
```

---

## 🔒 Security

- **All data is local** — credentials, keys, and documents never leave your machine
- **Password hashing** — PBKDF2-HMAC-SHA256 with a per-user random salt, stored in a local SQLite database (`auth.db`)
- **Input validation** — provider URLs are scheme-checked and blocked from resolving to private/loopback/metadata addresses (SSRF protection), with path sanitization and size limits on all inputs
- **Secure-by-default binding** — the server binds to `127.0.0.1` and uses a restricted CORS policy; use `--host 0.0.0.0` to opt into LAN exposure (opens CORS to all origins)
- **Error masking** — internal paths and stack traces never exposed to clients
- **File upload safety** — random temp filenames, extension sanitization, 10MB limit

---

## ⚙️ Configuration

### Environment Variables
| Variable | Description |
|----------|-------------|
| `OLLAMA_EMU_API_KEY` | Pre-set API key on startup |
| `OLLAMA_EMU_PROVIDER` | Active provider name (default: `openrouter`) |

### Provider DB
Provider configs are persisted in `providers.db` (SQLite). On first run, defaults for 8 providers are seeded automatically. Add custom providers through the Settings page.

---

## 🛠️ Building

### Standalone EXE (Windows)
```bash
build_exe.bat
```
Produces `dist/OllamaEmu.exe` — a single-file executable with embedded frontend.

### Requirements

- **Python 3.11+** (the backend uses `datetime.UTC`, introduced in 3.11)
- Node.js 18+ (for the frontend build)

### Manual Development
```bash
# Backend
pip install -r requirements.txt
python ollama_emu_desktop.py

# Frontend (separate dev server)
cd frontend
npm install
npm run dev    # http://localhost:3000
```
The dev frontend proxies to the backend on port 11434.

### Deploy the public site (free, on GitHub)

The merged homepage + About + comparison pages are pure static and deploy free to **GitHub Pages** straight from this repo (no backend needed for the marketing pages). The dynamic app pages (`/playground`, `/settings`, `/rag`, `/memory`, `/usage`) call the local API and need the EXE running.

**GitHub Pages (zero-config, free):**
1. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` — the [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) workflow builds `frontend/out` (with `GITHUB_PAGES=true` so assets use the `/Ollama-Emulator-Desktop-Ultimate` base path) and publishes it.
3. Live at `https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate`.
4. (Optional) add a **custom domain** in Settings → Pages; then set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_FREETIER_DOMAIN` to it in the workflow env.

**Cloudflare Pages (alternative, free custom domain):**
1. Cloudflare Pages → **Create a project** → connect the repo.
2. Build command: `cd frontend && npm install && npm run build` · Output: `frontend/out` · Node 18+.
3. Live at `https://<project>.pages.dev`; add a custom domain in the dashboard.

SEO is built in: `sitemap.xml`, `robots.txt`, canonical URL, OpenGraph + Twitter cards, and JSON-LD (`SoftwareApplication`) are generated into `frontend/out`. Submit `https://<your-domain>/sitemap.xml` in Google Search Console and Bing Webmaster Tools to get indexed and surface on trending/AI-overview results.

---

## 📁 Project Structure

```
├── ollama_emu_desktop.py    # Main server (FastAPI, 1400+ lines)
├── rag.py                   # RAG engine (FTS5 + TF-IDF)
├── memory.py                # Memory system (SQLite + auto-flush)
├── providers.db             # Provider configurations
├── rag.db / memory.db       # RAG & memory databases
├── requirements.txt         # Python dependencies
├── run.bat / run.sh         # One-click launchers
├── build_exe.bat            # PyInstaller build script
├── claude-code-env.bat/.sh  # Turnkey Claude Code launchers
├── opencode.example.json    # OpenCode configuration example
├── .env.example             # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (7 pages)
│   │   ├── components/      # Navbar, Icons, Background
│   │   └── lib/             # api, AuthContext, ThemeContext
│   ├── next.config.ts       # Static export config
│   └── package.json
└── README.md
```

---

## 📱 Mobile (Android / iOS)

A **React Native (Expo)** app (`mobile/`) is the phone client. It connects to the
desktop/server running `ollama_emu_desktop.py` (same Wi-Fi) and proxies chats to
the configured LLM provider. On first launch the app prompts for the server URL
(e.g. `http://192.168.1.50:11434`).

Run it instantly with **Expo Go** (scan the QR from `npx expo start`) — no build
needed — or produce a standalone APK/AAB with `eas build -p android`.

```bash
cd mobile
npm install
npx expo start        # scan the QR with the Expo Go app on your phone
```

Full instructions, the API contract, and EAS build steps: see **[MOBILE.md](https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/blob/main/MOBILE.md)**.

---

## 📜 License

Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.
