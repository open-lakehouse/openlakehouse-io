import { PixelConfetti } from "./PixelConfetti";

// Served from public/assets — referenced by URL (not a module import).
const heroScene = "/assets/lakehouse-hero.png";

/**
 * Pixel-art lakehouse hero — uses the brand illustration as a crisp,
 * full-bleed background (image-rendering: pixelated keeps the sprite sharp
 * when scaled). The scene's cabin/dock sit on the right and open sky/water
 * on the left, so a left→dark scrim keeps the headline legible. A twinkling
 * PixelConfetti motif adds retro motion (disabled under prefers-reduced-motion).
 */
export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-flow-900">
      {/* Brand pixel-art scene */}
      <img
        src={heroScene}
        alt=""
        aria-hidden="true"
        className="pixelated absolute inset-0 h-full w-full object-cover object-right select-none"
        draggable={false}
      />

      {/* Legibility scrim: a vertical wash for mobile (copy sits over the
          whole scene) plus a left→right darkening for desktop (copy sits over
          the open-water left). Bottom fade into the dark page. Flat, no glow. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsl(213 100% 16% / 0.55) 0%, hsl(213 100% 16% / 0.35) 55%, hsl(222 100% 8% / 0.7) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, hsl(213 100% 16% / 0.85) 0%, hsl(213 100% 16% / 0.45) 40%, transparent 68%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent, hsl(222 100% 8%))" }}
      />

      {/* Copy — left-aligned, constrained so it never collides with the cabin
          on the right. */}
      <div className="container relative py-28 md:py-48">
        <div className="max-w-md md:max-w-2xl animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            What is the Open Lakehouse?
          </h1>
          <p className="mt-6 md:mt-8 max-w-xl text-base md:text-xl text-white/90 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            Your data, in open formats, on storage you control — readable by any engine you choose,
            today and ten years from now.
          </p>
        </div>
      </div>

      {/* Retro pixel confetti twinkling across the scene */}
      <PixelConfetti />
    </section>
  );
};
