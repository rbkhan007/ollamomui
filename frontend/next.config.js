// When building for GitHub Pages (project site), set GITHUB_PAGES=true so assets
// are prefixed with the repo subpath. The local EXE build leaves this unset and
// serves at the domain root (http://localhost:11434).
const isGHPages = process.env.GITHUB_PAGES === "true";
const basePath = isGHPages ? "/Ollama-Emulator-Desktop-Ultimate" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  basePath: basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
};

module.exports = nextConfig;
