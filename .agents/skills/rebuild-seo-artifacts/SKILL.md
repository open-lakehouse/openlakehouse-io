---
name: rebuild-seo-artifacts
description: >-
  Regenerate this site's machine-readable discovery files for SEO/GEO/AEO —
  public/sitemap.xml, public/llms.txt, and public/llms-full.txt — from the
  content in src/content. Use after adding or editing blog/learn posts,
  authors, routes, or tech categories, when the canonical domain changes, or
  whenever the user mentions sitemap, llms.txt, robots.txt, canonical URLs,
  SEO, GEO, or AEO for this repo.
---

# Rebuild SEO / GEO / AEO artifacts

This site exposes three machine-readable files that search engines and LLMs
use to discover and cite content. They are generated, never hand-edited.

| File | Purpose |
|------|---------|
| `public/sitemap.xml` | Every public route, for search-engine crawlers |
| `public/llms.txt` | Curated, citable index of pages ([llmstxt.org](https://llmstxt.org)) |
| `public/llms-full.txt` | Full text of every published article, for LLM retrieval |

## Single source of truth

- **Canonical origin**: `SITE_URL` in [src/lib/seo.ts](../../../src/lib/seo.ts).
  Every generated URL, the app `<head>` canonical/OG tags, and the Organization
  JSON-LD derive from it. Change the domain there.
- **Content**: `src/content/posts/**` and `src/content/authors/*.mdx`. The
  generator reads frontmatter (`title`, `date`, `excerpt`, `include`, `status`,
  `originalUrl`, `originalPublisher`).
- **Static routes**: `staticEntries`, `TECH_CATEGORIES`, and `TECH_PILLARS` in
  [scripts/generate-seo.ts](../../../scripts/generate-seo.ts) must mirror the
  routes in [src/App.tsx](../../../src/App.tsx).

## Regenerate

The generator runs automatically via the `predev` / `prebuild` hooks in
[package.json](../../../package.json). To run it on demand:

```bash
bunx tsx scripts/generate-seo.ts
```

It writes all three files and prints a summary line with the URL/article counts.

## Rules the generator follows

- Only `status: published` posts are emitted (skips `draft` and `preview`).
- Verbatim republications with `originalUrl` use that upstream URL in the LLM
  artifacts and are omitted from the sitemap because the local page is not
  canonical.
- `include: [blog]` posts map to `/blog/<category>/<slug>`; `include: [learn]`
  posts map to `/learn/<category>/<slug>`. A post in both surfaces appears in
  both. Missing `include` defaults to `blog` (legacy).
- Blog and learn category index pages are derived from the posts present.
- `robots.txt` is NOT generated — it is hand-maintained. Its `Sitemap:` line
  must point at `<SITE_URL>/sitemap.xml`.

## When to run

- Added/edited/removed a post or author, or changed frontmatter (`title`,
  `excerpt`, `date`, `include`, `status`).
- Added a new route, tech category, or pillar (update `generate-seo.ts` first).
- Changed the canonical domain (`SITE_URL`).

## Verification checklist

After regenerating, confirm:

- [ ] `bunx tsx scripts/generate-seo.ts` exits 0 and the counts look right.
- [ ] `public/sitemap.xml` is valid XML and every `<loc>` uses the current
      `SITE_URL` origin.
- [ ] New/changed posts appear in `sitemap.xml`, `llms.txt`, and
      `llms-full.txt`; drafts/previews do NOT.
- [ ] `public/robots.txt` `Sitemap:` line matches the `SITE_URL` origin.
- [ ] No `openlakehouse-guide-hub.lovable.app` (or other stale origin) remains:
      `rg -n "lovable.app" public src/lib/seo.ts index.html` returns nothing.
- [ ] `bun run lint` passes on any edited TypeScript.
