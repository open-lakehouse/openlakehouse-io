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

### Current contents

- `.agents/rules/branching-rule.mdc` — always create a `feat/*`/`fix/*`/etc.
  branch before changes; never commit directly to `main`.

### Adding new guidance

- Put always-on conventions in `.agents/rules/<name>.mdc`.
- Put task-specific, on-demand capabilities in
  `.agents/skills/<skill-name>/SKILL.md`.
