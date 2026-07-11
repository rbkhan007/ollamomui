// Central configuration for OllamaEmu landing pages & external links.
// Edit FREETIER_DOMAIN (or set NEXT_PUBLIC_FREETIER_DOMAIN) to point the
// landing pages at your hosted free-tier gateway.

export const REPO_URL = "https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate";
export const REPO_RAW = "https://raw.githubusercontent.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/main";
export const RELEASES_URL = `${REPO_URL}/releases/latest`;
export const DOWNLOAD_URL = `${REPO_URL}/releases/latest/download/OllamaEmu.exe`;
export const NPM_PACKAGE = "@rbkhan007/ollama-emulator-desktop-ultimate";
export const NPM_URL =
  "https://github.com/rbkhan007/Ollama-Emulator-Desktop-Ultimate/pkgs/npm/ollama-emulator-desktop-ultimate";

export const FREETIER_DOMAIN =
  process.env.NEXT_PUBLIC_FREETIER_DOMAIN || "rbkhan007.github.io/Ollama-Emulator-Desktop-Ultimate";
export const FREETIER_URL = `https://${FREETIER_DOMAIN}`;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || FREETIER_URL;

export const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const EXE_URL = DOWNLOAD_URL;
