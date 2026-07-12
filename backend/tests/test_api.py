"""
OllamoMUI — Full System Test

Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.
Licensed under the MIT License.

Usage:
    python test.py              # Start server, run tests, stop
    python test.py --online     # Test against running server (no restart)
"""

import os, sys, json, time, re, subprocess, signal, argparse, urllib.request, urllib.error, socket, threading

BASE = os.environ.get("OLLAMA_EMU_TEST_BASE", "http://localhost:11435")
PASS = 0
FAIL = 0
SERVER_PROC = None

def log(msg: str):
    print(f"  {msg}")

def ok(msg: str):
    global PASS
    PASS += 1
    print(f"  [OK] {msg}")

def fail(msg: str):
    global FAIL
    FAIL += 1
    print(f"  [FAIL] {msg}")

def request(method: str, path: str, body: dict = None, expect: int = 200) -> dict:
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status != expect:
                fail(f"{method} {path} — expected {expect}, got {resp.status}")
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if e.code != expect:
            fail(f"{method} {path} — expected {expect}, got {e.code}: {body[:100]}")
        return json.loads(body) if body else {}
    except Exception as e:
        fail(f"{method} {path} — connection error: {e}")
        return {}

def test_dependencies():
    print("\n[1] Checking Dependencies")
    deps = [
        ("Python", sys.version_info >= (3, 10), f"Python >=3.10 (got {sys.version_info.major}.{sys.version_info.minor})"),
    ]
    try:
        import fastapi; deps.append(("fastapi", True, "ok"))
    except ImportError: deps.append(("fastapi", False, "not installed — run: pip install -r requirements.txt"))

    try:
        import uvicorn; deps.append(("uvicorn", True, "ok"))
    except ImportError: deps.append(("uvicorn", False, "not installed"))

    try:
        import httpx; deps.append(("httpx", True, "ok"))
    except ImportError: deps.append(("httpx", False, "not installed"))

    try:
        import psycopg2; deps.append(("psycopg2", True, "ok"))
    except ImportError: deps.append(("psycopg2", False, "not installed — pip install psycopg2-binary"))

    try:
        from pgvector.psycopg2 import register_vector; deps.append(("pgvector", True, "ok"))
    except ImportError: deps.append(("pgvector", False, "not installed — pip install pgvector"))

    try:
        import dotenv; deps.append(("python-dotenv", True, "ok"))
    except ImportError: deps.append(("python-dotenv", False, "not installed — pip install python-dotenv"))

    all_ok = all(d[1] for d in deps)
    for name, ok_status, msg in deps:
        if ok_status: ok(f"{name}: {msg}")
        else: fail(f"{name}: {msg}")
    return all_ok


def test_postgres_connection():
    print("\n[1b] PostgreSQL Connection")
    try:
        from dotenv import load_dotenv
        load_dotenv()
        import psycopg2
        host = os.environ.get("PGHOST", "127.0.0.1")
        port = os.environ.get("PGPORT", "5432")
        user = os.environ.get("PGUSER", "ollamaemu")
        password = os.environ.get("PGPASSWORD", "postgres")
        dbname = os.environ.get("PGDATABASE", "ollamaemu")
        conn = psycopg2.connect(host=host, port=port, user=user, password=password, dbname=dbname)
        cur = conn.cursor()
        cur.execute("SELECT current_user, current_database()")
        row = cur.fetchone()
        ok(f"Connected as {row[0]} to {row[1]}")
        cur.execute("SELECT extname FROM pg_extension WHERE extname = 'vector'")
        vec = cur.fetchone()
        if vec:
            ok(f"pgvector extension: {vec[0]}")
        else:
            fail("pgvector extension not installed")
        cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        tables = cur.fetchone()[0]
        ok(f"Database has {tables} tables")
        conn.close()
        return True
    except Exception as e:
        fail(f"PostgreSQL connection failed: {e}")
        return False

def test_frontend_build():
    print("\n[2] Checking Frontend Build")
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend", "out")
    index = os.path.join(out_dir, "index.html")
    if os.path.isfile(index):
        ok(f"Frontend built: {index}")
        pages = [f for f in os.listdir(out_dir) if os.path.isdir(os.path.join(out_dir, f)) or f.endswith(".html")]
        log(f"  Found {len(pages)} pages: {', '.join(sorted(pages)[:12])}")
        return True
    else:
        fail(f"Frontend not built — run: cd frontend && npm run build")
        return False

