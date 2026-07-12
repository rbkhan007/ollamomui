# Changelog

All notable changes to the OllamoMUI project are documented here.

## [1.0.5] — Unreleased

### Fixed
- Switched the PostgreSQL driver from `psycopg2-binary` to `psycopg` (v3) to resolve TLS
  handshake failures against Neon's connection pooler.
- `TrustedHostMiddleware` now allows deployment hostnames (Render/Vercel/custom domains) and is
  configurable via `ALLOWED_HOSTS`, so the Render health check passes.
- `setup_env.py` merges with existing Render env vars instead of overwriting them.
- Database pool now degrades gracefully when PostgreSQL is unavailable.
- Fixed frontend `next build` type error: `Navbar.tsx` now uses a named import for `BrandIcon` (it was a default import that broke the static export).
- Fixed `desktop/requirements.txt` broken `file:///${PROJECT_ROOT}` editable reference; the `ollamomui` package is now installed from the repo root (`pip install -e .`).
- Fixed documentation references to the non-existent `ollama_emu_desktop.py` (now `desktop/src/launcher.py` / `python -m ollama_emu.main`) and `build_exe.bat` (now `python desktop/build.py --onefile`).

### Changed
- Payments & licensing migrated from SSLCommerz/Stripe to **Lemon Squeezy** as the primary provider.
- Documentation, README, and brand references updated to Lemon Squeezy.
- Manual WhatsApp sales pipeline is the active licensing path; Lemon Squeezy remains an optional, not-yet-live payment provider.
- Desktop EXE verified building on Python 3.14 / PySide6 6.11 via `python desktop/build.py --onefile`.
- Test instructions corrected: the suite is a standalone script (`python backend/tests/test_api.py --online`), not `pytest`.

## [1.0.4] — 2026-07-12

### Changed
- Rebranded to **OllamoMUI** – new name, logo, and identity
- Updated all documentation and references

## [1.0.2] — 2026-07-12

### Added
- Full CRUD operations for all data models (providers, users, memory, RAG)
- New endpoints: `PUT /api/providers/{name}`, `GET/PUT/DELETE /api/users/{email}`, `DELETE /api/memory/messages/{msg_id}`, `GET /api/rag/chunks/{doc_id}`, `PUT /api/rag/chunks/{chunk_id}`
- Export/Import system: `GET /api/export`, `POST /api/import`
- Auto-refresh free model list from OpenRouter (`GET /api/models/free`)
- Re-embed single chunk on content update (`rag.reembed_chunk`)
- Desktop QML client with PySide6
  - Toast notification system
  - Progress spinner indicators
  - Keyboard shortcuts (Ctrl+1-9 navigation, Ctrl+Return send, Ctrl+N new chat)
  - Export/Import data dialogs in Settings
- Desktop QML pages: Login, Register, Home, Playground, Usage, Settings, RAG, Memory, Terminal
- Desktop sidebar with theme toggle and account navigation
- API Client in `api_client.py` — 40+ methods matching all backend endpoints

### Changed
- Pydantic models now have `field_validator` constraints on all inputs
- Unified error response format: `{"detail": "..."}` across all endpoints
- Added `RequestValidationError` handler for consistent 422 responses
- Added `ValueError` and connection error handlers in global exception handler
- QML import paths configured in `qml_engine.py` for component resolution
- `UsagePage.qml` uses correct `/api/usage/stats` endpoint

### Fixed
- autoflake cleanup: removed unused imports across `backend/src/` and `desktop/src/`
- `ConfigRequest` model has provider name validation
- Provider update now validates `auth_type` and `type` fields
- `MemorySearchRequest` validates query length and limit
- `MemoryFactRequest` validates fact, importance, session_id
- `UserUpdateRequest` validates role against allowed values
- `RagChunkUpdateRequest` validates content length
- `AuthRequest` validates email and password at model level
- Chunk re-embedding updates both `rag_chunks.embedding` and `rag_fts` FTS index

### Database
- PostgreSQL schema unchanged (v1)
- New Python methods: `get_provider`, `update_provider`, `load_all_users`, `update_user_role`, `delete_user`, `get_memory_message`, `delete_memory_message`, `clear_all_messages`, `get_rag_document`, `list_rag_chunks`, `update_rag_chunk`, `get_usage_stats`

## [1.0.1] — 2026-07-10

### Added
- Professional Python package restructure (`backend/src/ollama_emu/`)
- `pyproject.toml` with installable package configuration
- Launcher scripts for Windows and Unix (`run.bat`, `run.sh`, `ollamaemu.bat`, `ollamaemu.sh`)
- PyInstaller EXE build script (`build.py`)
- Documentation directory with README, SECURITY, MOBILE, ASSETS docs
- Resource directory with branding assets (SVG icons, favicons, diagrams)
- Configs directory with `.env.example`, `setup_database.sql`, CI configs
- `__init__.py` with package version (`1.0.2`)

### Changed
- All imports updated to `ollama_emu.*` package paths
- All launcher scripts use `-m ollama_emu.main` module entry
- Test script starts server via `python -m ollama_emu.main`

### Fixed
- Password update bug: now uses `UPDATE` instead of `INSERT ON CONFLICT DO NOTHING`
- Admin email default unified to `admin@localhost` across `acl.py` and `db.py`
- Dead files removed from git (Prisma, platform-tools, stale Next.js files)
- Duplicate `import re` removed
- Duplicate `ip` assignment removed in login endpoint
- `setup_database.sql` seed data synced with `DEFAULT_PROVIDERS`
- Memory search changed from `AND` to `OR` for better recall

## [1.0.0] — 2026-07-08

### Added
- Initial release of OllamoMUI
- FastAPI backend with PostgreSQL + pgvector
- Multi-provider support: OpenAI, Anthropic, Gemini, OpenRouter, Groq, DeepSeek, Mistral, Together
- RAG engine (TF-IDF, sentence-transformers, OpenAI embedding backends)
- Memory system with session-based message storage
- ACL with RBAC, rate limiting, API key management, IP filtering
- Next.js web frontend with dark/light theme
- React Native mobile app (Expo)
- GitHub Pages deployment workflow
- pgvector HNSW/IVFFlat indexing for vector search
