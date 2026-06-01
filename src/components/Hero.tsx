import heroWavesUrl from "@/assets/bundled/hero-waves.png";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <style>{`
        @keyframes hero-wave-pan-a {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes hero-wave-pan-b {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        @keyframes hero-wave-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* Animated wave background — two layers panning in opposite directions for a slow ocean feel */}
      <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ animation: "hero-wave-bob 9s ease-in-out infinite" }}
        >
          <div
            className="absolute inset-y-0 left-0 w-[200%] opacity-90"
            style={{
              backgroundImage: `url(${heroWavesUrl})`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "50% 100%",
              backgroundPosition: "left center",
              animation: "hero-wave-pan-a 60s linear infinite",
            }}
          />
          <div
            className="absolute inset-y-0 left-0 w-[200%] mix-blend-screen opacity-40"
            style={{
              backgroundImage: `url(${heroWavesUrl})`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "60% 110%",
              backgroundPosition: "left center",
              animation: "hero-wave-pan-b 95s linear infinite",
            }}
          />
        </div>
      </div>

      {/* Fade to dark at bottom for clean transition into the marquee */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-0"
        style={{ background: "linear-gradient(180deg, transparent, hsl(229 50% 6%))" }}
      />

      <div className="container relative z-10 py-32 md:py-48">
        <div className="max-w-5xl mx-auto text-center animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight text-white leading-[1.02] drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            What is the Open Lakehouse?
          </h1>
          <p className="mt-10 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
            Your data, in open formats, on storage you control — readable by any engine you choose,
            today and ten years from now.
          </p>
        </div>
      </div>
    </section>
  );
};
