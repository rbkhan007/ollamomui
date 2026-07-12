# 🚀 Execution Guide – From Code to Launch

Runnable commands for the remaining manual steps: building the EXE, running the
test suite, building the APK, setting up a custom domain, and launching promotion.

All code is already live and clean. This guide turns those final tasks into
commands with validation.

> **Accuracy note:** the test suite is a standalone `argparse` script
> (`backend/tests/test_api.py`), not a `pytest` suite, and its pass counts are
> **not** hard-coded — run it and observe the actual output. The EXE build needs
> `desktop/requirements.txt` installed first.

---

## 📋 Prerequisites

| Tool | Check Command | Install If Missing |
|------|---------------|---------------------|
| **Python 3.11+** | `python --version` | https://python.org |
| **Git** | `git --version` | https://git-scm.com |
| **Node.js 18+** | `node --version` | https://nodejs.org |
| **npm** | `npm --version` | Included with Node.js |
| **Expo CLI** | `npx expo --version` | `npm install -g expo-cli` |
| **EAS CLI** | `npx eas --version` | `npm install -g eas-cli` |
| **Vercel CLI** (optional) | `vercel --version` | `npm install -g vercel` |
| **Render CLI** (optional) | `render --version` | `npm install -g render-cli` |

---

## 🧪 1. Run the Test Suite

```bash
# From project root – install all Python deps
pip install -r requirements.txt

# Navigate to tests
cd backend/tests

# Run the standalone test script (requires a live PostgreSQL + network)
python test_api.py --online
```

**What to expect:** The script outputs a series of `[OK]` / `[FAIL]` lines. There
is **no hard-coded pass count** — run it and observe the actual status. If
failures occur, check your PostgreSQL connection and network (it calls free LLM
endpoints).

---

## 🖥️ 2. Build the Windows EXE

### 2.1 Install Desktop Dependencies
```bash
# From the repo root: install the backend package (importable as `ollama_emu`)
pip install -e .
# Then the desktop GUI toolkit + requirements
cd desktop
pip install -r requirements.txt   # PySide6, requests, markdown, psutil
pip install pyinstaller
```

### 2.2 Download PostgreSQL Binaries (one time)
```bash
python fetch_postgres.py
```
Downloads PostgreSQL Windows binaries into `desktop/postgres/`.

### 2.3 Build the EXE
```bash
python build.py --onefile
```
**Output:** `desktop/dist/ollamomui.exe` (single file).

### 2.4 Validate the EXE
- Run: `dist\ollamomui.exe`
- Verify: QML window opens, local PostgreSQL starts, login/register works, RAG
  upload + search works, memory works, license activation works (generate a test
  key with `license_generator.py` and paste it in).

**If the EXE fails:** Run from a terminal to see logs. Check
`%LOCALAPPDATA%\ollamomui\postgres\data\postgresql.log` for DB errors.

---

## 📱 3. Build the Mobile APK (Android)

```bash
cd mobile
npx eas login
npx eas build --platform android --profile apk
```
Download the APK and upload it to the Google Play Console.

---

## 🌐 4. Custom Domain (Optional)

| Record | Name | Value |
|--------|------|-------|
| **A** | `@` | `76.76.21.21` (Vercel) |
| **CNAME** | `www` | `cname.vercel-dns.com` |
| **CNAME** | `api` | `ollamomui-backend.onrender.com` |

Update env vars:
- **Vercel:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE`
- **Render:** `APP_URL`

Wait for DNS propagation, then verify `https://<domain>` and
`https://api.<domain>/api/status`.

---

## 📢 5. Launch Promotion

All materials are in `promotion/` — follow `launch-checklist.md`. Posts are
pre-written in `product-hunt.md`, `reddit-posts.md`, `twitter-thread.md`,
`email-campaign.md`.

---

## ✅ Final Verification Checklist

- [ ] `python test_api.py --online` runs (report actual output)
- [ ] EXE builds and runs (QML + local PG)
- [ ] APK builds and installs on a device
- [ ] Custom domain resolves (if set)
- [ ] Launch posts are scheduled
