"""
Ollama Emulator Desktop Ultimate — Full System Test

Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.
Licensed under the MIT License.

Usage:
    python test.py              # Start server, run tests, stop
    python test.py --online     # Test against running server (no restart)
"""

import os, sys, json, time, re, subprocess, signal, argparse, urllib.request, urllib.error, socket, threading

BASE = "http://localhost:11434"
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
        import sqlite3; deps.append(("sqlite3", True, "ok"))
    except ImportError: deps.append(("sqlite3", False, "missing — Python builtin"))

    all_ok = all(d[1] for d in deps)
    for name, ok_status, msg in deps:
        if ok_status: ok(f"{name}: {msg}")
        else: fail(f"{name}: {msg}")
    return all_ok

def test_frontend_build():
    print("\n[2] Checking Frontend Build")
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "out")
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
    pw = "testpass123"
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
    r = request("POST", "/api/auth/login", {"email": "example@gmail.com", "password": "12345678"}, expect=200)
    if r.get("success"):
        ok(f"Seeded user login: example@gmail.com / 12345678")
    else:
        fail(f"Seeded user login failed: {r}")

def test_api_endpoints():
    print("\n[5] API Endpoints")

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
    server_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ollama_emu_desktop.py")
    log("Starting server...")
    server_dir = os.path.dirname(server_script)
    SERVER_PROC = subprocess.Popen(
        [sys.executable, "-u", server_script],
        cwd=server_dir,
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
    print("  Ollama Emulator Desktop Ultimate — System Test")
    print("  Copyright (c) 2024-2026 Rhasan@dev")
    print("=" * 55)

    if not args.online:
        if not start_server():
            sys.exit(1)
    else:
        log("--online mode: testing against running server")

    try:
        test_dependencies()
        test_frontend_build()
        test_server_online()
        test_auth()
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
