#!/usr/bin/env python3
"""Build the Open Lakehouse + AI favicon set from the stacked logo.

Extracts only the house glyph (drops the wordmark), knocks out the solid
background, places it on a navy rounded tile, and renders each favicon size
with a per-size stroke boost so the thin line-art stays legible when small.

Usage: make-favicon.py <source-png> <out-dir> [--preview]
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

SRC = sys.argv[1]
OUT_DIR = sys.argv[2]
PREVIEW_ONLY = "--preview" in sys.argv

NAVY = (27, 49, 57, 255)      # Navy/800  #1B3139  (tile)
HOUSE = (138, 202, 255, 255)  # Blue/400  #8ACAFF  (glyph, brightened for contrast on navy)
THRESH = 60                   # color distance to count as content


def extract_glyph(path):
    """Return a tight RGBA crop of just the house glyph (transparent bg)."""
    im = Image.open(path).convert("RGB")
    W, H = im.size
    px = im.load()
    bg = px[0, 0]

    def dist(c):
        return ((c[0]-bg[0])**2 + (c[1]-bg[1])**2 + (c[2]-bg[2])**2) ** 0.5

    # find the empty band between the house and the wordmark
    first = None
    cut = H
    gap = 0
    for y in range(H):
        n = sum(1 for x in range(0, W, 2) if dist(px[x, y]) > THRESH)
        if n > 3 and first is None:
            first = y
        if first is not None:
            if n <= 2:
                gap += 1
                if gap >= 25:
                    cut = y - gap + 1
                    break
            else:
                gap = 0

    band = im.crop((0, 0, W, cut))
    rgba = Image.new("RGBA", band.size, (0, 0, 0, 0))
    bp, rp = band.load(), rgba.load()
    bw, bh = band.size
    for y in range(bh):
        for x in range(bw):
            c = bp[x, y]
            d = dist(c)
            a = 0 if d <= THRESH else min(255, int((d / 180) * 255))
            rp[x, y] = (c[0], c[1], c[2], a)
    return rgba.crop(rgba.getbbox())


def rounded_tile(size, radius, color):
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=255)
    solid = Image.new("RGBA", (size, size), color)
    tile.paste(solid, (0, 0), mask)
    return tile


def render(glyph, size, *, rounded=True, pad_frac=0.16, stroke_boost=0.0, ss=8):
    """Render one icon at `size`px. stroke_boost = extra stroke px per side
    (in final-pixel units) applied via dilation before downscaling."""
    S = size * ss
    radius = int(S * 0.22) if rounded else 0
    tile = rounded_tile(S, radius, NAVY)

    # fit glyph inside the padded area, preserving aspect
    avail = int(S * (1 - pad_frac * 2))
    gw, gh = glyph.size
    scale = min(avail / gw, avail / gh)
    g = glyph.resize((max(1, int(gw*scale)), max(1, int(gh*scale))), Image.LANCZOS)

    # Work on the alpha (shape) only, then flood with a single house color.
    # This thickens strokes cleanly without the edge-color speckle that
    # dilating an RGBA image directly would produce.
    alpha = g.split()[3]
    if stroke_boost > 0:
        k = 2 * int(round(stroke_boost * ss)) + 1
        alpha = alpha.filter(ImageFilter.MaxFilter(k))
    colored = Image.new("RGBA", g.size, HOUSE)
    colored.putalpha(alpha)

    ox = (S - g.size[0]) // 2
    oy = (S - g.size[1]) // 2
    tile.alpha_composite(colored, (ox, oy))
    return tile.resize((size, size), Image.LANCZOS)


glyph = extract_glyph(SRC)
print(f"glyph={glyph.size}")

# per-size: (stroke_boost px, pad fraction)
plan = {
    16:  (1.0, 0.12),
    32:  (0.6, 0.13),
    48:  (0.3, 0.14),
    64:  (0.15, 0.15),
    180: (0.0, 0.18),   # apple-touch (square; iOS masks corners)
    192: (0.0, 0.16),
    512: (0.0, 0.16),
}

icons = {}
for s, (boost, pad) in plan.items():
    rounded = s not in (180,)  # apple-touch stays a full square tile
    icons[s] = render(glyph, s, rounded=rounded, pad_frac=pad, stroke_boost=boost)

if PREVIEW_ONLY:
    strip_sizes = [16, 32, 48, 64]
    pad = 20
    w = sum(strip_sizes) + pad * (len(strip_sizes) + 1)
    h = max(strip_sizes) + pad * 2
    strip = Image.new("RGBA", (w, h), (90, 100, 110, 255))
    x = pad
    for s in strip_sizes:
        strip.alpha_composite(icons[s], (x, (h - s) // 2))
        x += s + pad
    strip.save(f"{OUT_DIR}/favicon-boost-strip.png")
    icons[512].save(f"{OUT_DIR}/favicon-boost-512.png")
    icons[32].resize((256, 256), Image.NEAREST).save(f"{OUT_DIR}/favicon-boost-32-zoom.png")
    print("preview written")
    sys.exit(0)

# Final assets
icons[16].save(f"{OUT_DIR}/favicon-16x16.png")
icons[32].save(f"{OUT_DIR}/favicon-32x32.png")
icons[180].save(f"{OUT_DIR}/apple-touch-icon.png")
icons[192].save(f"{OUT_DIR}/favicon-192.png")
icons[512].save(f"{OUT_DIR}/favicon-512.png")
icons[48].save(f"{OUT_DIR}/favicon-48.png")
# multi-resolution .ico
icons[48].save(
    f"{OUT_DIR}/favicon.ico",
    sizes=[(16, 16), (32, 32), (48, 48)],
)
print("final assets written")
