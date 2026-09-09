# AGENTS.md

Guidance for AI coding agents working in this repository.

## Auto-load rules and skills from `.agents/`

At the start of every session, automatically discover and load the project's
rules and skills from the `.agents/` directory before doing any work:

1. **Rules** — Read every file under `.agents/rules/` (`*.mdc`, `*.md`).
   Each rule's front matter may set `alwaysApply: true`, meaning the rule must
   be followed for all work in this repo. Treat these as binding project
   conventions.
2. **Skills** — Read every `SKILL.md` under `.agents/skills/` (one per
   subdirectory). A skill applies when the current task matches its
   description. When a skill is relevant, read and follow it immediately before
   implementing.

Re-scan `.agents/` whenever the task changes, since new rules or skills may
have been added.

## Reference docs

Longer-form references live under `docs/`. Consult the relevant one before doing
related work:

- [`docs/brand-guidelines.md`](docs/brand-guidelines.md) — the visual identity
  source of truth: color palette (Green primary, Blue accent, Yellow highlight,
  Navy ink), semantic tokens, gradients, logo, and favicon. Read this before any
  color, theming, or branding change; use tokens, never hardcoded hex.

## Republished content attribution

When a post republishes another site's content:

- Add `originalUrl` and `originalPublisher` to the MDX frontmatter.
- Include a visible note linking to the original article and credit the named
  author, community, or publisher exactly as the source does.
- For a verbatim republication, use `originalUrl` as the cross-domain
  `<link rel="canonical">` and add it to the Article JSON-LD as `isBasedOn` or
  `citation`. If this metadata is not wired into the content and SEO types yet,
  implement that support rather than emitting a local canonical.
- For substantially original or adapted coverage, retain the local canonical
  and cite the source visibly instead.
- Preserve direct source links, and only state a reuse license after verifying
  the source's content license.

### Current contents

- `.agents/rules/branching-rule.mdc` — always create a `feat/*`/`fix/*`/etc.
  branch before changes; never commit directly to `main`.
- `.agents/rules/bun-clean-lock-rule.mdc` — before opening a PR, strip registry
  proxy URLs from `bun.lock` (`bun run strip-lock-proxy` / `:check`); never
  commit host-specific resolution fields.
- `.agents/skills/rebuild-seo-artifacts/SKILL.md` — regenerate `sitemap.xml`,
  `llms.txt`, and `llms-full.txt` from `src/content` for SEO/GEO/AEO.

### Adding new guidance

- Put always-on conventions in `.agents/rules/<name>.mdc`.
- Put task-specific, on-demand capabilities in
  `.agents/skills/<skill-name>/SKILL.md`.
