# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.6.x   | :white_check_mark: |

## Reporting a Vulnerability

This is a **local desktop application**. All API keys, credentials, and user data are stored **locally on your machine** and are never sent to any external server except the LLM providers you explicitly configure.

### What's Protected

- **API keys** stored in local SQLite database (`providers.db`) — never exposed to the network
- **User credentials** stored in local SQLite database (`auth.db`) using PBKDF2-HMAC-SHA256 with a per-user random salt — never transmitted
- **Documents & memory** stored in local SQLite databases — never sent externally
- **All data stays on your machine** — zero telemetry, zero analytics, zero external calls

### Best Practices

1. Never commit `providers.db`, `rag.db`, or `memory.db` to version control (they are in `.gitignore`)
2. Never commit `.env` files with real keys (`.env.example` is safe)
3. Use the `OLLAMA_EMU_API_KEY` environment variable instead of the web UI for CI/CD environments
4. Regularly clear usage logs in the Usage page if you handle sensitive queries
5. The server binds to `127.0.0.1:11434` by default (restricted CORS). Pass `--host 0.0.0.0` to expose it on your LAN — only do this on a trusted network, as it opens CORS to all origins

### Reporting

If you discover a security issue, please do NOT open a public GitHub issue. Instead, report it privately.

Contact: Open a GitHub issue with the label `security` for non-critical issues, or reach out via the repository's security advisory feature.
