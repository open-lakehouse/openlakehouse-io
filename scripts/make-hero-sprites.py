#!/usr/bin/env python3
"""Extract transparent hero sprites from the supplied 1024x576 sprite sheet.

The source is a JPEG with a baked checkerboard rather than true transparency.
This script flood-fills the neutral checkerboard from each crop's edges while
preserving enclosed light details such as flowers and window highlights.

Usage:
  python3 scripts/make-hero-sprites.py \
    <sprite-sheet.jpg> public/assets [replacement-tree.jpg]
"""

import shutil
import sys
from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(sys.argv[1])
OUT_DIR = Path(sys.argv[2])
TREE_SRC = Path(sys.argv[3]) if len(sys.argv) > 3 else None

# left, top, right, bottom bounds in the 1024x576 source sheet.
SPRITES = {
    "house": (550, 24, 738, 201),
    "pine": (226, 268, 282, 368),
    "bush": (19, 295, 113, 371),
    "flower-bush": (136, 297, 222, 369),
    "dock": (900, 272, 1024, 380),
}


def is_checkerboard(pixel: tuple[int, int, int]) -> bool:
    """Return true for the JPEG-compressed neutral checkerboard palette."""
    red, green, blue = pixel
    value = max(pixel)
    saturation = value - min(pixel)
    return 115 <= value <= 255 and saturation <= 24 and abs(red - green) <= 18


def transparent_background(crop: Image.Image) -> Image.Image:
    rgb = crop.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    background = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if background[index] or not is_checkerboard(pixels[x, y]):
            return
        background[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in (
            (x - 1, y),
            (x + 1, y),
            (x, y - 1),
            (x, y + 1),
            (x - 1, y - 1),
            (x + 1, y - 1),
            (x - 1, y + 1),
            (x + 1, y + 1),
        ):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)

    rgba = rgb.convert("RGBA")
    alpha = Image.new("L", (width, height), 255)
    alpha_pixels = alpha.load()
    for y in range(height):
        for x in range(width):
            if background[y * width + x]:
                alpha_pixels[x, y] = 0

    rgba.putalpha(alpha)
    return rgba


sheet = Image.open(SRC).convert("RGB")
if sheet.size != (1024, 576):
    raise ValueError(f"expected a 1024x576 sprite sheet, got {sheet.size}")

OUT_DIR.mkdir(parents=True, exist_ok=True)
archived_source = OUT_DIR / "hero-sprite-sheet.jpg"
if SRC.resolve() != archived_source.resolve():
    shutil.copyfile(SRC, archived_source)
    print(f"wrote {archived_source}")

for name, bounds in SPRITES.items():
    sprite = transparent_background(sheet.crop(bounds))
    output = OUT_DIR / f"hero-sprite-{name}.png"
    sprite.save(output, optimize=True)
    visible = sprite.getchannel("A").histogram()[255]
    coverage = visible / (sprite.width * sprite.height) * 100
    print(f"wrote {output} ({coverage:.1f}% opaque)")

if TREE_SRC:
    archived_tree = OUT_DIR / "hero-tree-source.jpg"
    if TREE_SRC.resolve() != archived_tree.resolve():
        shutil.copyfile(TREE_SRC, archived_tree)
        print(f"wrote {archived_tree}")

    tree = transparent_background(Image.open(TREE_SRC).convert("RGB"))
    content_bounds = tree.getchannel("A").getbbox()
    if not content_bounds:
        raise ValueError("replacement tree extraction produced an empty image")
    tree = tree.crop(content_bounds)
    tree_output = OUT_DIR / "hero-sprite-pine-clean.png"
    tree.save(tree_output, optimize=True)
    print(f"wrote {tree_output} ({tree.width}x{tree.height})")
