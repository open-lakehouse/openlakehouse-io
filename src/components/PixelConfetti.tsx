import { cn } from "@/lib/utils";

/**
 * Retro pixel star/plus confetti scattered across a dark band — a signature
 * motif from the 2026 brand deck. Pure SVG so it themes with brand tokens and
 * stays crisp. Twinkle respects `prefers-reduced-motion` (see index.css).
 */

type Speck = { x: number; y: number; s: number; kind: "plus" | "sq"; hue: string; delay: number };

// Deterministic layout (no RNG) so it's stable across renders/SSR.
const SPECKS: Speck[] = [
  { x: 6, y: 18, s: 6, kind: "plus", hue: "hsl(var(--flow-300))", delay: 0 },
  { x: 14, y: 62, s: 4, kind: "sq", hue: "hsl(var(--spark-400))", delay: 0.8 },
  { x: 22, y: 34, s: 5, kind: "plus", hue: "hsl(var(--unity-400))", delay: 1.6 },
  { x: 31, y: 78, s: 4, kind: "sq", hue: "hsl(var(--flow-200))", delay: 0.4 },
  { x: 39, y: 12, s: 6, kind: "plus", hue: "hsl(var(--flow-400))", delay: 1.2 },
  { x: 47, y: 52, s: 4, kind: "sq", hue: "hsl(var(--spark-300))", delay: 2.0 },
  { x: 55, y: 26, s: 5, kind: "plus", hue: "hsl(var(--flow-300))", delay: 0.6 },
  { x: 63, y: 70, s: 4, kind: "sq", hue: "hsl(var(--unity-300))", delay: 1.4 },
  { x: 71, y: 40, s: 6, kind: "plus", hue: "hsl(var(--flow-200))", delay: 0.2 },
  { x: 79, y: 16, s: 4, kind: "sq", hue: "hsl(var(--spark-400))", delay: 1.8 },
  { x: 86, y: 60, s: 5, kind: "plus", hue: "hsl(var(--flow-400))", delay: 1.0 },
  { x: 93, y: 32, s: 4, kind: "sq", hue: "hsl(var(--unity-400))", delay: 0.5 },
  { x: 10, y: 88, s: 5, kind: "plus", hue: "hsl(var(--flow-300))", delay: 2.2 },
  { x: 68, y: 90, s: 4, kind: "sq", hue: "hsl(var(--spark-300))", delay: 1.1 },
  { x: 50, y: 84, s: 6, kind: "plus", hue: "hsl(var(--flow-200))", delay: 0.9 },
];

export const PixelConfetti = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
  >
    {SPECKS.map((p, i) => (
      <span
        key={i}
        className="animate-pixel-twinkle absolute"
        style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s` }}
      >
        {p.kind === "plus" ? (
          <svg width={p.s * 2} height={p.s * 2} viewBox="0 0 6 6" style={{ display: "block" }}>
            <rect x="2" y="0" width="2" height="6" fill={p.hue} />
            <rect x="0" y="2" width="6" height="2" fill={p.hue} />
          </svg>
        ) : (
          <span
            style={{ display: "block", width: p.s, height: p.s, background: p.hue }}
          />
        )}
      </span>
    ))}
  </div>
);

export default PixelConfetti;