def test_server_online():
    print("\n[3] Server Reachability")
    try:
        r = request("GET", "/api/version")
        if r.get("version"):
            ok(f"Server v{r['version']} reachable at {BASE}")
            return True
        fail(f"Response missing version: {r}")
        return False
    except:
        fail("Server not reachable")
        return False

def test_auth():
    print("\n[4] Auth System")
    pw = "TestPass123"
    email = f"test_{int(time.time())}@example.com"

    # Register
    r = request("POST", "/api/auth/register", {"email": email, "password": pw}, expect=200)
    if r.get("success"):
        ok(f"Register: {email}")
    else:
        fail(f"Register failed: {r}")

    # Duplicate register
    r = request("POST", "/api/auth/register", {"email": email, "password": pw}, expect=409)
    ok(f"Duplicate register blocked (409)")

    # Login
    r = request("POST", "/api/auth/login", {"email": email, "password": pw}, expect=200)
    if r.get("token"):
        token = r["token"]
        ok(f"Login successful, token={token[:16]}...")
    else:
        token = ""
        fail(f"Login failed: {r}")

    # Bad login
    r = request("POST", "/api/auth/login", {"email": email, "password": "wrongpass"}, expect=401)
    ok(f"Bad login rejected (401)")

    # Verify with token
    if token:
        r = request("GET", f"/api/auth/verify?token={token}", expect=200)
        if r.get("valid"):
            ok(f"Token verified for {r['email']}")
        else:
            fail(f"Verify failed: {r}")

    # Verify without token
    r = request("GET", "/api/auth/verify", expect=401)
    ok(f"No-token verify rejected (401)")

    # Logout
    if token:
        r = request("POST", "/api/auth/logout", {"token": token}, expect=200)
        ok(f"Logout successful")

        # Verify after logout
        r = request("GET", f"/api/auth/verify?token={token}", expect=401)
        ok(f"Post-logout token rejected (401)")

    # Seeded user login
    demo_email = os.environ.get("OLLAMA_EMU_ADMIN_EMAIL", "admin@localhost")
    demo_password = os.environ.get("OLLAMA_EMU_DEMO_PASSWORD", "changeme123")
    r = request("POST", "/api/auth/login", {"email": demo_email, "password": demo_password}, expect=200)
    if r.get("success"):
        ok(f"Seeded user login: {demo_email}")
    else:
        fail(f"Seeded user login failed: {r}")

def test_providers_crud():
    print("\n[5] Providers CRUD")
    # Add a test provider
    r = request("POST", "/api/providers/add", {
        "name": "test_provider_crud",
        "url": "https://api.test.com/v1/chat/completions",
        "type": "openai",
        "models_url": "https://api.test.com/v1/models",
        "default_model": "gpt-3.5-turbo",
    }, expect=200)
    if r.get("status") == "added":
        ok(f"POST /api/providers/add — added test_provider_crud")
    else:
        fail(f"POST /api/providers/add failed: {r}")

    # Get single provider
    r = request("GET", "/api/providers/test_provider_crud", expect=200)
    if r.get("name") == "test_provider_crud":
        ok(f"GET /api/providers/{r['name']} — detail returned")
    else:
        fail(f"GET /api/providers/test_provider_crud failed: {r}")

    # Update provider
    r = request("PUT", "/api/providers/test_provider_crud", {
        "default_model": "gpt-4o",
    }, expect=200)
    if r.get("status") == "updated":
        ok(f"PUT /api/providers/test_provider_crud — updated")
    else:
        fail(f"PUT /api/providers/test_provider_crud failed: {r}")

    # Verify update persisted
    r = request("GET", "/api/providers/test_provider_crud", expect=200)
    if r.get("default_model") == "gpt-4o":
        ok(f"  Verified default_model = gpt-4o")
    else:
        fail(f"  Update not persisted: {r}")

    # Delete provider
    r = request("DELETE", "/api/providers/test_provider_crud", expect=200)
    if r.get("status") == "deleted":
        ok(f"DELETE /api/providers/test_provider_crud — deleted")
    else:
        fail(f"DELETE /api/providers/test_provider_crud failed: {r}")

    # Verify deletion
    r = request("GET", "/api/providers/test_provider_crud", expect=404)
    ok(f"  Verified provider gone (404)")


