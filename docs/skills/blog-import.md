---
name: blog-import
description: Import an external blog post (URL) into this project as an MDX entry under src/content/posts/<category>/, including author profile(s), LinkedIn contact, thumbnail, and a republished-with-attribution closing block.
---

# Blog import

Import a single external blog post into this project's MDX content tree. The
project uses an MDX-driven blog: posts live under `src/content/posts/<category>/<slug>/index.mdx`
and authors under `src/content/authors/<slug>.mdx`. They are loaded by
`src/content/content.ts` via `import.meta.glob`.

This skill applies to any URL the user shares (delta.io, mlflow.org, DuckDB,
ClickHouse, etc.). Follow every step — skipping the contact/thumbnail/
attribution steps has caused rework on prior imports.

## When to use

Triggered by phrasing like:
- "Add this blog post under <category>: <url>"
- "Import this post / add this article"
- "Credit the right authors / include all contact / include the thumbnail"

## Inputs you must confirm or extract

1. **Source URL** (required, from the user).
2. **Category folder** under `src/content/posts/` (e.g. `delta-lake`, `iceberg`, `agentic`). Use the user's stated category. If absent, ask once before importing.
3. **Slug** — derive from the URL's last path segment, stripped of leading date prefixes (e.g. `2026-04-17-delta-4-2-released` → `delta-4-2-released`). Keep it kebab-case and short.
4. **Authors** — extract ALL bylines, not just the first one.
5. **Thumbnail** — use the canonical OG image from the source page.

## Procedure

### 1. Fetch the post

```
code--fetch_website url=<url>            # markdown body
```

If the markdown preview is truncated, read the saved `tool-results://fetched-websites/<file>.md` with `code--view` over the remaining line ranges. You need the full body, the byline, and the closing author block (which usually contains LinkedIn URLs).

### 2. Extract thumbnail + LinkedIn URLs from the raw HTML

The markdown rendering often drops the OG image and may drop author LinkedIns. Fetch the raw HTML and grep:

```bash
curl -s <url> | grep -oE '"og:image"[^>]*content="[^"]*"|linkedin.com/in/[^"]*"' | head -10
```

- `og:image` → use that URL directly as `thumbnail:` in frontmatter (works as a remote CDN URL; no need to download).
- `linkedin.com/in/<handle>/` → one per author, in the same order as the byline.

If `og:image` is missing, fall back to the first hero image referenced in the markdown.

### 3. Create or update author profiles

For each author, check `src/content/authors/<slug>.mdx`. If absent, create it:

```mdx
---
name: <Full Name>
role: <Title at Company>   # infer from post context (e.g. "Engineer at ClickHouse", "Software Engineer at Databricks", "Delta Lake Maintainer")
linkedin: <handle>          # just the slug after /in/, no URL, no trailing slash
---

<One- or two-sentence bio inferred from the post's framing and the author's contribution to the ecosystem.>
```

Rules:
- Slug = kebab-case of full name (`scott-haines`, `ben-fleis`, `kseniia-sumarokova`).
- Do NOT invent Twitter/GitHub if you can't verify them. Only fill fields you have evidence for.
- Avatar is optional — only set it if the user uploaded a photo or the source has a clean, stable headshot URL. If the user uploaded an avatar, upload it via `lovable-assets create --file /mnt/user-uploads/<file> --filename <slug>.jpg > src/assets/<slug>.jpg.asset.json` and use the returned `url` as `avatar:`.
- The author schema supports `twitter`, `github`, `linkedin` — all rendered on `/authors/<slug>` by `src/pages/AuthorPage.tsx`. LinkedIn renders as a "LinkedIn" link.

### 4. Create the post MDX

Path: `src/content/posts/<category>/<slug>/index.mdx`.

Frontmatter:

```mdx
---
title: "<Original title>"
date: <YYYY-MM-DD from URL or post>
authors: [<slug-1>, <slug-2>, <slug-3>]   # array, even for a single author when there could be more later
excerpt: <One-sentence summary, ~160 chars max>
tags: [<topic>, <project>, <feature>, ...]
thumbnail: <og:image URL from step 2>
---
```

