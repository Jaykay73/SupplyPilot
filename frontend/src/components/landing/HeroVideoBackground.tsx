"use client";

import React, { useEffect, useRef, useState } from "react";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useCanvasFallback, setUseCanvasFallback] = useState(true);

  // Procedural canvas particle & network visualization fallback
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Node network representation
    const nodeCount = Math.min(Math.floor(width / 35), 45);
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulseOffset: number;
      isHub: boolean;
    }

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() > 0.85 ? 3.5 : 2,
        pulseOffset: Math.random() * Math.PI * 2,
        isHub: Math.random() > 0.85,
      });
    }

    // Packet pulses moving between nodes
    interface Pulse {
      fromIndex: number;
      toIndex: number;
      progress: number;
      speed: number;
      color: string;
    }
    const pulses: Pulse[] = [];

    const spawnPulse = () => {
      if (pulses.length > 18) return;
      const from = Math.floor(Math.random() * nodes.length);
      // find close node
      let closestIdx = -1;
      let closestDist = 180;
      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue;
        const dx = nodes[i].x - nodes[from].x;
        const dy = nodes[i].y - nodes[from].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }
      if (closestIdx !== -1) {
        pulses.push({
          fromIndex: from,
          toIndex: closestIdx,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012,
          color: Math.random() > 0.7 ? "rgba(168, 85, 247, 0.9)" : "rgba(16, 185, 129, 0.85)",
        });
      }
    };

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Clean light whitish backdrop with subtle depth gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      bgGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      bgGrad.addColorStop(1, "rgba(248, 250, 252, 1)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Update node positions
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;
      }

      // Draw connection vectors
      const maxDistance = 160;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35;
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & draw pulses
      if (tick % 25 === 0) spawnPulse();

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const from = nodes[p.fromIndex];
        const to = nodes[p.toIndex];
        if (!from || !to) continue;

        const currentX = from.x + (to.x - from.x) * p.progress;
        const currentY = from.y + (to.y - from.y) * p.progress;

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = Math.sin(tick * 0.04 + n.pulseOffset) * 0.5 + 0.5;

        if (n.isHub) {
          ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + pulse * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(168, 85, 247, 0.9)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.4})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Looping HTML5 Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => {
          setVideoLoaded(true);
          setUseCanvasFallback(false);
        }}
        onError={() => {
          setUseCanvasFallback(true);
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-35" : "opacity-0"
        }`}
      >
        <source src="/media/hero/network-loop.webm" type="video/webm" />
        <source src="/media/hero/network-loop.mp4" type="video/mp4" />
      </video>

      {/* 2. Procedural Canvas Fallback & Ambient Layer */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          useCanvasFallback || !videoLoaded ? "opacity-90" : "opacity-40"
        }`}
      />

      {/* 3. High-End Edge Vignette & Tonal Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/30 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
    </div>
  );
}