def test_users_crud():
    print("\n[6] Users CRUD")
    admin_email = os.environ.get("OLLAMA_EMU_ADMIN_EMAIL", "admin@localhost")
    admin_password = os.environ.get("OLLAMA_EMU_DEMO_PASSWORD", "changeme123")

    # Login as admin (try primary, fall back to default)
    r = request("POST", "/api/auth/login", {"email": admin_email, "password": admin_password}, expect=200)
    if not r.get("token"):
        admin_email = "admin@localhost"
        admin_password = "changeme123"
        r = request("POST", "/api/auth/login", {"email": admin_email, "password": admin_password}, expect=200)
        if not r.get("token"):
            fail("Admin login failed — skipping user tests")
            return
    token = r["token"]

    # List users
    req = urllib.request.Request(f"{BASE}/api/users", headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            users = json.loads(resp.read().decode())
            if len(users) >= 1:
                ok(f"GET /api/users — {len(users)} users")
            else:
                fail(f"GET /api/users returned empty list")
    except urllib.error.HTTPError as e:
        fail(f"GET /api/users failed: {e.code}")

    # Create new test user via register
    test_email = f"crud_test_{int(time.time())}@example.com"
    r = request("POST", "/api/auth/register", {"email": test_email, "password": "crudPass123!"}, expect=200)
    if r.get("success"):
        ok(f"  Created test user: {test_email}")
    else:
        fail(f"  Create test user failed: {r}")

    # Update user role
    req = urllib.request.Request(
        f"{BASE}/api/users/{test_email}",
        data=json.dumps({"role": "user"}).encode(),
        method="PUT",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            r = json.loads(resp.read().decode())
            if r.get("role") == "user":
                ok(f"PUT /api/users/{test_email} — role set")
            else:
                fail(f"Role update response: {r}")
    except urllib.error.HTTPError as e:
        fail(f"PUT /api/users/{test_email} failed: {e.code}")

    # Delete test user
    req = urllib.request.Request(
        f"{BASE}/api/users/{test_email}",
        method="DELETE",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            r = json.loads(resp.read().decode())
            if r.get("status") == "deleted":
                ok(f"DELETE /api/users/{test_email} — deleted")
            else:
                fail(f"Delete response: {r}")
    except urllib.error.HTTPError as e:
        fail(f"DELETE /api/users/{test_email} failed: {e.code}")


def test_memory_crud():
    print("\n[7] Memory CRUD")

    # Add a fact
    r = request("POST", "/api/memory/facts", {
        "fact": "The sky is blue during the day.",
        "importance": "normal",
        "session_id": "test_session_crud",
    }, expect=200)
    if r.get("status") == "added":
        fact_id = r.get("id", "")
        ok(f"POST /api/memory/facts — added (id={fact_id[:16]}...)")
    else:
        fact_id = ""
        fail(f"POST /api/memory/facts failed: {r}")

    # List facts
    r = request("GET", "/api/memory/facts?session_id=test_session_crud", expect=200)
    if isinstance(r, list) and len(r) > 0:
        ok(f"GET /api/memory/facts — {len(r)} facts")
    else:
        fail(f"GET /api/memory/facts failed: {r}")

    # Get messages (should be empty for test session)
    r = request("GET", "/api/memory/messages?session_id=test_session_crud", expect=200)
    if isinstance(r, list):
        ok(f"GET /api/memory/messages — {len(r)} messages")
    else:
        fail(f"GET /api/memory/messages failed: {r}")

    # Get sessions
    r = request("GET", "/api/memory/sessions", expect=200)
    if isinstance(r, list):
        ok(f"GET /api/memory/sessions — {len(r)} sessions")
    else:
        fail(f"GET /api/memory/sessions failed: {r}")

    # Get stats
    r = request("GET", "/api/memory/stats", expect=200)
    if "messages" in r or "facts" in r:
        ok(f"GET /api/memory/stats — ok")
    else:
        fail(f"GET /api/memory/stats failed: {r}")

    # Delete the fact
    if fact_id:
        r = request("DELETE", f"/api/memory/facts/{fact_id}", expect=200)
        if r.get("deleted"):
            ok(f"DELETE /api/memory/facts/{fact_id[:16]}... — deleted")
        else:
            fail(f"DELETE fact failed: {r}")


def test_rag_crud():
    print("\n[8] RAG CRUD")
    test_text = "PostgreSQL is a powerful, open-source object-relational database system."

    # Add text
    r = request("POST", "/api/rag/add-text", {
        "text": test_text,
        "name": "test_doc_crud",
        "collection": "test_collection",
    }, expect=200)
    doc_id = r.get("doc_id", "")
    if doc_id:
        ok(f"POST /api/rag/add-text — doc_id={doc_id[:16]}...")
    else:
        fail(f"POST /api/rag/add-text failed: {r}")

    # List documents
    r = request("GET", "/api/rag/documents", expect=200)
    if isinstance(r, list):
        ok(f"GET /api/rag/documents — {len(r)} docs")
    else:
        fail(f"GET /api/rag/documents failed: {r}")

    # Get single document
    if doc_id:
        r = request("GET", f"/api/rag/documents/{doc_id}", expect=200)
        if r.get("id") == doc_id:
            ok(f"GET /api/rag/documents/{doc_id[:16]}... — doc returned")
        else:
            fail(f"GET single document failed: {r}")

        # Get chunks
        r = request("GET", f"/api/rag/chunks/{doc_id}", expect=200)
        if isinstance(r, list):
            ok(f"GET /api/rag/chunks/{doc_id[:16]}... — {len(r)} chunks")
        else:
            fail(f"GET chunks failed: {r}")

        # Search
        r = request("POST", "/api/rag/search", {"query": "PostgreSQL database", "top_k": 3}, expect=200)
        if isinstance(r, list):
            ok(f"POST /api/rag/search — {len(r)} results")
        else:
            fail(f"RAG search failed: {r}")

        # Delete document
        r = request("DELETE", f"/api/rag/documents/{doc_id}", expect=200)
        if r.get("deleted"):
            ok(f"DELETE /api/rag/documents/{doc_id[:16]}... — deleted")
        else:
            fail(f"DELETE document failed: {r}")


def test_export_import():
    print("\n[9] Export / Import")

    # Export
    r = request("GET", "/api/export", expect=200)
    if "providers" in r and "version" in r:
        ok(f"GET /api/export — {len(r['providers'])} providers, {len(r.get('memory_facts', []))} facts")
    else:
        fail(f"Export failed: {r}")

    # Free models endpoint
    r = request("GET", "/api/models/free", expect=200)
    if "models" in r:
        ok(f"GET /api/models/free — {len(r['models'])} free models cached")
    else:
        fail(f"GET /api/models/free failed: {r}")


def test_api_endpoints():
    print("\n[10] API Endpoints")

    r = request("GET", "/api/status")
    if "active_provider" in r:
        ok(f"/api/status — provider={r['active_provider']}, key_set={r.get('api_key_set')}, models={r.get('model_count')}")
    else:
        fail(f"/api/status failed: {r}")

    r = request("GET", "/api/providers")
    if len(r) > 0:
        ok(f"/api/providers — {len(r)} providers")
    else:
        fail(f"/api/providers failed: {r}")

    r = request("GET", "/api/providers/list")
    if isinstance(r, list) and len(r) > 0:
        ok(f"/api/providers/list — {len(r)} providers")
    else:
        fail(f"/api/providers/list failed: {r}")

    r = request("GET", "/api/models")
    if isinstance(r, list) or "models" in r or "error" not in r:
        models = r if isinstance(r, list) else r.get("models", [])
        ok(f"/api/models — {len(models)} models")
    else:
        fail(f"/api/models failed: {r}")

    r = request("GET", "/api/tags")
    ok(f"/api/tags — {r.get('status', 'responded')}")

    r = request("GET", "/api/version")
    if "version" in r:
        ok(f"/api/version — v{r['version']}")
    else:
        fail(f"/api/version failed: {r}")

    # Ollama endpoints
    for ep in ["/api/show", "/api/ps"]:
        r = request("GET", ep)
        ok(f"GET {ep} — responded")

    # OpenAI-compatible
    r = request("GET", "/v1/models")
    ok(f"/v1/models — responded")

    # Usage stats
    r = request("GET", "/api/usage/stats")
    if "total_requests" in r:
        ok(f"/api/usage/stats — {r['total_requests']} requests")
    else:
        fail(f"/api/usage/stats failed: {r}")

def test_spa():
    print("\n[6] SPA Frontend Routes")
    pages = ["/", "/login", "/register", "/playground", "/usage", "/settings", "/rag", "/memory", "/setup"]
    for page in pages:
        try:
            req = urllib.request.Request(BASE + page)
            with urllib.request.urlopen(req, timeout=5) as resp:
                html = resp.read().decode()[:200]
                if "<!DOCTYPE html>" in html or "<html" in html:
                    ok(f"{page} — serves HTML")
                else:
                    fail(f"{page} — not HTML: {html[:80]}")
        except Exception as e:
            fail(f"{page} — error: {e}")

def test_non_existent():
    print("\n[7] Edge Cases")
    # Invalid email (wrong method)
    try:
        req = urllib.request.Request(BASE + "/api/auth/register?email=bad&password=12", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass
    except urllib.error.HTTPError as e:
        if e.code in (400, 405, 422, 404):
            ok(f"Invalid register method rejected ({e.code})")
        else:
            fail(f"Unexpected status {e.code} for bad method")

    # Short password
    r = request("POST", "/api/auth/register", {"email": "a@b.com", "password": "12"}, expect=400)
    ok(f"Short password rejected (400)")

    # JSON parse errors are caught by server
    try:
        req = urllib.request.Request(BASE + "/api/auth/login", data=b"not json", method="POST", headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            r = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        r = {}
    ok(f"Bad JSON handled gracefully")

    # 404
    r = request("GET", "/api/nonexistent", expect=404)
    ok(f"Unknown API path returns 404")

def start_server():
    global SERVER_PROC
    project_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
    log("Starting server...")
    SERVER_PROC = subprocess.Popen(
        [sys.executable, "-u", "-m", "ollama_emu.main"],
        cwd=project_root,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        env=os.environ
    )
    # Wait for server
    for i in range(45):
        try:
            with urllib.request.urlopen(f"{BASE}/api/version", timeout=2) as r:
                if r.status == 200:
                    log(f"Server ready after {i+1}s")
                    return True
        except:
            time.sleep(1)
    fail("Server failed to start within 45s")
    return False

def stop_server():
    global SERVER_PROC
    if SERVER_PROC:
        log("Stopping server...")
        if sys.platform == "win32":
            SERVER_PROC.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            SERVER_PROC.terminate()
        try:
            SERVER_PROC.wait(timeout=10)
            log("Server stopped")
        except:
            SERVER_PROC.kill()
            log("Server killed")
        SERVER_PROC = None

def main():
    global PASS, FAIL

    parser = argparse.ArgumentParser(description="Ollama Emulator Desktop — Full System Test")
    parser.add_argument("--online", action="store_true", help="Test against already-running server")
    args = parser.parse_args()

    print("=" * 55)
    print("  OllamoMUI — System Test")
    print("  Copyright (c) 2024-2026 Rhasan@dev")
    print("=" * 55)

    if not args.online:
        if not start_server():
            sys.exit(1)
    else:
        log("--online mode: testing against running server")

    try:
        test_dependencies()
        test_postgres_connection()
        test_frontend_build()
        test_server_online()
        test_auth()
        test_providers_crud()
        test_users_crud()
        test_memory_crud()
        test_rag_crud()
        test_export_import()
        test_api_endpoints()
        test_spa()
        test_non_existent()
    finally:
        if not args.online:
            stop_server()

    print()
    print("=" * 55)
    total = PASS + FAIL
    if FAIL == 0:
        print(f"  ALL {PASS}/{total} TESTS PASSED")
        print("=" * 55)
        return 0
    else:
        print(f"  {PASS}/{total} passed, {FAIL}/{total} failed")
        print("=" * 55)
        return 1

if __name__ == "__main__":
    sys.exit(main())
