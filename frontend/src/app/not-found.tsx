import Link from "next/link";
import { LogoSvg } from "@/components/Icons";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100dvh - 80px)",
      textAlign: "center",
      padding: "clamp(24px, 5vw, 40px)",
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: "var(--gradient-1)",
        border: "1px solid var(--accent-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        animation: "floatSlow 4s ease-in-out infinite",
      }}>
        <LogoSvg size={48} />
      </div>

      <h1 style={{
        fontSize: "var(--text-h1)",
        fontWeight: 700,
        lineHeight: "var(--leading-heading)",
        marginBottom: 8,
        background: "var(--gradient-h3)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        404
      </h1>

      <p style={{
        fontSize: "var(--text-body)",
        color: "var(--text-muted)",
        marginBottom: 8,
        fontWeight: 500,
      }}>
        Page not found
      </p>

      <p style={{
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        lineHeight: "var(--leading-small)",
        maxWidth: "var(--text-max)",
        marginBottom: 32,
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try navigating from the homepage.
      </p>

      <Link href="/" className="btn btn-primary" style={{
        fontSize: "var(--text-body)",
        padding: "12px 24px",
        minHeight: "var(--click-target)",
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
