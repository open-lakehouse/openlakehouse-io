// Interactive water ripples for the lakehouse hero.
//
// Renders Stardew-style expanding ripple rings in a pixelated 2D canvas. The
// simulation uses the caller's current canvas coordinate system. The caller is
// responsible for clipping rendered rings to the visible water region.

export interface RippleColors {
  /** Bright leading edge (near-white blue). */
  outer: string;
  /** Mid ring (light sky blue, palette Blue/300). */
  mid: string;
  /** Trailing inner ring (deeper blue, palette Blue/500). */
  inner: string;
}

export interface WaterRipplesOptions {
  /** Max ring radius in the caller's canvas coordinates at full strength. */
  maxRadius?: number;
  /** Ripple lifetime in ms. */
  duration?: number;
  /** Vertical squash (ry / rx) to fake the lake's perspective. */
  flatten?: number;
  /** Hard cap on concurrent ripples (oldest are dropped). */
  max?: number;
  colors?: RippleColors;
}

interface Ripple {
  x: number;
  y: number;
  born: number;
  strength: number;
}

const DEFAULT_COLORS: RippleColors = {
  outer: "rgb(224, 244, 255)", // ~Blue/100, bright crest
  mid: "rgb(138, 202, 255)", // Blue/400
  inner: "rgb(66, 153, 224)", // Blue/500
};

export class WaterRipples {
  private ripples: Ripple[] = [];
  private readonly maxRadius: number;
  private readonly duration: number;
  private readonly flatten: number;
  private readonly max: number;
  private readonly colors: RippleColors;

  constructor(opts: WaterRipplesOptions = {}) {
    this.maxRadius = opts.maxRadius ?? 130;
    this.duration = opts.duration ?? 1600;
    this.flatten = opts.flatten ?? 0.42;
    this.max = opts.max ?? 48;
    this.colors = opts.colors ?? DEFAULT_COLORS;
  }

  /** Add a ripple in canvas coordinates. `strength` scales radius (0..~1.4). */
  spawn(x: number, y: number, strength = 1, now = performance.now()) {
    this.ripples.push({ x, y, born: now, strength: Math.max(0.15, strength) });
    if (this.ripples.length > this.max) {
      this.ripples.splice(0, this.ripples.length - this.max);
    }
  }

  /** Drop expired ripples. */
  update(now: number) {
    if (this.ripples.length === 0) return;
    this.ripples = this.ripples.filter((r) => now - r.born < this.duration);
  }

  get count() {
    return this.ripples.length;
  }

  /** Draw all live ripples into `ctx` (in buffer coordinates). */
  draw(ctx: CanvasRenderingContext2D, now: number) {
    const { flatten, maxRadius, duration, colors } = this;
    // Three concentric rings per ripple: bright leading edge + fainter trails.
    const rings = [
      { scale: 1.0, alpha: 0.9, width: 2, color: colors.outer },
      { scale: 0.78, alpha: 0.55, width: 1.5, color: colors.mid },
      { scale: 0.55, alpha: 0.35, width: 1, color: colors.inner },
    ];

    ctx.lineJoin = "round";
    for (const r of this.ripples) {
      const age = now - r.born;
      const t = age / duration;
      if (t < 0 || t >= 1) continue;
      // Decelerating expansion, fade out toward the end of life.
      const ease = 1 - Math.pow(1 - t, 2.2);
      const fade = Math.min(1, (1 - t) * 1.4) * Math.min(1, t * 6);
      const baseR = maxRadius * r.strength * ease;
      if (baseR < 0.5) continue;

      for (const ring of rings) {
        const rx = baseR * ring.scale;
        if (rx < 0.5) continue;
        const ry = rx * flatten;
        ctx.globalAlpha = fade * ring.alpha;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.ripples = [];
  }
}

export interface WaterMask {
  /** RGBA canvas whose alpha channel is the water region (for destination-in). */
  canvas: HTMLCanvasElement;
  /** True when the buffer-space point lies on water. */
  isWater: (x: number, y: number) => boolean;
  /** Pick a random water point (biased toward the open left side). */
  randomPoint: () => { x: number; y: number } | null;
  width: number;
  height: number;
}

/**
 * Rasterize the mask image at buffer resolution and derive:
 *  - an alpha-keyed canvas (white -> opaque) for clipping ripple layers, and
 *  - a fast per-pixel water lookup.
 */
export function buildWaterMask(
  img: HTMLImageElement,
  width: number,
  height: number,
): WaterMask {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, width, height);

  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  const water = new Uint8Array(width * height);
  for (let i = 0; i < water.length; i++) {
    // White mask pixel => water. Key on luminance of the red channel.
    water[i] = px[i * 4] > 127 ? 1 : 0;
  }

  // Re-key the canvas so its ALPHA channel encodes water (for destination-in).
  for (let i = 0; i < water.length; i++) {
    const on = water[i] ? 255 : 0;
    px[i * 4] = 255;
    px[i * 4 + 1] = 255;
    px[i * 4 + 2] = 255;
    px[i * 4 + 3] = on;
  }
  ctx.putImageData(data, 0, 0);

  const isWater = (x: number, y: number) => {
    const xi = x | 0;
    const yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= width || yi >= height) return false;
    return water[yi * width + xi] === 1;
  };

  const randomPoint = () => {
    for (let attempt = 0; attempt < 40; attempt++) {
      // Bias toward the open water on the left third of the scene.
      const x = Math.random() ** 1.5 * width;
      const y = height * (0.5 + Math.random() * 0.48);
      if (isWater(x, y)) return { x, y };
    }
    return null;
  };

  return { canvas, isWater, randomPoint, width, height };
}
