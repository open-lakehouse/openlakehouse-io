// The Spark Matrix data model, ported from the viewer in
// open-lakehouse/spark-matrix (site/src/lib/{levels,matrix,versions}.ts).
// The JSON under src/data/spark-matrix/ is vendored by
// scripts/sync-spark-matrix.mjs; never edit it by hand.
//
// Relative imports only: scripts/generate-seo.ts imports this file through
// src/content/spark-matrix.ts and runs outside Vite.
import matrixJson from "../data/spark-matrix/matrix.json";
import featuresJson from "../data/spark-matrix/features.json";
import platformsJson from "../data/spark-matrix/platforms.json";

export interface Meta {
  generated: string;
  latest: string;
  versions: string[];
  tags: string[];
  categories: Record<string, { title: string; blurb: string }>;
}

export interface EvidenceRule {
  kind: string;
  pattern: string;
  required: boolean;
  since: string | null;
  in: string[];
  url?: string;
  path?: string;
}

export interface Feature {
  id: string;
  title: string;
  category: string;
  summary: string;
  since: string | null;
  in: string[];
  vendor_only: boolean;
  docs: string | null;
  evidence: EvidenceRule[];
}

export interface Runtime {
  id: string;
  label: string;
  spark?: string;
  spark_base?: string;
  status?: string;
  released?: string;
  source?: string;
  spark_via?: { runtime: string; label: string; quote?: string; source?: string };
}

export interface Claim {
  feature: string;
  status: string;
  note?: string;
  quote?: string;
  source?: string;
}

export interface Platform {
  id: string;
  name: string;
  vendor: string;
  kind: string;
  provider: string;
  docs_url?: string;
  retrieved?: string;
  runtimes: Runtime[];
  claims: Claim[];
}

export interface MatrixRow {
  levels: string;
  claims: Record<string, number[]>;
  other: number[];
  from?: { platform: string; runtime: string };
  inherited?: string[];
  other_from?: number[];
}

export interface MatrixData {
  meta: Meta;
  codes: Record<string, string>;
  features: string[];
  rows: Record<string, Record<string, MatrixRow>>;
}

export const matrix = matrixJson as unknown as MatrixData;
export const meta = (featuresJson as unknown as { meta: Meta }).meta;
export const features = (featuresJson as unknown as { features: Feature[] }).features;
export const platforms = (platformsJson as unknown as { platforms: Platform[] }).platforms;

// ---------- Levels ----------

export type Level =
  | "documented"
  | "ahead"
  | "inherited"
  | "partial"
  | "preview"
  | "off-by-default"
  | "unsupported"
  | "absent"
  | "undocumented"
  | "unknown";

/** Legend order: strongest evidence first. `short` is the glyph shown in a cell. */
export const LEVELS: { level: Level; code: string; label: string; short: string; meaning: string }[] = [
  { level: "documented", code: "D", label: "Documented", short: "✓",
    meaning: "The vendor's documentation says the feature is supported on this runtime, with a quotation." },
  { level: "ahead", code: "A", label: "Ahead of Apache", short: "✓+",
    meaning: "The vendor documents the feature on a runtime whose Apache Spark base does not have it yet (a backport or vendor build)." },
  { level: "inherited", code: "I", label: "In the Apache base", short: "✓",
    meaning: "The runtime's Apache Spark version contains the feature, verified in Spark's source at that release. The vendor's documentation says nothing either way." },
  { level: "partial", code: "P", label: "Partial", short: "~",
    meaning: "The vendor documents limits, such as only some APIs, languages or sources." },
  { level: "preview", code: "V", label: "Preview", short: "β",
    meaning: "Documented as preview, beta or experimental on this runtime." },
  { level: "off-by-default", code: "O", label: "Off by default", short: "○",
    meaning: "Available, but the vendor turns it off by default (for example ANSI mode)." },
  { level: "unsupported", code: "U", label: "Unsupported", short: "✗",
    meaning: "The vendor documents that the feature is not supported or not available." },
  { level: "absent", code: "-", label: "Not in this Spark", short: "·",
    meaning: "The runtime's Apache Spark version predates the feature, and the vendor documents no backport." },
  { level: "undocumented", code: "N", label: "Not documented", short: "",
    meaning: "A platform capability (table format, engine) that the vendor's documentation does not mention for this runtime." },
  { level: "unknown", code: "?", label: "Unknown", short: "?",
    meaning: "The vendor does not state which Spark version the runtime is based on, and documents nothing about the feature." },
];

export const LEVEL_BY_CODE: Record<string, (typeof LEVELS)[number]> = Object.fromEntries(LEVELS.map((l) => [l.code, l]));
export const LEVEL_META: Record<Level, (typeof LEVELS)[number]> = Object.fromEntries(
  LEVELS.map((l) => [l.level, l]),
) as Record<Level, (typeof LEVELS)[number]>;

/** A level counts as "has it" for summary counts. */
export function hasIt(level: Level): boolean {
  return level === "documented" || level === "ahead" || level === "inherited" || level === "partial" ||
    level === "preview" || level === "off-by-default";
}

// ---------- Versions ----------

export function vparts(v: string | undefined | null): number[] {
  if (!v) return [];
  return v.split(/[.-]/).map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n));
}

