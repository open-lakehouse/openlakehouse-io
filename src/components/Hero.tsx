import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { WaterRipples } from "./hero/waterRipples";

// Every artwork layer uses this shared coordinate system. The scene may shrink
// with the viewport but stops growing at 1200 CSS pixels.
const SCENE_W = 1024;
const SCENE_H = 576;
const SCENE_MAX_W = 1200;
const HORIZON_Y = 254;
const SMALL_CLOUD_SRC = "/assets/hero-cloud-small.png";
const LARGE_CLOUD_SRC = "/assets/hero-cloud-large.png";
const FOREGROUND_SRC = "/assets/hero-lakehouse-foreground.png";
const FLOWER_BUSH_SRC = "/assets/hero-sprite-flower-bush.png";
const TREE_SRC = "/assets/hero-sprite-pine-clean.png";

interface HeroCloud {
  src: string;
  left: string;
  top: string;
  width: string;
  duration: string;
  delay: string;
  travel: string;
}

// Tweak these values to change each cloud's path and pace independently.
const HERO_CLOUDS: readonly HeroCloud[] = [
  {
    src: SMALL_CLOUD_SRC,
    left: "35%",
    top: "19%",
    width: "clamp(82px, 12vw, 145px)",
    duration: "105s",
    delay: "-24s",
    travel: "22vw",
  },
  {
    src: LARGE_CLOUD_SRC,
    left: "58%",
    top: "9%",
    width: "clamp(130px, 18vw, 220px)",
    duration: "138s",
    delay: "-76s",
    travel: "28vw",
  },
];

interface HeroTree {
  id: string;
  left: string;
  top: string;
  width: string;
  layer: "behind" | "front";
}

const HERO_TREES: readonly HeroTree[] = [
  { id: "left", left: "29%", top: "31%", width: "17%", layer: "front" },
  { id: "center", left: "42%", top: "20%", width: "18%", layer: "front" },
  { id: "mid-right", left: "58%", top: "24%", width: "14%", layer: "behind" },
  { id: "far-right", left: "81%", top: "12%", width: "13%", layer: "behind" },
];

type CloudStyle = CSSProperties & {
  "--cloud-travel": string;
};

interface SceneLayout {
  width: number;
  height: number;
  scale: number;
  horizonY: number;
}

