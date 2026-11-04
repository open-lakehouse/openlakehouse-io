---
name: import-substack-post
description: >-
  Import a Substack article into this site as an MDX blog post that credits
  the original — body, cover, inline images, and republication metadata
  (originalUrl, originalPublisher, canonical). Use when the user shares a
  *.substack.com post URL or asks to republish, cross-post, mirror, or import
  a Substack (or Distributed Thoughts) article onto openlakehouse.io.
---

# Import a Substack post

Substack posts become `src/content/posts/<category>/<slug>/index.mdx` with the
Substack article as the canonical source. The script produces a draft that
compiles; the manual pass below makes it publishable.

## Workflow

```
- [ ] 1. Branch (feat/<slug>) per .agents/rules/branching-rule.mdc
- [ ] 2. Run the import script
- [ ] 3. Review every figure; rebuild screenshots of tables/code as text
- [ ] 4. Resize the cover thumbnail
- [ ] 5. Manual pass on the MDX
- [ ] 6. Regenerate SEO artifacts, build, and check it visually
- [ ] 7. Clean bun.lock and open the PR
```

### 2. Run the import script

Pick the category (an existing folder under `src/content/posts/`, e.g.
`iceberg`, `delta-lake`, `apache-spark`) and a short slug, then run from the
repo root. It needs network access (request `full_network` in the sandbox).

```bash
python3 .agents/skills/import-substack-post/scripts/substack_to_mdx.py \
  https://<pub>.substack.com/p/<post> src/content/posts/<category>/<slug>
```

Options: `--author <slug>` when the Substack author name doesn't slugify to a
file in `src/content/authors/`; `--html <file>` to convert a saved page.

The script prints a JSON report. Act on `todos` and `unlabeled_code_blocks`.
It writes:

- `index.mdx` with frontmatter (`title`, `subtitle`, `date`, `authors`,
  `excerpt` = subtitle, `originalUrl`, `originalPublisher`), an attribution
  line at the top, and an attribution footer.
- `thumbnail.<ext>`: the cover image at full resolution. The post layout
  renders it as the cover, so the body doesn't repeat it.
- `figure-N.<ext>` plus `<Figure>` imports for each inline image.

It already handles: Substack's language-label paragraphs before code blocks,
links split around inline code (`[a](u) \`x\` [b](u)`), bold or italic on bare
punctuation (`**.**`), proxied image URLs (downloads the S3 originals), and
subscribe/share widgets (dropped). YouTube embeds become `<YouTubeEmbed>`;
footnotes become GFM footnotes. Other embeds become `TODO(import)` comments.

### 3. Review every figure

Open each downloaded image. Substack has no tables, so authors paste
screenshots of tables and sometimes code:

- **Table or code screenshot**: transcribe it into a GFM table or fenced code
  block, then delete the image file, its `import`, and the `<Figure>`.
- **Diagram or photo**: keep the `<Figure>` and replace the `TODO(import)` alt
  text with a real description.

### 4. Resize the cover

Covers arrive at 2–4 MB. The post column is 768px wide, so 1600px covers 2x
screens. Aim for about 500 KB:

```bash
cd src/content/posts/<category>/<slug>
sips -Z 1600 -s format jpeg -s formatOptions 72 thumbnail.jpg --out thumbnail.jpg
```

If the cover is a `.png`, write `--out thumbnail.jpg` and delete the `.png`.
Only one `thumbnail.*` may remain.

### 5. Manual pass on the MDX

- **Tags**: fill `tags: []` (lowercase, hyphenated; see sibling posts).
- **Date**: `date` is the UTC date of `datePublished`. Confirm it with the
  user if they gave one; a late-evening US post can land on the next UTC day.
- **Code languages**: add a language to each unlabeled fence (`java`, `sql`,
  `text` for grammars and pseudo-code).
- **Links next to code**: the script joins `[a](u) \`x\` [b](u)` but not a
  code span on only one side, e.g. `[filtering on](u) \`col\``. Search for
  `](` next to backticks and pull the code inside the link where it belongs.
- **TODOs**: `rg -n "TODO\(import\)" src/content/posts/<category>/<slug>`
  must return nothing.
- **Prose stays verbatim** for a republication. Don't fix the author's
  wording or typos; list them for the user instead.

### Attribution rules

These follow "Republished content attribution" in `AGENTS.md`:

- **Verbatim republication** (the default): keep `originalUrl` and
  `originalPublisher`. `BlogPost.tsx` turns `originalUrl` into the
  cross-domain canonical and the JSON-LD `isBasedOn`. The SEO generator leaves
  the post out of `sitemap.xml` and lists the original URL in `llms.txt`.
- **Adapted or substantially rewritten**: delete `originalUrl` so the local
  canonical stays, but keep `originalPublisher` and both visible notes.
- Keep the attribution notes in plain prose. `<Callout>` bodies are
  `not-prose`, so links inside them render unstyled.
- Don't claim a reuse license unless you've verified the source's license.

### 6. Regenerate, build, and check visually

Run the `rebuild-seo-artifacts` skill (`bunx tsx scripts/generate-seo.ts`). In
the diff, `llms.txt` gains a line pointing at the Substack URL and
`sitemap.xml` doesn't change.

```bash
bun install --frozen-lockfile   # only if node_modules is missing
bun run build
./node_modules/.bin/vite preview --port 4179 --strictPort --host 127.0.0.1
```

Run the preview unsandboxed and from the repo root (pass
`working_directory`). Otherwise it fails on `uv_interface_addresses`, or
serves an empty folder if the shell `cd`'d elsewhere. Take screenshots with
headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --hide-scrollbars --virtual-time-budget=6000 --window-size=1280,15000 \
  --screenshot=/tmp/post.png http://127.0.0.1:4179/blog/<category>/<slug>
```

Check the title, subtitle, author, date, cover, tables, quoted code blocks,
and footer, plus the card on `/blog`. Headless Chrome won't lay out narrower
than about 500px, so a 390px screenshot looks clipped on every page. Compare
against an existing post before treating that as an overflow bug.

`bun run build` reruns the SEO generator. If you built with scratch content,
run `git checkout -- public/` afterwards.

### 7. Clean bun.lock and open the PR

Follow `.agents/rules/bun-clean-lock-rule.mdc`: run
`bun run strip-lock-proxy && bun run strip-lock-proxy:check` before the PR.
In the PR description, link the original post and note which screenshots
became tables.
