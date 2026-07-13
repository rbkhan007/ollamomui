#!/usr/bin/env python3
"""
Cross-platform build script for OllamoMUI Desktop.
Builds a standalone executable with PyInstaller.

Usage:
    python desktop/build.py                    # Build for current platform
    python desktop/build.py --onefile          # Single EXE (Windows/macOS)
    python desktop/build.py --clean            # Clean before build
"""

import os
import sys
import shutil
import subprocess
import argparse
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SPEC_FILE = PROJECT_ROOT / "desktop" / "build.spec"
DIST_DIR = PROJECT_ROOT / "dist"
BUILD_DIR = PROJECT_ROOT / "build"


def check_dependencies():
    """Verify required packages are installed."""
    missing = []
    for pkg in ["PyInstaller", "PySide6"]:
        try:
            __import__(pkg.replace("-", "_"))
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"[FAIL] Missing dependencies: {', '.join(missing)}")
        print(f"       Run: pip install {' '.join(missing)}")
        return False
    return True


def check_frontend():
    """Ensure frontend is built (static export)."""
    out_dir = PROJECT_ROOT / "frontend" / "out"
    index = out_dir / "index.html"
    if not index.exists():
        print("[INFO] Frontend not built. Building now...")
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=str(PROJECT_ROOT / "frontend"),
            shell=True,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"[FAIL] Frontend build failed:\n{result.stderr}")
            return False
        print("[OK] Frontend built.")
    else:
        print(f"[OK] Frontend found ({len(list(out_dir.rglob('*')))} files).")
    return True


def clean_build():
    """Remove previous build artifacts."""
    for d in [DIST_DIR, BUILD_DIR]:
        if d.exists():
            shutil.rmtree(d)
            print(f"[OK] Removed {d}")
    # Also remove .spec in project root if any
    for spec in PROJECT_ROOT.glob("*.spec"):
        spec.unlink()
        print(f"[OK] Removed {spec}")


def run_pyinstaller(onefile: bool = False):
    """Run PyInstaller with the spec file."""
    cmd = [sys.executable, "-m", "PyInstaller", str(SPEC_FILE), "--noconfirm"]

    if onefile:
        # For --onefile, we override: use a custom spec approach
        cmd = [
            sys.executable, "-m", "PyInstaller",
            "--onefile",
            "--name", "ollamomui",
            "--add-data", f"{PROJECT_ROOT / 'desktop' / 'src' / 'qml'}{os.pathsep}qml",
            "--add-data", f"{PROJECT_ROOT / 'frontend' / 'out'}{os.pathsep}frontend/out",
            "--hidden-import", "PySide6",
            "--hidden-import", "PySide6.QtCore",
            "--hidden-import", "PySide6.QtGui",
            "--hidden-import", "PySide6.QtQml",
            "--hidden-import", "PySide6.QtQuick",
            "--hidden-import", "PySide6.QtNetwork",
            "--collect-all", "PySide6",
            "--collect-all", "ollama_emu",
            "--collect-submodules", "psycopg",
            "--collect-submodules", "pgvector",
            "--collect-data", "numpy",
            "--hidden-import", "uvicorn.workers",
            "--hidden-import", "httpx",
            "--hidden-import", "dotenv",
            "--hidden-import", "python_multipart",
            "--hidden-import", "postgres_bootstrap",
            "--hidden-import", "qml_engine",
            "--hidden-import", "api_client",
            "--hidden-import", "updater",
            "--paths", str(PROJECT_ROOT / "desktop" / "src"),
            "--distpath", str(DIST_DIR),
            "--workpath", str(BUILD_DIR),
            "--clean",
            "--noconfirm",
            str(PROJECT_ROOT / "desktop" / "src" / "launcher.py"),
        ]
        if sys.platform == "win32":
            cmd += ["--icon", str(PROJECT_ROOT / "resources" / "ollamomui.ico")]

        postgres_dir = PROJECT_ROOT / "desktop" / "postgres"
        if postgres_dir.exists():
            cmd += ["--add-data", f"{postgres_dir}{os.pathsep}postgres"]

        # Bundle postgres_bootstrap.py so local PostgreSQL auto-starts in the EXE.
        postgres_bootstrap = PROJECT_ROOT / "desktop" / "postgres_bootstrap.py"
        if postgres_bootstrap.exists():
            cmd += ["--add-data", f"{postgres_bootstrap}{os.pathsep}postgres_bootstrap.py"]

    print(f"[BUILD] Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"[FAIL] PyInstaller failed:\n{result.stdout[-2000:]}\n{result.stderr[-2000:]}")
        return False

    print(f"[OK] Build succeeded. Output in: {DIST_DIR}")
    return True


def copy_artifacts():
    """Copy supporting files to dist folder."""
    if not DIST_DIR.exists():
        return

    # Copy config example
    env_example = PROJECT_ROOT / "configs" / ".env.example"
    if env_example.exists():
        shutil.copy2(env_example, DIST_DIR / ".env.example")
        print("[OK] Copied .env.example")

    # Copy README
    readme = PROJECT_ROOT / "docs" / "README.md"
    if readme.exists():
        shutil.copy2(readme, DIST_DIR / "README.md")
        print("[OK] Copied README.md")


def main():
    parser = argparse.ArgumentParser(description="OllamoMUI Desktop Build Script")
    parser.add_argument("--onefile", action="store_true", help="Build single executable (Windows/macOS)")
    parser.add_argument("--clean", action="store_true", help="Clean before building")
    parser.add_argument("--skip-frontend", action="store_true", help="Skip frontend build check")
    args = parser.parse_args()

    print("=" * 55)
    print("  OllamoMUI Desktop — Build Script")
    print(f"  Platform: {sys.platform}  Python: {sys.version_info.major}.{sys.version_info.minor}")
    print("=" * 55)

    if args.clean:
        clean_build()

    if not check_dependencies():
        sys.exit(1)

    if not args.skip_frontend:
        if not check_frontend():
            sys.exit(1)

    if not run_pyinstaller(onefile=args.onefile):
        sys.exit(1)

    copy_artifacts()

    print()
    print("=" * 55)
    exe_name = "ollamomui.exe" if sys.platform == "win32" else "ollamomui"
    print(f"  Build complete!")
    print(f"  Executable: dist/{exe_name}")
    print(f"  Run: dist/{exe_name}")
    print("=" * 55)
    return 0


if __name__ == "__main__":
    sys.exit(main())
