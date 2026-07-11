# OllamaEmu — Stop Paying $20/mo for Claude & ChatGPT

<p align="center">
  <img src="https://raw.githubusercontent.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/main/logo.svg" alt="OllamaEmu" width="320" />
</p>

<p align="center">
  <b>Stop paying $20/mo for Claude & ChatGPT. Get 26 free models on one port.</b>
</p>

<p align="center">
  <a href="https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/releases/latest"><img src="https://img.shields.io/github/v/release/rbkhan007/Ollama-Emulator-Desktop-Ultimate?color=2da44e&label=release&style=flat-square" alt="Release" /></a>
  <img src="https://img.shields.io/github/downloads/rbkhan007/Ollama-Emulator-Desktop-Ultimate/total?style=flat-square" alt="Downloads" />
  <img src="https://img.shields.io/github/license/rbkhan007/Ollama-Emulator-Desktop-Ultimate?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/python-3.11%2B-blue?style=flat-square" alt="Python" />
  <img src="https://img.shields.io/badge/100%25-FOSS-green?style=flat-square" alt="FOSS" />
  <a href="https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/stargazers"><img src="https://img.shields.io/github/stars/rbkhan007/Ollama-Emulator-Desktop-Ultimate?style=social" alt="Stars" /></a>
</p>

---

## Why Are You Still Paying $20/mo?

| Service | Monthly Cost | Annual Cost | Models Included |
|---------|-------------|-------------|-----------------|
| ChatGPT Plus | $20 | $240 | GPT-4o only |
| Claude Pro | $20 | $240 | Claude 3.5 Sonnet only |
| Cursor Pro | $20 | $240 | Limited GPT-4 requests |
| GitHub Copilot | $10-19 | $120-228 | Limited to VS Code |
| **OllamaEmu** | **$0** | **$0** | **26 free models** |

## Cost Comparison

```mermaid
xychart-beta
    title "Annual Cost: Paid Subscriptions vs OllamaEmu"
    x-axis ["ChatGPT Plus", "Claude Pro", "Cursor Pro", "Copilot", "OllamaEmu"]
    y-axis "Cost (USD)" 0 --> 280
    bar [240, 240, 240, 228, 0]
```

**OllamaEmu: $0/year.** Same quality. Full privacy. No limits.

---

## Free Models You Get (26 Free Models via OpenRouter)

| Rank | Model | Provider | Size | Best For |
|------|-------|----------|------|----------|
| 1 | **Qwen3 Coder** | Alibaba | 480B A35B | Code generation, complex tasks |
| 2 | **OpenAI GPT-OSS** | OpenAI | 120B | General purpose, reasoning |
| 3 | **NVIDIA Nemotron 3 Ultra** | NVIDIA | 550B A55B | High-quality reasoning |
| 4 | **NVIDIA Nemotron 3 Super** | NVIDIA | 120B A12B | Fast, capable |
| 5 | **Nous Hermes 3** | Nous Research | 405B | Creative, roleplay |
| 6 | **Meta Llama 3.3** | Meta | 70B | General purpose |
| 7 | **Qwen3 Next 80B** | Alibaba | 80B A3B | Fast inference |
| 8 | **Google Gemma 4** | Google | 31B | General chat, code |
| 9 | **Tencent Hy3** | Tencent | - | Multilingual |
| 10 | **Venice Uncensored** | CognitiveComputations | 24B | Uncensored chat |

