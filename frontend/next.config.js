const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const backendUrl = process.env.BACKEND_API_URL || "https://ollamomui-backend.onrender.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.VERCEL ? undefined : "export",
  distDir: process.env.VERCEL ? ".next" : "out",
  basePath: basePath,
  assetPrefix: basePath,
  images: { unoptimized: process.env.VERCEL ? false : true },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net; img-src 'self' https: data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.render.com https://*.vercel.app wss:; frame-src 'self' https://www.googletagmanager.com;" },
        ],
      },
    ];
  },
  async rewrites() {
    return process.env.VERCEL ? [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ] : [];
  },
};

module.exports = nextConfig;
