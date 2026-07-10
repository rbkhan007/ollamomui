"""
ollamaemu — command line interface (drop-in style for `ollama`).

Routes to the local Ollama Emulator server (default http://localhost:11434).
Usable by CLI coding agents exactly like `ollama`, e.g.:

    ollamaemu serve                 # start the proxy server
    ollamaemu run llama3 "hello"    # chat (streams)
    ollamaemu list                  # list available models
    ollamaemu pull <model>          # register / pull a model
    ollamaemu ps                    # show server status
    ollamaemu version               # print version

Set OLLAMA_EMU_URL to point at a different server.
"""
import os
import sys
import json
import argparse
import httpx

BASE = os.environ.get("OLLAMA_EMU_URL", "http://localhost:11434").rstrip("/")
VERSION = "0.6.0"


def _get(path: str, params: dict | None = None):
    return httpx.get(f"{BASE}{path}", params=params, timeout=30)


def _post(path: str, json_body: dict | None = None):
    return httpx.post(f"{BASE}{path}", json=json_body, timeout=60)


def cmd_serve(args):
    import uvicorn
    import ollama_emu_desktop

    host = args.host
    port = args.port
    ollama_emu_desktop.BIND_HOST = host
    ollama_emu_desktop.BIND_PORT = port
    ollama_emu_desktop.configure_cors(ollama_emu_desktop.app)
    if host not in ("127.0.0.1", "localhost", "::1"):
        print(f"[warning] Binding to {host} exposes the server on the LAN with open CORS.", file=sys.stderr)
    uvicorn.run(ollama_emu_desktop.app, host=host, port=port)


def cmd_run(args):
    payload = {
        "model": args.model,
        "messages": [{"role": "user", "content": args.prompt or ""}],
        "stream": True,
    }
    try:
        with _post("/api/chat", payload) as r:
            r.raise_for_status()
            for line in r.iter_lines():
                if not line.strip():
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                msg = obj.get("message", {})
                content = msg.get("content", "")
                if content:
                    sys.stdout.write(content)
                    sys.stdout.flush()
                if obj.get("done"):
                    break
        sys.stdout.write("\n")
    except httpx.HTTPError as e:
        print(f"error: cannot reach server at {BASE}: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_list(_args):
    try:
        res = _get("/api/tags")
        res.raise_for_status()
        models = res.json().get("models", [])
        if not models:
            print("no models cached yet")
            return
        for m in models:
            print(f"{m.get('name', m.get('model', '?'))}")
    except httpx.HTTPError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_pull(args):
    try:
        res = _post("/api/pull", {"model": args.model, "stream": False})
        try:
            print(res.json().get("status", res.text))
        except Exception:
            print("pull accepted" if res.status_code < 400 else f"pull failed: {res.status_code}")
    except httpx.HTTPError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_ps(_args):
    try:
        res = _get("/api/status")
        res.raise_for_status()
        print(json.dumps(res.json(), indent=2))
    except httpx.HTTPError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_version(_args):
    print(f"ollamaemu version {VERSION}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="ollamaemu", description="Ollama Emulator CLI")
    sub = p.add_subparsers(dest="command")

    serve = sub.add_parser("serve", help="Start the proxy server")
    serve.add_argument("--host", default=os.environ.get("OLLAMA_EMU_BIND", "127.0.0.1"),
                       help="Bind host (default 127.0.0.1; use 0.0.0.0 for LAN)")
    serve.add_argument("--port", type=int, default=int(os.environ.get("OLLAMA_EMU_PORT", "11434")),
                       help="Bind port (default 11434)")
    serve.set_defaults(func=cmd_serve)

    run = sub.add_parser("run", help="Run a model (chat, streams)")
    run.add_argument("model")
    run.add_argument("prompt", nargs="?", default="")
    run.set_defaults(func=cmd_run)

    sub.add_parser("list", help="List models").set_defaults(func=cmd_list)
    sub.add_parser("ls", help="List models").set_defaults(func=cmd_list)

    pull = sub.add_parser("pull", help="Pull / register a model")
    pull.add_argument("model")
    pull.set_defaults(func=cmd_pull)

    sub.add_parser("ps", help="Show server status").set_defaults(func=cmd_ps)
    sub.add_parser("version", help="Print version").set_defaults(func=cmd_version)

    return p


def main():
    parser = build_parser()
    args = parser.parse_args()
    if not getattr(args, "command", None):
        parser.print_help()
        sys.exit(1)
    args.func(args)


if __name__ == "__main__":
    main()
