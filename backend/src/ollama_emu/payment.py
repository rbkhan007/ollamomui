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

from ollama_emu import db

log = logging.getLogger("ollama-emu")

APP_URL = os.getenv("APP_URL", "http://localhost:11434")
SMTP_SENDER = os.getenv("SMTP_SENDER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

router = APIRouter(prefix="/api/payment", tags=["payment"])


def generate_license_key(user_id: str, plan: str) -> str:
    raw = f"OLLAMOMUI-{plan.upper()}-{user_id[:8]}-{secrets.token_hex(4).upper()}-{int(datetime.now(timezone.utc).timestamp())}"
    return raw


def hash_license_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()


def verify_license_key(raw_key: str, stored_hash: str) -> bool:
    return hmac.compare_digest(hash_license_key(raw_key), stored_hash)


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


def _save_license(user_id: str, raw_key: str, plan: str, expiry_days: int = 30):
    key_hash = hash_license_key(raw_key)
    expiry = datetime.now(timezone.utc) + timedelta(days=expiry_days)
    with db.get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO licenses (user_id, key_hash, raw_key, plan, expiry_date)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id, plan) DO UPDATE
            SET key_hash = EXCLUDED.key_hash,
                raw_key = EXCLUDED.raw_key,
                expiry_date = EXCLUDED.expiry_date,
                activated = false
            """,
            (user_id, key_hash, raw_key, plan, expiry),
        )
    return raw_key, key_hash


def _update_user_subscription(user_id: str, expiry_days: int = 30):
    expiry = datetime.now(timezone.utc) + timedelta(days=expiry_days)
    with db.get_cursor() as cur:
        cur.execute(
            "UPDATE users SET subscription_status = 'pro', subscription_expiry = %s WHERE email = %s",
            (expiry, user_id),
        )


class LicenseActivateRequest(BaseModel):
    license_key: str
    device_id: Optional[str] = None


@router.post("/activate")
def activate_license(req: LicenseActivateRequest):
    """Activate a license key. Returns success/failure and remaining days."""
    key_hash = hash_license_key(req.license_key)

    with db.get_cursor(commit=False) as cur:
        cur.execute(
            "SELECT user_id, plan, expiry_date, activated FROM licenses WHERE key_hash = %s",
            (key_hash,),
        )
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Invalid license key")

    if row["activated"]:
        raise HTTPException(status_code=409, detail="License already activated on another device")

    remaining = (row["expiry_date"] - datetime.now(timezone.utc)).days
    if remaining < 0:
        raise HTTPException(status_code=410, detail="License has expired")

    with db.get_cursor() as cur:
        cur.execute(
            "UPDATE licenses SET activated = true, activated_at = %s, device_id = %s WHERE key_hash = %s",
            (datetime.now(timezone.utc), req.device_id or "", key_hash),
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
    form = await request.form()
    session_key = form.get("tran_id")
    payment_status = form.get("status")
    amount = form.get("amount", "0")

    if not session_key:
        return RedirectResponse(f"{APP_URL}/payment-result?status=error&message=Missing transaction ID")

    with db.get_cursor(commit=False) as cur:
        cur.execute(
            "SELECT id, user_id, plan, status FROM payment_sessions WHERE session_key = %s",
            (session_key,),
        )
        row = cur.fetchone()

    if not row:
        return RedirectResponse(f"{APP_URL}/payment-result?status=error&message=Invalid session")

    if row["status"] == "success":
        with db.get_cursor(commit=False) as cur:
            cur.execute(
                "SELECT raw_key, plan FROM licenses WHERE user_id = %s AND plan = %s",
                (row["user_id"], row["plan"]),
            )
            lic = cur.fetchone()
        if lic:
            return RedirectResponse(
                f"{APP_URL}/payment-result?status=success&key={lic['raw_key']}&plan={lic['plan']}"
            )
        return RedirectResponse(f"{APP_URL}/payment-result?status=error&message=License not found")

    if payment_status != "VALID":
        with db.get_cursor() as cur:
            cur.execute(
                "UPDATE payment_sessions SET status = 'failed' WHERE session_key = %s",
                (session_key,),
            )
        return RedirectResponse(
            f"{APP_URL}/payment-result?status=fail&message=Payment+{payment_status}"
        )

    plan = row["plan"]
    raw_key = generate_license_key(row["user_id"], plan)
    _save_license(row["user_id"], raw_key, plan)
    _update_user_subscription(row["user_id"])

    transaction_id = form.get("bank_tran_id", session_key)
    with db.get_cursor() as cur:
        cur.execute(
            "UPDATE payment_sessions SET status = 'success', transaction_id = %s WHERE session_key = %s",
            (transaction_id, session_key),
        )

    with db.get_cursor(commit=False) as cur:
        cur.execute("SELECT email FROM users WHERE email = %s", (row["user_id"],))
        user_row = cur.fetchone()
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
        with db.get_cursor() as cur:
            cur.execute(
                "UPDATE payment_sessions SET status = 'failed' WHERE session_key = %s",
                (session_key,),
            )
    return RedirectResponse(f"{APP_URL}/payment-result?status=fail")


@router.post("/sslcommerz/cancel")
async def sslcommerz_cancel(request: Request):
    form = await request.form()
    session_key = form.get("tran_id")
    if session_key:
        with db.get_cursor() as cur:
            cur.execute(
                "UPDATE payment_sessions SET status = 'cancelled' WHERE session_key = %s",
                (session_key,),
            )
    return RedirectResponse(f"{APP_URL}/payment-result?status=cancel")


@router.post("/init")
async def init_payment(user_id: str, plan: str, amount: float):
    """
    Initialize a payment session. Creates a session_key and returns it
    along with the SSLCommerz checkout URL.
    """
    import secrets

    session_key = f"OLLAMOMUI-{secrets.token_hex(12).upper()}"
    with db.get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO payment_sessions (session_key, user_id, plan, amount, status)
            VALUES (%s, %s, %s, %s, 'pending')
            """,
            (session_key, user_id, plan, amount),
        )

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
def get_user_licenses(user_id: str):
    """Get all licenses for a user."""
    with db.get_cursor(commit=False) as cur:
        cur.execute(
            "SELECT plan, expiry_date, activated, activated_at, device_id FROM licenses WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
        )
        rows = cur.fetchall()
    return {"licenses": [dict(r) for r in rows]}


@router.get("/license/current")
async def get_current_license(request: Request):
    """Get the current user's active license from the auth token."""
    from ollama_emu.acl import get_auth_context
    ctx = get_auth_context(request)
    email = (ctx or {}).get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Not authenticated")
    with db.get_cursor(commit=False) as cur:
        cur.execute(
            "SELECT plan, expiry_date, activated, activated_at, device_id FROM licenses WHERE user_id = %s AND activated = true ORDER BY created_at DESC LIMIT 1",
            (email,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="No active license found")
    return {"plan": row["plan"], "expires_at": str(row["expiry_date"]), "activated": row["activated"]}
