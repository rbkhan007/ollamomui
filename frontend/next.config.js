const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.VERCEL ? undefined : "export",
  distDir: "out",
  basePath: basePath,
  assetPrefix: basePath,
  images: { unoptimized: process.env.VERCEL ? false : true },
};

if (apiBase) {
  nextConfig.rewrites = async () => [
    {
      source: "/api/:path*",
      destination: `${apiBase}/api/:path*`,
    },
  ];
}

module.exports = nextConfig;