const getSceneLayout = (width: number, height: number): SceneLayout => {
  const sceneWidth = Math.min(width, SCENE_MAX_W);
  const scale = sceneWidth / SCENE_W;
  const sceneHeight = SCENE_H * scale;
  const sceneTop = (height - sceneHeight) / 2;

  return {
    width,
    height,
    scale,
    horizonY: sceneTop + HORIZON_Y * scale,
  };
};

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

    Promise.all([
      loadImage(SMALL_CLOUD_SRC),
      loadImage(LARGE_CLOUD_SRC),
      loadImage(FOREGROUND_SRC),
      loadImage(FLOWER_BUSH_SRC),
      loadImage(TREE_SRC),
    ])
      .then(() => {
        if (cancelled) return;
        setReady(true);

        const ripples = new WaterRipples({ maxRadius: 110, duration: 1600 });
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        const backgroundCanvas = document.createElement("canvas");
        const backgroundCtx = backgroundCanvas.getContext("2d");
        if (!backgroundCtx) return;

        let dpr = 1;
        let layout = getSceneLayout(
          section.clientWidth,
          section.clientHeight,
        );

        const tokenColor = (token: string, alpha = 1) => {
          const value = getComputedStyle(section)
            .getPropertyValue(token)
            .trim();
          return `hsl(${value} / ${alpha})`;
        };

        const seededFraction = (seed: number) => {
          const value = Math.sin(seed * 12.9898) * 43758.5453;
          return value - Math.floor(value);
        };

        const paintBackground = () => {
          const { width, height, horizonY, scale } = layout;
          backgroundCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          backgroundCtx.clearRect(0, 0, width, height);

          const skyEnd = Math.max(0, Math.min(height, horizonY));
          if (skyEnd > 0) {
            const sky = backgroundCtx.createLinearGradient(0, 0, 0, skyEnd);
            sky.addColorStop(0, tokenColor("--blue-500"));
            sky.addColorStop(0.72, tokenColor("--blue-400"));
            sky.addColorStop(1, tokenColor("--blue-200"));
            backgroundCtx.fillStyle = sky;
            backgroundCtx.fillRect(0, 0, width, skyEnd);
          }

          const waterStart = Math.max(0, Math.min(height, horizonY));
          if (waterStart < height) {
            const water = backgroundCtx.createLinearGradient(
              0,
              horizonY,
              0,
              height,
            );
            water.addColorStop(0, tokenColor("--blue-500"));
            water.addColorStop(0.58, tokenColor("--blue-600"));
            water.addColorStop(1, tokenColor("--blue-700"));
            backgroundCtx.fillStyle = water;
            backgroundCtx.fillRect(0, waterStart, width, height - waterStart);

            // Deterministic pixel streaks keep the generated water consistent
            // with the source artwork without stretching a raster texture.
            const detailScale = Math.max(0.7, scale);
            const rowGap = Math.max(38, Math.round(52 * detailScale));
            const columnGap = Math.max(92, Math.round(132 * detailScale));
            const lineHeight = Math.max(2, Math.round(2 * detailScale));
            let row = 0;

            for (
              let y = horizonY + rowGap;
              y < height;
              y += rowGap, row += 1
            ) {
              const offset = seededFraction(row + 1) * columnGap;
              for (
                let x = offset - columnGap;
                x < width;
                x += columnGap
              ) {
                const seed = row * 97 + Math.round(x / columnGap) + 13;
                const length = Math.round(
                  (18 + seededFraction(seed) * 48) * detailScale,
                );
                const px = Math.round(x);
                const py = Math.round(y);

                backgroundCtx.fillStyle = tokenColor("--blue-400", 0.28);
                backgroundCtx.fillRect(px, py, length, lineHeight);

                if (seededFraction(seed + 31) > 0.52) {
                  const tailGap = Math.max(5, Math.round(7 * detailScale));
                  backgroundCtx.fillRect(
                    px + length + tailGap,
                    py,
                    Math.max(7, Math.round(length * 0.42)),
                    lineHeight,
                  );
                }
              }
            }
          }
        };

        const drawFrame = (now: number) => {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(backgroundCanvas, 0, 0);

          if (!reduceMotion) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.save();
            ctx.beginPath();
            ctx.rect(
              0,
              layout.horizonY,
              layout.width,
              layout.height - layout.horizonY,
            );
            ctx.clip();
            ripples.draw(ctx, now);
            ctx.restore();
          }
        };

        const resize = () => {
          const width = Math.max(1, section.clientWidth);
          const height = Math.max(1, section.clientHeight);
          dpr = Math.min(window.devicePixelRatio || 1, 2);
          layout = getSceneLayout(width, height);

          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          backgroundCanvas.width = canvas.width;
          backgroundCanvas.height = canvas.height;
          ctx.imageSmoothingEnabled = false;
          backgroundCtx.imageSmoothingEnabled = false;

          paintBackground();
          drawFrame(performance.now());
        };

        const isWater = (x: number, y: number) => {
          return (
            x >= 0 &&
            x < layout.width &&
            y >= layout.horizonY &&
            y < layout.height
          );
        };

        const toCanvasPoint = (clientX: number, clientY: number) => {
          const rect = canvas.getBoundingClientRect();
          return {
            x: clientX - rect.left,
            y: clientY - rect.top,
          };
        };

        const randomWaterPoint = () => {
          const firstWaterRow = Math.max(0, layout.horizonY);
          const waterHeight = layout.height - firstWaterRow;
          if (waterHeight <= 0) return null;

          for (let attempt = 0; attempt < 40; attempt += 1) {
            const x = Math.random() ** 1.35 * layout.width;
            const y = firstWaterRow + Math.random() * waterHeight;
            if (isWater(x, y)) return { x, y };
          }
          return null;
        };

        // Ambient ripples so the lake is never perfectly still.
        let nextAmbient = performance.now() + 700;
        const scheduleAmbient = (now: number) => {
          nextAmbient = now + 1200 + Math.random() * 1400;
        };

        // Pointer interaction (water only). We never preventDefault, so the
        // page keeps scrolling on touch devices.
        // Hover ripples back off exponentially while the pointer stays active,
        // so continuous movement spawns progressively fewer ripples. The
        // interval resets when the pointer pauses (an idle gap) or on a press.
        const MOVE_INTERVAL_MIN = 90; // ms between hover ripples at the start
        const MOVE_INTERVAL_MAX = 1400; // ms once fully backed off
        const MOVE_BACKOFF = 1.7; // interval growth factor per spawn
        const MOVE_IDLE_RESET = 260; // ms of stillness that resets the backoff

        let lastX = 0,
          lastY = 0,
          lastT = 0,
          hasLast = false,
          lastSpawn = 0,
          moveInterval = MOVE_INTERVAL_MIN;

        const onPointerMove = (e: PointerEvent) => {
          const { x, y } = toCanvasPoint(e.clientX, e.clientY);
          const t = performance.now();
          // A pause in movement resets the backoff back to frequent.
          if (t - lastT > MOVE_IDLE_RESET) moveInterval = MOVE_INTERVAL_MIN;
          if (hasLast && isWater(x, y)) {
            const dt = Math.max(1, t - lastT);
            const speed = Math.hypot(x - lastX, y - lastY) / dt;
            if (speed > 0.15 && t - lastSpawn >= moveInterval) {
              ripples.spawn(x, y, Math.min(0.15 + speed * 0.06, 0.55), t);
              lastSpawn = t;
              moveInterval = Math.min(moveInterval * MOVE_BACKOFF, MOVE_INTERVAL_MAX);
            }
          }
          lastX = x;
          lastY = y;
          lastT = t;
          hasLast = true;
        };
        const onPointerDown = (e: PointerEvent) => {
          const { x, y } = toCanvasPoint(e.clientX, e.clientY);
          if (isWater(x, y)) {
            ripples.spawn(x, y, 1.1);
          }
          lastX = x;
          lastY = y;
          const t = performance.now();
          lastT = t;
          lastSpawn = t;
          moveInterval = MOVE_INTERVAL_MIN; // a fresh press starts frequent again
          hasLast = true;
        };
        const onPointerLeave = () => {
          hasLast = false;
          moveInterval = MOVE_INTERVAL_MIN;
        };

        if (!reduceMotion) {
          canvas.addEventListener("pointermove", onPointerMove);
          canvas.addEventListener("pointerdown", onPointerDown);
          canvas.addEventListener("pointerleave", onPointerLeave);
        }

        const step = () => {
          const now = performance.now();

          if (now >= nextAmbient) {
            const p = randomWaterPoint();
            if (p) ripples.spawn(p.x, p.y, 0.2 + Math.random() * 0.18, now);
            scheduleAmbient(now);
          }

          ripples.update(now);
          drawFrame(now);
          raf = requestAnimationFrame(step);
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(section);
        resize();

        // Pause the loop when the hero is off-screen.
        const io = new IntersectionObserver(
          ([entry]) => {
            if (!reduceMotion && entry.isIntersecting && !raf) {
              raf = requestAnimationFrame(step);
            } else if ((!entry.isIntersecting || reduceMotion) && raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            }
          },
          { threshold: 0.01 },
        );
        io.observe(section);

        cleanup = () => {
          io.disconnect();
          resizeObserver.disconnect();
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
      className="relative flex h-[clamp(300px,40svh,340px)] items-center overflow-hidden bg-[hsl(var(--navy-900))] md:h-[clamp(440px,60svh,600px)]"
    >
      {/* Responsive sky, water texture, and interactive ripples */}
      <canvas
        ref={canvasRef}
        width={SCENE_W}
        height={SCENE_H}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{
          imageRendering: "pixelated",
          opacity: ready ? 1 : 0,
          zIndex: 0,
        }}
      />

      {/* Clouds drift independently across the generated sky. Their paths and
          timing are configured in HERO_CLOUDS above. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0, zIndex: 2 }}
      >
        {HERO_CLOUDS.map((cloud) => (
          <img
            key={cloud.src}
            src={cloud.src}
            alt=""
            draggable={false}
            className="hero-cloud-drift absolute"
            style={
              {
                imageRendering: "pixelated",
                left: cloud.left,
                top: cloud.top,
                width: cloud.width,
                animationDuration: cloud.duration,
                animationDelay: cloud.delay,
                "--cloud-travel": cloud.travel,
              } as CloudStyle
            }
          />
        ))}
      </div>

      {/* The full artwork group is 70% of its previous size and stays pinned
          right. Replacement pines fill or cover the source trees while keeping
          house/roof overlap in the correct stacking order. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 aspect-[1024/951] h-[101.5%] max-h-[609px] w-auto translate-x-[22%] -translate-y-1/2 transition-opacity duration-700 min-[400px]:translate-x-[10%] sm:translate-x-0"
        style={{ opacity: ready ? 1 : 0, zIndex: 5 }}
      >
        {HERO_TREES.filter((tree) => tree.layer === "behind").map((tree) => (
          <img
            key={tree.id}
            src={TREE_SRC}
            alt=""
            draggable={false}
            className="absolute"
            style={{
              imageRendering: "pixelated",
              left: tree.left,
              top: tree.top,
              width: tree.width,
              zIndex: 2,
            }}
          />
        ))}
        <img
          src={FOREGROUND_SRC}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full"
          style={{
            imageRendering: "pixelated",
            zIndex: 5,
          }}
        />
        {HERO_TREES.filter((tree) => tree.layer === "front").map((tree) => (
          <img
            key={tree.id}
            src={TREE_SRC}
            alt=""
            draggable={false}
            className="absolute"
            style={{
              imageRendering: "pixelated",
              left: tree.left,
              top: tree.top,
              width: tree.width,
              zIndex: 6,
            }}
          />
        ))}
        {/* A separately extracted flowering bush demonstrates how supplied
            sprites can be positioned independently over the clean scene. */}
        <img
          src={FLOWER_BUSH_SRC}
          alt=""
          draggable={false}
          className="absolute"
          style={{
            imageRendering: "pixelated",
            left: "49%",
            top: "54%",
            width: "8%",
            zIndex: 7,
          }}
        />
      </div>

      {/* Gentle bottom fade into the marquee below */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-16 pointer-events-none md:h-24"
        style={{
          zIndex: 10,
          background:
            "linear-gradient(180deg, transparent, hsl(var(--navy-900) / 0.35))",
        }}
      />

      <div
        className="container relative min-w-0 pointer-events-none py-8 md:py-16"
        style={{ zIndex: 20 }}
      >
        <div className="min-w-0 max-w-2xl animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.03] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            What is the Open Lakehouse?
          </h1>
          <div className="relative mt-6 min-w-0 w-full max-w-[13rem] md:mt-8 md:max-w-xl">
            <p className="relative text-sm leading-relaxed text-white hero-mobile-text-shadow md:text-lg md:text-white/90 md:drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] lg:text-xl">
              <span className="md:hidden">
                <span className="block whitespace-nowrap">Your data, in open formats,</span>
                <span className="block whitespace-nowrap">on storage you control —</span>
                <span className="block whitespace-nowrap">readable by any engine</span>
                <span className="block whitespace-nowrap">you choose, today</span>
                <span className="block whitespace-nowrap">and ten years from now.</span>
              </span>
              <span className="hidden md:inline">
                Your data, in open formats, on storage you control — readable by any
                engine you choose, today and ten years from now.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
