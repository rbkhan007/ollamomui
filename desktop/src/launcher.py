import atexit
import sys
import threading
import uvicorn
from pathlib import Path

if getattr(sys, "frozen", False):
    BUNDLE = Path(sys.executable).resolve().parent
    sys.path.insert(0, str(BUNDLE))
    _meipass = getattr(sys, "_MEIPASS", None)
    if _meipass:
        sys.path.insert(0, str(Path(_meipass)))
else:
    ROOT = Path(__file__).resolve().parent.parent.parent
    sys.path.insert(0, str(ROOT / "backend" / "src"))
    sys.path.insert(0, str(ROOT / "desktop" / "src"))

from ollama_emu.main import app

_PG_STATE = {}


def start_local_postgres():
    try:
        from postgres_bootstrap import ensure_local_postgres, find_postgres_bin, data_dir
    except Exception as exc:
        print(f"[postgres] bootstrap import failed: {exc}")
        return
    result = ensure_local_postgres()
    _PG_STATE["bin_dir"] = find_postgres_bin()
    _PG_STATE["data_dir"] = data_dir()
    if result is None:
        print("[postgres] no PostgreSQL binaries found; configure one or run fetch_postgres.py")
        return
    if not result.get("ok"):
        print(f"[postgres] start failed: {result.get('error')}")
        return
    print(f"[postgres] local PostgreSQL ready at {result.get('dsn')}")


def stop_local_postgres():
    bin_dir = _PG_STATE.get("bin_dir")
    ddir = _PG_STATE.get("data_dir")
    if bin_dir and ddir:
        try:
            from postgres_bootstrap import stop_postgres
            stop_postgres(bin_dir, ddir)
        except Exception:
            pass


def run_server():
    import os
    import traceback

    try:
        uvicorn.run(app, host="127.0.0.1", port=11434, log_level="warning")
    except Exception:
        log = os.path.join(os.environ.get("TEMP", "."), "ollamomui_server.log")
        try:
            with open(log, "w") as fh:
                fh.write(traceback.format_exc())
        except Exception:
            pass


def main():
    atexit.register(stop_local_postgres)
    # Start PostgreSQL bootstrap and the API server concurrently so the server
    # binds (port 11434) immediately and connects to the DB once it is ready,
    # instead of blocking the GUI on Postgres startup.
    threading.Thread(target=start_local_postgres, daemon=True).start()
    threading.Thread(target=run_server, daemon=True).start()

    from qml_engine import QmlEngine
    engine = QmlEngine()
    sys.exit(engine.run())


if __name__ == "__main__":
    main()
