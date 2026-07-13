import json
import requests
from typing import Optional, Dict, Any, List, Generator, Callable
from PySide6.QtCore import QObject, Signal, Slot, Property, QRunnable, QThreadPool


class _WorkerSignals(QObject):
    """QRunnable cannot own signals, so the worker carries a QObject for them."""
    finished = Signal(str)
    error = Signal(str)


class ApiWorker(QRunnable):
    """Runs a blocking ApiClient method off the GUI thread."""

    def __init__(self, client: "ApiClient", method: str, args: list, kwargs: dict):
        super().__init__()
        self._client = client
        self._method = method
        self._args = args
        self._kwargs = kwargs
        self.signals = _WorkerSignals()

    def run(self):
        try:
            result = getattr(self._client, self._method)(*self._args, **self._kwargs)
            self.signals.finished.emit(json.dumps(result, default=str))
        except Exception as e:
            self.signals.error.emit(str(e))


class ApiClient(QObject):
    requestFinished = Signal(str, str)
    requestError = Signal(str, str)
    loadingChanged = Signal(bool)
    base_url_changed = Signal()
    token_changed = Signal()

    def __init__(self, base_url="http://localhost:11434"):
        super().__init__()
        self._base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self._token: Optional[str] = None
        self._preferences: Dict[str, str] = {}
        self._pool = QThreadPool.globalInstance()
        self._active = 0

    def _get_base_url(self):
        return self._base_url

    def _set_base_url(self, url):
        if self._base_url != url:
            self._base_url = url
            self.base_url_changed.emit()

    base_url = Property(str, _get_base_url, _set_base_url, notify=base_url_changed)

    @Slot(str, str, str, str)
    def executeAsync(self, requestId: str, method: str, argsJson: str = "[]", kwargsJson: str = "{}"):
        try:
            args = json.loads(argsJson) if argsJson else []
            kwargs = json.loads(kwargsJson) if kwargsJson else {}
        except Exception as e:
            self.requestError.emit(requestId, f"bad args: {e}")
            return
        if not hasattr(self, method):
            self.requestError.emit(requestId, f"unknown method: {method}")
            return
        worker = ApiWorker(self, method, args, kwargs)
        worker.signals.finished.connect(lambda payload: self._done(requestId, payload))
        worker.signals.error.connect(lambda err: self._fail(requestId, err))
        self._active += 1
        if self._active == 1:
            self.loadingChanged.emit(True)
        self._pool.start(worker)

    def _done(self, requestId: str, payload: str):
        self._active = max(0, self._active - 1)
        if self._active == 0:
            self.loadingChanged.emit(False)
        self.requestFinished.emit(requestId, payload)

    def _fail(self, requestId: str, err: str):
        self._active = max(0, self._active - 1)
        if self._active == 0:
            self.loadingChanged.emit(False)
        self.requestError.emit(requestId, err)

    @property
    def token(self):
        return self._token

    @token.setter
    def token(self, value: Optional[str]):
        if self._token != value:
            self._token = value
            if value:
                self.session.headers.update({"Authorization": f"Bearer {value}"})
            else:
                self.session.headers.pop("Authorization", None)
            self.token_changed.emit()

    def _request(self, method: str, path: str, **kwargs) -> Any:
        url = f"{self.base_url}{path}"
        resp = self.session.request(method, url, timeout=30, **kwargs)
        resp.raise_for_status()
        return resp.json()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        result = self._request("POST", "/api/auth/login", json={"email": email, "password": password})
        return result

    def register(self, email: str, password: str) -> Dict[str, Any]:
        result = self._request("POST", "/api/auth/register", json={"email": email, "password": password})
        if result.get("token"):
            self.token = result["token"]
        return result

    def logout(self, token: str = "") -> Dict[str, Any]:
        return self._request("POST", "/api/auth/logout", json={"token": token or self._token or ""})

    def verify_token(self, token: str = "") -> Dict[str, Any]:
        params = {"token": token or self._token or ""}
        return self._request("GET", "/api/auth/verify", params=params)

    def change_password(self, old_password: str, new_password: str) -> Dict[str, Any]:
        return self._request("POST", "/api/auth/change-password", json={"old_password": old_password, "new_password": new_password})

    def activate_license(self, license_key: str, device_id: str = "") -> Dict[str, Any]:
        return self._request("POST", "/api/payment/activate", json={
            "license_key": license_key,
            "device_id": device_id,
        })

    def get_providers(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/providers")

    def list_providers(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/providers/list")

    def get_provider(self, name: str) -> Dict[str, Any]:
        return self._request("GET", f"/api/providers/{name}")

    def add_provider(self, name: str, url: str, provider_type: str, models_url: str = "",
                     api_key: str = "", is_default: bool = False) -> Dict[str, Any]:
        return self._request("POST", "/api/providers/add", json={
            "name": name,
            "url": url,
            "type": provider_type,
            "models_url": models_url,
            "api_key": api_key,
            "is_default": is_default,
        })

    def update_provider(self, name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request("PUT", f"/api/providers/{name}", json=data)

    def delete_provider(self, name: str) -> Dict[str, Any]:
        return self._request("DELETE", f"/api/providers/{name}")

    def activate_provider(self, name: str) -> Dict[str, Any]:
        return self._request("POST", "/api/providers/activate", json={"name": name})

    def save_config(self, provider: str, api_key: str = "") -> Dict[str, Any]:
        return self._request("POST", "/api/config", json={"provider": provider, "api_key": api_key})

    def auto_detect_key(self, api_key: str) -> Dict[str, Any]:
        return self._request("POST", "/api/auth/auto-detect", json={"api_key": api_key})

    def get_models(self) -> Dict[str, Any]:
        return self._request("GET", "/api/models")

    def get_model_list(self) -> List[Dict[str, Any]]:
        result = self.get_models()
        return result.get("models", [])

    def get_free_models(self) -> Dict[str, Any]:
        return self._request("GET", "/api/models/free")

    def chat_completion(self, model: str, messages: List[Dict[str, str]], stream: bool = False) -> Any:
        payload = {"model": model, "messages": messages, "stream": stream}
        resp = self.session.post(f"{self.base_url}/v1/chat/completions", json=payload,
                                 headers={"Content-Type": "application/json"}, timeout=120)
        if stream:
            return self._stream_lines(resp)
        return resp.json()

    def _stream_lines(self, resp: requests.Response) -> Generator[str, None, None]:
        for line in resp.iter_lines(decode_unicode=True):
            if line:
                if line.startswith("data: "):
                    data = line[6:]
                    if data.strip() == "[DONE]":
                        continue
                    yield data

    def get_rag_documents(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/rag/documents")

    def get_rag_document(self, doc_id: str) -> Dict[str, Any]:
        return self._request("GET", f"/api/rag/documents/{doc_id}")

    def get_rag_chunks(self, doc_id: str) -> List[Dict[str, Any]]:
        return self._request("GET", f"/api/rag/chunks/{doc_id}")

    def update_rag_chunk(self, chunk_id: str, content: str) -> Dict[str, Any]:
        return self._request("PUT", f"/api/rag/chunks/{chunk_id}", json={"content": content})

    def delete_rag_document(self, doc_id: str) -> Dict[str, Any]:
        return self._request("DELETE", f"/api/rag/documents/{doc_id}")

    def add_rag_text(self, text: str, name: str = "pasted-text", collection: str = "default") -> Dict[str, Any]:
        return self._request("POST", "/api/rag/add-text", json={"text": text, "name": name, "collection": collection})

    def search_rag(self, query: str, top_k: int = 5, collection: str = None) -> List[Dict[str, Any]]:
        return self._request("POST", "/api/rag/search", json={"query": query, "top_k": top_k, "collection": collection})

    def get_rag_stats(self) -> Dict[str, Any]:
        return self._request("GET", "/api/rag/stats")

    def upload_document(self, file_path: str, collection: str = "default") -> Dict[str, Any]:
        import os
        url = f"{self.base_url}/api/rag/upload"
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, "application/octet-stream")}
            resp = self.session.post(url, files=files, data={"collection": collection})
            resp.raise_for_status()
            return resp.json()

    def get_memory_messages(self, session_id: str = None, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        params = {"limit": limit, "offset": offset}
        if session_id:
            params["session_id"] = session_id
        return self._request("GET", "/api/memory/messages", params=params)

    def get_memory_message(self, msg_id: str) -> Dict[str, Any]:
        return self._request("GET", f"/api/memory/messages/{msg_id}")

    def delete_memory_message(self, msg_id: str) -> Dict[str, Any]:
        return self._request("DELETE", f"/api/memory/messages/{msg_id}")

    def clear_memory_messages(self, confirm: bool = False) -> Dict[str, Any]:
        return self._request("DELETE", "/api/memory/messages", json={"confirm": confirm})

    def get_memory_sessions(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/memory/sessions")

    def get_memory_facts(self, session_id: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        params = {"limit": limit}
        if session_id:
            params["session_id"] = session_id
        return self._request("GET", "/api/memory/facts", params=params)

    def add_memory_fact(self, fact: str, source: str = "", importance: str = "normal", session_id: str = "default") -> Dict[str, Any]:
        return self._request("POST", "/api/memory/facts", json={"fact": fact, "source": source, "importance": importance, "session_id": session_id})

    def delete_memory_fact(self, fact_id: str) -> Dict[str, Any]:
        return self._request("DELETE", f"/api/memory/facts/{fact_id}")

    def search_memory(self, query: str, limit: int = 20, session_id: str = None) -> List[Dict[str, Any]]:
        return self._request("POST", "/api/memory/search", json={"query": query, "limit": limit, "session_id": session_id})

    def get_memory_stats(self) -> Dict[str, Any]:
        return self._request("GET", "/api/memory/stats")

    def get_users(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/users")

    def get_user(self, email: str) -> Dict[str, Any]:
        return self._request("GET", f"/api/users/{email}")

    def update_user_role(self, email: str, role: str) -> Dict[str, Any]:
        return self._request("PUT", f"/api/users/{email}", json={"role": role})

    def delete_user(self, email: str) -> Dict[str, Any]:
        return self._request("DELETE", f"/api/users/{email}")

    def get_usage_stats(self) -> Dict[str, Any]:
        return self._request("GET", "/api/usage/stats")

    def clear_usage(self) -> Dict[str, Any]:
        return self._request("POST", "/api/usage/clear")

    def health_check(self) -> Dict[str, Any]:
        return self._request("GET", "/api/status")

    def get_version(self) -> Dict[str, Any]:
        return self._request("GET", "/api/version")

    def get_status(self) -> Dict[str, Any]:
        return self._request("GET", "/api/status")

    def get_device(self) -> Dict[str, Any]:
        return self._request("GET", "/api/device")

    def export_all(self) -> Dict[str, Any]:
        return self._request("GET", "/api/export")

    def import_all(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request("POST", "/api/import", json=data)

    def export_backup(self, path: str) -> Dict[str, Any]:
        import json
        data = self.export_all()
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        return {"status": "ok", "path": path, "providers": len(data.get("providers", [])),
                "facts": len(data.get("facts", [])), "messages": len(data.get("messages", []))}

    def import_backup(self, path: str) -> Dict[str, Any]:
        import json
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return self.import_all(data)

    def get_preference(self, key: str, default: str = "") -> str:
        return self._preferences.get(key, default)

    def set_preference(self, key: str, value: str) -> None:
        self._preferences[key] = value

    def open_folder_picker(self) -> str:
        return ""

    def deploy_proxy_env(self) -> Dict[str, Any]:
        try:
            return self._request("POST", "/api/proxy/deploy")
        except Exception:
            return {"status": "stub", "message": "Deploy endpoint not yet available on server"}

    # ====== QML @Slot camelCase wrappers ======
    @Slot(result='QVariant')
    def getUsage(self):
        return self.get_usage_stats()

    @Slot(result='QVariant')
    def getModelList(self):
        return self.get_model_list()

    @Slot(result='QVariant')
    def getMemoryMessages(self):
        return self.get_memory_messages()

    @Slot(result='QVariant')
    def getMemoryFacts(self):
        return self.get_memory_facts()

    @Slot(result='QVariant')
    def getMemorySessions(self):
        return self.get_memory_sessions()

    @Slot(result='QVariant')
    def getMemoryStats(self):
        return self.get_memory_stats()

    @Slot(str, result='QVariant')
    def searchMemory(self, q):
        return self.search_memory(q)

    @Slot(str, str, str, result='QVariant')
    def addMemoryFact(self, f, s, i):
        return self.add_memory_fact(f, s, i)

    @Slot(str, result='QVariant')
    def deleteMemoryMessage(self, i):
        return self.delete_memory_message(i)

    @Slot(str, result='QVariant')
    def deleteMemoryFact(self, i):
        return self.delete_memory_fact(i)

    @Slot(bool, result='QVariant')
    def clearMemoryMessages(self, c):
        return self.clear_memory_messages(c)

    @Slot(result='QVariant')
    def getRagDocuments(self):
        return self.get_rag_documents()

    @Slot(str, result='QVariant')
    def getRagChunks(self, d):
        return self.get_rag_chunks(d)

    @Slot(result='QVariant')
    def getRagStats(self):
        return self.get_rag_stats()

    @Slot(str, result='QVariant')
    def searchRag(self, q):
        return self.search_rag(q)

    @Slot(str, str, result='QVariant')
    def updateRagChunk(self, i, c):
        return self.update_rag_chunk(i, c)

    @Slot(str, result='QVariant')
    def deleteRagDocument(self, d):
        return self.delete_rag_document(d)

    @Slot(str, str, result='QVariant')
    def activateLicense(self, k, d=""):
        return self.activate_license(k, d)

    @Slot(str, 'QVariant', result='QVariant')
    def updateProvider(self, n, data):
        return self.update_provider(n, data)

    @Slot(str, str, str, str, result='QVariant')
    def addProvider(self, n, u, t, m):
        return self.add_provider(n, u, t, m)

    @Slot(str, str, result='QVariant')
    def changePassword(self, o, n):
        return self.change_password(o, n)

    @Slot(str, result='QVariant')
    def deleteProvider(self, n):
        return self.delete_provider(n)

    @Slot(result='QVariant')
    def listProviders(self):
        return self.list_providers()

    @Slot(result='QVariant')
    def getUsers(self):
        return self.get_users()

    @Slot(result='QVariant')
    def getProviders(self):
        return self.get_providers()

    @Slot(result='QVariant')
    def healthCheck(self):
        return self.health_check()

    @Slot(str, str, result='QVariant')
    def getPreference(self, k, d=""):
        return self.get_preference(k, d)

    @Slot(str, str, result='QVariant')
    def setPreference(self, k, v):
        return self.set_preference(k, v)
