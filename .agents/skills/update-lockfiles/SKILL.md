---
name: update-lockfiles
description: >-
  Update bun.lock and package-lock.json together after any dependency change,
  strip private registry proxy URLs from both, and verify they match
  package.json. Use when adding, removing, or upgrading a package; when
  package.json dependencies change; when a Vercel build fails with npm errors
  like ERESOLVE, ETARGET, ENOTFOUND, or a proxy/registry host it can't reach;
  or when the user mentions lockfiles, bun.lock, package-lock.json, or
  strip-lock-proxy.
---

# Update lockfiles

Two lockfiles are committed and both matter:

- `bun.lock` — local development (`bun install`).
- `package-lock.json` — Vercel builds run `npm install` from it.

Both must pin every dependency in `package.json`, and neither may contain
private proxy URLs. Rules: `.agents/rules/lockfile-sync-rule.mdc` and
`.agents/rules/bun-clean-lock-rule.mdc`.

## Workflow

```
- [ ] 1. Change dependencies with bun
- [ ] 2. Bring package-lock.json up to date with npm
- [ ] 3. Strip proxy URLs from both lockfiles
- [ ] 4. Verify both lockfiles
- [ ] 5. Commit package.json + both lockfiles together
```

Steps 1–2 need registry access (request `full_network` in the sandbox).

### 1. Change dependencies with bun

```bash
bun add <pkg>            # or: bun add -d <pkg>, bun remove <pkg>, bun update <pkg>
```

This updates `package.json` and `bun.lock`. `bunfig.toml` enforces a 24h
`minimumReleaseAge` supply-chain guard — don't add `minimumReleaseAgeExcludes`
entries without asking the user.

### 2. Bring package-lock.json up to date

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
```

This adds/removes entries to match `package.json` without touching
`node_modules`, and keeps already-locked versions. Do **not** delete
`package-lock.json` to regenerate it from scratch — that re-resolves every
package and produces a huge, risky diff.

On a machine behind a registry proxy, every entry npm just wrote now has a
`resolved` URL pointing at the proxy. Step 3 fixes that.

### 3. Strip proxy URLs

```bash
bun run strip-lock-proxy
```

Resets `bun.lock` resolutions to `""` and rewrites `package-lock.json`
`resolved` URLs to `https://registry.npmjs.org/...`. Host-agnostic; only the
URL field changes. Logic: `scripts/strip-bun-lock-proxy.ts`.

### 4. Verify

All three must pass:

```bash
bun run strip-lock-proxy:check                    # no proxy URLs in either lockfile
npm ls --package-lock-only > /dev/null && echo ok # package-lock.json matches package.json
bun install --frozen-lockfile                     # bun.lock matches package.json
```

Then confirm the npm path Vercel uses works end to end from a clean copy:

```bash
T=$(mktemp -d) && rsync -a --exclude node_modules --exclude dist --exclude .git ./ "$T/" \
  && (cd "$T" && npm install --no-audit --no-fund && npm run build); rm -rf "$T"
```

### 5. Commit

Stage `package.json`, `bun.lock`, and `package-lock.json` in the same commit.
The pre-commit hook (`.githooks/pre-commit`, enabled with
`git config core.hooksPath .githooks`) re-strips staged lockfiles and blocks
the commit if `package-lock.json` is out of sync.

## Diagnosing a failed Vercel install

- **`ERESOLVE` / `ETARGET`**: `package-lock.json` is missing or out of date
  for some dependency, so npm resolved it fresh against the public registry.
  Check with `npm ls --package-lock-only`, then run steps 2–4.
- **`ENOTFOUND` / timeouts on a non-npmjs host**: proxy URLs were committed.
  Run `bun run strip-lock-proxy:check`, then step 3.
- Compare the lockfile against `package.json` to find drift:

```bash
node -e 'const p=require("./package.json"),l=require("./package-lock.json").packages[""];
for (const s of ["dependencies","devDependencies"]) for (const [n,r] of Object.entries(p[s]||{}))
  if ((l[s]||{})[n] !== r) console.log(s, n, r, "lock:", (l[s]||{})[n] ?? "MISSING")'
```
