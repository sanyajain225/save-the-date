import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
const HEART_PATH = "M50,88 C20,68 4,49 4,29 C4,14 17,4 31,4 C40,4 47,10 50,18 C53,10 60,4 69,4 C83,4 96,14 96,29 C96,49 80,68 50,88 Z";
const VIEWBOX = 100;
function ScratchHeart() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef(null);
  const pathRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const checkRef = useRef(0);
  const [progress, setProgress] = useState(0);
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
    const scale = w / VIEWBOX;
    const path = new Path2D();
    const raw = new Path2D(HEART_PATH);
    const m = new DOMMatrix().scale(scale, scale);
    path.addPath(raw, m);
    pathRef.current = path;
    ctx.save();
    ctx.clip(path);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#7a4f12");
    grad.addColorStop(0.25, "#d9a84a");
    grad.addColorStop(0.5, "#fff1bf");
    grad.addColorStop(0.75, "#d4a64a");
    grad.addColorStop(1, "#6b4410");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = `rgba(255,${220 + Math.random() * 35},${160 + Math.random() * 60},${0.05 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
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
    const step = 6;
    let total = 0;
    let erased = 0;
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
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const stroke = (x, y) => {
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
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    lastRef.current = { x, y };
  };
  const onPointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const { x, y } = getPos(e);
    lastRef.current = { x, y };
    stroke(x, y);
  };
  const onPointerMove = (e) => {
    if (!drawingRef.current) return;
    const { x, y } = getPos(e);
    stroke(x, y);
    checkRef.current += 1;
    if (checkRef.current % 6 === 0) sampleProgress();
  };
  const onPointerUp = () => {
    drawingRef.current = false;
    lastRef.current = null;
    sampleProgress();
  };
  const reset = () => {
    setProgress(0);
    setRevealed(false);
    paintGold();
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6 select-none", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: wrapRef,
        className: "relative",
        style: {
          width: "min(78vw, 360px)",
          aspectRatio: "1 / 1",
          filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.45))"
        },
        children: [
          /* @__PURE__ */ jsxs(
            "svg",
            {
              viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`,
              className: "absolute inset-0 h-full w-full",
              "aria-hidden": true,
              children: [
                /* @__PURE__ */ jsxs("defs", { children: [
                  /* @__PURE__ */ jsxs("radialGradient", { id: "redHeart", cx: "50%", cy: "40%", r: "70%", children: [
                    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#d4133a" }),
                    /* @__PURE__ */ jsx("stop", { offset: "60%", stopColor: "#8a0020" }),
                    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#4a0012" })
                  ] }),
                  /* @__PURE__ */ jsxs("linearGradient", { id: "redEdge", x1: "0", x2: "0", y1: "0", y2: "1", children: [
                    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "rgba(255,200,160,0.5)" }),
                    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "rgba(0,0,0,0)" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("path", { d: HEART_PATH, fill: "url(#redHeart)" }),
                /* @__PURE__ */ jsx(
                  "path",
                  {
                    d: HEART_PATH,
                    fill: "none",
                    stroke: "url(#redEdge)",
                    strokeWidth: "0.6"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "absolute inset-0 flex flex-col items-center justify-center px-6 text-center",
              style: {
                opacity: Math.min(1, progress * 2.2),
                transition: "opacity 200ms ease-out",
                color: "#fbe5b8"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: "italic",
                    style: { fontSize: "clamp(11px, 2.8vw, 16px)", letterSpacing: "0.08em" },
                    children: "invite you to celebrate"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: "italic",
                    style: { fontSize: "clamp(11px, 2.8vw, 16px)", letterSpacing: "0.08em" },
                    children: "the wedding on"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: "mt-2 font-semibold",
                    style: {
                      fontSize: "clamp(22px, 6.5vw, 38px)",
                      letterSpacing: "0.06em",
                      textShadow: "0 2px 14px rgba(0,0,0,0.45)"
                    },
                    children: "12.08.27"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "canvas",
            {
              ref: canvasRef,
              onPointerDown,
              onPointerMove,
              onPointerUp,
              onPointerCancel: onPointerUp,
              className: "absolute inset-0 h-full w-full touch-none",
              style: { cursor: "grab" }
            }
          )
        ]
      }
    ),
    !revealed ? /* @__PURE__ */ jsx(
      "p",
      {
        className: "gold-text animate-soft-pulse tracking-[0.4em]",
        style: { fontSize: "clamp(11px, 2.4vw, 14px)" },
        children: "✦ SCRATCH THE HEART ✦"
      }
    ) : /* @__PURE__ */ jsx(
      "button",
      {
        onClick: reset,
        className: "rounded-full border border-[rgba(247,226,155,0.55)] bg-[rgba(0,0,0,0.18)] px-6 py-2 text-[12px] tracking-[0.35em] text-[#f7e29b] backdrop-blur-sm transition hover:bg-[rgba(247,226,155,0.12)] hover:scale-[1.03]",
        children: "✦ SCRATCH AGAIN ✦"
      }
    )
  ] });
}
function Sparkles({ count = 40 }) {
  const items = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 18,
      duration: 14 + Math.random() * 16,
      opacity: 0.35 + Math.random() * 0.5
    })),
    [count]
  );
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: "pointer-events-none fixed inset-0 overflow-hidden",
      style: { zIndex: 0 },
      children: items.map((s) => /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            position: "absolute",
            left: `${s.left}%`,
            bottom: `-10px`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(255,236,180,1) 0%, rgba(212,166,74,0.6) 50%, transparent 80%)",
            boxShadow: "0 0 6px rgba(255,220,140,0.7)",
            opacity: s.opacity,
            animation: `sparkleFloat ${s.duration}s linear ${s.delay}s infinite`
          }
        },
        s.id
      ))
    }
  );
}
function Index() {
  const calendarUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("Swati & Harsh — Wedding") + "&dates=20270812T030000Z/20270812T150000Z&details=" + encodeURIComponent("With great joy, we invite you to celebrate our wedding.") + "&location=" + encodeURIComponent("To be announced");
  return /* @__PURE__ */ jsxs("main", { className: "relative min-h-screen overflow-hidden", children: [
    /* @__PURE__ */ jsx(Sparkles, { count: 50 }),
    /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "pointer-events-none fixed inset-0", style: {
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
      zIndex: 0
    } }),
    /* @__PURE__ */ jsxs("section", { className: "relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-between px-6 py-12 text-center sm:py-16", children: [
      /* @__PURE__ */ jsxs("header", { className: "animate-fade-up", children: [
        /* @__PURE__ */ jsx("p", { className: "gold-text mb-3 tracking-[0.55em]", style: {
          fontSize: "clamp(10px, 2vw, 12px)"
        }, children: "✦ WITH BLESSINGS ✦" }),
        /* @__PURE__ */ jsx("h1", { className: "gold-text font-light leading-[0.95]", style: {
          fontSize: "clamp(48px, 11vw, 96px)",
          fontStyle: "italic",
          letterSpacing: "0.01em"
        }, children: "Save the Date" }),
        /* @__PURE__ */ jsx("div", { className: "mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-[#d4a64a] to-transparent" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "my-10 animate-fade-up", style: {
        animationDelay: "200ms"
      }, children: /* @__PURE__ */ jsx(ScratchHeart, {}) }),
      /* @__PURE__ */ jsxs("footer", { className: "flex w-full flex-col items-center gap-5 animate-fade-up", style: {
        animationDelay: "400ms"
      }, children: [
        /* @__PURE__ */ jsx("h2", { className: "gold-text font-medium", style: {
          fontSize: "clamp(34px, 8vw, 64px)",
          letterSpacing: "0.08em"
        }, children: "SWATI & HARSH" }),
        /* @__PURE__ */ jsx("p", { className: "tracking-[0.5em] text-[#f5d99a]/90", style: {
          fontSize: "clamp(12px, 2.6vw, 16px)"
        }, children: "12 • 08 • 2027" }),
        /* @__PURE__ */ jsxs("a", { href: calendarUrl, target: "_blank", rel: "noopener noreferrer", className: "mt-3 inline-flex items-center gap-3 rounded-full border border-[rgba(247,226,155,0.55)] bg-[rgba(0,0,0,0.22)] px-7 py-3 text-[12px] tracking-[0.38em] text-[#f7e29b] backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:bg-[rgba(247,226,155,0.12)] hover:shadow-[0_10px_40px_rgba(247,226,155,0.25)]", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#f7e29b]", children: "✦" }),
          "ADD TO CALENDAR",
          /* @__PURE__ */ jsx("span", { className: "text-[#f7e29b]", children: "✦" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 italic text-[#f5d99a]/60", style: {
          fontSize: "clamp(11px, 2.2vw, 13px)",
          letterSpacing: "0.12em"
        }, children: "Together with their families" })
      ] })
    ] })
  ] });
}
export {
  Index as component
};
