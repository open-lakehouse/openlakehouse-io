#!/usr/bin/env bun
/**
 * Strips registry proxy URLs out of bun.lock and package-lock.json.
 *
 * Local installs may route through a private npm proxy/registry, which bakes a
 * host-specific tarball URL into every lockfile entry. That URL must never land
 * in a PR — Vercel and other machines can't reach the proxy — so:
 *
 *   - bun.lock: the resolution (second) field is reset to "" — the value Bun
 *     uses for the default registry.
 *   - package-lock.json: `resolved` is rewritten to the public npm registry
 *     (https://registry.npmjs.org/<name>/-/<file>.tgz) — what npm writes with
 *     the default registry. npm's default `replace-registry-host=npmjs` maps it
 *     back to whichever registry a local install is configured to use.
 *
 * Host-agnostic: matches any http(s) registry tarball URL (".../-/<name>-<version>.tgz").
 * Git, GitHub, file, and already-clean resolutions are left untouched. Names,
 * versions, dependency maps, and integrity hashes are never modified.
 *
 * Usage:
 *   bun run scripts/strip-bun-lock-proxy.ts          # rewrite lockfiles in place
 *   bun run scripts/strip-bun-lock-proxy.ts --check   # exit 1 if proxy URLs exist (no write)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Stripped = { text: string; count: number };

const NPM_REGISTRY = "https://registry.npmjs.org";

// Group 1 is the entry head: ["<name>@<version>", . Group 2 is the proxied
// resolution URL, which we drop (replace the whole match with group 1 + "").
const BUN_PROXY_RESOLUTION =
  /(\["[^"]+@[^"]+", )"https?:\/\/[^"]*\/-\/[^"]*\.tgz"/g;

const TARBALL_URL = /^https?:\/\/[^"]*\/-\/[^"/]+\.tgz$/;

function stripBunLock(text: string): Stripped {
  const count = text.match(BUN_PROXY_RESOLUTION)?.length ?? 0;
  return { text: text.replace(BUN_PROXY_RESOLUTION, '$1""'), count };
}

// Edits the raw text rather than re-serializing so npm's formatting is kept.
function stripPackageLock(text: string): Stripped {
  const lock = JSON.parse(text) as {
    packages?: Record<string, { name?: string; resolved?: string }>;
  };
  let count = 0;
  for (const [key, entry] of Object.entries(lock.packages ?? {})) {
    const url = entry.resolved;
    if (!url || !TARBALL_URL.test(url) || url.startsWith(`${NPM_REGISTRY}/`)) continue;
    // Aliased installs (e.g. "string-width-cjs") record the real package in `name`.
    const name = entry.name ?? key.slice(key.lastIndexOf("node_modules/") + "node_modules/".length);
    const file = url.slice(url.lastIndexOf("/") + 1);
    const publicUrl = `${NPM_REGISTRY}/${name}/-/${file}`;
    text = text.replace(`"resolved": "${url}"`, () => `"resolved": "${publicUrl}"`);
    count++;
  }
  return { text, count };
}

const LOCKFILES: { file: string; strip: (text: string) => Stripped }[] = [
  { file: "bun.lock", strip: stripBunLock },
  { file: "package-lock.json", strip: stripPackageLock },
];

const checkOnly = process.argv.includes("--check");
let dirty = false;

for (const { file, strip } of LOCKFILES) {
  const path = resolve(import.meta.dirname, "..", file);
  if (!existsSync(path)) continue;

  const { text, count } = strip(readFileSync(path, "utf8"));

  if (count === 0) {
    console.log(`${file} is clean — no proxy URLs found.`);
  } else if (checkOnly) {
    console.error(
      `${file} contains ${count} proxied resolution URL(s). Run: bun run strip-lock-proxy`,
    );
    dirty = true;
  } else {
    writeFileSync(path, text);
    console.log(`Stripped ${count} proxy URL(s) from ${file}.`);
  }
}

if (dirty) process.exit(1);
