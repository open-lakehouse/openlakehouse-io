---
name: learn-authoring
description: Author a new educational or blog post (MDX) under src/content/posts/<category>/<slug>/index.mdx for the unified content registry — supports /learn, /blog, or both, with optional video embed, author profile creation, and frontmatter scaffolding.
---

# Learn / Blog authoring

Create a new MDX post in the unified content tree at
`src/content/posts/<category>/<slug>/index.mdx`. The registry
(`src/content/content.ts`) reads frontmatter to decide whether a post shows on
`/blog`, `/learn`, or both, and supports `status: published | preview | draft`.

Use this skill any time the user wants to **write** new content (vs. importing
an external post — for that, use `blog-import`).

## Walk the user through these questions, in order

Ask one at a time (or batched via `questions--ask_questions`). Do not assume —
ask. If the user already supplied an answer in their request, skip that step.

### 1. Kind of content

`kind:` frontmatter. Options:

- `getting-started` — short, ~5-minute educational intro. Lives under
  `src/content/posts/getting-started/<slug>/`. Surfaces on `/learn` Getting
  Started section and the homepage.
- `deep-dive` — longer educational explainer with figures, flow diagrams,
  code. Pick a topic category folder (e.g. `delta-lake`, `iceberg`,
  `agentic`, `unity-catalog`).
- `concept` — focused explanation of a single concept.
- `tutorial` — step-by-step walkthrough.
- `post` — default blog post (no education framing).

### 2. Where should it publish?

`include:` frontmatter array. Ask: `/learn`, `/blog`, or both?

- `[learn]` — Learn only (educational content)
- `[blog]` — Blog only (announcements, news)
- `[learn, blog]` — cross-published

Also confirm `status:`:
- `published` (default) — visible in listings
- `preview` — reachable via direct link only, `noindex`
- `draft` — excluded from the registry entirely

### 3. Title

`title:` frontmatter. One sentence, quoted in YAML.

### 4. Short description

`excerpt:` frontmatter. ~160 chars max, single sentence.

### 5. Slug

Generate a kebab-case slug from the title. Confirm with the user. Final path:
`src/content/posts/<category>/<slug>/index.mdx`.

Pick `<category>` based on kind:
- `kind: getting-started` → always `getting-started/`
- everything else → topic category (`delta-lake`, `iceberg`, `agentic`,
  `unity-catalog`, `mlflow`, `apache-spark`, etc.). If unclear, ask.

### 6. Author(s)

`authors: [<slug>, ...]` frontmatter (always an array).

Check `src/content/authors/` for a matching profile:

```bash
ls src/content/authors/
```

If the author exists, use their existing slug. If not, **create a new author
profile** (next step).

### 7. New author profile (only if needed)

Create `src/content/authors/<author-slug>.mdx`. Ask for:

- **Full name** → `name:` (slug = kebab-case of name)
- **Role / title** → `role:` (e.g. "Delta Lake Maintainer", "Engineer at
  ClickHouse")
- **LinkedIn handle** (just the slug after `/in/`, no URL) → `linkedin:`
- **Twitter handle** (optional) → `twitter:`
- **GitHub handle** (optional) → `github:`
- **Avatar** (optional) — only if the user uploads one. Upload via
  `lovable-assets create --file /mnt/user-uploads/<file> --filename
  <slug>.jpg > src/assets/<slug>.jpg.asset.json` and use the returned URL as
  `avatar:`. Do NOT invent `/__l5e/...` URLs.
- **Bio** — one or two sentences for the body of the author MDX.

Author file template:

```mdx
---
name: <Full Name>
role: <Role>
linkedin: <handle>
---

<One- or two-sentence bio.>
```

### 8. YouTube video embed?

Ask: "Is there a YouTube video to embed at the top of the post?"

If yes, ask for the URL (share link, watch URL, or youtu.be short link) and
extract the 11-character video ID:

- `https://youtu.be/<ID>` → `<ID>`
- `https://www.youtube.com/watch?v=<ID>` → `<ID>`
- `https://www.youtube.com/shorts/<ID>` → `<ID>`

Set `video: <ID>` in frontmatter. `PostLayout` renders the embed above the
article body.

### 9. Body

Ask: "Do you have body content to paste in, or should I scaffold a
placeholder?"

- **With body**: drop the user's content under the frontmatter as MDX. Convert
  fenced code blocks to language-tagged blocks (` ```sql `, ` ```bash `,
  ` ```ts `). Use the MDX components available via `MdxProvider`:
  `<Figure>`, `<Callout>`, `<Steps>`/`<Step>`, `<FlowDiagram id="..." />`,
  `<PromptBlock>` (click-to-copy / send to Claude / ChatGPT / Gemini).
- **Skipped**: write a placeholder body:

  ```mdx
  Coming soon — <one-line description of what this will cover>.
  ```

## Final MDX skeleton

```mdx
---
title: "<Title>"
date: <YYYY-MM-DD>            # today's date unless the user specifies
authors: [<author-slug>]
excerpt: "<Short description>"
tags: [<tag-1>, <tag-2>]
include: [<learn|blog|both>]
status: published
kind: <kind>
readingTime: 5                # only for getting-started; otherwise omit
video: <youtube-id>           # omit if no video
---

<body or placeholder>
```

## Optional figures / images

Co-locate images next to the MDX file
(`src/content/posts/<category>/<slug>/figure-1.png`). Import at the top:

```mdx
import fig1 from "./figure-1.png";

<Figure src={fig1} alt="..." caption="..." />
```

Never upload images to the Lovable CDN — keep them in the repo so Vercel
serves them.

## Verify

After creating the file, confirm:

- The post appears at `/learn/<category>/<slug>` and/or `/blog/<category>/<slug>` depending on `include:`.
- For `getting-started`, it appears on the Learn Getting Started section and on the homepage's "Getting Started" block.
- For new authors, `/authors/<author-slug>` renders and lists the new post.
- `status: preview` posts are reachable only by direct link and emit `noindex`.

## Files this skill touches

- `src/content/posts/<category>/<slug>/index.mdx` — new
- `src/content/posts/<category>/<slug>/<figure>.{png,jpg,svg}` — optional
- `src/content/authors/<author-slug>.mdx` — only when adding a new author
- `src/assets/<name>.<ext>.asset.json` — only when uploading a real avatar

Do NOT modify `src/content/content.ts`, `src/pages/BlogPost.tsx`,
`src/pages/learn/LearnPost.tsx`, `src/components/PostLayout.tsx`, or
`src/components/MdxProvider.tsx` as part of authoring. They already support
the schema.

## Related skills

- `blog-import` — when importing an external post from a URL (delta.io,
  mlflow.org, ClickHouse blog, etc.) rather than writing fresh content.
