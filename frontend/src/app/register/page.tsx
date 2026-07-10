"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { LogoSvg } from "@/components/Icons";
import { toast } from "@/lib/api";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      toast("Please enter a valid email address", true);
      return;
    }
    if (password.length < 6) {
      toast("Password must be at least 6 characters", true);
      return;
    }
    if (password !== confirmPassword) {
      toast("Passwords do not match", true);
      return;
    }

    setLoading(true);
    try {
      const ok = await register(email, password);
      if (ok) {
        toast("Account created successfully");
        router.push("/");
      } else {
        toast("Email already registered", true);
      }
    } catch {
      toast("Registration failed", true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 440, margin: "0 auto", paddingTop: 80 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <LogoSvg size={56} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
          Create Account
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Register to save your configuration locally
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
            style={{ fontSize: 15, padding: "12px 16px" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              style={{ fontSize: 15, padding: "12px 16px", paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                padding: 4, display: "flex",
              }}
              tabIndex={-1}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            style={{ fontSize: 15, padding: "12px 16px" }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "14px 24px" }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </div>
      </form>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
