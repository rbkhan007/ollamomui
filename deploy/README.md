# OllamoMUI – Production Deployment Guide

## Prerequisites

- Domain names: `ollamomui.com` (frontend), `api.ollamomui.com` (backend)
- GitHub account (for frontend hosting via Pages)
- PostgreSQL 17 with pgvector (use NeonDB, Supabase, or self-hosted)
- SSLCommerz merchant account (sandbox or live)
- SMTP credentials (Gmail app password works)

---

## Option A: Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/rbkhan007/ollamomui.git
cd ollamomui

# 2. Create .env with your production values
cp .env.production .env
# Edit .env with your secrets

# 3. Start everything
docker compose up -d

# 4. Verify
curl http://localhost:11434/api/version
```

The `docker-compose.yml` starts both PostgreSQL (pgvector) and the backend.
The frontend should be deployed separately (see Option B or C below).

---

## Option B: Render (Easiest)

### Backend

1. Create a **Web Service** on Render.
2. Connect your GitHub repo.
3. Set:
   - **Root Directory**: (leave blank)
   - **Build Command**: `pip install -e .`
   - **Start Command**: `ollamomui serve --host 0.0.0.0 --port 10000`
4. Add environment variables from `.env.production`.
5. Add a **PostgreSQL** database (Render provides one — enable the `pgvector` extension manually).

### Frontend

1. Deploy the `/frontend` folder to **Vercel** (or **Cloudflare Pages**).
2. Set `NEXT_PUBLIC_API_BASE` to your backend URL.
3. Set `NEXT_PUBLIC_STRIPE_*` vars for pricing links.
4. Connect custom domain `ollamomui.com`.

---

## Option C: VPS Manual Setup

### 1. Provision a VPS

Ubuntu 22.04+, 2GB RAM minimum, 4GB recommended.

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.12 python3.12-venv nginx certbot python3-certbot-nginx postgresql postgresql-client git curl

# Install pgvector
sudo apt install -y postgresql-17-pgvector
```

### 2. Database Setup

```bash
sudo -u postgres psql -c "CREATE USER ollamaemu WITH PASSWORD 'your-strong-password';"
sudo -u postgres psql -c "CREATE DATABASE ollamaemu OWNER ollamaemu;"
sudo -u postgres psql -d ollamaemu -c "CREATE EXTENSION IF NOT EXISTS vector;"
sudo -u postgres psql -d ollamaemu -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
sudo -u postgres psql -d ollamaemu -f configs/setup_database.sql
```

### 3. Deploy Backend

```bash
# Clone and setup
git clone https://github.com/rbkhan007/ollamomui.git /opt/ollamomui
cd /opt/ollamomui
python3.12 -m venv venv
source venv/bin/activate
pip install -e .

# Copy env
cp .env.production .env
# Edit .env with your values

# Create systemd service
sudo tee /etc/systemd/system/ollamomui.service << 'EOF'
[Unit]
Description=OllamoMUI AI Gateway
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ollamomui
Environment=PATH=/opt/ollamomui/venv/bin
ExecStart=/opt/ollamomui/venv/bin/ollamomui serve --host 127.0.0.1 --port 11434
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now ollamomui
```

### 4. Deploy Frontend

```bash
cd /opt/ollamomui/frontend
npm install
npm run build
sudo mkdir -p /var/www/ollamomui
sudo cp -r out/* /var/www/ollamomui/
sudo chown -R www-data:www-data /var/www/ollamomui
```

### 5. Set Up Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/ollamomui
sudo ln -s /etc/nginx/sites-available/ollamomui /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. SSL Certificates

```bash
sudo certbot --nginx -d ollamomui.com -d api.ollamomui.com
```

### 7. Verify

```bash
curl https://api.ollamomui.com/api/version
curl https://ollamomui.com
```

---

## Custom Domain Setup

| Record | Type | Value |
|--------|------|-------|
| `ollamomui.com` | A | `185.199.108.153` (GitHub Pages) |
| `ollamomui.com` | A | `185.199.109.153` |
| `ollamomui.com` | A | `185.199.110.153` |
| `ollamomui.com` | A | `185.199.111.153` |
| `api.ollamomui.com` | A | `<your-vps-ip>` |

For Vercel: use their provided CNAME target instead of A records.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PGHOST` | ✅ | PostgreSQL host |
| `PGPASSWORD` | ✅ | Database password |
| `OLLAMA_EMU_API_KEY` | ✅ | Default LLM provider API key |
| `SSLCOMMERZ_STORE_ID` | ✅ for payments | SSLCommerz store ID |
| `SSLCOMMERZ_STORE_PASSWORD` | ✅ for payments | SSLCommerz store password |
| `SMTP_SENDER` | ✅ for emails | SMTP sender email |
| `SMTP_PASSWORD` | ✅ for emails | SMTP app password |
| `APP_URL` | ✅ | Public backend URL (e.g. `https://api.ollamomui.com`) |

---

## Post-Deployment Checklist

- [ ] `curl /api/version` returns `{"version":"1.0.4"}`
- [ ] `curl /api/db/schema` shows `connected: true`
- [ ] Payment flow works end-to-end (sandbox → license key → email)
- [ ] Frontend loads at custom domain
- [ ] Pricing page links point to correct Stripe/SSLCommerz URLs
- [ ] SSL certificate valid (no browser warnings)
- [ ] Auto-updater in EXE checks the live GitHub Releases
