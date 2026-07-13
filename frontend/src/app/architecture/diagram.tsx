"use client";

export function ArchitectureDiagram() {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)",
      padding: "clamp(12px, 2vw, 20px)", overflow: "auto",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <svg viewBox="0 0 1280 720" style={{ width: "100%", height: "auto", maxWidth: 1280 }} xmlns="http://www.w3.org/2000/svg" fontFamily="var(--font-inter), system-ui, sans-serif">
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="1280" y2="720">
            <stop offset="0%" stopColor="var(--surface)" />
            <stop offset="50%" stopColor="color-mix(in srgb, var(--surface) 90%, var(--accent) 5%)" />
            <stop offset="100%" stopColor="var(--surface)" />
          </linearGradient>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="glowCyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="glowPurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="codexGrad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#B1A7FF" /><stop offset=".5" stopColor="#7A9DFF" /><stop offset="1" stopColor="#3941FF" /></linearGradient>
          <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1280" height="720" fill="url(#bgGrad)" rx="8" />

        {/* Background network dots */}
        {Array.from({ length: 60 }, (_, i) => {
          const x = 60 + (i % 10) * 120;
          const y = 80 + Math.floor(i / 10) * 110;
          return <circle key={i} cx={x} cy={y} r="1.5" fill="var(--text-muted)" opacity="0.06" />;
        })}

        {/* Orbital ambient glows */}
        <circle cx="640" cy="360" r="160" fill="url(#coreGrad)" filter="url(#softGlow)" opacity="0.3" />
        <circle cx="640" cy="360" r="120" fill="none" stroke="url(#glowCyan)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0 640 360" to="360 640 360" dur="30s" repeatCount="indefinite" />
        </circle>
        <circle cx="640" cy="360" r="100" fill="none" stroke="url(#glowPurple)" strokeWidth="1.5" strokeDasharray="4 12" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="360 640 360" to="0 640 360" dur="36s" repeatCount="indefinite" />
        </circle>

        {/* Animated orbital dots */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 640 360" to="360 640 360" dur="18s" repeatCount="indefinite" />
          <circle cx="780" cy="360" r="5" fill="#00f0ff" filter="url(#glow)" />
          <circle cx="580" cy="500" r="5" fill="#ec4899" filter="url(#glow)" />
          <circle cx="580" cy="220" r="5" fill="#8b5cf6" filter="url(#glow)" />
        </g>

        {/* ===== LEFT: CLI AGENTS ===== */}
        <text x="210" y="60" fill="var(--text-muted)" fontSize="14" fontWeight="700" letterSpacing="3" textAnchor="middle">CLI AGENTS</text>

        {/* Claude Code */}
        <g>
          <rect x="60" y="85" width="300" height="52" rx="12" fill="color-mix(in srgb, #fd79a8 6%, var(--surface))" stroke="#fd79a8" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="68" y="93" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#fd79a8", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20"><path clipRule="evenodd" d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z" fill="#D97757" fillRule="evenodd" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="104" y="114" fill="#fd79a8" fontSize="14" fontWeight="600">Claude Code</text>
          <text x="210" y="114" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">Anthropic CLI agent</text>
          <circle cx="60" cy="111" r="8" fill="none" stroke="#fd79a8" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* OpenCode */}
        <g>
          <rect x="60" y="151" width="300" height="52" rx="12" fill="color-mix(in srgb, #6c5ce7 6%, var(--surface))" stroke="#6c5ce7" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="68" y="159" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#6c5ce7", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16 6H8v12h8V6zm4 16H4V2h16v20z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="104" y="180" fill="#6c5ce7" fontSize="14" fontWeight="600">OpenCode</text>
          <text x="210" y="180" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">Open-source CLI agent</text>
          <circle cx="60" cy="177" r="8" fill="none" stroke="#6c5ce7" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Kilo Code */}
        <g>
          <rect x="60" y="217" width="300" height="52" rx="12" fill="color-mix(in srgb, #00b894 6%, var(--surface))" stroke="#00b894" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="68" y="225" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#00b894", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M0 0v24h24V0H0zm22.222 22.222H1.778V1.778h20.444v20.444zm-7.555-4.964h2.222v1.778h-2.794L12.89 17.83v-2.794h1.778v2.222zm4 0h-1.778v-2.222h-2.222v-1.778h2.793l1.207 1.207v2.793zm-7.556-2.591H9.333v-1.778h1.778v1.778zm-5.778-1.778h1.778v4h4v1.778H6.54L5.333 17.46V12.89zm13.334-3.556v1.778h-5.778V9.333h1.987V7.111h-1.987V5.333h2.558l1.206 1.207v2.793h2.014zm-11.556-2h2.222l1.778 1.778v2H9.333v-2H7.111v2H5.333V5.333h1.778v2zm4 0H9.333v-2h1.778v2z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="104" y="246" fill="#00b894" fontSize="14" fontWeight="600">Kilo Code</text>
          <text x="210" y="246" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">VS Code assistant</text>
          <circle cx="60" cy="243" r="8" fill="none" stroke="#00b894" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="0.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Codex CLI */}
        <g>
          <rect x="60" y="283" width="300" height="52" rx="12" fill="color-mix(in srgb, #10a37f 6%, var(--surface))" stroke="#10a37f" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="68" y="291" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#10a37f", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20"><path d="M19.503 0H4.496A4.496 4.496 0 000 4.496v15.007A4.496 4.496 0 004.496 24h15.007A4.496 4.496 0 0024 19.503V4.496A4.496 4.496 0 0019.503 0z" fill="#fff" /><path d="M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.09.09 0 00.043 0 4.55 4.55 0 013.046.275l.047.022.116.057a4.581 4.581 0 012.188 2.399c.209.51.313 1.041.315 1.595a4.24 4.24 0 01-.134 1.223.123.123 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.123.123 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.107.107 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.441 4.441 0 01-1.945-.466 4.544 4.544 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.81 5.81 0 01-.37-.961 4.582 4.582 0 01-.014-2.298.124.124 0 00.006-.056.085.085 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.896 3.896 0 01-.251-1.192 5.189 5.189 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33.215-.089.43-.164.646-.227a.098.098 0 00.065-.066 4.51 4.51 0 01.829-1.615 4.535 4.535 0 011.837-1.388zm3.482 10.565a.637.637 0 000 1.272h3.636a.637.637 0 100-1.272h-3.636zM8.462 9.23a.637.637 0 00-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 101.095.649l1.454-2.455a.636.636 0 00.005-.64L8.462 9.23z" fill="url(#codexGrad)" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="104" y="312" fill="#10a37f" fontSize="14" fontWeight="600">Codex CLI</text>
          <text x="210" y="312" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">OpenAI CLI agent</text>
          <circle cx="60" cy="309" r="8" fill="none" stroke="#10a37f" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="1.2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Ollama CLI */}
        <g>
          <rect x="60" y="349" width="300" height="52" rx="12" fill="color-mix(in srgb, #00cec9 6%, var(--surface))" stroke="#00cec9" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="68" y="357" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#00cec9", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M7.905 1.09c.216.085.411.225.588.41.295.306.544.744.734 1.263.191.522.315 1.1.362 1.68a5.054 5.054 0 012.049-.636l.051-.004c.87-.07 1.73.087 2.48.474.101.053.2.11.297.17.05-.569.172-1.134.36-1.644.19-.52.439-.957.733-1.264a1.67 1.67 0 01.589-.41c.257-.1.53-.118.796-.042.401.114.745.368 1.016.737.248.337.434.769.561 1.287.23.934.27 2.163.115 3.645l.053.04.026.019c.757.576 1.284 1.397 1.563 2.35.435 1.487.216 3.155-.534 4.088l-.018.021.002.003c.417.762.67 1.567.724 2.4l.002.03c.064 1.065-.2 2.137-.814 3.19l-.007.01.01.024c.472 1.157.62 2.322.438 3.486l-.006.039a.651.651 0 01-.747.536.648.648 0 01-.54-.742c.167-1.033.01-2.069-.48-3.123a.643.643 0 01.04-.617l.004-.006c.604-.924.854-1.83.8-2.72-.046-.779-.325-1.544-.8-2.273a.644.644 0 01.18-.886l.009-.006c.243-.159.467-.565.58-1.12a4.229 4.229 0 00-.095-1.974c-.205-.7-.58-1.284-1.105-1.683-.595-.454-1.383-.673-2.38-.61a.653.653 0 01-.632-.371c-.314-.665-.772-1.141-1.343-1.436a3.288 3.288 0 00-1.772-.332c-1.245.099-2.343.801-2.67 1.686a.652.652 0 01-.61.425c-1.067.002-1.893.252-2.497.703-.522.39-.878.935-1.066 1.588a4.07 4.07 0 00-.068 1.886c.112.558.331 1.02.582 1.269l.008.007c.212.207.257.53.109.785-.36.622-.629 1.549-.673 2.44-.05 1.018.186 1.902.719 2.536l.016.019a.643.643 0 01.095.69c-.576 1.236-.753 2.252-.562 3.052a.652.652 0 11-1.269.298c-.243-1.018-.078-2.184.473-3.498l.014-.035-.008-.012a4.339 4.339 0 01-.598-1.309l-.005-.019a5.764 5.764 0 01-.177-1.785c.044-.91.278-1.842.622-2.59l.012-.026-.002-.002c-.293-.418-.51-.953-.63-1.545l-.005-.024a5.352 5.352 0 01.093-2.49c.262-.915.777-1.701 1.536-2.269.06-.045.123-.09.186-.132-.159-1.493-.119-2.73.112-3.67.127-.518.314-.95.562-1.287.27-.368.614-.622 1.015-.737.266-.076.54-.059.797.042zm4.116 9.09c.936 0 1.8.313 2.446.855.63.527 1.005 1.235 1.005 1.94 0 .888-.406 1.58-1.133 2.022-.62.375-1.451.557-2.403.557-1.009 0-1.871-.259-2.493-.734-.617-.47-.963-1.13-.963-1.845 0-.707.398-1.417 1.056-1.946.668-.537 1.55-.849 2.485-.849zm0 .896a3.07 3.07 0 00-1.916.65c-.461.37-.722.835-.722 1.25 0 .428.21.829.61 1.134.455.347 1.124.548 1.943.548.799 0 1.473-.147 1.932-.426.463-.28.7-.686.7-1.257 0-.423-.246-.89-.683-1.256-.484-.405-1.14-.643-1.864-.643zm.662 1.21l.004.004c.12.151.095.37-.056.49l-.292.23v.446a.375.375 0 01-.376.373.375.375 0 01-.376-.373v-.46l-.271-.218a.347.347 0 01-.052-.49.353.353 0 01.494-.051l.215.172.22-.174a.353.353 0 01.49.051zm-5.04-1.919c.478 0 .867.39.867.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zm8.706 0c.48 0 .868.39.868.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="104" y="378" fill="#00cec9" fontSize="14" fontWeight="600">Ollama CLI</text>
          <text x="210" y="378" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">Local model runner</text>
          <circle cx="60" cy="375" r="8" fill="none" stroke="#00cec9" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="1.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ===== CENTER: OLLAMOMUI NEURAL PROXY ===== */}
        <g>
          {/* Hexagon */}
          <polygon points="640,242 760,316 760,404 640,478 520,404 520,316" fill="color-mix(in srgb, var(--surface) 92%, #00f0ff 8%)" stroke="#00f0ff" strokeWidth="4" filter="url(#glow)" />
          <polygon points="640,258 745,322 745,398 640,462 535,398 535,322" fill="none" stroke="url(#glowPurple)" strokeWidth="1.5" opacity="0.5" />

          {/* Bolt icon */}
          <g transform="translate(640 345) scale(1.6)">
            <polygon points="0,-13 11,-6 11,6 0,13 -11,6 -11,-6" fill="none" stroke="#00f0ff" strokeWidth="1.4" filter="url(#glow)" />
            <polygon points="0,-9 8,-5 8,5 0,9 -8,5 -8,-5" fill="none" stroke="url(#glowPurple)" strokeWidth="0.8" opacity="0.6" />
            <path d="M -4,-6 L 4,-6 L 2,-1 L 6,-1 L -4,8 L -2,2 L -6,2 Z" fill="url(#boltGrad)" filter="url(#glow)" />
            <circle cx="0" cy="-13" r="1.5" fill="#00f0ff" filter="url(#glow)" />
            <circle cx="11" cy="-6" r="1.5" fill="#8b5cf6" filter="url(#glow)" />
            <circle cx="11" cy="6" r="1.5" fill="#00f0ff" filter="url(#glow)" />
            <circle cx="0" cy="13" r="1.5" fill="#8b5cf6" filter="url(#glow)" />
            <circle cx="-11" cy="6" r="1.5" fill="#00f0ff" filter="url(#glow)" />
            <circle cx="-11" cy="-6" r="1.5" fill="#8b5cf6" filter="url(#glow)" />
            <circle cx="0" cy="0" r="2" fill="#00f0ff" opacity="0.8" filter="url(#glow)" />
          </g>

          <text x="640" y="400" fill="#00f0ff" fontSize="18" fontWeight="700" textAnchor="middle" fontFamily="monospace">&gt;_</text>
          <text x="640" y="422" fill="#ffffff" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace" letterSpacing="2">OLLAMOMUI</text>
          <text x="640" y="440" fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontFamily="monospace" letterSpacing="2">NEURAL PROXY</text>

          {/* Pulse ring */}
          <circle cx="640" cy="360" r="10" fill="none" stroke="#00f0ff" strokeWidth="1.2" opacity="0.6">
            <animate attributeName="r" values="10;60" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ===== RIGHT: CLOUD PROVIDERS ===== */}
        <text x="1070" y="60" fill="var(--text-muted)" fontSize="14" fontWeight="700" letterSpacing="3" textAnchor="middle">CLOUD PROVIDERS</text>

        {/* OpenAI */}
        <g>
          <rect x="920" y="85" width="300" height="52" rx="12" fill="color-mix(in srgb, #10a37f 6%, var(--surface))" stroke="#10a37f" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="928" y="93" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#10a37f", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="964" y="114" fill="#10a37f" fontSize="14" fontWeight="600">OpenAI</text>
          <text x="1117" y="114" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">GPT-4o / o-series</text>
          <circle cx="1220" cy="111" r="8" fill="none" stroke="#10a37f" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Anthropic */}
        <g>
          <rect x="920" y="151" width="300" height="52" rx="12" fill="color-mix(in srgb, #fd79a8 6%, var(--surface))" stroke="#fd79a8" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="928" y="159" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#fd79a8", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="964" y="180" fill="#fd79a8" fontSize="14" fontWeight="600">Anthropic</text>
          <text x="1117" y="180" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">Claude 4 Sonnet / Opus</text>
          <circle cx="1220" cy="177" r="8" fill="none" stroke="#fd79a8" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="0.35s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="0.35s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Groq */}
        <g>
          <rect x="920" y="217" width="300" height="52" rx="12" fill="color-mix(in srgb, #fdcb6e 6%, var(--surface))" stroke="#fdcb6e" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="928" y="225" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#fdcb6e", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="964" y="246" fill="#fdcb6e" fontSize="14" fontWeight="600">Groq</text>
          <text x="1117" y="246" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">LPU inference / fast</text>
          <circle cx="1220" cy="243" r="8" fill="none" stroke="#fdcb6e" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="0.7s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* DeepSeek */}
        <g>
          <rect x="920" y="283" width="300" height="52" rx="12" fill="color-mix(in srgb, #e17055 6%, var(--surface))" stroke="#e17055" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="928" y="291" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#e17055", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20"><path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" fill="#4D6BFE" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="964" y="312" fill="#e17055" fontSize="14" fontWeight="600">DeepSeek</text>
          <text x="1117" y="312" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">DeepSeek-V3 / R1</text>
          <circle cx="1220" cy="309" r="8" fill="none" stroke="#e17055" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="1.05s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="1.05s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Gemini */}
        <g>
          <rect x="920" y="349" width="300" height="52" rx="12" fill="color-mix(in srgb, #4285f4 6%, var(--surface))" stroke="#4285f4" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="928" y="357" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#4285f4", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="964" y="378" fill="#4285f4" fontSize="14" fontWeight="600">Gemini</text>
          <text x="1117" y="378" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">Gemini 2.0 / 2.5 Flash</text>
          <circle cx="1220" cy="375" r="8" fill="none" stroke="#4285f4" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="1.4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* OpenRouter */}
        <g>
          <rect x="920" y="415" width="300" height="52" rx="12" fill="color-mix(in srgb, #6c5ce7 6%, var(--surface))" stroke="#6c5ce7" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="928" y="423" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#6c5ce7", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16.804 1.957l7.22 4.105v.087L16.73 10.21l.017-2.117-.821-.03c-1.059-.028-1.611.002-2.268.11-1.064.175-2.038.577-3.147 1.352L8.345 11.03c-.284.195-.495.336-.68.455l-.515.322-.397.234.385.23.53.338c.476.314 1.17.796 2.701 1.866 1.11.775 2.083 1.177 3.147 1.352l.3.045c.694.091 1.375.094 2.825.033l.022-2.159 7.22 4.105v.087L16.589 22l.014-1.862-.635.022c-1.386.042-2.137.002-3.138-.162-1.694-.28-3.26-.926-4.881-2.059l-2.158-1.5a21.997 21.997 0 00-.755-.498l-.467-.28a55.927 55.927 0 00-.76-.43C2.908 14.73.563 14.116 0 14.116V9.888l.14.004c.564-.007 2.91-.622 3.809-1.124l1.016-.58.438-.274c.428-.28 1.072-.726 2.686-1.853 1.621-1.133 3.186-1.78 4.881-2.059 1.152-.19 1.974-.213 3.814-.138l.02-1.907z" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="964" y="444" fill="#6c5ce7" fontSize="14" fontWeight="600">OpenRouter</text>
          <text x="1117" y="444" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">Multi-provider gateway</text>
          <circle cx="1220" cy="441" r="8" fill="none" stroke="#6c5ce7" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="1.75s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="1.75s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Mistral */}
        <g>
          <rect x="920" y="481" width="300" height="52" rx="12" fill="color-mix(in srgb, #ff7000 6%, var(--surface))" stroke="#ff7000" strokeOpacity="0.3" strokeWidth="1" />
          <foreignObject x="928" y="489" width="28" height="28">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <span style={{ color: "#ff7000", display: "inline-flex" }}>
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M3.428 3.4h3.429v3.428H3.428V3.4zm13.714 0h3.43v3.428h-3.43V3.4z" fill="gold" /><path d="M3.428 6.828h6.857v3.429H3.429V6.828zm10.286 0h6.857v3.429h-6.857V6.828z" fill="#FFAF00" /><path d="M3.428 10.258h17.144v3.428H3.428v-3.428z" fill="#FF8205" /><path d="M3.428 13.686h3.429v3.428H3.428v-3.428zm6.858 0h3.429v3.428h-3.429v-3.428zm6.856 0h3.43v3.428h-3.43v-3.428z" fill="#FA500F" /><path d="M0 17.114h10.286v3.429H0v-3.429zm13.714 0H24v3.429H13.714v-3.429z" fill="#E10500" /></svg>
              </span>
            </div>
          </foreignObject>
          <text x="964" y="510" fill="#ff7000" fontSize="14" fontWeight="600">Mistral</text>
          <text x="1117" y="510" fill="var(--text-muted)" fontSize="12" textAnchor="middle" opacity="0.6">Mistral Large / Small</text>
          <circle cx="1220" cy="507" r="8" fill="none" stroke="#ff7000" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8;28" dur="2.6s" begin="2.1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.6s" begin="2.1s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ===== DATA FLOW LINES: CLI → Neural Proxy → Cloud ===== */}
        <g stroke="#00f0ff" fill="none" strokeDasharray="12 8" strokeWidth="2" opacity="0.7">
          <style>{`@keyframes flow{0%{stroke-dashoffset:120}100%{stroke-dashoffset:0}}`}</style>
          {/* From each CLI agent to center */}
          <path d="M360 111 C420 111, 460 250, 520 316" style={{ animation: "flow 2s linear infinite" }} />
          <path d="M360 177 C420 177, 460 270, 520 330" style={{ animation: "flow 2s linear infinite", animationDelay: "0.15s" }} />
          <path d="M360 243 C420 243, 460 290, 520 360" style={{ animation: "flow 2s linear infinite", animationDelay: "0.3s" }} />
          <path d="M360 309 C420 309, 460 310, 520 390" style={{ animation: "flow 2s linear infinite", animationDelay: "0.45s" }} />
          <path d="M360 375 C420 375, 460 350, 520 410" style={{ animation: "flow 2s linear infinite", animationDelay: "0.6s" }} />
        </g>

        <g stroke="#8b5cf6" fill="none" strokeDasharray="12 8" strokeWidth="2" opacity="0.7">
          {/* From center to each cloud provider */}
          <path d="M760 316 C820 316, 860 111, 920 111" style={{ animation: "flow 2s linear infinite" }} />
          <path d="M760 340 C820 340, 860 177, 920 177" style={{ animation: "flow 2s linear infinite", animationDelay: "0.15s" }} />
          <path d="M760 360 C820 360, 860 243, 920 243" style={{ animation: "flow 2s linear infinite", animationDelay: "0.3s" }} />
          <path d="M760 380 C820 380, 860 309, 920 309" style={{ animation: "flow 2s linear infinite", animationDelay: "0.45s" }} />
          <path d="M760 400 C820 400, 860 375, 920 375" style={{ animation: "flow 2s linear infinite", animationDelay: "0.6s" }} />
          <path d="M760 420 C820 420, 860 441, 920 441" style={{ animation: "flow 2s linear infinite", animationDelay: "0.75s" }} />
          <path d="M760 440 C820 440, 860 507, 920 507" style={{ animation: "flow 2s linear infinite", animationDelay: "0.9s" }} />
        </g>

        {/* Animated data dots on paths */}
        {[
          "M360 111 C420 111, 460 250, 520 316",
          "M360 177 C420 177, 460 270, 520 330",
          "M360 243 C420 243, 460 290, 520 360",
          "M360 309 C420 309, 460 310, 520 390",
          "M360 375 C420 375, 460 350, 520 410",
        ].map((path, i) => (
          <circle key={`l-${i}`} r="3.5" fill="#00f0ff" filter="url(#glow)">
            <animateMotion dur={`${1.8 + i * 0.15}s`} repeatCount="indefinite" path={path} />
          </circle>
        ))}
        {[
          "M760 316 C820 316, 860 111, 920 111",
          "M760 340 C820 340, 860 177, 920 177",
          "M760 360 C820 360, 860 243, 920 243",
          "M760 380 C820 380, 860 309, 920 309",
          "M760 400 C820 400, 860 375, 920 375",
          "M760 420 C820 420, 860 441, 920 441",
          "M760 440 C820 440, 860 507, 920 507",
        ].map((path, i) => (
          <circle key={`r-${i}`} r="3.5" fill="#8b5cf6" filter="url(#glow)">
            <animateMotion dur={`${2 + i * 0.22}s`} repeatCount="indefinite" path={path} />
          </circle>
        ))}

        {/* ===== FOOTER ===== */}
        <rect x="40" y="604" width="1200" height="48" rx="10" fill="var(--bg)" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="640" y="633" fill="var(--text-muted)" fontSize="13" fontWeight="500" textAnchor="middle" fontFamily="monospace" letterSpacing="1">
          http://localhost:11434  •  CLI → OllamoMUI → any cloud model  •  OpenAPI / Anthropic / Google wire formats
        </text>
        <text x="640" y="665" fill="var(--text-muted)" fontSize="10" textAnchor="middle" opacity="0.5" fontFamily="monospace">
          All middleware is async, non-blocking • ACL auth • Rate limiter • Payload validation • RAG context • Memory inject
        </text>
      </svg>
    </div>
  );
}

