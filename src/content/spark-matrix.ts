// Single source of truth for the /spark-matrix project page.
// Plain data only (no JSX) so both the React page and the SEO/llms.txt
// generator can import it. Every data value (build date, Apache releases,
// platforms, categories, the matrix itself) is read from the vendored Spark
// Matrix data in src/data/spark-matrix/, which scripts/sync-spark-matrix.mjs
// copies from open-lakehouse/spark-matrix. Refresh it with that script, never
// by hand.
//
// The repository link is MATRIX_REPO below, pending the repository going
// public.
import {
  APACHE_MINORS,
  CATEGORIES,
  LEVEL_META,
  RETIRED_PLATFORMS,
  SHOWN_PLATFORMS,
  SPARK_FEATURES,
  cellFor,
  defaultRuntime,
  features,
  hasIt,
  meta,
  platforms,
  type Level,
} from "../lib/spark-matrix";

export const SLUG = "/spark-matrix";
export const TITLE = "Spark Matrix";
export const TAGLINE = "Apache Spark features across managed Spark platforms, every cell traced to a source";
/** The repository's own interactive viewer, built into public/spark-matrix/explorer/. */
export const EXPLORER_PATH = "/spark-matrix/explorer/";

// PENDING: the open-lakehouse/spark-matrix repository is private. When it goes
// public, set MATRIX_REPO to "https://github.com/open-lakehouse/spark-matrix";
// the repository links and the Dataset JSON-LD read this constant.
export const MATRIX_REPO: string | null = null;

// /spark-matrix forwards visitors to the full explorer. The crawlable content
// lives on prerendered subpages: the comparison table (with its Dataset
// JSON-LD), the methodology, and the FAQ (with its FAQPage JSON-LD). Each
// reuses the constants below; the page components must not duplicate the prose.
export const TABLE_PATH = "/spark-matrix/table";
export const TABLE_TITLE = "Spark Matrix comparison table";
export const TABLE_META_DESCRIPTION =
  "The Spark Matrix comparison table: Apache Spark features across managed Spark platforms, each at its newest generally available runtime, with every cell traced to the Apache Spark source or a primary vendor statement.";
export const METHOD_PATH = "/spark-matrix/method";
export const METHOD_TITLE = "Spark Matrix method";
export const METHOD_META_DESCRIPTION =
  "How Spark Matrix is built: the evidence model, what is read from the Apache Spark source tree, the support levels, the features compared, and the managed Spark platforms covered.";
export const FAQ_PATH = "/spark-matrix/faq";
export const FAQ_TITLE = "Spark Matrix FAQ";
export const FAQ_META_DESCRIPTION =
  "Frequently asked questions about Spark Matrix: what it is, where to see the matrix, which managed Spark platforms it covers, how feature support is decided, and how the data is kept current.";

export const DATA_GENERATED = meta.generated;
export const APACHE_LATEST = meta.latest;
export const APACHE_FEATURE_RELEASES = meta.versions;
export const PLATFORMS_BY_VENDOR: { vendor: string; platforms: string[] }[] = platforms.reduce(
  (acc, p) => {
    const v = acc.find((x) => x.vendor === p.vendor);
    if (v) v.platforms.push(p.name);
    else acc.push({ vendor: p.vendor, platforms: [p.name] });
    return acc;
  },
  [] as { vendor: string; platforms: string[] }[],
);
export const FEATURE_CATEGORIES: { title: string; blurb: string }[] = CATEGORIES.map(({ title, blurb }) => ({ title, blurb }));
export const HEADLINE_FEATURE_COUNT = features.length;

export const PLATFORM_COUNT = PLATFORMS_BY_VENDOR.reduce((n, v) => n + v.platforms.length, 0);
export const VENDOR_COUNT = PLATFORMS_BY_VENDOR.length;
export const APACHE_FIRST = APACHE_FEATURE_RELEASES[0];

export const META_DESCRIPTION =
  "Spark Matrix compares Apache Spark features across managed Spark platforms such as Amazon EMR, AWS Glue, Databricks, Google Cloud, Microsoft Fabric and Snowflake. Every cell is traced to the Apache Spark source or a primary vendor statement.";

export const DESCRIPTION =
  "Spark Matrix is an open dataset and viewer that compares Apache Spark features across managed Spark platforms. A version label such as \"Spark 3.5\" does not say whether a runtime has Spark Connect, which SQL grammar it accepts, or what the vendor changed. Spark Matrix answers those questions with evidence: every cell traces to the Apache Spark source tree at a release tag, or to a quoted statement in the vendor's own documentation.";

