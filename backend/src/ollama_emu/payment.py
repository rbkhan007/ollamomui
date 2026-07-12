import os
import re
import uuid
import hashlib
import secrets
import smtplib
import hmac
import logging
from email.mime.text import MIMEText
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel, EmailStr

log = logging.getLogger("ollama-emu")

APP_URL = os.getenv("APP_URL", "http://localhost:11434")
SMTP_SENDER = os.getenv("SMTP_SENDER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

router = APIRouter(prefix="/api/payment", tags=["payment"])


# ── License Key Helpers ──

def generate_license_key(user_id: str, plan: str) -> str:
    raw = f"OLLAMOMUI-{plan.upper()}-{user_id[:8]}-{secrets.token_hex(4).upper()}-{int(datetime.now(timezone.utc).timestamp())}"
    return raw


def hash_license_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()


def verify_license_key(raw_key: str, stored_hash: str) -> bool:
    return hmac.compare_digest(hash_license_key(raw_key), stored_hash)


# ── Email Sending ──

def send_license_email(email_to: str, license_key: str, plan: str):
    if not SMTP_SENDER or not SMTP_PASSWORD:
        log.warning("SMTP not configured — skipping license email to %s", email_to)
        return

    subject = f"Your OllamoMUI {plan} License Key"
    body = f"""
Thank you for purchasing OllamoMUI {plan}!

Your license key is:
{license_key}

To activate, paste this key into the activation screen of the EXE or mobile app.

Download the EXE: https://github.com/rbkhan007/ollamomui/releases/latest
Get the mobile app: https://play.google.com/store/apps/details?id=com.ollamomui.app

Regards,
The OllamoMUI Team
"""
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_SENDER
    msg["To"] = email_to

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_SENDER, SMTP_PASSWORD)
            server.send_message(msg)
        log.info("License email sent to %s", email_to)
    except Exception as e:
        log.error("Failed to send license email to %s: %s", email_to, e)


# ── Database Helpers ──

async def _save_license(db, user_id: str, raw_key: str, plan: str, expiry_days: int = 30):
    key_hash = hash_license_key(raw_key)
    expiry = datetime.now(timezone.utc) + timedelta(days=expiry_days)
    await db.execute(
        """
        INSERT INTO licenses (user_id, key_hash, raw_key, plan, expiry_date)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, plan) DO UPDATE
        SET key_hash = EXCLUDED.key_hash,
            raw_key = EXCLUDED.raw_key,
            expiry_date = EXCLUDED.expiry_date,
            activated = false
        """,
        user_id, key_hash, raw_key, plan, expiry,
    )
    return raw_key, key_hash


async def _update_user_subscription(db, user_id: str, expiry_days: int = 30):
    expiry = datetime.now(timezone.utc) + timedelta(days=expiry_days)
    await db.execute(
        "UPDATE users SET subscription_status = 'pro', subscription_expiry = $1 WHERE email = $2",
        expiry, user_id,
    )


# ── Routes ──

class LicenseActivateRequest(BaseModel):
    license_key: str
    device_id: Optional[str] = None


