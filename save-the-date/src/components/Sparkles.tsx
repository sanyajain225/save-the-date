import { useMemo } from "react";

export function Sparkles({ count = 40 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 2.5 + 0.8,
        delay: Math.random() * 18,
        duration: 14 + Math.random() * 16,
        opacity: 0.35 + Math.random() * 0.5,
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {items.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            bottom: `-10px`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(255,236,180,1) 0%, rgba(212,166,74,0.6) 50%, transparent 80%)",
            boxShadow: "0 0 6px rgba(255,220,140,0.7)",
            opacity: s.opacity,
            animation: `sparkleFloat ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}