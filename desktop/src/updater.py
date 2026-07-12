import sys
import os
import json
import tempfile
import subprocess
import threading
import requests
from pathlib import Path
from PySide6.QtCore import QObject, Signal, Property

REPO_OWNER = "rbkhan007"
REPO_NAME = "ollamomui"

def _get_current_version():
    try:
        from ollama_emu import __version__
        return __version__
    except ImportError:
        return "1.0.4"

def _api_headers():
    return {"Accept": "application/vnd.github.v3+json"}

def check_latest_release(timeout=5):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/releases/latest"
    try:
        resp = requests.get(url, headers=_api_headers(), timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        tag = data.get("tag_name", "").lstrip("v")
        exe_url = None
        for asset in data.get("assets", []):
            name = asset.get("name", "")
            if name.endswith(".exe") or "ollamomui" in name.lower() and name.endswith(".exe"):
                exe_url = asset["browser_download_url"]
                break
        return tag, exe_url, data.get("html_url", "")
    except Exception:
        return None, None, None


class UpdaterManager(QObject):
    updateAvailable = Signal(str, str, arguments=["version", "downloadUrl"])
    updateProgress = Signal(float)
    updateFinished = Signal(bool, str, arguments=["success", "message"])
    checkFinished = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self._latest_version = None
        self._download_url = None
        self._release_url = None
        self._status = "idle"

    @Property(str, constant=True)
    def currentVersion(self):
        return _get_current_version()

    @Property(str, notify=checkFinished)
    def latestVersion(self):
        return self._latest_version or ""

    @Property(str, notify=checkFinished)
    def status(self):
        return self._status

    def check(self):
        self._status = "checking"
        threading.Thread(target=self._do_check, daemon=True).start()

    def _do_check(self):
        tag, exe_url, html_url = check_latest_release()
        if tag and exe_url and tag != _get_current_version():
            self._latest_version = tag
            self._download_url = exe_url
            self._release_url = html_url
            self._status = "available"
            self.updateAvailable.emit(tag, exe_url)
        else:
            self._latest_version = tag or ""
            self._download_url = ""
            self._release_url = ""
            self._status = "up_to_date"
        self.checkFinished.emit()

    def downloadAndInstall(self):
        if not self._download_url:
            self.updateFinished.emit(False, "No download URL available")
            return
        self._status = "downloading"
        threading.Thread(target=self._do_download_and_install, daemon=True).start()

    def _do_download_and_install(self):
        try:
            temp_dir = tempfile.gettempdir()
            new_exe = os.path.join(temp_dir, "ollamomui_update.exe")

            resp = requests.get(self._download_url, stream=True, timeout=30)
            resp.raise_for_status()
            total = int(resp.headers.get("content-length", 0))
            downloaded = 0
            with open(new_exe, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total:
                        self.updateProgress.emit(downloaded / total * 100)
            self.updateProgress.emit(100.0)

            current_exe = sys.executable
            script_path = os.path.join(temp_dir, "ollamomui_update.bat")
            with open(script_path, "w") as f:
                f.write(
                    f'@echo off\r\n'
                    f'timeout /t 2 /nobreak > nul\r\n'
                    f'copy /y "{new_exe}" "{current_exe}"\r\n'
                    f'start "" "{current_exe}"\r\n'
                    f'del "{new_exe}"\r\n'
                    f'del "%~f0"\r\n'
                )

            subprocess.Popen([script_path], shell=True)
            self.updateFinished.emit(True, "Update installed. Restarting...")
            QObject.sender = None
            sys.exit(0)
        except Exception as e:
            self._status = "error"
            self.updateFinished.emit(False, str(e))

    def skipVersion(self):
        self._status = "skipped"
        self._latest_version = ""
        self._download_url = ""
        self.checkFinished.emit()

    def openReleasePage(self):
        if self._release_url:
            import webbrowser
            webbrowser.open(self._release_url)