@router.post("/activate")
async def activate_license(req: LicenseActivateRequest):
    """Activate a license key. Returns success/failure and remaining days."""
    from ollama_emu.db import Database
    db = Database()
    key_hash = hash_license_key(req.license_key)

    row = await db.fetchrow(
        "SELECT user_id, plan, expiry_date, activated FROM licenses WHERE key_hash = $1",
        key_hash,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Invalid license key")

    if row["activated"]:
        raise HTTPException(status_code=409, detail="License already activated on another device")

    remaining = (row["expiry_date"] - datetime.now(timezone.utc)).days
    if remaining < 0:
        raise HTTPException(status_code=410, detail="License has expired")

    await db.execute(
        "UPDATE licenses SET activated = true, activated_at = $1, device_id = $2 WHERE key_hash = $3",
        datetime.now(timezone.utc), req.device_id or "", key_hash,
    )

    return {
        "success": True,
        "plan": row["plan"],
        "expires_at": row["expiry_date"].isoformat(),
        "days_remaining": remaining,
    }


@router.post("/sslcommerz/success")
async def sslcommerz_success(request: Request):
    """
    SSLCommerz IPN / success redirect handler.
    Expects form data with 'tran_id', 'status', 'amount', etc.
    Generates license key and redirects user to result page.
    """
    from ollama_emu.db import Database
    form = await request.form()
    session_key = form.get("tran_id")
    payment_status = form.get("status")
    amount = form.get("amount", "0")

    if not session_key:
        return RedirectResponse(f"{APP_URL}/payment-result?status=error&message=Missing transaction ID")

    db = Database()

    # Find the payment session
    row = await db.fetchrow(
        "SELECT id, user_id, plan, status FROM payment_sessions WHERE session_key = $1",
        session_key,
    )
    if not row:
        return RedirectResponse(f"{APP_URL}/payment-result?status=error&message=Invalid session")

    if row["status"] == "success":
        # Already processed — return existing license key
        lic = await db.fetchrow(
            "SELECT raw_key, plan FROM licenses WHERE user_id = $1 AND plan = $2",
            row["user_id"], row["plan"],
        )
        if lic:
            return RedirectResponse(
                f"{APP_URL}/payment-result?status=success&key={lic['raw_key']}&plan={lic['plan']}"
            )
        return RedirectResponse(f"{APP_URL}/payment-result?status=error&message=License not found")

    # Validate payment status from SSLCommerz
    if payment_status != "VALID":
        await db.execute(
            "UPDATE payment_sessions SET status = 'failed' WHERE session_key = $1",
            session_key,
        )
        return RedirectResponse(
            f"{APP_URL}/payment-result?status=fail&message=Payment+{payment_status}"
        )

    # Generate license key
    plan = row["plan"]
    raw_key = generate_license_key(row["user_id"], plan)
    await _save_license(db, row["user_id"], raw_key, plan)
    await _update_user_subscription(db, row["user_id"])

    # Update payment session
    transaction_id = form.get("bank_tran_id", session_key)
    await db.execute(
        "UPDATE payment_sessions SET status = 'success', transaction_id = $1 WHERE session_key = $2",
        transaction_id, session_key,
    )

    # Send email with license key
    user_row = await db.fetchrow("SELECT email FROM users WHERE email = $1", row["user_id"])
    if user_row:
        send_license_email(user_row["email"], raw_key, plan)

    return RedirectResponse(
        f"{APP_URL}/payment-result?status=success&key={raw_key}&plan={plan}"
    )


@router.post("/sslcommerz/fail")
async def sslcommerz_fail(request: Request):
    form = await request.form()
    session_key = form.get("tran_id")
    if session_key:
        from ollama_emu.db import Database
        db = Database()
        await db.execute(
            "UPDATE payment_sessions SET status = 'failed' WHERE session_key = $1",
            session_key,
        )
    return RedirectResponse(f"{APP_URL}/payment-result?status=fail")


@router.post("/sslcommerz/cancel")
async def sslcommerz_cancel(request: Request):
    form = await request.form()
    session_key = form.get("tran_id")
    if session_key:
        from ollama_emu.db import Database
        db = Database()
        await db.execute(
            "UPDATE payment_sessions SET status = 'cancelled' WHERE session_key = $1",
            session_key,
        )
    return RedirectResponse(f"{APP_URL}/payment-result?status=cancel")


@router.post("/init")
async def init_payment(user_id: str, plan: str, amount: float):
    """
    Initialize a payment session. Creates a session_key and returns it
    along with the SSLCommerz checkout URL.
    """
    from ollama_emu.db import Database
    import secrets

    session_key = f"OLLAMOMUI-{secrets.token_hex(12).upper()}"
    db = Database()

    await db.execute(
        """
        INSERT INTO payment_sessions (session_key, user_id, plan, amount, status)
        VALUES ($1, $2, $3, $4, 'pending')
        """,
        session_key, user_id, plan, amount,
    )

    # Build SSLCommerz checkout URL
    store_id = os.getenv("SSLCOMMERZ_STORE_ID", "")
    store_passwd = os.getenv("SSLCOMMERZ_STORE_PASSWORD", "")
    success_url = f"{APP_URL}/api/payment/sslcommerz/success"
    fail_url = f"{APP_URL}/api/payment/sslcommerz/fail"
    cancel_url = f"{APP_URL}/api/payment/sslcommerz/cancel"

    checkout_url = (
        f"https://sandbox.sslcommerz.com/gwprocess/v3/api.php"
        f"?store_id={store_id}"
        f"&store_passwd={store_passwd}"
        f"&total_amount={amount}"
        f"&currency=BDT"
        f"&tran_id={session_key}"
        f"&success_url={success_url}"
        f"&fail_url={fail_url}"
        f"&cancel_url={cancel_url}"
        f"&cus_name={user_id}"
        f"&cus_email={user_id}"
        f"&cus_phone=01XXXXXXX"
        f"&product_name={plan}"
        f"&product_category=software"
        f"&product_profile=general"
    )

    return {"session_key": session_key, "checkout_url": checkout_url}


@router.get("/license/{user_id}")
async def get_user_licenses(user_id: str):
    """Get all licenses for a user."""
    from ollama_emu.db import Database
    db = Database()
    rows = await db.fetchall(
        "SELECT plan, expiry_date, activated, activated_at, device_id FROM licenses WHERE user_id = $1 ORDER BY created_at DESC",
        user_id,
    )
    return {"licenses": [dict(r) for r in rows]}
