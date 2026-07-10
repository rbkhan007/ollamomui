"""
Device identity & local time helpers.

On first run a random device ID and key are generated and persisted to
``device.json`` next to this file. The same installation reuses them on every
later launch. A different user/PC gets a fresh, unique identity. All timestamps
use the local system clock and timezone (no GPS / network lookups).
"""
import os
import sys
import json
import uuid
import getpass
import secrets
import datetime


def _base_dir() -> str:
    """Stable location for ``device.json``.

    When frozen by PyInstaller the module lives in a temporary extraction
    directory, so we resolve relative to the executable instead. This keeps a
    single identity per installation (reused across launches) no matter where
    the bundled app is run from.
    """
    if getattr(sys, "frozen", False):
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))


BASE_DIR = _base_dir()
DEVICE_PATH = os.path.join(BASE_DIR, "device.json")

_device_cache: dict | None = None


def now_local() -> datetime.datetime:
    """Local, timezone-aware current time."""
    return datetime.datetime.now().astimezone()


def local_now_iso() -> str:
    return now_local().isoformat()


def _current_user() -> str:
    try:
        return getpass.getuser() or "unknown"
    except Exception:
        return "unknown"


def ensure_device() -> dict:
    """Load the device identity, creating it on first run."""
    global _device_cache
    if _device_cache is not None:
        return _device_cache
    data: dict = {}
    if os.path.exists(DEVICE_PATH):
        try:
            with open(DEVICE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}
    created = False
    if not data.get("device_id"):
        data["device_id"] = uuid.uuid4().hex
        created = True
    if not data.get("key"):
        data["key"] = secrets.token_hex(16)
        created = True
    if not data.get("user"):
        data["user"] = _current_user()
        created = True
    if not data.get("created_at"):
        data["created_at"] = local_now_iso()
        created = True
    data["user"] = _current_user()  # always reflect the current OS user
    if created or not os.path.exists(DEVICE_PATH):
        try:
            with open(DEVICE_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass
    _device_cache = data
    return data


def get_device() -> dict:
    return ensure_device()


def device_summary() -> dict:
    d = get_device()
    return {
        "device_id": d.get("device_id", "")[:8],
        "user": d.get("user", "unknown"),
        "timezone": now_local().tzname() or "UTC",
        "server_local_time": local_now_iso(),
    }