export function vcmp(a: string | undefined | null, b: string | undefined | null): number {
  const pa = vparts(a);
  const pb = vparts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

export function minor(v: string | undefined | null): string {
  return vparts(v).slice(0, 2).join(".");
}

const ACTIVE = new Set(["current", "supported"]);

/** The runtime a platform column shows by default: the newest generally available one with a known Spark base. */
export function defaultRuntime(p: Platform): Runtime | undefined {
  const known = p.runtimes.filter((r) => r.spark_base);
  const active = known.filter((r) => ACTIVE.has(r.status ?? "supported"));
  const pool = active.length ? active : known.length ? known : p.runtimes;
  return [...pool].sort((a, b) => vcmp(b.spark_base, a.spark_base))[0];
}

/** Every runtime of the platform is end of life or deprecated. */
export function isRetired(p: Platform): boolean {
  return !p.runtimes.some((r) => r.status !== "eol" && r.status !== "deprecated");
}

// ---------- Cells ----------

export interface CellInfo {
  level: Level;
  claims: Claim[];
  /** Set when the claims come from the paired runtime, e.g. "Databricks Runtime 19". */
  via?: string;
}

const featureIdx: Record<string, number> = Object.fromEntries(matrix.features.map((id, i) => [id, i]));

function paired(row: MatrixRow) {
  if (!row.from) return undefined;
  const p = platforms.find((x) => x.id === row.from!.platform);
  const r = p?.runtimes.find((x) => x.id === row.from!.runtime);
  const prow = matrix.rows[row.from.platform]?.[row.from.runtime];
  return p && prow ? { p, label: r?.label.replace(/\s*\(.*\)$/, "") ?? row.from.runtime, row: prow } : undefined;
}

export function cellFor(p: Platform, runtimeId: string | undefined, f: Feature): CellInfo {
  const row = runtimeId ? matrix.rows[p.id]?.[runtimeId] : undefined;
  if (!row) return { level: "unknown", claims: [] };
  const code = row.levels[featureIdx[f.id]] ?? "?";
  const level = LEVEL_BY_CODE[code]?.level ?? "unknown";
  if (row.inherited?.includes(f.id)) {
    const src = paired(row);
    if (src) return { level, claims: (src.row.claims[f.id] ?? []).map((i) => src.p.claims[i]), via: src.label };
  }
  return { level, claims: (row.claims[f.id] ?? []).map((i) => p.claims[i]) };
}

const STATUS_LEVEL: Record<string, Level> = {
  supported: "documented", partial: "partial", preview: "preview", unsupported: "unsupported",
  "disabled-by-default": "off-by-default",
};

/** Vendor-only capabilities (claims filed as other:<id>): one row per id across the given platforms. */
export function vendorRows(ps: Platform[]): { id: string; title: string; vendors: string[] }[] {
  const seen = new Map<string, Set<string>>();
  for (const p of ps) {
    for (const c of p.claims) {
      if (c.feature.startsWith("other:")) {
        if (!seen.has(c.feature)) seen.set(c.feature, new Set());
        seen.get(c.feature)!.add(p.vendor);
      }
    }
  }
  return [...seen.entries()]
    .map(([id, vendors]) => ({ id, title: humanize(id), vendors: [...vendors] }))
    .sort((a, b) => a.vendors[0].localeCompare(b.vendors[0]) || a.title.localeCompare(b.title));
}

export function vendorCell(p: Platform, runtimeId: string | undefined, id: string): CellInfo {
  const row = runtimeId ? matrix.rows[p.id]?.[runtimeId] : undefined;
  const claims = (row?.other ?? []).map((i) => p.claims[i]).filter((c) => c.feature === id);
  let via: string | undefined;
  if (!claims.length && row?.other_from?.length) {
    const src = paired(row);
    if (src) {
      claims.push(...row.other_from.map((i) => src.p.claims[i]).filter((c) => c.feature === id));
      if (claims.length) via = src.label;
    }
  }
  if (!claims.length) {
    return { level: p.claims.some((c) => c.feature === id) ? "absent" : "undocumented", claims: [] };
  }
  return { level: STATUS_LEVEL[claims[0].status] ?? "documented", claims, via };
}

export function humanize(id: string): string {
  const t = id.replace(/^other:/, "").replace(/-/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1)
    .replace(/\buc\b/g, "Unity Catalog").replace(/\bdbconnect\b/g, "Databricks Connect")
    .replace(/\bemr\b/g, "EMR").replace(/\boss\b/g, "OSS").replace(/\bjvm\b/g, "JVM").replace(/\brdd\b/g, "RDD");
}

/** Apache Spark itself as a column: a feature is there when the release line has it. */
export function apacheLevel(f: Feature, minorVersion: string): Level {
  if (f.vendor_only) return "undocumented";
  return f.in.some((v) => v.startsWith(minorVersion + ".")) ? "documented" : "absent";
}

export function shortName(p: Platform): string {
  return p.name.replace(/^(Amazon|AWS|Microsoft|Azure|Google Cloud|Databricks|Oracle|IBM|Alibaba Cloud) /, "")
    .replace("Managed Service for Apache Spark", "Managed Spark")
    .replace(/\s*\(formerly[^)]*\)/g, "");
}

export function shortUrl(u: string): string {
  return u.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

// ---------- The default view ----------

/** The newest Apache Spark feature lines, newest first (the Apache columns). */
export const APACHE_MINORS: string[] = [...new Set(meta.versions.map(minor))].sort((a, b) => vcmp(b, a)).slice(0, 5);

/** Platforms shown as columns: not retired, newest Spark base first, as the viewer's default. */
export const SHOWN_PLATFORMS: Platform[] = platforms
  .filter((p) => !isRetired(p))
  .sort((a, b) => vcmp(defaultRuntime(b)?.spark_base, defaultRuntime(a)?.spark_base) || a.name.localeCompare(b.name));

export const RETIRED_PLATFORMS: Platform[] = platforms.filter(isRetired);

export const CATEGORIES: { id: string; title: string; blurb: string }[] = Object.entries(meta.categories).map(
  ([id, c]) => ({ id, ...c }),
);

/** Spark features only (vendor capabilities are their own category). */
export const SPARK_FEATURES: Feature[] = features.filter((f) => !f.vendor_only);
