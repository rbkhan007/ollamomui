# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for OllamaEmu Desktop (PySide6 + QML + FastAPI backend)

Build:
    pyinstaller desktop/build.spec --clean
"""

import sys
from pathlib import Path

block_cipher = None

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# ── Collect all QML files ──
qml_src = PROJECT_ROOT / "desktop" / "src" / "qml"
qml_files = []
for f in qml_src.rglob("*"):
    if f.is_file() and f.suffix in (".qml", ".js", ".ttf", ".otf") or f.name == "qmldir":
        rel = f.relative_to(qml_src.parent)  # relative to desktop/src/
        qml_files.append((str(f), str(rel.parent)))

# ── Frontend static files ──
frontend_out = PROJECT_ROOT / "frontend" / "out"
frontend_files = []
if frontend_out.exists():
    for f in frontend_out.rglob("*"):
        if f.is_file():
            rel = f.relative_to(PROJECT_ROOT)
            frontend_files.append((str(f), str(rel.parent)))

# ── Docs ──
docs_files = [
    (str(PROJECT_ROOT / "docs" / "README.md"), "docs"),
    (str(PROJECT_ROOT / "docs" / "SECURITY.md"), "docs"),
    (str(PROJECT_ROOT / "configs" / ".env.example"), "."),
]

# ── All data files ──
datas = qml_files + frontend_files + docs_files

# ── Hidden imports for backend ──
hiddenimports = [
    "numpy",
    "psycopg2",
    "psycopg2._psycopg",
    "psycopg2.extensions",
    "psycopg2.pool",
    "psycopg2.extras",
    "psycopg2.errors",
    "pgvector",
    "pgvector.psycopg2",
    "dotenv",
    "python_multipart",
    "multipart",
    "uvicorn.workers",
    "uvicorn.logging",
    "httpx",
    "ollama_emu.main",
    "ollama_emu.db",
    "ollama_emu.acl",
    "ollama_emu.rag",
    "ollama_emu.memory",
    "ollama_emu.cli",
    "ollama_emu.device_identity",
    "ollama_emu.memory_monitor",
    "ollama_emu.updater",
    "psutil",
]

# ── Collect all PySide6 Qt plugins and QML imports ──
from PyInstaller.utils.hooks import collect_data_files, collect_submodules, collect_dynamic_libs

pyside6_data = collect_data_files("PySide6", include_py_files=True)
pyside6_qml = collect_data_files("PySide6.qml")
pyside6_plugins = collect_dynamic_libs("PySide6")

# ── Binaries ──
binaries = pyside6_plugins

# ── Excludes ──
excludes = [
    "tkinter", "matplotlib", "scipy", "pandas", "PIL",
    "cairo", "gi", "Gtk", "PyQt5", "sphinx",
]

a = Analysis(
    [str(PROJECT_ROOT / "desktop" / "src" / "launcher.py")],
    pathex=[str(PROJECT_ROOT), str(PROJECT_ROOT / "backend" / "src")],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="ollamomui",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=str(PROJECT_ROOT / "resources" / "ollamomui.ico") if sys.platform == "win32" else None,
)

# ── Also create a one-dir bundle (faster startup, easier to debug) ──
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="ollamomui",
)
