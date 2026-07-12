# OllamoMUI Mobile — Free LLMs in Your Pocket

The mobile client is a **React Native (Expo)** app in `mobile/`. It connects to the
desktop server (`ollama_emu_desktop.py`, FastAPI) over the network and proxies
chats to whichever LLM provider the server has configured.

```
  Phone (Expo / Expo Go)  ──HTTP──>  Desktop server :11434  ──>  Free Cloud LLMs
   (React Native UI)                (FastAPI + RAG + Memory)     (OpenRouter, etc.)
```

## Why Use the Mobile App?

- **Same free models** — chat with Qwen3 Coder 480B, GPT-OSS 120B, Nemotron Ultra 550B, Llama 3.3, Gemma 4 on your phone
- **Full parity** — all 8 screens work identically to the desktop EXE
- **Manage providers** — switch active provider, paste API keys, add/delete providers
- **RAG on the go** — upload docs, search your knowledge base from anywhere
- **Memory** — review facts, sessions, and recent messages

## Connect Your Phone (Expo Go — No Build Needed)

1. Start the desktop server on your computer:
   ```bash
   python ollama_emu_desktop.py        # serves on http://localhost:11434
   ```
2. In `mobile/`, install deps and start Expo:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Expo prints a QR code. On your phone, open the **Expo Go** app and scan it.
   (If the QR doesn't appear, press `s` for the tunnel URL, or use `npx expo start --tunnel`.)
4. In the mobile app's **Connect** screen, enter your computer's **LAN IP**
   (e.g. `http://192.168.1.50:11434`) — not `localhost`, which means "the phone"
   from the phone's perspective. Both devices must be on the same Wi-Fi.

That's it — you can chat, browse providers/models, and view usage from your phone.

## Download the APK

The branded standalone **`OllamoMUI.apk`** is attached to every
[GitHub Release](https://github.com/rbkhan007/ollamomui/releases/latest).

- **Portrait-locked** — no auto-rotation
- **Branded identity** — custom icon, adaptive icon, splash screen, notification icon
- **Full 8-screen parity** — Chat, Knowledge, Memory, Providers, Usage, Settings, About

## Build a Standalone APK (EAS)

For custom builds without Expo Go:

```bash
cd mobile
npm install -g eas-cli        # once
eas login                     # Expo account (or export EXPO_TOKEN for CI/robot)
eas init --force              # link/register the EAS project (run once)
eas build -p android --profile apk   # standalone APK (assembleRelease)
```

> The EAS project lives under the Expo account **`rhavex`** as
> `@rhavex/ollamomui-mobile` (see `expo.extra.eas.projectId` in `app.json`).
> With a robot token (`EXPO_TOKEN`) you must run `eas init --force` once before
> the first build. Track progress with `eas build:view <id>` or `eas build:list`.

The build runs in Expo's cloud, so **no local Android SDK is required**. Download
the artifact from the EAS dashboard and install it.

> Local native builds (`npx expo prebuild` + Android Studio/gradle) also work if
> you have the Android SDK installed.

## Project Layout (`mobile/`)

| Path | Purpose |
|------|---------|
| `app/_layout.tsx` | Root stack + `AppProvider` + dark status bar |
| `app/index.tsx` | Connect screen (enter server URL, test, save) |
| `app/chat.tsx` | Streaming chat playground (Ollama ndjson) — model picker |
| `app/knowledge.tsx` | RAG: upload docs, add text, search, manage documents/collections |
| `app/memory.tsx` | Persistent memory: facts, sessions, recent messages, search, clear |
| `app/providers.tsx` | Set active provider, paste API keys, add & delete providers, list models |
| `app/usage.tsx` | Requests, tokens, per-model stats, recent activity |
| `app/settings.tsx` | Server URL, account, device/identity info |
| `app/about.tsx` | App overview, supported tools, link to free web app |
| `components/` | `ui.tsx` (Card/Input/Button/Chip), `MessageBubble`, `BottomNav` |
| `lib/api.ts` | Typed client for the desktop REST + streaming API |
| `lib/AppContext.tsx` | Server URL + auth state (AsyncStorage) |
| `theme.ts` | Shared dark palette |
| `app.json` | Expo config (scheme, dark UI, bundle id, **branded icon + adaptive icon + splash + notification icon, portrait lock**) |
| `assets/icon.png` | Branded app icon (1024x1024, used as `expo.icon` + iOS icon) |
| `assets/adaptive-icon-foreground.png` | Android adaptive-icon foreground (mark) |
| `assets/adaptive-icon-background.png` | Android adaptive-icon background (gradient) |
| `assets/notification-icon.png` | Monochrome white notification icon |
| `assets/splash.png` | Full-bleed branded splash (1242x2436) |

## API Contract

The app talks to the same endpoints the web dashboard uses:

| Endpoint | Used for |
|----------|----------|
| `GET  /api/status` | Active provider, key status, model count |
| `GET  /api/providers/list` | Configured providers |
| `GET  /api/models` | Available models (catalog fallback) |
| `GET  /api/models/all` | All models (catalog + live) with provider stats |
| `POST /api/chat` | Streaming chat (`application/x-ndjson`, Ollama shape) |
| `POST /api/providers/activate` | Switch the active provider (key-safe) |
| `POST /api/providers/add` | Add a custom provider |
| `POST /api/config` | Save an API key + set that provider active |
| `DELETE /api/providers/{name}` | Remove a provider |
| `GET  /api/usage/stats` | Usage analytics |
| `GET  /api/device` | Device identity / local time |
| `POST /api/auth/login` | Login (email + password) |
| `POST /api/auth/register` | Register new account |
| `POST /api/auth/verify` | Verify token validity |
| `POST /api/auth/change-password` | Change password |
| `POST /api/auth/auto-detect` | Auto-detect provider from API key |
| `GET  /api/acl/stats` | ACL statistics |
| `GET  /api/acl/roles` | Role definitions |
| `GET  /api/audit/log` | Audit log (admin only) |

## Notes

- The server must be reachable from the phone. For remote use, expose it via a
  tunnel/VPN rather than a public open port.
- Auth is optional: the app works with just the server URL (the server already
  holds the provider API key). Signing in links a local account on the server.
- **Orientation is locked to portrait** (`"orientation": "portrait"` in
  `app.json`) so the app never auto-rotates.
- **Responsive layout:** content is centered with a 760px max-width on tablets
  and the padding scales down on small phones (`mobile/lib/layout.ts`).
- The bundle was validated with `expo export` (Android, ~900 modules) and
  `tsc --noEmit` passes.

## Branding / Assets

All app artwork is generated from the `brand-mark.svg` hex+bolt logo
(`mobile/assets/*.png`). The generator script is `mobile/gen-assets.js`
(runs with the `sharp` package from `frontend/node_modules`):

```bash
cd frontend
$env:NODE_PATH="$PWD/../frontend/node_modules"   # so node can resolve 'sharp'
node ../mobile/gen-assets.js
```

It produces the app icon, Android adaptive-icon foreground/background, the
white notification icon, the splash screen, and the web PWA icons
(`frontend/public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`) plus
the Open Graph share image (`frontend/public/og-image.png`).

## Automated Release (GitHub Actions)

Pushing a tag `v*` (or `workflow_dispatch`) runs
[`.github/workflows/release.yml`](.github/workflows/release.yml), which:

1. **Builds the Windows EXE** with PyInstaller (embedded `frontend/out`, branded
   `brand-mark.ico` icon) and uploads `OllamoMUI.exe` to the GitHub Release.
2. **Builds the Android APK** with EAS and uploads `OllamoMUI.apk` — **only when
   the repo secret `EXPO_TOKEN` (an Expo access token) is set**, otherwise that
   job is skipped.

To cut a release:

```bash
git tag v1.0.x
git push origin v1.0.x
```

The EXE is attached automatically. For the APK, add the `EXPO_TOKEN` repo secret
(Settings → Secrets → Actions) under the Expo account `rhavex`, then re-run the
workflow (or re-push the tag) and `OllamoMUI.apk` will be attached too.
