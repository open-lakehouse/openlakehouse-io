export interface ShorelineWaveLayout {
  left: number;
  top: number;
  scale: number;
}

export interface ShorelineWaveColors {
  /** Lightest band, nearest the shore. */
  shore: string;
  /** Mid-blue transition band. */
  middle: string;
  /** Deepest band, furthest into open water. */
  outer: string;
}

export interface ShorelineWave {
  /** Starting point in the 1024x951 foreground artwork. */
  x: number;
  y: number;
  /** Travel vector pointing away from the shoreline. */
  driftX: number;
  driftY: number;
  /** Final width in source-art pixels. */
  length: number;
  duration: number;
  phase: number;
}

// Waves trace the curved shore, both sides of the dock, and the lower bank.
// Values are intentionally data-driven so the pacing and origin points can be
// tuned without touching the drawing algorithm.
export const DEFAULT_SHORELINE_WAVES: readonly ShorelineWave[] = [
  { x: 326, y: 438, driftX: -72, driftY: 3, length: 70, duration: 9200, phase: 0 },
  { x: 302, y: 510, driftX: -88, driftY: 12, length: 82, duration: 10600, phase: 3700 },
  { x: 315, y: 586, driftX: -96, driftY: 22, length: 92, duration: 11200, phase: 7100 },
  { x: 354, y: 650, driftX: -108, driftY: 30, length: 104, duration: 12400, phase: 2200 },
  { x: 432, y: 742, driftX: -92, driftY: 36, length: 96, duration: 10800, phase: 5900 },
  { x: 510, y: 720, driftX: -62, driftY: -34, length: 76, duration: 9800, phase: 1400 },
  { x: 598, y: 680, driftX: -48, driftY: -30, length: 68, duration: 11400, phase: 8200 },
  { x: 548, y: 812, driftX: -45, driftY: 54, length: 88, duration: 12100, phase: 4600 },
  { x: 688, y: 838, driftX: -30, driftY: 62, length: 98, duration: 13200, phase: 9100 },
];

const easeOut = (value: number) => 1 - (1 - value) ** 2;

export function drawShorelineWaves(
  ctx: CanvasRenderingContext2D,
  now: number,
  layout: ShorelineWaveLayout,
  colors: ShorelineWaveColors,
  waves: readonly ShorelineWave[] = DEFAULT_SHORELINE_WAVES,
) {
  const pixel = Math.max(2, Math.round(3 * layout.scale));

  for (const wave of waves) {
    const progress = ((now + wave.phase) % wave.duration) / wave.duration;
    const travel = easeOut(progress);
    const opacity = Math.sin(progress * Math.PI) * 0.82;
    const width = wave.length * (0.45 + progress * 0.55) * layout.scale;

    const drawBand = (
      color: string,
      distance: number,
      widthScale: number,
      alpha: number,
    ) => {
      const x =
        layout.left +
        (wave.x + wave.driftX * travel * distance) * layout.scale;
      const y =
        layout.top +
        (wave.y + wave.driftY * travel * distance) * layout.scale;
      const bandWidth = width * widthScale;
      const firstWidth = Math.max(
        pixel * 3,
        Math.round(bandWidth * 0.58),
      );
      const secondWidth = Math.max(
        pixel * 2,
        Math.round(bandWidth * 0.24),
      );
      const gap = Math.max(pixel * 2, Math.round(bandWidth * 0.1));
      const startX = Math.round(x - bandWidth * 0.5);
      const lineY = Math.round(y);

      ctx.globalAlpha = opacity * alpha;
      ctx.fillStyle = color;
      ctx.fillRect(startX, lineY, firstWidth, pixel);
      ctx.fillRect(startX + firstWidth + gap, lineY, secondWidth, pixel);
    };

    // Paint from open water back toward shore. The three bands travel at
    // slightly different rates, preserving the source artwork's stepped
    // light → mid → deep-blue shoreline gradation.
    drawBand(colors.outer, 1, 1, 0.58);
    drawBand(colors.middle, 0.82, 0.84, 0.76);
    drawBand(colors.shore, 0.64, 0.68, 0.94);
  }

  ctx.globalAlpha = 1;
}
