# Open Reference Architectures

The `/reference-architectures` section: an interactive board of open source
data engineering architectures, one page per architecture, one page per
industry lens, and machine-readable twins of all of it.

## Where things live

| What | File |
|---|---|
| Platform taxonomy: zones, groups, capability slots with typical open source choices, and teams | `src/content/reference-architectures/platform.ts` |
| Component catalog | `src/content/reference-architectures/components.ts` |
| Architectures (patterns) | `src/content/reference-architectures/patterns.ts` |
| Industry lenses | `src/content/reference-architectures/industries.ts` |
| Curated resources list | `src/content/reference-architectures/resources.ts` |
| Types | `src/content/reference-architectures/types.ts` |
| Helpers and export formats (YAML, Mermaid, JSON, AI prompt, Markdown) | `src/content/reference-architectures/index.ts` |
| Interactive board | `src/components/refarch/ArchitectureBoard.tsx` |
| Pages | `src/pages/refarch/*.tsx` |
| JSON-LD | `src/lib/refarch-seo.ts` |
| Build-time prerender | `src/entry-server.tsx`, `scripts/prerender.mjs` |
| Integrity tests | `src/test/reference-architectures.test.tsx` |

The content files are plain data with relative imports only, so the pages,
the SSR prerender and `scripts/generate-seo.ts` all read the same source.

## Rules for content

- Every architecture is grounded in at least one **public** repository.
  Private or empty repos are not linked.
- Versions are the ones the reference repo pins. Quickstart commands are
  copied verbatim from the repo README.
- Numbers are quoted only when the repo commits the result file they come
  from, and the page cites that file in `sources`.
- `caveats` carry the documented gaps and version incompatibilities from the
  repos. Do not drop them to make a page look cleaner.
- Swap options (`swaps`) must be open source projects that speak the same
  interface. A swap is shown as "not a tested configuration".
- No em dashes in prose (a test enforces this on the dataset).

## The board

Every architecture is drawn on the same open platform: sources, ingestion,
the platform (AI and agents, engine access, execution, data foundation, with
governance and operations bands), serving and teams. An architecture's nodes
fill capability slots (`slot` in each node). The simplified view shows the
slots it uses plus the core ones; the full platform view shows every slot,
with unused ones dimmed and labelled with their typical open source choice.
Prefer Apache Iceberg wherever the reference repo supports it.

## Adding an architecture

1. Add any missing components to `components.ts`.
2. Add the pattern to `patterns.ts` (slug, definition paragraph, nodes with
   a `slot` from `platform.ts`, steps, repos, caveats, FAQs, sources).
3. Point relevant industry use cases at the new slug in `industries.ts`.
4. Run `bun run test` and `bun run build`. The build regenerates
   `sitemap.xml`, `llms.txt`, `llms-full.txt`,
   `public/reference-architectures.json` and the `.md` twins, then prerenders
   static HTML for every route in `src/entry-server.tsx`.

## Why the prerender exists

The site is a client-rendered SPA: before this section, every route served
an empty `<div id="root">` with the homepage `<title>`. Crawlers that do not
run JavaScript (GPTBot, ClaudeBot, PerplexityBot and most link unfurlers) saw
no content. `scripts/prerender.mjs` writes
`dist/<route>/index.html` with the rendered page, its own title, canonical,
Open Graph tags and JSON-LD. Vercel serves those files before the SPA
rewrite. The client mounts with `createRoot`, which replaces the static
markup, so there is no hydration contract to maintain.

The homepage (`/`) is prerendered too, which overwrites `dist/index.html`.
The untouched SPA shell is saved as `dist/app-shell.html`, and `vercel.json`
rewrites every other client-side route to `/app-shell` (extensionless,
because `cleanUrls` serves `app-shell.html` at `/app-shell`; a rewrite to
`/app-shell.html` returns 404). `public/_redirects` does the same for
hosts that read it. Do not
point the rewrite back at `/index.html`: every unprerendered route would then
serve the homepage's content and canonical URL.

To prerender other sections, add their routes to `src/entry-server.tsx`
(components must not touch `window`, `document` or `localStorage` during
render).
