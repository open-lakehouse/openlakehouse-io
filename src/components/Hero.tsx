import { useEffect, useRef, useState } from "react";
import { WaterRipples, buildWaterMask, type WaterMask } from "./hero/waterRipples";

// The pixel-art scene is authored at this native resolution. The canvas buffer
// stays at these dimensions and is CSS-upscaled with `image-rendering: pixelated`
// so the retro pixels stay crisp.
const SCENE_W = 1024;
const SCENE_H = 576;
const SCENE_SRC = "/assets/hero-lakehouse.png";
const MASK_SRC = "/assets/hero-lakehouse-water-mask.png";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    let raf = 0;
    let cancelled = false;
    let cleanup = () => {};

    Promise.all([loadImage(SCENE_SRC), loadImage(MASK_SRC)])
      .then(([scene, maskImg]) => {
        if (cancelled) return;
        setReady(true);

        const mask: WaterMask = buildWaterMask(maskImg, SCENE_W, SCENE_H);

        // Offscreen layer where ripples are drawn, then clipped to water.
        const rippleCanvas = document.createElement("canvas");
        rippleCanvas.width = SCENE_W;
        rippleCanvas.height = SCENE_H;
        const rctx = rippleCanvas.getContext("2d")!;
        rctx.imageSmoothingEnabled = false;

        const ripples = new WaterRipples({ maxRadius: 130, duration: 1600 });

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        const drawScene = () => {
          ctx.clearRect(0, 0, SCENE_W, SCENE_H);
          ctx.drawImage(scene, 0, 0, SCENE_W, SCENE_H);
        };

        // Reduced motion: paint the static scene once, no simulation.
        if (reduceMotion) {
          drawScene();
          cleanup = () => {};
          return;
        }

        // Map a pointer event to scene-buffer coordinates, accounting for the
        // canvas's `object-fit: cover` + `object-position: right center`.
        const toBuffer = (clientX: number, clientY: number) => {
          const rect = canvas.getBoundingClientRect();
          const scale = Math.max(rect.width / SCENE_W, rect.height / SCENE_H);
          const freeX = SCENE_W * scale - rect.width; // cropped horizontally
          const freeY = SCENE_H * scale - rect.height; // cropped vertically
          const px = clientX - rect.left;
          const py = clientY - rect.top;
          // right-aligned x (fraction 1), center y (fraction 0.5)
          const bx = (px + freeX) / scale;
          const by = (py + freeY * 0.5) / scale;
          return { bx, by };
        };

        // Ambient ripples so the lake is never perfectly still.
        let nextAmbient = performance.now() + 700;
        const scheduleAmbient = (now: number) => {
          nextAmbient = now + 1200 + Math.random() * 1400;
        };

        // Pointer interaction (water only). We never preventDefault, so the
        // page keeps scrolling on touch devices.
        let lastX = 0,
          lastY = 0,
          lastT = 0,
          hasLast = false,
          lastSpawn = 0;

        const onPointerMove = (e: PointerEvent) => {
          const { bx, by } = toBuffer(e.clientX, e.clientY);
          const t = performance.now();
          if (hasLast && mask.isWater(bx, by)) {
            const dt = Math.max(1, t - lastT);
            const speed = Math.hypot(bx - lastX, by - lastY) / dt;
            if (speed > 0.15 && t - lastSpawn > 70) {
              ripples.spawn(bx, by, Math.min(0.15 + speed * 0.06, 0.55), t);
              lastSpawn = t;
            }
          }
          lastX = bx;
          lastY = by;
          lastT = t;
          hasLast = true;
        };
        const onPointerDown = (e: PointerEvent) => {
          const { bx, by } = toBuffer(e.clientX, e.clientY);
          if (mask.isWater(bx, by)) {
            ripples.spawn(bx, by, 1.1);
          }
          lastX = bx;
          lastY = by;
          lastT = performance.now();
          hasLast = true;
        };
        const onPointerLeave = () => {
          hasLast = false;
        };

        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointerleave", onPointerLeave);

        const step = () => {
          const now = performance.now();

          if (now >= nextAmbient) {
            const p = mask.randomPoint();
            if (p) ripples.spawn(p.x, p.y, 0.2 + Math.random() * 0.18, now);
            scheduleAmbient(now);
          }

          ripples.update(now);

          drawScene();

          // Draw ripples, clip them to the water region, composite over scene.
          rctx.clearRect(0, 0, SCENE_W, SCENE_H);
          ripples.draw(rctx, now);
          rctx.globalCompositeOperation = "destination-in";
          rctx.drawImage(mask.canvas, 0, 0);
          rctx.globalCompositeOperation = "source-over";
          ctx.drawImage(rippleCanvas, 0, 0);

          raf = requestAnimationFrame(step);
        };

        // Pause the loop when the hero is off-screen.
        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && !raf) {
              raf = requestAnimationFrame(step);
            } else if (!entry.isIntersecting && raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            }
          },
          { threshold: 0.01 },
        );
        io.observe(section);

        cleanup = () => {
          io.disconnect();
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointerleave", onPointerLeave);
        };
      })
      .catch(() => {
        /* image failed to load — the navy section background remains */
      });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[hsl(var(--navy-900))] min-h-[68vh] md:min-h-[80vh] flex items-center"
    >
      {/* Interactive pixel-art water scene */}
      <canvas
        ref={canvasRef}
        width={SCENE_W}
        height={SCENE_H}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{
          objectFit: "cover",
          objectPosition: "right center",
          imageRendering: "pixelated",
          opacity: ready ? 1 : 0,
          zIndex: 0,
        }}
      />

      {/* Left scrim so the headline stays readable over the bright sky/water */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "linear-gradient(90deg, hsl(var(--navy-900) / 0.88) 0%, hsl(var(--navy-900) / 0.6) 30%, hsl(var(--navy-900) / 0.15) 52%, transparent 66%)",
        }}
      />
      {/* Gentle bottom fade into the marquee below */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "linear-gradient(180deg, transparent, hsl(var(--navy-900) / 0.35))",
        }}
      />

      <div
        className="container relative pointer-events-none py-24 md:py-32"
        style={{ zIndex: 20 }}
      >
        <div className="max-w-2xl animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.03] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            What is the Open Lakehouse?
          </h1>
          <p className="mt-8 max-w-xl text-lg md:text-xl text-white/90 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Your data, in open formats, on storage you control — readable by any
            engine you choose, today and ten years from now.
          </p>
        </div>
      </div>
    </section>
  );
};