**All 100% free through OpenRouter's free tier.** No credit card. No limits. No catches.
Live model list: [openrouter.ai/models?supported_parameters=tools](https://openrouter.ai/models?supported_parameters=tools)

---

## How It Works

```mermaid
flowchart LR
    subgraph Tools["Your AI Coding Tools"]
        CC[Claude Code]
        CU[Cursor]
        OC[OpenCode]
        CD[Continue.dev]
    end

    subgraph YourPC["Your PC"]
        OE["OllamaEmu<br/>localhost:11434"]
        RAG["RAG Engine"]
        MEM["Memory System"]
        USAGE["Usage Analytics"]
    end

    subgraph FreeCloud["Free Cloud LLMs (26 Models)"]
        OR["OpenRouter Free Tier"]
    end

    subgraph TopModels["Top Free Models"]
        QW["Qwen3 Coder 480B"]
        OA["GPT-OSS 120B"]
        NN["Nemotron Ultra 550B"]
        NH["Hermes 3 405B"]
        LL["Llama 3.3 70B"]
        GM["Gemma 4 31B"]
    end

    CC --> OE
    CU --> OE
    OC --> OE
    CD --> OE
    OE --> RAG
    OE --> MEM
    OE --> USAGE
    OE --> OR
    OR --> QW
    OR --> OA
    OR --> NN
    OR --> NH
    OR --> LL
    OR --> GM
```

**OllamaEmu** pretends to be Ollama (`localhost:11434`) but routes your prompts to **free cloud LLMs**. Your coding tools (Claude Code, Cursor, OpenCode) don't know the difference — they think they're talking to a local model, but you're getting cloud-quality responses for free.

---

## Quick Start

### Option 1: Download the EXE (Windows)
```bash
# Download OllamaEmu.exe from:
# https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/releases/latest

# Double-click to run
OllamaEmu.exe
```

### Option 2: Download the APK (Android)
```bash
# Download OllamaEmu.apk from the same release
# Install on your phone, connect to your PC's IP
```

### Option 3: Run from Source
```bash
git clone https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate.git
cd Ollama-Emulator-Desktop-Ultimate

# Windows
run.bat

# macOS / Linux
bash run.sh
```

Opens `http://localhost:11434` automatically. Add your API key in **Settings** and pick a free model. Done.

---

## Download & Install

| Platform | What You Get | Link |
|----------|-------------|------|
| **Windows EXE** | Single-file `OllamaEmu.exe` (embedded dashboard, no install) | [Download](https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/releases/latest) |
| **Android APK** | Branded app with 8 screens (Chat, RAG, Memory, Providers, Usage, Settings, About) | [Download](https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/releases/latest) |
| **From Source** | `run.bat` / `run.sh` | [Clone & Run](#quick-start) |
| **npm** | `@rbkhan007/ollama-emulator-desktop-ultimate` | [GitHub Packages](#install-from-github-packages) |
| **Web (Free)** | Live demo at GitHub Pages | [Open Free Tier](https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate) |

---

## Features

| Feature | What It Does |
|---------|-------------|
| **Ollama API** | `/api/tags`, `/api/chat`, `/api/generate` — drop-in replacement |
| **OpenAI API** | `/v1/models`, `/v1/chat/completions` — works with any OpenAI client |
| **Anthropic API** | `/v1/messages` — works with Claude Code via `ANTHROPIC_BASE_URL` |
| **26 Free Models** | Qwen3 Coder 480B, GPT-OSS 120B, Nemotron Ultra 550B, Llama 3.3, Gemma 4 |
| **Multi-Provider** | OpenRouter, OpenAI, Anthropic, Gemini, Groq, DeepSeek, Mistral, Together |
| **RAG Knowledge Base** | Upload docs, paste text, FTS5 + TF-IDF search |
| **Persistent Memory** | Auto-saves conversations, facts, sessions to SQLite |
| **Usage Analytics** | Real-time token tracking, resonance, accuracy, hourly activity |
| **Local Auth** | Email/password login, all data stays on your machine |
| **Dark/Light Theme** | System preference detection, manual toggle |
| **Mobile App** | 8-screen React Native app (EXPO) with full parity |
| **One-Click Launch** | `run.bat` / `run.sh` — live in 2 seconds |

---

## Why Build Your Own LLM Gateway?

### The Problem
Every AI coding tool needs a subscription:

```mermaid
flowchart TD
    subgraph Paid["You Pay $60+/Month"]
        CC1["Claude Code"] -->|$20/mo| A1["Anthropic"]
        CU1["Cursor Pro"] -->|$20/mo| A2["OpenAI GPT-4"]
        OC1["OpenCode"] -->|$20/mo| A3["Any Provider"]
        CD1["Continue.dev"] -->|$20/mo| A4["Various"]
    end
    A1 --> $$$["$$$ Wasted"]
    A2 --> $$$
    A3 --> $$$
    A4 --> $$$
    style Paid fill:#fee2e2,stroke:#dc2626
    style $$$ fill:#fef2f2,stroke:#dc2626
```

That's **$60+/month** just to use different tools.

### The Solution
**OllamaEmu** sits in the middle. One server. One port. All tools work.

```mermaid
flowchart LR
    subgraph Tools["Your Tools (FREE)"]
        CC["Claude Code"]
        CU["Cursor"]
        OC["OpenCode"]
        CD["Continue.dev"]
    end

    subgraph Emu["OllamaEmu ($0)"]
        OE["localhost:11434"]
    end

    subgraph Providers["Free Cloud LLMs (26 Models)"]
        OR["OpenRouter Free Tier"]
        QW["Qwen3 Coder 480B"]
        OA["GPT-OSS 120B"]
        NN["Nemotron Ultra 550B"]
        LL["Llama 3.3 70B"]
        GM["Gemma 4 31B"]
    end

    CC --> OE
    CU --> OE
    OC --> OE
    CD --> OE
    OE --> OR
    OR --> QW
    OR --> OA
    OR --> NN
    OR --> LL
    OR --> GM

    style Emu fill:#d1fae5,stroke:#059669
    style Providers fill:#dbeafe,stroke:#2563eb
```

**You save $240+/year.** The same quality. Zero cost. Full privacy.

---

## Using with AI Coding Tools

### Claude Code
```bash
set OLLAMA_EMU_API_KEY=sk-or-v1-your-key-here
set ANTHROPIC_BASE_URL=http://localhost:11434
set ANTHROPIC_API_KEY=sk-local
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

### Any Ollama Client
```
OLLAMA_HOST=http://localhost:11434 ollama list
```

---

## API Endpoints

### Request Lifecycle

```mermaid
sequenceDiagram
    participant Tool as AI Coding Tool
    participant Emu as OllamaEmu
    participant Router as Provider Router
    participant Cloud as Free Cloud LLM
    participant DB as Local SQLite

    Tool->>Emu: POST /api/chat (model, messages)
    Emu->>DB: Track usage (tokens, latency)
    Emu->>Router: Route to active provider
    Router->>Cloud: POST /v1/chat/completions
    Cloud-->>Router: Stream response (ndjson)
    Router-->>Emu: Forward stream
    Emu->>DB: Save to memory (auto-flush)
    Emu-->>Tool: Stream response (Ollama ndjson)
```

### Ollama-Compatible
| Route | Method | Description |
|-------|--------|-------------|
| `/api/tags` | GET | List available models |
| `/api/chat` | POST | Streaming chat completion |
| `/api/generate` | POST | Text generation |
| `/api/show` | GET | Model details |

### OpenAI-Compatible
| Route | Method | Description |
|-------|--------|-------------|
| `/v1/models` | GET | List models |
| `/v1/chat/completions` | POST | Chat completion |
| `/v1/completions` | POST | Text completion |

### Anthropic-Compatible
| Route | Method | Description |
|-------|--------|-------------|
| `/v1/messages` | POST | Messages API (streaming) |

### RAG (Knowledge Base)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/rag/upload` | POST | Upload file for indexing |
| `/api/rag/add-text` | POST | Add plain text |
| `/api/rag/search` | POST | Semantic search |
| `/api/rag/documents` | GET | List documents |
| `/api/rag/documents/{id}` | DELETE | Remove document |

### Memory
| Route | Method | Description |
|-------|--------|-------------|
| `/api/memory/stats` | GET | Memory statistics |
| `/api/memory/messages` | GET | Conversation messages |
| `/api/memory/facts` | GET/POST | Stored facts |
| `/api/memory/search` | POST | Search memory |

### Provider Management
| Route | Method | Description |
|-------|--------|-------------|
| `/api/status` | GET | Active provider, key status |
| `/api/providers/list` | GET | Configured providers |
| `/api/providers/activate` | POST | Switch active provider |
| `/api/providers/add` | POST | Add custom provider |
| `/api/providers/{name}` | DELETE | Remove provider |
| `/api/config` | POST | Save provider config |

---

## Architecture

```mermaid
flowchart TB
    subgraph Desktop["Desktop (EXE / Source)"]
        API["FastAPI Server<br/>:11434"]
        RAG["RAG Engine<br/>FTS5 + TF-IDF"]
        MEM["Memory System<br/>SQLite + Auto-flush"]
        AUTH["Auth System<br/>PBKDF2 + Salt"]
        ROUTER["Provider Router"]
        DB[("providers.db<br/>rag.db<br/>memory.db<br/>auth.db")]
    end

    subgraph Providers["Cloud Providers"]
        OR["OpenRouter<br/>(26 free models)"]
        OAI["OpenAI"]
        ANTH["Anthropic"]
        GEM["Google Gemini"]
        DS["DeepSeek"]
        GRQ["Groq"]
        MST["Mistral"]
        TGH["Together"]
    end

    subgraph Frontend["Web Dashboard"]
        NEXT["Next.js<br/>Static Export"]
        PAGES["~15 Pages<br/>Playground, RAG, Memory<br/>Usage, Settings, About"]
    end

    subgraph Mobile["Mobile App"]
        RN["React Native<br/>Expo"]
        MSCREENS["8 Screens<br/>Full Parity"]
    end

    subgraph Clients["AI Coding Tools"]
        CC["Claude Code"]
        CU["Cursor"]
        OC["OpenCode"]
        CD["Continue.dev"]
    end

    CC --> API
    CU --> API
    OC --> API
    CD --> API
    NEXT --> API
    RN --> API
    API --> RAG
    API --> MEM
    API --> AUTH
    API --> ROUTER
    RAG --> DB
    MEM --> DB
    AUTH --> DB
    ROUTER --> DB
    ROUTER --> OR
    ROUTER --> OAI
    ROUTER --> ANTH
    ROUTER --> GEM
    ROUTER --> DS
    ROUTER --> GRQ
    ROUTER --> MST
    ROUTER --> TGH

    style Desktop fill:#f0fdf4,stroke:#16a34a
    style Providers fill:#eff6ff,stroke:#2563eb
    style Frontend fill:#fefce8,stroke:#ca8a04
    style Mobile fill:#fdf2f8,stroke:#db2777
    style Clients fill:#f5f3ff,stroke:#7c3aed
```

---

## Security

- **All data is local** — credentials, keys, and documents never leave your machine
- **Password hashing** — PBKDF2-HMAC-SHA256 with per-user random salt
- **SSRF protection** — provider URLs are scheme-checked and blocked from private/loopback addresses
- **Secure binding** — server binds to `127.0.0.1` by default; use `--host 0.0.0.0` for LAN
- **Error masking** — internal paths and stack traces never exposed
- **File upload safety** — random temp filenames, extension sanitization, 10MB limit

---

## Configuration

### Environment Variables
| Variable | Description |
|----------|-------------|
| `OLLAMA_EMU_API_KEY` | Pre-set API key on startup |
| `OLLAMA_EMU_PROVIDER` | Active provider name (default: `openrouter`) |

### Provider Database
Provider configs are persisted in `providers.db` (SQLite). On first run, 8 providers are seeded automatically. Add custom providers through the Settings page or mobile app.

---

## Building

### Standalone EXE (Windows)
```bash
build_exe.bat
```
Produces `dist/OllamaEmu.exe` — a single-file executable with embedded frontend.

### Requirements
- **Python 3.11+** (backend uses `datetime.UTC`)
- **Node.js 18+** (frontend build)

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

### Deploy the Public Site (Free on GitHub)
1. Repo → **Settings → Pages → Source: GitHub Actions**
2. Push to `main` — the [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) workflow builds and publishes
3. Live at `https://rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate`

---

## Mobile App

A **React Native (Expo)** app with 8 screens:

```mermaid
flowchart LR
    subgraph Screens["8 Screens"]
        CONNECT["Connect<br/>Server URL"]
        CHAT["Chat<br/>Streaming"]
        KNOW["Knowledge<br/>RAG"]
        MEM["Memory<br/>Facts"]
        PROV["Providers<br/>Manage"]
        USE["Usage<br/>Analytics"]
        SET["Settings<br/>Account"]
        ABOUT["About<br/>Info"]
    end

    subgraph Features["Built-in Features"]
        MODEL["Model Picker"]
        SEARCH["Doc Search"]
        FACTS["Stored Facts"]
        KEY["API Key Manager"]
        STATS["Token Stats"]
        THEME["Dark/Light Theme"]
    end

    CONNECT --> CHAT
    CHAT --> MODEL
    KNOW --> SEARCH
    MEM --> FACTS
    PROV --> KEY
    USE --> STATS
    SET --> THEME

    style Screens fill:#fdf2f8,stroke:#db2777
    style Features fill:#f0fdf4,stroke:#16a34a
```

| Screen | What It Does |
|--------|-------------|
| **Connect** | Enter server URL, test connection |
| **Chat** | Streaming playground with model picker |
| **Knowledge** | RAG: upload docs, search, manage collections |
| **Memory** | Facts, sessions, recent messages |
| **Providers** | Set active provider, paste API keys, add/delete |
| **Usage** | Token tracking, per-model stats |
| **Settings** | Server URL, account, device info |
| **About** | App overview, supported tools |

```bash
cd mobile
npm install
npx expo start        # scan QR with Expo Go
```

Full details: **[MOBILE.md](MOBILE.md)**

---

## Project Structure

```mermaid
graph TB
    ROOT["OllamaEmu"] --> PY["Python Backend"]
    ROOT --> FE["Next.js Frontend"]
    ROOT --> MOB["React Native Mobile"]
    ROOT --> CI["GitHub Actions"]

    PY --> SERVER["ollama_emu_desktop.py<br/>FastAPI Server"]
    PY --> RAG["rag.py<br/>RAG Engine"]
    PY --> MEM["memory.py<br/>Memory System"]
    PY --> REQ["requirements.txt"]

    FE --> APP["src/app/<br/>~15 Pages"]
    FE --> COMP["src/components/<br/>Navbar, Icons"]
    FE --> LIB["src/lib/<br/>API, Auth, Theme"]
    FE --> NC["next.config.js<br/>Static Export"]

    MOB --> MAPP["app/<br/>8 Screens"]
    MOB --> MCOMP["components/<br/>UI, BottomNav"]
    MOB --> MLIB["lib/<br/>API Client"]
    MOB --> MJ["app.json<br/>Expo Config"]

    CI --> DEPLOY["deploy-pages.yml<br/>GitHub Pages"]
    CI --> RELEASE["release.yml<br/>EXE + APK"]
    CI --> LIGHTHOUSE["lighthouse.yml<br/>Audit"]

    style ROOT fill:#f0fdf4,stroke:#16a34a
    style PY fill:#dbeafe,stroke:#2563eb
    style FE fill:#fefce8,stroke:#ca8a04
    style MOB fill:#fdf2f8,stroke:#db2777
    style CI fill:#f5f3ff,stroke:#7c3aed
```

---

## Share & Spread the Word

If this saves you a subscription, **share it**:

- **Twitter/X**: [Tweet about OllamaEmu](https://twitter.com/intent/tweet?text=Stop%20paying%20%2420%2Fmo%20for%20Claude%20%26%20ChatGPT.%20OllamaEmu%20gives%20you%2026%20free%20LLMs%20on%20one%20port.%20%23OllamaEmu%20%23FreeLLM%20%23AI)
- **Reddit**: Share in r/LocalLLaMA, r/selfhosted, r/ChatGPT, r/opensource
- **Hacker News**: [Submit to HN](https://news.ycombinator.com/submitlink?u=https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate&t=OllamaEmu%20%E2%80%94%2026%20free%20LLMs%20on%20one%20port)
- **GitHub**: Star the repo, fork it, open issues

**The only price is virality.** Star the repo and tell a friend.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run `tsc --noEmit` (frontend) and `python -m py_compile ollama_emu_desktop.py` (backend)
5. Submit a PR

---

## License

Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.
