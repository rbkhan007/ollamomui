const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = "G:\\Python project\\Ollama_Emulator_Desktop_Ultimate";
const MOBILE_ASSETS = path.join(ROOT, "mobile", "assets");
const WEB_PUBLIC = path.join(ROOT, "frontend", "public");

const BRAND = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandCyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00f0ff"/><stop offset="100%" stop-color="#00bcd4"/></linearGradient>
    <linearGradient id="brandPurple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
    <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00f0ff"/><stop offset="55%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
  </defs>
  <g transform="translate(32, 32)">
    <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="none" stroke="url(#brandCyan)" stroke-width="2"/>
    <polygon points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9" fill="none" stroke="url(#brandPurple)" stroke-width="1" opacity="0.6"/>
    <path d="M -6,-10 L 6,-10 L 3,-2 L 8,-2 L -6,12 L -3,3 L -9,3 Z" fill="url(#boltGrad)"/>
    <circle cx="0" cy="-24" r="2" fill="url(#brandCyan)"/>
    <circle cx="21" cy="-12" r="2" fill="url(#brandPurple)"/>
    <circle cx="21" cy="12" r="2" fill="url(#brandCyan)"/>
    <circle cx="0" cy="24" r="2" fill="url(#brandPurple)"/>
    <circle cx="-21" cy="12" r="2" fill="url(#brandCyan)"/>
    <circle cx="-21" cy="-12" r="2" fill="url(#brandPurple)"/>
    <circle cx="0" cy="0" r="3" fill="url(#brandCyan)" opacity="0.8"/>
  </g>
</svg>`;

const WHITE = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(32, 32)">
    <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="none" stroke="#ffffff" stroke-width="3"/>
    <path d="M -6,-10 L 6,-10 L 3,-2 L 8,-2 L -6,12 L -3,3 L -9,3 Z" fill="#ffffff"/>
    <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.85"/>
  </g>
</svg>`;

function svgBuffer(svg, size) {
  return Buffer.from(
    svg.replace('<svg width="64" height="64"', `<svg width="${size}" height="${size}"`)
  );
}

async function renderToPng(svg, size) {
  return sharp(svgBuffer(svg, size)).png().toBuffer();
}

async function main() {
  fs.mkdirSync(MOBILE_ASSETS, { recursive: true });

  // 1. Adaptive icon foreground (transparent, mark padded to ~70% safe zone)
  const markFull = await renderToPng(BRAND, 1024);
  const fgPad = 154; // (1024-716)/2 -> 70% safe zone
  const fg = await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: await sharp(markFull).resize(1024 - fgPad * 2, 1024 - fgPad * 2).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(MOBILE_ASSETS, "adaptive-icon-foreground.png"));

  // 2. Adaptive icon background (brand gradient)
  const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6c5ce7"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#b)"/></svg>`;
  await sharp(Buffer.from(bgSvg)).png().toFile(path.join(MOBILE_ASSETS, "adaptive-icon-background.png"));

  // 3. Full app icon (rounded brand bg + mark)
  const fullBg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6c5ce7"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient></defs><rect x="0" y="0" width="1024" height="1024" rx="220" fill="url(#b)"/></svg>`;
  const fullBgBuf = await sharp(Buffer.from(fullBg)).png().toBuffer();
  await sharp(fullBgBuf)
    .composite([{ input: await sharp(markFull).resize(620, 620).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(MOBILE_ASSETS, "icon.png"));

  // 4. Notification icon (white silhouette)
  await renderToPng(WHITE, 1024).then((b) =>
    sharp(b).png().toFile(path.join(MOBILE_ASSETS, "notification-icon.png"))
  );

  // 5. Splash (full-bleed brand bg + centered mark)
  const splashSvg = `<svg width="1242" height="2436" xmlns="http://www.w3.org/2000/svg"><rect width="1242" height="2436" fill="#06060e"/><g transform="translate(621,1218) scale(11)">${BRAND.match(/<g transform="translate\(32, 32\)">[\s\S]*?<\/g>/)[0].replace('translate(32, 32)', 'translate(0,0)')}</g></svg>`;
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(MOBILE_ASSETS, "splash.png"));

  // 6. PWA icons (maskable: mark on brand bg)
  const pwaBg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6c5ce7"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient></defs><rect width="512" height="512" fill="url(#b)"/></svg>`;
  const pwaBgBuf = await sharp(Buffer.from(pwaBg)).png().toBuffer();
  for (const [name, sz, markSz] of [["icon-192.png", 192, 120], ["icon-512.png", 512, 320]]) {
    const base = await sharp({ create: { width: sz, height: sz, channels: 4, background: { r: 13, g: 13, b: 26, alpha: 1 } } }).png().toBuffer();
    await sharp(base)
      .composite([{ input: await sharp(markFull).resize(markSz, markSz).png().toBuffer(), gravity: "center" }])
      .png()
      .toFile(path.join(WEB_PUBLIC, name));
  }

  // 7. Apple touch icon (180, full brand rounded bg + mark)
  const atSvg = `<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6c5ce7"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#b)"/></svg>`;
  const atBuf = await sharp(Buffer.from(atSvg)).png().toBuffer();
  await sharp(atBuf)
    .composite([{ input: await sharp(markFull).resize(110, 110).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(path.join(WEB_PUBLIC, "apple-touch-icon.png"));

  // 8. Open Graph share image (1200x630)
  const markGroup = BRAND.match(/<g transform="translate\(32, 32\)">[\s\S]*?<\/g>/)[0].replace('translate(32, 32)', 'translate(0,0)');
  const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="30%" cy="50%" r="60%"><stop offset="0%" stop-color="#6c5ce7" stop-opacity="0.35"/><stop offset="100%" stop-color="#06060e" stop-opacity="0"/></radialGradient>
      <linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#00f0ff"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient>
    </defs>
    <rect width="1200" height="630" fill="#06060e"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <g transform="translate(300,315) scale(6)">${markGroup}</g>
    <text x="560" y="300" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="800" fill="url(#t)">OllamoMUI</text>
    <text x="562" y="360" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="#c7c9e0">Free local LLM proxy</text>
    <text x="562" y="408" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="#c7c9e0">RAG · Memory · Analytics</text>
  </svg>`;
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(WEB_PUBLIC, "og-image.png"));

  console.log("assets generated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
