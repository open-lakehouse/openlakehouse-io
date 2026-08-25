#!/usr/bin/env python3
"""Generate the water mask for the interactive lakehouse hero.

White = water (the only region that ripples), black = sky/land/trees/house/dock.

Sky and water share almost the same blue hue, so a color key alone is
ambiguous. We combine:
  1. a horizon cutoff (water only exists below y~254 in this fixed scene),
  2. a water-blue hue/saturation/value key (excludes brown dock/land and
     green trees/grass/bushes),
  3. a morphological close to fill wave-crest speckles and bridge the dock.

Usage: make-hero-water-mask.py <scene.png> <out-mask.png>
"""
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SRC = sys.argv[1]
OUT = sys.argv[2]

HORIZON_Y = 254           # first water row (sea horizon)
HUE_LO, HUE_HI = 135, 153  # ~190-216 deg in PIL's 0-255 hue scale
SAT_MIN = 70               # ~0.27
VAL_MIN = 70               # ~0.27

im = Image.open(SRC).convert("RGB")
W, H = im.size
hsv = im.convert("HSV")
Hc, Sc, Vc = hsv.split()

hue = Hc.point(lambda p: 255 if HUE_LO <= p <= HUE_HI else 0)
sat = Sc.point(lambda p: 255 if p >= SAT_MIN else 0)
val = Vc.point(lambda p: 255 if p >= VAL_MIN else 0)

# AND the three keys (min = 255 only where all pass)
water = ImageChops.darker(ImageChops.darker(hue, sat), val)

# Horizon cutoff: zero out everything above the waterline.
horizon = Image.new("L", (W, H), 0)
ImageDraw.Draw(horizon).rectangle([0, HORIZON_Y, W - 1, H - 1], fill=255)
water = ImageChops.darker(water, horizon)

# Morphological close (dilate then erode) to fill wave-crest holes and bridge
# thin gaps, then a light open to drop stray specks.
water = water.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
water = water.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))

water.save(OUT)

# Coverage report
hist = water.histogram()
white = hist[255]
print(f"scene={W}x{H} horizon_y={HORIZON_Y} water_px={white} ({white/(W*H)*100:.1f}%)")
print(f"wrote {OUT}")