export function RagPipelineDiagram() {
  const accent1 = "var(--accent)";
  const accent2 = "var(--accent-2)";
  const accent3 = "var(--accent-3)";
  const accent4 = "var(--accent-4)";

  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)",
      padding: "clamp(12px, 2vw, 20px)", overflow: "auto",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <svg viewBox="0 0 800 380" style={{ width: "100%", height: "auto", maxWidth: 800 }} xmlns="http://www.w3.org/2000/svg" fontFamily="var(--font-inter), system-ui, sans-serif">
        <defs>
          <marker id="rag-arr" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
          <marker id="rag-acc" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
          <marker id="rag-teal" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
          <linearGradient id="rag-merge" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6c5ce7" stopOpacity="0.06" /><stop offset="100%" stopColor="#00cec9" stopOpacity="0.10" /></linearGradient>
        </defs>

        {/* Dot grid background */}
        {Array.from({ length: 50 }, (_, i) => {
          const x = 16 + (i % 10) * 80;
          const y = 20 + Math.floor(i / 10) * 85;
          return <circle key={i} cx={x} cy={y} r="1" fill="var(--text-muted)" opacity="0.06" />;
        })}

        <text x="28" y="28" fontSize="11" fontWeight="700" fill="var(--text-muted)" letterSpacing="0.08em">
          RAG Pipeline
        </text>

        {/* User Query */}
        <g>
          <rect x={40} y={60} width={130} height={50} rx="10" fill="color-mix(in srgb, var(--accent) 8%, var(--surface))" stroke={accent1} strokeWidth="2" />
          <text x={105} y={90} fontSize="14" fontWeight="700" fill={accent1} textAnchor="middle" dominantBaseline="middle">User Query</text>
        </g>

        <line x1={170} y1={85} x2={215} y2={85} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />

        {/* Parallel: Semantic + Keyword */}
        <g>
          <rect x={220} y={45} width={150} height={55} rx="10" fill="color-mix(in srgb, var(--accent-2) 8%, var(--surface))" stroke={accent2} strokeWidth="2" />
          <text x={295} y={66} fontSize="13" fontWeight="700" fill={accent2} textAnchor="middle" dominantBaseline="middle">Semantic Search</text>
          <text x={295} y={83} fontSize="11" fill={accent2} textAnchor="middle" dominantBaseline="middle" opacity="0.7">pgvector (cosine sim)</text>
        </g>
        <g>
          <rect x={220} y={115} width={150} height={55} rx="10" fill="color-mix(in srgb, var(--accent-3) 8%, var(--surface))" stroke={accent3} strokeWidth="2" />
          <text x={295} y={136} fontSize="13" fontWeight="700" fill={accent3} textAnchor="middle" dominantBaseline="middle">Keyword Search</text>
          <text x={295} y={153} fontSize="11" fill={accent3} textAnchor="middle" dominantBaseline="middle" opacity="0.7">pg_trgm (fuzzy match)</text>
        </g>

        <line x1={370} y1={72} x2={425} y2={95} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />
        <line x1={370} y1={142} x2={425} y2={95} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />

        {/* Merge & Rerank */}
        <g>
          <rect x={430} y={70} width={140} height={55} rx="10" fill="url(#rag-merge)" stroke={accent1} strokeWidth="2" />
          <text x={500} y={91} fontSize="13" fontWeight="700" fill={accent1} textAnchor="middle" dominantBaseline="middle">Merge &amp; Rerank</text>
          <text x={500} y={108} fontSize="11" fill={accent1} textAnchor="middle" dominantBaseline="middle" opacity="0.7">Cross-encoder</text>
        </g>

        <line x1={570} y1={97} x2={615} y2={97} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />

        {/* LLM Context */}
        <g>
          <rect x={620} y={70} width={140} height={55} rx="10" fill="color-mix(in srgb, var(--accent-2) 8%, var(--surface))" stroke={accent2} strokeWidth="2" />
          <text x={690} y={91} fontSize="13" fontWeight="700" fill={accent2} textAnchor="middle" dominantBaseline="middle">LLM Context</text>
          <text x={690} y={108} fontSize="11" fill={accent2} textAnchor="middle" dominantBaseline="middle" opacity="0.7">Injection</text>
        </g>

        {/* Response */}
        <line x1={690} y1={125} x2={690} y2={185} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" markerEnd="url(#rag-arr)" />
        <g>
          <rect x={630} y={190} width={120} height={45} rx="10" fill="color-mix(in srgb, var(--accent-4) 8%, var(--surface))" stroke={accent4} strokeWidth="2" />
          <text x={690} y={217} fontSize="13" fontWeight="700" fill={accent4} textAnchor="middle" dominantBaseline="middle">Response</text>
        </g>

        {/* Upload / Ingest path */}
        <line x1={500} y1={125} x2={500} y2={250} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" />
        <g>
          <rect x={420} y={260} width={160} height={36} rx="8" fill="var(--surface)" stroke="var(--glass-border)" strokeWidth="1.5" />
          <text x={500} y={283} fontSize="12" fontWeight="500" fill="var(--text-muted)" textAnchor="middle" dominantBaseline="middle">PDF / TXT / CSV Upload</text>
        </g>
        <line x1={500} y1={296} x2={500} y2={315} stroke="var(--text-muted)" strokeWidth="1" />
        <g>
          <rect x={420} y={320} width={160} height={36} rx="8" fill="var(--surface)" stroke="var(--glass-border)" strokeWidth="1.5" />
          <text x={500} y={343} fontSize="12" fontWeight="500" fill="var(--text-muted)" textAnchor="middle" dominantBaseline="middle">Document Chunking &amp; Embedding</text>
        </g>
        <line x1={420} y1={338} x2={160} y2={338} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" markerEnd="url(#rag-arr)" />

        {/* Index DB */}
        <g>
          <rect x={60} y={310} width={100} height={45} rx="10" fill="color-mix(in srgb, var(--accent-3) 8%, var(--surface))" stroke={accent3} strokeWidth="2" />
          <text x={110} y={337} fontSize="13" fontWeight="700" fill={accent3} textAnchor="middle" dominantBaseline="middle">pgvector Index</text>
        </g>

        {/* Note */}
        <rect x={40} y={370} width={720} height={38} rx="8" fill="var(--bg)" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="400" y="394" fontSize="11" fontWeight="500" fill="var(--text-muted)" textAnchor="middle" dominantBaseline="middle">
          Documents are chunked → embedded via pgvector → indexed with pg_trgm for keyword search
        </text>
        <line x1={160} y1={355} x2={400} y2={389} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      </svg>
    </div>
  );
}