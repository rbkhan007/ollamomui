# OllamoMUI Desktop

The desktop app is a **self-contained Windows build** (PySide6 + QML frontend, bundled FastAPI backend) that speaks the Ollama-compatible API.

## Database topology

| Target            | Database                                            | How it is provisioned                                  |
|-------------------|-----------------------------------------------------|--------------------------------------------------------|
| **Desktop EXE**   | **Local PostgreSQL** (running on your machine)      | Auto-bootstrapped by the EXE, or your existing install |
| Marketing website | **NeonDB (cloud)**                                  | Configured on the Render backend via env vars          |
| Android apps      | **NeonDB (cloud)**                                  | Configured on the Render backend via env vars          |

The desktop never talks to Neon. It owns its own local PostgreSQL cluster so your
data (chat history, providers, API keys, RAG documents) stays on your PC.

## Local PostgreSQL for the desktop

On first launch the desktop:

1. Looks for PostgreSQL binaries in two places, in order:
   - bundled `postgres/bin/` next to the EXE (download them with `fetch_postgres.py`), or
   - a PostgreSQL install already on your `PATH` (e.g. the one that ships with **pgAdmin 4** from the EDB installer).
2. If no server is reachable, it initializes a cluster in
   `%LOCALAPPDATA%\ollamomui\postgres\data`, starts it on port `5432`
   (falling back to `5433`/`5434`), and creates the `ollamaemu` role + database.
3. Local auth uses `trust` on `127.0.0.1`, so no password is required.

If you already have PostgreSQL + pgAdmin 4 installed, the desktop will simply use
it (it creates the `ollamaemu` database if missing).

### Vendoring PostgreSQL into the EXE

```powershell
cd desktop
python fetch_postgres.py
python build.py --onefile
```

`fetch_postgres.py` downloads the official Windows binaries into `desktop/postgres/`,
which `build.py` then bundles into the EXE (onefile) or `build.spec` (one-folder).

## Connecting pgAdmin 4 to the desktop database

Open pgAdmin 4 → **Object → Register → Server**:

- **General → Name:** `OllamoMUI (local)`
- **Connection → Host:** `127.0.0.1`
- **Connection → Port:** `5432` (or `5433`/`5434` if the EXE reported a fallback)
- **Connection → Maintenance database:** `postgres`
- **Connection → Username:** `ollamaemu`
- **Connection → Password:** *(leave blank — local auth is `trust`)*

You can then browse the `ollamaemu` database, inspect tables, and run SQL.

To find the actual port the EXE used, look at the launch console log:
`[postgres] local PostgreSQL ready at postgresql://ollamaemu@127.0.0.1:5432/ollamaemu`.

## Using your own API keys (free / testing)

No license or payment is required to use your own keys.

- **Settings → Add Provider**: paste any provider's base URL and API key
  (OpenAI, Anthropic, Google, Ollama, a local LM Studio server, etc.).
- Keys are stored **locally** in the desktop database — they never leave your machine
  except to call the provider you configured.
- Enable **Free / heuristic** models to use local or keyless endpoints for testing.

This lets anyone run OllamoMUI for free with their own API keys or a local model server.

## Building from source

Prerequisites: install the backend package and the desktop GUI toolkit from the
repo root, then vendor PostgreSQL and build:

```powershell
# From the repo root
pip install -e .                 # installs the `ollamomui` (ollama_emu) package
pip install pyinstaller pyside6  # build toolchain

cd desktop
python fetch_postgres.py         # download Windows PostgreSQL binaries
python build.py --onefile        # -> dist/ollamomui.exe (single file)
```

The resulting `dist/ollamomui.exe` is a self-contained Windows EXE (PySide6 + QML +
bundled FastAPI backend + local PostgreSQL). Runs on Windows 10/11 (x64). See
[EXECUTION_GUIDE.md](../EXECUTION_GUIDE.md) for the full step-by-step.
