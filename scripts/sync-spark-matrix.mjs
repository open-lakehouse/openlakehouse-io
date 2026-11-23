#!/usr/bin/env node
// Refresh the Spark Matrix data and explorer from a checkout of
// open-lakehouse/spark-matrix (a private repository, so the Vercel build
// cannot fetch it; the data is vendored here instead).
//
//   bun run sync:spark-matrix -- /path/to/spark-matrix
//   SPARK_MATRIX_DIR=/path/to/spark-matrix bun run sync:spark-matrix
//   bun run sync:spark-matrix -- /path/to/spark-matrix --data-only
//
// What it writes:
//   src/data/spark-matrix/matrix.json     data/matrix.json, unchanged
//   src/data/spark-matrix/features.json   data/features.json, unchanged
//   src/data/spark-matrix/platforms.json  data/platforms.json, reduced to the
//                                         fields the /spark-matrix page reads
//   public/spark-matrix/explorer/         the repository's own viewer (site/),
//                                         built with SITE_BASE=/spark-matrix/explorer/,
//                                         plus all of data/*.json it fetches
//
// The first three are imported at build time by src/lib/spark-matrix.ts, so
// the matrix on /spark-matrix is in the prerendered HTML. The explorer is a
// static app served as-is at /spark-matrix/explorer/. The viewer is built in a
// temporary copy, so the checkout is never modified. Needs Node 22 and npm.
// After a sync, run `bun run build` and commit the changed files.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const dataOnly = args.includes("--data-only");
const src = resolve(args.find((a) => !a.startsWith("--")) ?? process.env.SPARK_MATRIX_DIR ?? "");
if (!process.env.SPARK_MATRIX_DIR && !args.some((a) => !a.startsWith("--"))) {
  console.error("usage: sync-spark-matrix.mjs <path to spark-matrix checkout> [--data-only]  (or set SPARK_MATRIX_DIR)");
  process.exit(2);
}
const dataDir = join(src, "data");
for (const f of ["matrix.json", "features.json", "platforms.json"]) {
  if (!existsSync(join(dataDir, f))) {
    console.error(`[sync-spark-matrix] ${join(dataDir, f)} not found; is ${src} a spark-matrix checkout?`);
    process.exit(1);
  }
}

const root = resolve(import.meta.dirname, "..");
const outData = join(root, "src/data/spark-matrix");
mkdirSync(outData, { recursive: true });

const read = (f) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));
const write = (f, v) => writeFileSync(join(outData, f), JSON.stringify(v) + "\n");

write("matrix.json", read("matrix.json"));
write("features.json", read("features.json"));

// Claims are referenced by their index in each platform's claims array
// (matrix.rows[*][*].claims), so the array keeps its order and length.
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const platforms = read("platforms.json").platforms.map((p) => ({
  ...pick(p, ["id", "name", "vendor", "kind", "provider", "docs_url", "retrieved"]),
  runtimes: p.runtimes.map((r) => pick(r, ["id", "label", "spark", "spark_base", "status", "released", "source", "spark_via"])),
  claims: p.claims.map((c) => pick(c, ["feature", "status", "note", "quote", "source"])),
}));
write("platforms.json", { platforms });
console.log(`[sync-spark-matrix] wrote ${outData}`);

if (dataOnly) process.exit(0);

const siteDir = join(src, "site");
if (!existsSync(join(siteDir, "package.json"))) {
  console.error(`[sync-spark-matrix] ${siteDir} has no package.json; use --data-only to skip the explorer`);
  process.exit(1);
}
const work = mkdtempSync(join(tmpdir(), "spark-matrix-explorer-"));
try {
  cpSync(siteDir, join(work, "site"), {
    recursive: true,
    filter: (p) => !/[/\\](node_modules|dist|public[/\\]data)([/\\]|$)/.test(p.slice(siteDir.length)),
  });
  cpSync(dataDir, join(work, "data"), { recursive: true });
  const run = (cmd, cmdArgs, env = {}) =>
    execFileSync(cmd, cmdArgs, { cwd: join(work, "site"), stdio: "inherit", env: { ...process.env, ...env } });
  run("npm", ["ci", "--no-audit", "--no-fund"]);
  run("npm", ["run", "build"], { SITE_BASE: "/spark-matrix/explorer/" });
  const outExplorer = join(root, "public/spark-matrix/explorer");
  rmSync(outExplorer, { recursive: true, force: true });
  cpSync(join(work, "site/dist"), outExplorer, { recursive: true });
  console.log(`[sync-spark-matrix] wrote ${outExplorer}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