export const DEFINITION =
  "Spark Matrix is an open-source comparison of Apache Spark features across managed Spark platforms. For each managed runtime it records the Apache Spark release the vendor states the runtime is based on, then reports which Spark features that runtime has and what support level the vendor documents. Every cell is traced either to the Apache Spark source tree at a release tag or to a primary vendor statement with a quotation and URL. Where vendor documentation is silent or contradictory, the matrix records an open question instead of guessing.";

export const QUESTIONS_ANSWERED = [
  "Which Apache Spark release underlies each managed runtime?",
  "Which Spark features are present in that release?",
  "What support level does the vendor document for a feature?",
  "When did an Apache API, SQL construct, configuration or protocol message first appear?",
  "Which vendor runtimes are ahead of or behind their stated Apache base?",
];

// Apache inventory: what the harvester reads from each release tag.
export const INVENTORY_SOURCES: { item: string; source: string }[] = [
  { item: "SQL functions and examples", source: "sql-expression-schema.md and @ExpressionDescription" },
  { item: "Public and internal configuration", source: "buildConf, buildStaticConf and ConfigBuilder declarations" },
  { item: "SQL statements and clauses", source: "SqlBaseParser.g4 rules and labeled alternatives" },
  { item: "SQL keywords", source: "SqlBaseLexer.g4" },
  { item: "Spark Connect protocol", source: "RPC and plan messages under spark/connect/*.proto" },
  { item: "Python and Scala APIs", source: "PySpark modules and org.apache.spark.sql.functions" },
  { item: "Data sources", source: "DataSourceRegister.shortName() implementations" },
  { item: "Documentation and compatibility", source: "docs/, error-conditions.json and docs/index.md" },
];

// Cell levels, strongest evidence first (the matrix legend).
export const SUPPORT_LEVELS: { label: string; meaning: string }[] = Object.values(LEVEL_META).map(({ label, meaning }) => ({
  label,
  meaning,
}));

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Spark Matrix?",
    a: "Spark Matrix is an open-source comparison of Apache Spark features across managed Spark platforms. It records which Apache Spark release each managed runtime is based on and which features that runtime has, and it traces every cell to the Apache Spark source or to a primary vendor statement.",
  },
  {
    q: "Where can I see the matrix?",
    a: `The matrix is on this page at ${SLUG}: one row per feature, one column per managed Spark service at its newest generally available runtime, and a cell for each that opens the vendor quotation or the Apache source behind it. The full explorer at ${EXPLORER_PATH} adds every runtime of each service, the per-release Apache Spark inventory of functions, configurations, syntax and APIs, release notes, and how far each runtime lags the Apache release.`,
  },
  {
    q: "Which managed Spark platforms does Spark Matrix cover?",
    a: `As of the ${DATA_GENERATED} data build, Spark Matrix records ${PLATFORM_COUNT} managed Spark services from ${VENDOR_COUNT} vendors: ${PLATFORMS_BY_VENDOR.map((v) => v.vendor).join(", ")}. They include Amazon EMR, AWS Glue, Databricks Runtime, Google Cloud Managed Service for Apache Spark (formerly Dataproc), Microsoft Fabric, Azure Synapse, Cloudera, OCI Data Flow, Snowpark Connect for Spark, IBM watsonx.data and Alibaba Cloud EMR Serverless Spark.`,
  },
  {
    q: "How does Spark Matrix decide whether a platform supports a Spark feature?",
    a: "An explicit vendor statement wins. Without one, the matrix reports whether the runtime's stated Apache Spark base contains the feature, as detected in the Apache source tree at that release. A feature the vendor documents on a runtime whose Apache base lacks it is marked as ahead of Apache. Missing or conflicting vendor documentation is recorded as an open question, never converted into a support claim.",
  },
  {
    q: "Where does the Apache Spark feature data come from?",
    a: `A harvester reads each Apache Spark feature-release tag from ${APACHE_FIRST} to ${APACHE_LATEST} directly from the source tree: SQL functions, configuration keys, parser rules and keywords, Spark Connect protocol messages, PySpark and Scala APIs, data sources and error conditions. Each record has its first release, its removal release when there is one, and a link to the source location. Release dates and notes come from the Apache Spark website release announcements.`,
  },
  {
    q: "How is Spark Matrix kept current?",
    a: "A weekly refresh workflow reruns the harvester and opens a pull request when Apache release data changes. Vendor records are updated from vendor documentation, and each platform file records the date its cited pages were checked.",
  },
];

