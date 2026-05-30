import { useEffect, useRef } from "react";

export const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.5, y: 0.5 });
  const current = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      target.current.x = (e.clientX - r.left) / r.width;
      target.current.y = (e.clientY - r.top) / r.height;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.06;
      current.current.y += (target.current.y - current.current.y) * 0.06;
      const px = (current.current.x - 0.5) * 2; // -1..1
      const py = (current.current.y - 0.5) * 2;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-background"
      style={{ ["--px" as any]: "0", ["--py" as any]: "0" }}
    >
      {/* Animated colorful blobs */}
      <div className="absolute inset-0 -z-0 pointer-events-none">
        {[
          { w: "55vw", pos: { top: "-10%", right: "-10%" }, bg: "radial-gradient(circle, hsl(20 100% 62%) 0%, hsl(340 95% 60%) 55%, transparent 75%)", opacity: "opacity-70 dark:opacity-50", anim: "animate-blob-1", px: 30, py: 30 },
          { w: "50vw", pos: { top: "20%", left: "-15%" }, bg: "radial-gradient(circle, hsl(195 95% 60%) 0%, hsl(220 90% 65%) 55%, transparent 75%)", opacity: "opacity-60 dark:opacity-45", anim: "animate-blob-2", px: -40, py: -25 },
          { w: "45vw", pos: { bottom: "-15%", left: "20%" }, bg: "radial-gradient(circle, hsl(155 80% 55%) 0%, hsl(50 95% 60%) 60%, transparent 75%)", opacity: "opacity-55 dark:opacity-40", anim: "animate-blob-3", px: 25, py: -35 },
          { w: "35vw", pos: { top: "10%", left: "35%" }, bg: "radial-gradient(circle, hsl(280 75% 65%) 0%, transparent 70%)", opacity: "opacity-40 dark:opacity-35", anim: "animate-blob-4", px: -20, py: 20 },
        ].map((b, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: b.w,
              height: b.w,
              ...b.pos,
              transform: `translate(calc(var(--px) * ${b.px}px), calc(var(--py) * ${b.py}px))`,
              transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div
              className={`absolute inset-0 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen ${b.opacity} ${b.anim}`}
              style={{ background: b.bg }}
            />
          </div>
        ))}
      </div>


      {/* Fade to background at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-0"
        style={{ background: "linear-gradient(180deg, transparent, hsl(var(--background)))" }}
      />

      <div className="container relative z-10 py-32 md:py-48">
        <div className="max-w-5xl mx-auto text-center animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight text-foreground leading-[1.02]">
            What is the Open Lakehouse?
          </h1>
          <p className="mt-10 mx-auto max-w-2xl text-lg md:text-xl text-foreground/70 leading-relaxed">
            Your data, in open formats, on storage you control — readable by any engine you choose,
            today and ten years from now.
          </p>
        </div>
      </div>
    </section>
  );
};

