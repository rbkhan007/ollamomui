# Contributing to OllamoMUI

Thanks for your interest in improving OllamoMUI! This document explains how to set up the
project, the conventions we follow, and how to get your changes merged.

## Getting Started

```bash
git clone https://github.com/rbkhan007/ollamomui.git
cd ollamomui

# Backend
python -m venv .venv && .venv\Scripts\activate   # or: source .venv/bin/activate
pip install -e ".[dev]"

# Frontend
cd frontend && npm install

# Desktop
cd ../desktop && pip install -e .

# Mobile
cd ../mobile && npm install
```

Copy `.env.example` → `.env` and fill in local secrets (the `.env` file is gitignored and
**must never be committed**). Production secrets live only in the Render / Vercel dashboards.

## Development Workflow

1. Create a feature branch: `git checkout -b feat/short-description`
2. Make your change, following the style below.
3. Run the test suite: `python backend/tests/test_api.py` (starts its own server).
4. Run the linter: `ruff check backend/src`
5. Commit using clear, imperative messages (`Add`, `Fix`, `Update`).
6. Push and open a Pull Request against `main`.

## Code Style

- **Python**: formatted with [Ruff](https://docs.astral.sh/ruff/) (line length 120).
  Type hints are required on public functions. No `# comments` unless asked.
- **TypeScript / React**: Prettier defaults; use the `@/` path alias for imports.
- **QML (desktop)**: follow the existing component structure under `desktop/src/qml`.

## Reporting Bugs & Ideas

- Use the **Bug Report** template for defects.
- Use the **Feature Request** template for proposals.
- For security issues, follow `docs/SECURITY.md` (do **not** open a public issue).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
