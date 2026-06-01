import { useEffect, useRef } from "react";

export const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = 220; // simulation resolution

    type Layer = {
      color: string;
      baseY: number; // fraction of canvas height
      damping: number; // 0..1, closer to 1 = longer ringing
      spring: number; // restoring force pulling toward flat
      c2: number; // wave propagation coefficient
      strokeAlpha: number;
      fillAlpha: number;
      lineWidth: number;
      h: Float32Array;
      v: Float32Array;
    };

    const layers: Layer[] = [
      { color: "229 64% 48%", baseY: 0.32, damping: 0.988, spring: 0.0009, c2: 0.30, strokeAlpha: 0.55, fillAlpha: 0.18, lineWidth: 2, h: new Float32Array(N), v: new Float32Array(N) },
      { color: "296 56% 58%", baseY: 0.42, damping: 0.984, spring: 0.0011, c2: 0.32, strokeAlpha: 0.72, fillAlpha: 0.14, lineWidth: 1.75, h: new Float32Array(N), v: new Float32Array(N) },
      { color: "192 94% 55%", baseY: 0.52, damping: 0.980, spring: 0.0013, c2: 0.34, strokeAlpha: 0.85, fillAlpha: 0.10, lineWidth: 1.5, h: new Float32Array(N), v: new Float32Array(N) },
      { color: "191 100% 84%", baseY: 0.62, damping: 0.976, spring: 0.0015, c2: 0.36, strokeAlpha: 0.95, fillAlpha: 0.06, lineWidth: 1, h: new Float32Array(N), v: new Float32Array(N) },
    ];

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Apply a localized impulse (gaussian) to the velocity field of all layers.
    // Each layer scales the impulse so deeper layers get a softer kick.
    const layerImpulseScale = [0.55, 0.75, 0.9, 1.0];
    const impulse = (xFrac: number, strength: number, width: number) => {
      const center = xFrac * (N - 1);
      const inv2w2 = 1 / (2 * width * width);
      for (let l = 0; l < layers.length; l++) {
        const L = layers[l];
        const s = strength * layerImpulseScale[l];
        for (let i = 0; i < N; i++) {
          const d = i - center;
          const g = Math.exp(-(d * d) * inv2w2);
          if (g < 0.001) continue;
          L.v[i] -= s * g; // negative velocity = upward displacement
        }
      }
    };

    let lastX = 0, lastY = 0, lastT = 0, hasLast = false;
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = performance.now();
      if (hasLast) {
        const dt = Math.max(1, t - lastT);
        const speed = Math.hypot(x - lastX, y - lastY) / dt; // px/ms
        if (speed > 0.4) {
          // Gentle hover ripple — much softer than click
          const strength = Math.min(speed * 0.15, 0.9);
          const width = Math.max(5, 9 - speed);
          impulse(x / rect.width, strength, width);
        }
      }
      lastX = x; lastY = y; lastT = t; hasLast = true;
    };
    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      impulse(x / rect.width, 7, 3.5);
      lastX = x; lastY = e.clientY - rect.top; lastT = performance.now(); hasLast = true;
    };
    const onPointerLeave = () => { hasLast = false; };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerleave", onPointerLeave);

    // Ambient ripples — small random impulses so the water is never fully still
    let nextAmbient = performance.now() + 600;
    const scheduleAmbient = (now: number) => {
      // ~every 0.9–2.2s, drop a soft impulse somewhere across the surface
      nextAmbient = now + 900 + Math.random() * 1300;
    };


    let raf = 0;
    const step = () => {
      const now = performance.now();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Ambient ripples — soft, wide impulses at random spots
      if (now >= nextAmbient) {
        const xFrac = 0.05 + Math.random() * 0.9;
        impulse(xFrac, 0.35 + Math.random() * 0.35, 10 + Math.random() * 6);
        scheduleAmbient(now);
      }



      for (let li = 0; li < layers.length; li++) {
        const L = layers[li];
        const H = L.h, V = L.v;
        // 1D damped wave equation toward flat baseline
        for (let i = 1; i < N - 1; i++) {
          const accel = (H[i - 1] + H[i + 1] - 2 * H[i]) * L.c2 - L.spring * H[i];
          V[i] = (V[i] + accel) * L.damping;
        }
        // soft absorbing boundary so ripples don't bounce hard off the edges
        V[0] *= 0.86; V[N - 1] *= 0.86;
        H[0] = H[1] * 0.5; H[N - 1] = H[N - 2] * 0.5;
        for (let i = 0; i < N; i++) H[i] += V[i];

        // Stroke the wave
        const baseY = h * L.baseY;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const x = (i / (N - 1)) * w;
          const y = baseY + H[i];
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsl(${L.color} / ${L.strokeAlpha})`;
        ctx.lineWidth = L.lineWidth;
        ctx.lineJoin = "round";
        ctx.shadowBlur = 6;
        ctx.shadowColor = `hsl(${L.color} / 0.6)`;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Gradient fill underneath
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, baseY, 0, baseY + h * 0.22);
        grad.addColorStop(0, `hsl(${L.color} / ${L.fillAlpha})`);
        grad.addColorStop(0.55, `hsl(${L.color} / ${L.fillAlpha * 0.35})`);
        grad.addColorStop(1, `hsl(${L.color} / 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[hsl(229_64%_9%)]">
      {/* Ambient depth glow */}
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, hsl(296 56% 28% / 0.55), transparent 60%), radial-gradient(100% 70% at 80% 30%, hsl(192 94% 35% / 0.35), transparent 65%), linear-gradient(180deg, hsl(229 64% 12%), hsl(229 64% 7%))",
        }}
      />

      {/* Interactive water canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-x-0 top-0 h-[70%] w-full touch-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Fade to dark at bottom for clean transition into the marquee */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{
          zIndex: 2,
          background: "linear-gradient(180deg, transparent, hsl(229 50% 6%))",
        }}
      />

      <div className="container relative py-32 md:py-48 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="max-w-5xl mx-auto text-center animate-[fade-up_0.8s_ease-out] relative">
          {/* Dark purple gradient halo behind the heading */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10"
            style={{
              width: "min(900px, 110%)",
              height: "min(420px, 140%)",
              background:
                "radial-gradient(ellipse at center, hsl(296 70% 22% / 0.85) 0%, hsl(285 65% 16% / 0.6) 35%, hsl(280 60% 10% / 0.25) 65%, transparent 80%)",
              filter: "blur(20px)",
            }}
          />
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
