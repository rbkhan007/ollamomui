import Link from "next/link";
import { LogoSvg } from "@/components/Icons";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 80px)",
      textAlign: "center",
      padding: 40,
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: "rgba(108,92,231,0.1)",
        border: "1px solid rgba(108,92,231,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
      }}>
        <LogoSvg size={48} />
      </div>

      <h1 style={{
        fontSize: 72,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        marginBottom: 8,
        background: "linear-gradient(135deg, #6c5ce7, #00cec9)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        404
      </h1>

      <p style={{
        fontSize: 18,
        color: "var(--text-muted)",
        marginBottom: 8,
        fontWeight: 500,
      }}>
        Page not found
      </p>

      <p style={{
        fontSize: 14,
        color: "var(--text-muted)",
        maxWidth: 400,
        marginBottom: 32,
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try navigating from the homepage.
      </p>

      <Link href="/" className="btn btn-primary" style={{
        fontSize: 15,
        padding: "14px 32px",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Back to Home
      </Link>
    </div>
  );
}
