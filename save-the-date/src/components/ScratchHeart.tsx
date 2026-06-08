import { useCallback, useEffect, useRef, useState } from "react";

// Smooth professional heart path in a 100x100 viewBox.
const HEART_PATH =
  "M50,88 C20,68 4,49 4,29 C4,14 17,4 31,4 C40,4 47,10 50,18 C53,10 60,4 69,4 C83,4 96,14 96,29 C96,49 80,68 50,88 Z";
const VIEWBOX = 100;

export function ScratchHeart() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const pathRef = useRef<Path2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const checkRef = useRef(0);

  const [progress, setProgress] = useState(0); // 0..1 erased fraction (inside heart)
  const [revealed, setRevealed] = useState(false);

  const paintGold = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h, dpr } = sizeRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Build heart path scaled to canvas size
    const scale = w / VIEWBOX;
    const path = new Path2D();
    const raw = new Path2D(HEART_PATH);
    const m = new DOMMatrix().scale(scale, scale);
    path.addPath(raw, m);
    pathRef.current = path;

    ctx.save();
    ctx.clip(path);

    // Metallic gold base
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#7a4f12");
    grad.addColorStop(0.25, "#d9a84a");
    grad.addColorStop(0.5, "#fff1bf");
    grad.addColorStop(0.75, "#d4a64a");
    grad.addColorStop(1, "#6b4410");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle speckle texture
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = `rgba(255,${220 + Math.random() * 35},${160 + Math.random() * 60},${0.05 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft highlight stripe
    const hl = ctx.createLinearGradient(0, 0, w, h);
    hl.addColorStop(0, "rgba(255,255,255,0)");
    hl.addColorStop(0.45, "rgba(255,255,255,0.35)");
    hl.addColorStop(0.55, "rgba(255,255,255,0.35)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }, []);

  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    sizeRef.current = { w: rect.width, h: rect.height, dpr };
    paintGold();
  }, [paintGold]);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(() => resize());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  const sampleProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pathRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h, dpr } = sizeRef.current;
    // Sample on a low-res grid
    const step = 6;
    let total = 0;
    let erased = 0;
    // Get full image once
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (!ctx.isPointInPath(pathRef.current, x * dpr, y * dpr)) continue;
        total++;
        const idx = ((y * dpr | 0) * canvas.width + (x * dpr | 0)) * 4 + 3;
        if (img[idx] < 30) erased++;
      }
    }
    if (total === 0) return;
    const p = erased / total;
    setProgress(p);
    if (p >= 0.4) setRevealed(true);
  }, []);

  const getPos = (e: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const stroke = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { dpr } = sizeRef.current;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 28;
    ctx.beginPath();
    const last = lastRef.current ?? { x, y };
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    // Soft edge with second pass
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    lastRef.current = { x, y };
  };

  const onPointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const { x, y } = getPos(e);
    lastRef.current = { x, y };
    stroke(x, y);
  };
  const onPointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    if (!drawingRef.current) return;
    const { x, y } = getPos(e);
    stroke(x, y);
    // Throttle progress sampling
    checkRef.current += 1;
    if (checkRef.current % 6 === 0) sampleProgress();
  };
  const onPointerUp: React.PointerEventHandler<HTMLCanvasElement> = () => {
    drawingRef.current = false;
    lastRef.current = null;
    sampleProgress();
  };

  const reset = () => {
    setProgress(0);
    setRevealed(false);
    paintGold();
  };

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div
        ref={wrapRef}
        className="relative"
        style={{
          width: "min(78vw, 360px)",
          aspectRatio: "1 / 1",
          filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.45))",
        }}
      >
        {/* Red heart + content (under layer) */}
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <radialGradient id="redHeart" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#d4133a" />
              <stop offset="60%" stopColor="#8a0020" />
              <stop offset="100%" stopColor="#4a0012" />
            </radialGradient>
            <linearGradient id="redEdge" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,200,160,0.5)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          <path d={HEART_PATH} fill="url(#redHeart)" />
          <path
            d={HEART_PATH}
            fill="none"
            stroke="url(#redEdge)"
            strokeWidth="0.6"
          />
        </svg>

        {/* Text inside heart */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{
            opacity: Math.min(1, progress * 2.2),
            transition: "opacity 200ms ease-out",
            color: "#fbe5b8",
          }}
        >
          <p
            className="italic"
            style={{ fontSize: "clamp(11px, 2.8vw, 16px)", letterSpacing: "0.08em" }}
          >
            invite you to celebrate
          </p>
          <p
            className="italic"
            style={{ fontSize: "clamp(11px, 2.8vw, 16px)", letterSpacing: "0.08em" }}
          >
            the wedding on
          </p>
          <p
            className="mt-2 font-semibold"
            style={{
              fontSize: "clamp(22px, 6.5vw, 38px)",
              letterSpacing: "0.06em",
              textShadow: "0 2px 14px rgba(0,0,0,0.45)",
            }}
          >
            12.08.27
          </p>
        </div>

        {/* Gold scratch canvas (top layer) */}
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ cursor: "grab" }}
        />
      </div>

      {!revealed ? (
        <p
          className="gold-text animate-soft-pulse tracking-[0.4em]"
          style={{ fontSize: "clamp(11px, 2.4vw, 14px)" }}
        >
          ✦ SCRATCH THE HEART ✦
        </p>
      ) : (
        <button
          onClick={reset}
          className="rounded-full border border-[rgba(247,226,155,0.55)] bg-[rgba(0,0,0,0.18)] px-6 py-2 text-[12px] tracking-[0.35em] text-[#f7e29b] backdrop-blur-sm transition hover:bg-[rgba(247,226,155,0.12)] hover:scale-[1.03]"
        >
          ✦ SCRATCH AGAIN ✦
        </button>
      )}
    </div>
  );
}