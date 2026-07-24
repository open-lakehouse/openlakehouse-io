import { PixelConfetti } from "./PixelConfetti";

/**
 * Pixel-art lakehouse hero — a 16-bit retro scene rendered as crisp SVG
 * (shape-rendering: crispEdges) so it stays sharp at any size and themes
 * with the brand palette. Clouds drift via a `steps()` animation that the
 * global `prefers-reduced-motion` rule disables. Flat, no glow.
 */

const PixelCloud = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 32 14" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
    <g fill="#ffffff">
      <rect x="8" y="4" width="16" height="6" />
      <rect x="4" y="6" width="24" height="4" />
      <rect x="12" y="2" width="8" height="2" />
      <rect x="18" y="4" width="8" height="2" />
    </g>
    <g fill="#D6E9FC">
      <rect x="4" y="10" width="24" height="2" />
    </g>
  </svg>
);

const PixelTree = ({ x, scale = 1 }: { x: number; scale?: number }) => (
  <g transform={`translate(${x} 0) scale(${scale})`} shapeRendering="crispEdges">
    <rect x="7" y="26" width="4" height="8" fill="#5A3A1E" />
    <g fill="#1E6B3A">
      <rect x="2" y="20" width="14" height="8" />
      <rect x="4" y="14" width="10" height="8" />
      <rect x="6" y="8" width="6" height="8" />
    </g>
    <g fill="#2E8B57">
      <rect x="4" y="22" width="4" height="4" />
      <rect x="6" y="16" width="4" height="4" />
    </g>
  </g>
);

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-flow-900">
      {/* Pixel-art scene */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 320 180"
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <defs>
          {/* Sky — banded gradient for a retro dithered feel */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6BB0F0" />
            <stop offset="55%" stopColor="#9ACEF8" />
            <stop offset="100%" stopColor="#D6E9FC" />
          </linearGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3890E5" />
            <stop offset="100%" stopColor="#005695" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="120" fill="url(#sky)" />

        {/* Pixel sun */}
        <g fill="#FFF3EC">
          <rect x="250" y="18" width="20" height="20" />
          <rect x="246" y="22" width="28" height="12" />
          <rect x="248" y="20" width="24" height="16" />
        </g>

        {/* Distant hills — clustered to the right so the copy sits over open sky/water */}
        <rect x="196" y="96" width="124" height="24" fill="#2E8B57" />
        <path d="M196 100 H240 V92 H288 V98 H320 V120 H196 Z" fill="#37A05F" opacity="0.7" />

        {/* Trees on the right ridge */}
        <PixelTree x={205} scale={0.8} />
        <PixelTree x={232} scale={1.1} />
        <PixelTree x={296} scale={0.9} />

        {/* Cabin on the right shore */}
        <g shapeRendering="crispEdges">
          <rect x="252" y="82" width="44" height="24" fill="#C58A52" />
          <rect x="252" y="82" width="44" height="4" fill="#8A5A2E" />
          <path d="M248 82 L274 66 L300 82 Z" fill="#7A4A24" />
          <rect x="260" y="90" width="10" height="9" fill="#3890E5" />
          <rect x="280" y="90" width="10" height="13" fill="#5A3A1E" />
        </g>

        {/* Lake */}
        <rect x="0" y="106" width="320" height="74" fill="url(#lake)" />
        {/* Pixel ripples */}
        <g fill="#6BB0F0" opacity="0.7">
          <rect x="20" y="120" width="14" height="2" />
          <rect x="60" y="132" width="20" height="2" />
          <rect x="120" y="126" width="16" height="2" />
          <rect x="30" y="148" width="24" height="2" />
          <rect x="150" y="140" width="18" height="2" />
          <rect x="90" y="158" width="20" height="2" />
          <rect x="200" y="164" width="16" height="2" />
        </g>
        {/* Dock reaching in from the right shore */}
        <g fill="#8A5A2E" shapeRendering="crispEdges">
          <rect x="272" y="106" width="6" height="26" />
          <rect x="236" y="128" width="42" height="4" />
        </g>
      </svg>

      {/* Drifting pixel clouds */}
      <PixelCloud
        className="animate-cloud-drift absolute left-[8%] top-[14%] w-24 opacity-95"
        style={{ animationDuration: "50s" }}
      />
      <PixelCloud
        className="animate-cloud-drift absolute left-[38%] top-[8%] w-16 opacity-90"
        style={{ animationDuration: "62s", animationDelay: "-8s" }}
      />
      <PixelCloud
        className="animate-cloud-drift absolute left-[64%] top-[20%] w-20 opacity-90"
        style={{ animationDuration: "44s", animationDelay: "-20s" }}
      />

      {/* Legibility scrim behind the copy + fade into the next section */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsl(213 100% 16% / 0.55) 0%, hsl(213 100% 16% / 0.2) 45%, hsl(222 100% 8% / 0.85) 100%)",
        }}
      />

      {/* Copy */}
      <div className="container relative py-32 md:py-48">
        <div className="max-w-5xl mx-auto text-center animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.02]">
            What is the Open Lakehouse?
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed">
            Your data, in open formats, on storage you control — readable by any engine you choose,
            today and ten years from now.
          </p>
        </div>
      </div>

      {/* Pixel confetti twinkling across the scene */}
      <PixelConfetti />
    </section>
  );
};