// ---------- Text summary of the matrix (llms-full.txt) ----------

const EXPLICIT: Level[] = ["ahead", "documented", "partial", "preview", "off-by-default", "unsupported"];

/** The matrix as Markdown, from the vendored data: per service, its runtime, Spark base and documented levels. */
const LATEST_MINOR = APACHE_MINORS[0];
const LATEST_FEATURES = SPARK_FEATURES.filter((f) => f.in.some((v) => v.startsWith(LATEST_MINOR + ".")));

export function matrixMarkdown(siteUrl: string): string {
  const out: string[] = [];
  out.push(
    `## The matrix (data build ${DATA_GENERATED})`,
    "",
    `Each service is shown at its newest generally available runtime. "Spark features available" counts the ${SPARK_FEATURES.length} Apache Spark features that the runtime has at any level from Documented to Off by default. The interactive matrix is at ${siteUrl}${SLUG}; the full explorer is at ${siteUrl}${EXPLORER_PATH}.`,
    "",
    `| Service | Vendor | Runtime | Vendor Spark version | Apache Spark base | Spark features available | Missing from Apache Spark ${LATEST_MINOR} |`,
    "|---|---|---|---|---|---|---|",
  );
  for (const p of SHOWN_PLATFORMS) {
    const r = defaultRuntime(p);
    const n = SPARK_FEATURES.filter((f) => hasIt(cellFor(p, r?.id, f).level)).length;
    const miss = LATEST_FEATURES.filter((f) => !hasIt(cellFor(p, r?.id, f).level)).length;
    out.push(`| ${p.name} | ${p.vendor} | ${r?.label ?? "not stated"} | ${r?.spark ?? "not stated"} | ${r?.spark_base ?? "not stated"} | ${n} | ${miss} |`);
  }
  out.push("", `## What each Apache Spark release line added`, "", "Spark 4.0, 4.1, 4.2 and 4.3 are not interchangeable. These tracked features first shipped in each release line:", "");
  for (const m of [...APACHE_MINORS].reverse()) {
    const added = SPARK_FEATURES.filter((f) => f.since && f.since.startsWith(m + "."));
    if (added.length) out.push(`- **Apache Spark ${m}:** ${added.map((f) => f.title).join("; ")}`);
  }
  out.push("", "Apache Spark itself, for comparison:", "");
  for (const m of APACHE_MINORS) {
    const n = SPARK_FEATURES.filter((f) => f.in.some((v) => v.startsWith(m + "."))).length;
    out.push(`- Apache Spark ${m}: ${n} of ${SPARK_FEATURES.length} features`);
  }
  if (RETIRED_PLATFORMS.length) {
    out.push("", `Retired services (every runtime end of life or deprecated), not shown in the matrix: ${RETIRED_PLATFORMS.map((p) => p.name).join("; ")}.`);
  }
  out.push("", "### What each vendor documents", "", "Features with an explicit vendor statement on the runtime shown, by support level. Features not listed follow the runtime's Apache Spark base.", "");
  for (const p of SHOWN_PLATFORMS) {
    const r = defaultRuntime(p);
    const by = new Map<Level, string[]>();
    const absent: string[] = [];
    for (const f of features) {
      const c = cellFor(p, r?.id, f);
      if (EXPLICIT.includes(c.level) && c.claims.length) by.set(c.level, [...(by.get(c.level) ?? []), f.title]);
      else if (c.level === "absent" && !f.vendor_only) absent.push(f.title);
    }
    out.push(`#### ${p.name} (${r?.label ?? "runtime not stated"}, Apache Spark ${r?.spark_base ?? "base not stated"})`, "");
    if (r?.source) out.push(`Version source: ${r.source}`, "");
    for (const l of EXPLICIT) {
      const fs = by.get(l);
      if (fs?.length) out.push(`- ${LEVEL_META[l].label}: ${fs.join("; ")}`);
    }
    if (absent.length) out.push(`- Not in this Spark: ${absent.join("; ")}`);
    if (!by.size && !absent.length) out.push("- No feature-level vendor statements recorded.");
    out.push("");
  }
  return out.join("\n");
}
