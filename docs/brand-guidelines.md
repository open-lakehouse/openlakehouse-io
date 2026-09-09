# Open Lakehouse + AI — Brand Guidelines

The visual identity for openlakehouse.io. This is the source of truth for
colors, tokens, logo, and favicon usage. When changing anything visual, keep it
consistent with what is described here.

The color system is implemented as HSL CSS variables in
[`src/index.css`](../src/index.css) and exposed to Tailwind in
[`tailwind.config.ts`](../tailwind.config.ts). Always consume colors through the
tokens below — never hardcode hex or ad-hoc `hsl(...)` values in components.

## Palette

Four tint families, each on a 100 (lightest) → 900 (darkest) ramp. Green is the
primary brand color, Blue the accent, Yellow the highlight, and Navy the ink /
dark canvas. Values come from the official `Open Lakehouse + AI Colors` palette.

### Green (primary)

| Step | Hex | HSL token |
| --- | --- | --- |
| 100 | `#DCF4ED` | `--green-100` |
| 200 | `#BAE9DA` | `--green-200` |
| 300 | `#9ED6C4` | `--green-300` |
| 400 | `#70C4AB` | `--green-400` |
| 500 | `#42BA91` | `--green-500` |
| 600 | `#00A972` | `--green-600` |
| 700 | `#00875C` | `--green-700` |
| 800 | `#095A35` | `--green-800` |
| 900 | `#074C2C` | `--green-900` |

### Blue (accent)

| Step | Hex | HSL token |
| --- | --- | --- |
| 100 | `#F0F8FF` | `--blue-100` |
| 200 | `#D7EDFE` | `--blue-200` |
| 300 | `#BAE1FC` | `--blue-300` |
| 400 | `#8ACAFF` | `--blue-400` |
| 500 | `#4299E0` | `--blue-500` |
| 600 | `#2272B4` | `--blue-600` |
| 700 | `#0E538B` | `--blue-700` |
| 800 | `#04355D` | `--blue-800` |
| 900 | `#002849` | `--blue-900` |

### Yellow (highlight)

| Step | Hex | HSL token |
| --- | --- | --- |
| 100 | `#FFF0D3` | `--yellow-100` |
| 200 | `#FFE6B8` | `--yellow-200` |
| 300 | `#FFDB96` | `--yellow-300` |
| 400 | `#FFCC66` | `--yellow-400` |
| 500 | `#FCBA33` | `--yellow-500` |
| 600 | `#FFAB00` | `--yellow-600` |
| 700 | `#BA7B23` | `--yellow-700` |
| 800 | `#7D5319` | `--yellow-800` |
| 900 | `#694109` | `--yellow-900` |

### Navy (ink / dark canvas)

| Step | Hex | HSL token |
| --- | --- | --- |
| 100 | `#EDF2F8` | `--navy-100` |
| 200 | `#E5EAF1` | `--navy-200` |
| 300 | `#C4CCD6` | `--navy-300` |
| 400 | `#90A5B1` | `--navy-400` |
| 500 | `#618794` | `--navy-500` |
| 600 | `#1B5162` | `--navy-600` |
| 700 | `#143D4A` | `--navy-700` |
| 800 | `#1B3139` | `--navy-800` |
| 900 | `~#12232A` | `--navy-900` (derived — no swatch in the source PDF) |

> Navy/900 was not defined in the source palette; it is extrapolated from the
> ramp for the darkest surface / dark-mode canvas. Replace with an official
> value if brand provides one.

## Using the palette

### Raw ramps (Tailwind)

Every step is available as a Tailwind color scale: `green`, `yellow`, `blue`,
`navy`. Examples: `bg-green-600`, `text-navy-800`, `border-blue-200`. These map
directly to the tokens above.

### Semantic tokens (preferred)

Most UI should use the shadcn-style semantic tokens, which are re-pointed at the
ramps and adapt automatically between light and dark mode:

