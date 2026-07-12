import os
import shutil
import subprocess
import sys
import time
from pathlib import Path


def app_root() -> Path:
    if getattr(sys, "frozen", False):
        meipass = getattr(sys, "_MEIPASS", None)
        if meipass:
            return Path(meipass)
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def local_app_data() -> Path:
    base = os.environ.get("LOCALAPPDATA")
    if base:
        return Path(base) / "ollamomui"
    return app_root() / "runtime"


def bundled_postgres_bin() -> Path | None:
    cand = app_root() / "postgres" / "bin"
    if (cand / "postgres.exe").exists() or (cand / "postgres").exists():
        return cand
    return None


def system_postgres_bin() -> Path | None:
    for exe in ("pg_ctl", "pg_ctl.exe"):
        found = shutil.which(exe)
        if found:
            return Path(found).resolve().parent
    return None


def find_postgres_bin() -> Path | None:
    return bundled_postgres_bin() or system_postgres_bin()


def data_dir() -> Path:
    return local_app_data() / "postgres" / "data"


def log_file() -> Path:
    return data_dir() / "logfile"


def run(bin_dir: Path, name: str, *args, check: bool = True, capture: bool = True):
    exe = bin_dir / name
    if not exe.exists() and (bin_dir / (name + ".exe")).exists():
        exe = bin_dir / (name + ".exe")
    cmd = [str(exe), *[str(a) for a in args]]
    res = subprocess.run(
        cmd,
        capture_output=capture,
        text=True,
        creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
    )
    if check and res.returncode != 0:
        raise RuntimeError(
            f"{name} failed ({res.returncode}): {res.stderr or res.stdout}"
        )
    return res


def init_cluster(bin_dir: Path, ddir: Path) -> None:
    ddir.parent.mkdir(parents=True, exist_ok=True)
    if (ddir / "PG_VERSION").exists():
        return
    run(bin_dir, "initdb", "-D", str(ddir), "-U", "ollamaemu", "-A", "trust", "-E", "UTF8")


def configure_hba(ddir: Path) -> None:
    hba = ddir / "pg_hba.conf"
    if not hba.exists():
        return
    text = hba.read_text(encoding="utf-8", errors="ignore")
    needed = [
        "host    all    all    127.0.0.1/32    trust",
        "host    all    all    ::1/128         trust",
        "local   all    all                     trust",
    ]
    if all(line.strip() in text for line in needed):
        return
    lines = [line for line in text.splitlines() if line.strip().startswith(("host", "local"))]
    lines.extend(needed)
    hba.write_text("\n".join(lines) + "\n", encoding="utf-8")


def pick_port(bin_dir: Path) -> int:
    for port in (5432, 5433, 5434):
        try:
            res = run(bin_dir, "pg_isready", "-h", "127.0.0.1", "-p", str(port), check=False)
        except Exception:
            return port
        if "accepting" not in (res.stdout or "") and res.returncode != 0:
            return port
    return 5432


def start_postgres(bin_dir: Path, ddir: Path, port: int) -> None:
    ddir.mkdir(parents=True, exist_ok=True)
    run(
        bin_dir,
        "pg_ctl",
        "start",
        "-D",
        str(ddir),
        "-o",
        f'-p {port} -c listen_addresses="127.0.0.1" -c wal_level=minimal',
        "-l",
        str(log_file()),
        "-w",
    )


def stop_postgres(bin_dir: Path | None, ddir: Path) -> None:
    if bin_dir is None or not (ddir / "postmaster.pid").exists():
        return
    try:
        run(bin_dir, "pg_ctl", "stop", "-D", str(ddir), "-m", "fast", "-w", check=False)
    except Exception:
        pass


def ensure_role_and_db(bin_dir: Path, port: int) -> None:
    try:
        run(
            bin_dir,
            "psql",
            "-h",
            "127.0.0.1",
            "-p",
            str(port),
            "-U",
            "ollamaemu",
            "-d",
            "postgres",
            "-c",
            "SELECT 1 FROM pg_roles WHERE rolname='ollamaemu'",
            check=False,
        )
        run(
            bin_dir,
            "createdb",
            "-h",
            "127.0.0.1",
            "-p",
            str(port),
            "-U",
            "ollamaemu",
            "ollamaemu",
            check=False,
        )
    except Exception:
        pass


def ensure_local_postgres() -> dict | None:
    bin_dir = find_postgres_bin()
    if bin_dir is None:
        return None

    ddir = data_dir()
    try:
        init_cluster(bin_dir, ddir)
        configure_hba(ddir)
        port = pick_port(bin_dir)
        if not (ddir / "postmaster.pid").exists():
            start_postgres(bin_dir, ddir, port)
        for _ in range(20):
            res = run(bin_dir, "pg_isready", "-h", "127.0.0.1", "-p", str(port), check=False)
            if res.returncode == 0:
                break
            time.sleep(0.5)
        ensure_role_and_db(bin_dir, port)
    except Exception as exc:
        return {"ok": False, "error": str(exc), "bin_dir": str(bin_dir)}

    dsn = f"postgresql://ollamaemu@127.0.0.1:{port}/ollamaemu"
    os.environ["OLLAMA_EMU_DATABASE_URL"] = dsn
    os.environ["PGHOST"] = "127.0.0.1"
    os.environ["PGPORT"] = str(port)
    os.environ["PGUSER"] = "ollamaemu"
    os.environ["PGDATABASE"] = "ollamaemu"
    os.environ["PGPASSWORD"] = ""
    return {"ok": True, "dsn": dsn, "port": port, "bin_dir": str(bin_dir), "data_dir": str(ddir)}
