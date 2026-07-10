"use client";

import { useEffect, useRef } from "react";

export function Particles({ count = 20 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animId: number | null = null;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; hue: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 60 + 240,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas!.height + 10; p.x = Math.random() * canvas!.width; }
        if (p.x < -10) p.x = canvas!.width + 10;
        if (p.x > canvas!.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.a})`;
        ctx.fill();
      }
      if (!reduceMotion && !document.hidden) {
        animId = requestAnimationFrame(draw);
      } else {
        animId = null;
      }
    }

    function start() {
      if (animId === null && !reduceMotion && !document.hidden) {
        animId = requestAnimationFrame(draw);
      }
    }
    function stop() {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    if (reduceMotion) {
      draw(); // single static frame, no loop
    } else {
      start();
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.5,
        contain: "strict",
      }}
    />
  );
}

export function GradientOrbs() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, overflow: "hidden", contain: "strict" }}>
      <div style={{
        position: "absolute", top: "-15%", right: "-10%", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)",
        animation: "orbFloat1 20s ease-in-out infinite",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,206,201,0.08) 0%, transparent 70%)",
        animation: "orbFloat2 25s ease-in-out infinite",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "50%", width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(253,121,168,0.06) 0%, transparent 70%)",
        animation: "orbFloat3 18s ease-in-out infinite",
        filter: "blur(50px)",
      }} />
    </div>
  );
}

export function MeshGrid() {
  return (
    <svg
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
