import requests
from typing import Optional, Dict, Any, List, Generator, Callable


class ApiClient:
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self._token: Optional[str] = None
        self._preferences: Dict[str, str] = {}

    # ── Token ──────────────────────────────────────────────
    @property
    def token(self):
        return self._token

    @token.setter
    def token(self, value: Optional[str]):
        self._token = value
        if value:
            self.session.headers.update({"Authorization": f"Bearer {value}"})
        else:
            self.session.headers.pop("Authorization", None)

    def _request(self, method: str, path: str, **kwargs) -> Any:
        url = f"{self.base_url}{path}"
        resp = self.session.request(method, url, timeout=30, **kwargs)
        resp.raise_for_status()
        return resp.json()

    # ── Auth ──────────────────────────────────────────────
    def login(self, email: str, password: str) -> Dict[str, Any]:
        result = self._request("POST", "/api/auth/login", json={"email": email, "password": password})
        self.token = result.get("token")
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

    # ── Providers ─────────────────────────────────────────
    def get_providers(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/providers")

    def list_providers(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/providers/list")

    def get_provider(self, name: str) -> Dict[str, Any]:
        return self._request("GET", f"/api/providers/{name}")

    def add_provider(self, name: str, url: str, provider_type: str, models_url: str = "",
                     auth_type: str = "bearer", default_model: str = "",
                     free_heuristic: bool = False, api_key: str = "") -> Dict[str, Any]:
        return self._request("POST", "/api/providers/add", json={
            "name": name, "url": url, "type": provider_type, "models_url": models_url,
            "auth_type": auth_type, "default_model": default_model,
            "free_heuristic": free_heuristic, "api_key": api_key,
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

    # ── Models ────────────────────────────────────────────
    def get_models(self) -> Dict[str, Any]:
        return self._request("GET", "/api/models")

    def get_model_list(self) -> List[Dict[str, Any]]:
        result = self.get_models()
        return result.get("models", [])

    def get_free_models(self) -> Dict[str, Any]:
        return self._request("GET", "/api/models/free")

    # ── Chat ──────────────────────────────────────────────
    def chat_completion(self, model: str, messages: List[Dict[str, str]], stream: bool = False) -> Any:
        payload = {"model": model, "messages": messages, "stream": stream}
        if stream:
            resp = self.session.post(f"{self.base_url}/v1/chat/completions", json=payload, stream=True, timeout=60)
            resp.raise_for_status()
            return self._stream_lines(resp)
        resp = self.session.post(f"{self.base_url}/v1/chat/completions", json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json()

    def _stream_lines(self, resp: requests.Response) -> Generator[str, None, None]:
        for line in resp.iter_lines(decode_unicode=True):
            if line:
                if line.startswith("data: "):
                    data = line[6:]
                    if data.strip() == "[DONE]":
                        break
                    yield data

    # ── RAG ───────────────────────────────────────────────
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

    # ── Memory ────────────────────────────────────────────
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

    # ── Users ─────────────────────────────────────────────
    def get_users(self) -> List[Dict[str, Any]]:
        return self._request("GET", "/api/users")

    def get_user(self, email: str) -> Dict[str, Any]:
        return self._request("GET", f"/api/users/{email}")

    def update_user_role(self, email: str, role: str) -> Dict[str, Any]:
        return self._request("PUT", f"/api/users/{email}", json={"role": role})

    def delete_user(self, email: str) -> Dict[str, Any]:
        return self._request("DELETE", f"/api/users/{email}")

    # ── Usage ─────────────────────────────────────────────
    def get_usage_stats(self) -> Dict[str, Any]:
        return self._request("GET", "/api/usage/stats")

    def clear_usage(self) -> Dict[str, Any]:
        return self._request("POST", "/api/usage/clear")

    # ── System ────────────────────────────────────────────
    def health_check(self) -> Dict[str, Any]:
        return self._request("GET", "/api/status")

    def get_version(self) -> Dict[str, Any]:
        return self._request("GET", "/api/version")

    def get_status(self) -> Dict[str, Any]:
        return self._request("GET", "/api/status")

    def get_device(self) -> Dict[str, Any]:
        return self._request("GET", "/api/device")

    # ── Export / Import ───────────────────────────────────
    def export_all(self) -> Dict[str, Any]:
        return self._request("GET", "/api/export")

    def import_all(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request("POST", "/api/import", json=data)

    # ── Preferences (client-side) ─────────────────────────
    def get_preference(self, key: str, default: str = "") -> str:
        return self._preferences.get(key, default)

    def set_preference(self, key: str, value: str) -> None:
        self._preferences[key] = value

    # ── Folder picker (stub – real integration uses QML) ─
    def open_folder_picker(self) -> str:
        return ""

    # ── Deploy proxy environment ──────────────────────────
    def deploy_proxy_env(self) -> Dict[str, Any]:
        try:
            return self._request("POST", "/api/proxy/deploy")
        except Exception:
            return {"status": "stub", "message": "Deploy endpoint not yet available on server"}

    # ═══════════════════════════════════════════════════════
    # CamelCase aliases for QML compatibility
    # ═══════════════════════════════════════════════════════
    # Auth
    changePassword = change_password
    verifyToken = verify_token
    autoDetectKey = auto_detect_key

    # Providers
    listProviders = list_providers
    getProviders = get_providers
    getProvider = get_provider
    addProvider = add_provider
    updateProvider = update_provider
    deleteProvider = delete_provider
    activateProvider = activate_provider
    saveConfig = save_config

    # Models
    getModels = get_models
    getModelList = get_model_list
    getFreeModels = get_free_models

    # Chat
    chatCompletion = chat_completion

    # RAG
    getRagDocuments = get_rag_documents
    getRagDocument = get_rag_document
    getRagChunks = get_rag_chunks
    updateRagChunk = update_rag_chunk
    deleteRagDocument = delete_rag_document
    addRagText = add_rag_text
    searchRag = search_rag
    getRagStats = get_rag_stats
    uploadDocument = upload_document

    # Memory
    getMemoryMessages = get_memory_messages
    getMemoryMessage = get_memory_message
    deleteMemoryMessage = delete_memory_message
    clearMemoryMessages = clear_memory_messages
    getMemorySessions = get_memory_sessions
    getMemoryFacts = get_memory_facts
    addMemoryFact = add_memory_fact
    deleteMemoryFact = delete_memory_fact
    searchMemory = search_memory
    getMemoryStats = get_memory_stats

    # Users
    getUsers = get_users
    getUser = get_user
    updateUserRole = update_user_role
    deleteUser = delete_user

    # Usage
    getUsage = get_usage_stats
    getUsageStats = get_usage_stats
    clearUsage = clear_usage

    # System
    getVersion = get_version
    getStatus = get_status
    getDevice = get_device
    healthCheck = health_check

    # Export/Import
    exportAll = export_all
    importAll = import_all

    # Preferences
    setPreference = set_preference
    getPreference = get_preference

    # Folder / Deploy
    openFolderPicker = open_folder_picker
    deployProxyEnv = deploy_proxy_env
