#!/usr/bin/env python3
"""Split the flattened hero scene into transparent pixel-art layers.

The generated foreground keeps the shoreline, trees, house, and dock. The two
clouds are emitted as separate, tightly-cropped assets. Sky and water pixels
are removed so the responsive hero canvas can paint an unlimited background.

Usage:
  python3 scripts/make-hero-layers.py \
    <clean-hero-source.jpg> public/assets
"""

import sys
from pathlib import Path

from PIL import Image

SRC = Path(sys.argv[1])
OUT_DIR = Path(sys.argv[2])

# Bounds are left, top, right, bottom in the clean 1024x951 source scene.
CLOUDS = {
    "small": (232, 184, 460, 251),
    "large": (486, 112, 825, 226),
}


def is_background_pixel(hue: int, saturation: int, value: int) -> bool:
    """Identify blue sky/water while preserving foreground artwork."""
    return 128 <= hue <= 164 and saturation >= 28 and value >= 55


def is_cloud_pixel(saturation: int, value: int) -> bool:
    """Keep the bright, low-saturation cream and peach cloud palette."""
    return saturation <= 125 and value >= 165


scene = Image.open(SRC).convert("RGBA")
if scene.size != (1024, 951):
    raise ValueError(f"expected a 1024x951 clean hero source, got {scene.size}")

width, height = scene.size
hsv = scene.convert("RGB").convert("HSV")
foreground_alpha = Image.new("L", scene.size, 0)

hsv_pixels = hsv.load()
alpha_pixels = foreground_alpha.load()

for y in range(height):
    for x in range(width):
        hue, saturation, value = hsv_pixels[x, y]
        alpha_pixels[x, y] = (
            0 if is_background_pixel(hue, saturation, value) else 255
        )

OUT_DIR.mkdir(parents=True, exist_ok=True)

# Keep the clean flattened source in-repo so all derived layers are reproducible.
source_path = OUT_DIR / "hero-lakehouse.png"
scene.convert("RGB").save(source_path, optimize=True)
print(f"wrote {source_path}")

# Build clouds first so only their visible pixels are removed from the main
# foreground. This preserves tree pixels that overlap a cloud's crop bounds.
for name, bounds in CLOUDS.items():
    cloud = scene.crop(bounds)
    cloud_hsv = cloud.convert("RGB").convert("HSV")
    cloud_alpha = Image.new("L", cloud.size, 0)
    cloud_hsv_pixels = cloud_hsv.load()
    cloud_alpha_pixels = cloud_alpha.load()

    for y in range(cloud.height):
        for x in range(cloud.width):
            _, saturation, value = cloud_hsv_pixels[x, y]
            if is_cloud_pixel(saturation, value):
                cloud_alpha_pixels[x, y] = 255

    left, top, right, bottom = bounds
    for y in range(cloud.height):
        for x in range(cloud.width):
            alpha_pixels[left + x, top + y] = 0

    cloud.putalpha(cloud_alpha)
    cloud_path = OUT_DIR / f"hero-cloud-{name}.png"
    cloud.save(cloud_path)
    cloud_visible = cloud_alpha.histogram()[255]
    print(
        f"wrote {cloud_path} "
        f"({cloud_visible / (cloud.width * cloud.height) * 100:.1f}% visible)"
    )

foreground = scene.copy()
foreground.putalpha(foreground_alpha)

foreground_path = OUT_DIR / "hero-lakehouse-foreground.png"
foreground.save(foreground_path)
foreground_visible = foreground_alpha.histogram()[255]
print(
    f"wrote {foreground_path} "
    f"({foreground_visible / (width * height) * 100:.1f}% visible)"
)
