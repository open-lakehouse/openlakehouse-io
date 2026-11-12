// Centralized SEO/GEO constants and helpers.
// Single source of truth for site identity used by <Seo> and JSON-LD.

export const SITE_URL = "https://openlakehouse.io";
export const SITE_NAME = "Open Lakehouse";
export const SITE_TAGLINE = "Open formats, open engines, your storage";
export const SITE_DESCRIPTION =
  "The Open Lakehouse: open source data engineering with Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark — your data in open formats on storage you control.";

// Query-shaped entity vocabulary. Search engines and LLMs use these strings to
// decide whether this domain is a relevant source for a question, so they are
// kept as plain, literal phrases rather than brand-first prose.
export const SITE_KEYWORDS = [
  "open source data engineering",
  "open source data engineering stack",
  "open source data platform",
  "open lakehouse",
  "open table format",
  "Delta Lake",
  "Apache Iceberg",
  "Apache Hudi",
  "Unity Catalog",
  "Apache Polaris",
  "MLflow",
  "Apache Spark",
  "Apache Flink",
  "Trino",
  "DuckDB",
  "Apache Airflow",
  "data lakehouse architecture",
];

// Concept-level `knowsAbout` graph for the sitewide Organization node. Kept
// separate from SITE_KEYWORDS because schema.org expects topics, not verbatim
// search phrases.
export const SITE_KNOWS_ABOUT = [
  "Open source data engineering",
  "Data lakehouse architecture",
  "Open table formats",
  "Delta Lake",
  "Apache Iceberg",
  "Apache Hudi",
  "Data catalogs and governance",
  "Unity Catalog",
  "Apache Spark",
  "Streaming data pipelines",
  "ML and AI lifecycle management",
  "MLflow",
];

export const canonicalUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// og:image, twitter:image, and JSON-LD `image` must be absolute. Local assets
// (e.g. a colocated post thumbnail) resolve to "/assets/..." paths, so prefix
// those with the site origin; absolute URLs pass through unchanged.
export const absoluteUrl = (url?: string) =>
  !url ? undefined : /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : canonicalUrl(url);

// Schema.org Organization used sitewide. The `sameAs` graph encodes the
// open-source projects (and their origin orgs) that make up the lakehouse —
// machine-readable provenance for LLMs and search engines.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS.join(", "),
  knowsAbout: SITE_KNOWS_ABOUT,
  sameAs: [
    "https://delta.io",
    "https://iceberg.apache.org",
    "https://unitycatalog.io",
    "https://mlflow.org",
    "https://spark.apache.org",
    "https://hudi.apache.org",
    "https://polaris.apache.org",
    "https://flink.apache.org",
    "https://trino.io",
    "https://duckdb.org",
    "https://airflow.apache.org",
    "https://github.com/delta-io",
    "https://github.com/apache/iceberg",
    "https://github.com/apache/hudi",
    "https://github.com/unitycatalog/unitycatalog",
    "https://github.com/apache/polaris",
    "https://github.com/mlflow/mlflow",
    "https://github.com/apache/spark",
    "https://github.com/apache/flink",
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS.join(", "),
};