| Token | Light | Dark | Use for |
| --- | --- | --- | --- |
| `--primary` | Green/600 | Green/500 | primary buttons, links, focus |
| `--accent` | Blue/600 | Blue/500 | secondary emphasis |
| `--background` | white | Navy/900 | page canvas |
| `--foreground` | Navy/800 | Navy/100 | body text |
| `--card` / `--popover` | white | Navy/800 | surfaces |
| `--muted` | Navy/100 | Navy/700 | subtle fills |
| `--muted-foreground` | Navy/500 | Navy/300 | secondary text |
| `--border` / `--input` | Navy/200 | Navy/700 | hairlines, fields |
| `--ring` | Green/600 | Green/500 | focus rings |

Consume as `hsl(var(--primary))` (or Tailwind `bg-primary`, `text-foreground`,
etc.). Yellow is a highlight accent (badges, callouts) and is intentionally not
a default semantic role — reach for `yellow-*` when you need it.

### Brand shortcuts, gradients, shadows

- `--brand-green`, `--brand-blue`, `--brand-yellow`, `--brand-navy` — brand
  color shortcuts (brightened one step in dark mode).
- `--gradient-brand` — Green → Blue → light Blue. Utilities:
  `bg-brand-gradient`, `text-brand-gradient`.
- `--gradient-hero` — Navy canvas gradient. Utility: `bg-hero-gradient`.
- `--shadow-glow` (Green in light / Blue in dark) and `--shadow-card`.
  Utilities: `shadow-glow`, `shadow-card`.

## Logo & favicon

- The wordmark/house logo is the Open Lakehouse + AI mark. The favicon uses only
  the house glyph (wordmark removed), in Blue/400 (`#8ACAFF`) on a Navy/800
  (`#1B3139`) rounded tile for contrast at small sizes.
- Favicon assets live in `public/` (`favicon.ico`, `favicon-16x16.png`,
  `favicon-32x32.png`, `apple-touch-icon.png`, `favicon-192.png`,
  `favicon-512.png`, `site.webmanifest`) and are wired up in
  [`index.html`](../index.html). `theme-color` is Navy/800 `#1B3139`.
- Regenerate the favicon set with
  [`scripts/make-favicon.py`](../scripts/make-favicon.py):
  `python3 scripts/make-favicon.py <logo.png> public`.

## Hero scene

The homepage hero ([`src/components/Hero.tsx`](../src/components/Hero.tsx)) is
a responsive, layered pixel-art scene. A full-width HTML canvas paints the sky,
water texture, and interactive ripples from the Blue ramp. The clean,
artifact-free lakehouse/shore layer stays pinned to the right while transparent
clouds drift independently above it.

Cloud paths and speeds are configured in `HERO_CLOUDS` in `Hero.tsx`; keep the
motion slow and linear, and preserve the reduced-motion fallback. Regenerate the
foreground and clouds with
[`scripts/make-hero-layers.py`](../scripts/make-hero-layers.py) whenever the
clean source scene changes.

Reusable house, pine, bush, flower-bush, and dock sprites are extracted from the
archived sprite sheet by
[`scripts/make-hero-sprites.py`](../scripts/make-hero-sprites.py). The sheet is
a JPEG with a baked checkerboard, so the extraction script flood-fills its
background into real transparency. An optional third argument extracts and
archives the cleaner replacement pine used by the current hero composition.

## Do / don't

- Do use semantic tokens first, ramps second; keep light + dark parity.
- Do keep Green as primary and Blue as accent; use Yellow sparingly as a
  highlight.
- Don't hardcode hex or one-off `hsl(...)` in components — add or reuse a token.
- Don't reintroduce the retired Grape/Blueberry/Teal/Sky palette.

## Changing colors

Edit the ramp variables in [`src/index.css`](../src/index.css) (`:root` for
light, `.dark` for dark). Because semantic tokens and brand shortcuts reference
the ramps via `var(--…)`, updating a ramp step propagates everywhere. The
Tailwind scales in [`tailwind.config.ts`](../tailwind.config.ts) read the same
variables, so no config change is needed for value tweaks.
