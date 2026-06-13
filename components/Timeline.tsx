"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

export default function Timeline({ periods }) {
  const [scale, setScale] = useState(0.06); // pixels per year
  const [offsetX, setOffsetX] = useState(0);
  const [hoveredPeriod, setHoveredPeriod] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [vw, setVw] = useState(0);
  const dragStart = useRef({ x: 0, offset: 0 });
  const animFrame = useRef(null);
  const targetScale = useRef(0.06);
  const targetOffset = useRef(0);
  const selectPeriod = useStore((s) => s.selectPeriod);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const tick = () => {
      setScale((s) => s + (targetScale.current - s) * 0.15);
      setOffsetX((o) => o + (targetOffset.current - o) * 0.15);
      animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  const centerY = "calc(50% + 40px)"; // 280px area centered slightly below middle

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const yearAtCursor = (x - offsetX) / scale;
    const zoomFactor = e.deltaY > 0 ? 0.85 : 1.18;
    const newScale = Math.max(0.005, Math.min(2, scale * zoomFactor));
    targetScale.current = newScale;
    const newOffset = x - yearAtCursor * newScale;
    targetOffset.current = newOffset;
  };
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, offset: targetOffset.current };
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      targetOffset.current = dragStart.current.offset + (e.clientX - dragStart.current.x);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const onMouseMove = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    for (const p of periods) {
      const px1 = p.startYear * scale + offsetX;
      const px2 = p.endYear * scale + offsetX;
      if (x >= px1 && x <= px2) {
        setHoveredPeriod({ p, x, y: e.clientY - rect.top });
        target.style.cursor = "pointer";
        return;
      }
    }
    setHoveredPeriod(null);
    target.style.cursor = isDragging ? "grabbing" : "grab";
  };

  const onClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    for (const p of periods) {
      const px1 = p.startYear * scale + offsetX;
      const px2 = p.endYear * scale + offsetX;
      if (x >= px1 && x <= px2) {
        selectPeriod(p);
        return;
      }
    }
  };

  const minYear = Math.min(...periods.map((p) => p.startYear));
  const maxYear = Math.max(...periods.map((p) => p.endYear));
  const yearStep = scale < 0.03 ? 500 : scale < 0.1 ? 200 : 100;
  const yearLabels: number[] = [];
  const startLabel = Math.ceil(minYear / yearStep) * yearStep;
  for (let y = startLabel; y <= maxYear; y += yearStep) {
    yearLabels.push(y);
  }

  const colors = ["#fbbf24", "#fb923c", "#ef4444", "#ec4899", "#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16", "#f59e0b"];

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#0a0a14] to-[#0d0815] overflow-hidden select-none">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #ffffff08 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      <div className="absolute top-0 left-0 right-0 p-8 z-10 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white/90">
          Art History <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-rose-300">Museum</span>
        </h1>
        <p className="text-white/50 text-sm mt-2 font-mono">drag to pan · scroll to zoom · click a period to enter</p>
      </div>

      {/* The scrollable timeline area */}
      <div
        className="absolute inset-0"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoveredPeriod(null)}
        onClick={onClick}
      >
        {/* Center line */}
        <div className="absolute left-0 right-0 h-px bg-white/10" style={{ top: centerY }} />

        {/* Year labels */}
        {yearLabels.map((y) => {
          const x = y * scale + offsetX;
          if (x < -50 || x > (vw || 9999) + 50) return null;
          return (
            <div key={y} className="absolute" style={{ left: x, top: centerY, transform: "translate(-50%, 8px)" }}>
              <div className="w-px h-3 bg-white/30 mx-auto" />
              <div className="text-white/40 font-mono text-[10px] text-center mt-1">{y}</div>
            </div>
          );
        })}

        {/* Period bars */}
        {periods.map((p, i) => {
          const x1 = p.startYear * scale + offsetX;
          const x2 = p.endYear * scale + offsetX;
          const width = x2 - x1;
          if (x2 < -50 || x1 > (vw || 9999) + 50) return null;
          const color = colors[i % colors.length];
          return (
            <button
              key={p.id}
              onClick={(e) => { e.stopPropagation(); selectPeriod(p); }}
              className="absolute flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105"
              style={{ left: x1, top: `calc(${centerY} - 130px)`, width: Math.max(width, 80), height: 260 }}
            >
              <div
                className="w-full h-full rounded-2xl border-2 backdrop-blur-sm flex flex-col items-center justify-center px-3"
                style={{
                  borderColor: color + "cc",
                  background: `linear-gradient(180deg, ${color}33, ${color}11)`,
                  boxShadow: `0 0 40px ${color}33 inset`,
                }}
              >
                <div className="text-white font-bold text-center leading-tight" style={{ fontSize: Math.min(28, Math.max(13, width / 10)) }}>
                  {p.name}
                </div>
                <div className="text-white/50 font-mono text-[10px] mt-1">
                  {p.startYear}–{p.endYear}
                </div>
                <div className="text-white/40 text-[10px]">{p.region}</div>
                {p._count?.artists > 0 && <div className="text-amber-300/80 text-[10px] mt-2 font-mono">{p._count.artists} artists</div>}
              </div>
            </button>
          );
        })}
      </div>

      {hoveredPeriod && (
        <div className="absolute pointer-events-none z-20 max-w-xs" style={{ left: hoveredPeriod.x + 16, top: hoveredPeriod.y + 16 }}>
          <div className="bg-black/80 backdrop-blur border border-white/10 rounded-lg p-3 text-white text-sm">
            <div className="font-bold">{hoveredPeriod.p.name}</div>
            <div className="text-white/50 text-xs font-mono">
              {hoveredPeriod.p.startYear}–{hoveredPeriod.p.endYear} · {hoveredPeriod.p.region}
            </div>
            <div className="text-white/70 text-xs mt-1 line-clamp-3">{hoveredPeriod.p.summary}</div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
          <span className="text-white/50 text-xs font-mono">zoom</span>
          <input
            type="range" min="0.005" max="2" step="0.01"
            value={scale}
            onChange={(e) => { targetScale.current = parseFloat(e.target.value); }}
            className="w-48 accent-amber-400"
          />
          <span className="text-white/70 text-xs font-mono w-12">{(scale * 100).toFixed(0)}%</span>
          <button onClick={() => { targetScale.current = 0.06; targetOffset.current = 0; }} className="text-white/70 hover:text-white text-xs px-2">
            reset
          </button>
        </div>
      </div>
    </div>
  );
}