- Use `authors: [ ... ]` (array). The content loader accepts both `author:` (single) and `authors:` (array); always prefer the array for parity with multi-author posts.
- Tags should mix the category (`delta-lake`), the engine/project (`clickhouse`, `duckdb`, `mlflow`), and the feature (`writes`, `time-travel`, `tracing`, `kernel`). Keep 3–6 tags.

### 5. Body

- Rewrite the body as clean MDX. Convert fenced code blocks to language-tagged blocks (` ```sql `, ` ```bash `, ` ```ts `) so the prose styles render syntax highlighting correctly.
- Drop site chrome the fetch picked up: nav, "Search ctrl K", "Clear", LinkedIn-svg author block at the bottom, "The Linux Foundation Projects" header, etc.
- Keep all links inline. Convert escaped underscores like `device\_type` to plain `device_type`.
- Preserve tables, blockquotes, callouts, and code examples. Trim long log dumps to a representative excerpt if they exceed ~30 lines.
- Images in the body: posts are stored as self-contained directories (`src/content/posts/<category>/<slug>/index.mdx`), so co-locate figures next to the MDX file as `figure-1.png`, `diagram.png`, etc. In MDX, import them at the top (`import fig1 from "./figure-1.png";`) and render with `<img src={fig1} alt="..." />` so Vite fingerprints and serves them. For very large or external-only assets, leaving the original remote `https://…` URL is acceptable. Only use `lovable-assets` for binaries the user explicitly wants on the CDN (e.g. uploaded avatars).

### 6. Close with attribution

ALWAYS end the post body with a horizontal rule and an italicized republished-with-attribution block linking to the original:

```mdx
---

*This post was originally published on the
[<Source Site> blog](<original url>) by <Author 1>, <Author 2>, and <Author 3>.
Republished here with attribution to the original authors.*
```

For single-author posts, use "by <Author>".

### 7. Verify

- Confirm the post appears on `/blog` and `/blog/category/<category>`.
- Confirm `/blog/<category>/<slug>` renders with the thumbnail, all author chips (each linking to `/authors/<author-slug>`), and the body.
- Confirm `/authors/<slug>` for each new author shows the LinkedIn link and lists the new post under "Posts by ...".

## Lessons learned

- **Always credit every author.** The Delta Lake posts have 2–3 bylines; using a single `author:` field silently drops the others. Use `authors: [ ... ]`.
- **Pull LinkedIn from raw HTML, not the rendered markdown.** The markdown often omits the author footer links.
- **Pull the thumbnail from `og:image`.** The in-body hero image is sometimes a stylized variant or missing entirely.
- **Slug without the date prefix.** URLs like `/blog/2026-04-17-delta-4-2-released/` should become `src/content/posts/delta-lake/delta-4-2-released/index.mdx`. The `date:` frontmatter carries the date.
- **Author roles matter.** Infer from the post: a ClickHouse blog post → "Engineer at ClickHouse"; a DuckDB blog → "Engineer at DuckDB Labs"; an MLflow/Databricks post → "Software Engineer at Databricks"; a delta.io release post → "Delta Lake Maintainer" or "Delta Lake Contributor".
- **Don't hand-write asset IDs.** When uploading a real avatar the user provided, always go through `lovable-assets create` and write the returned JSON pointer to `src/assets/<name>.asset.json`. Never invent a `/__l5e/...` URL.
- **Keep the closing attribution.** It's the credit the original site expects and matches the pattern of every imported post so far.

## Files this skill touches

- `src/content/posts/<category>/<slug>/index.mdx` — new
- `src/content/posts/<category>/<slug>/<figure>.{png,jpg,svg}` — any co-located images for the post
- `src/content/authors/<slug>.mdx` — new (per new author)
- `src/assets/<name>.<ext>.asset.json` — only when a user-supplied avatar is uploaded

Do NOT modify `src/content/content.ts`, `src/pages/BlogPost.tsx`, or `src/pages/AuthorPage.tsx` as part of an import — they already support the schema. Only touch them if the user asks for a new author field (e.g. adding `mastodon`).
