// Single source of truth for the /spark-matrix project page.
// Plain data only (no JSX) so both the React page and the SEO/llms.txt
// generator can import it. The platform list, feature categories and Apache
// release range below are copied from the Spark Matrix generated data
// (data/platforms.json and data/matrix.json in open-lakehouse/spark-matrix);
// refresh them from a new data build, never from memory.
//
// The repository and the matrix viewer links live in
// src/pages/projects/SparkMatrix.tsx (MATRIX_REPO, MATRIX_URL) because they
// are pending the repository going public.

export const SLUG = "/spark-matrix";
export const TITLE = "Spark Matrix";
export const TAGLINE = "Apache Spark features across managed Spark platforms, every cell traced to a source";

export const DATA_GENERATED = "2026-11-22";
export const APACHE_LATEST = "4.3.0";
export const APACHE_FEATURE_RELEASES = ["3.0.0", "3.1.1", "3.2.0", "3.3.0", "3.4.0", "3.5.0", "4.0.0", "4.1.0", "4.2.0", "4.3.0"];
export const PLATFORMS_BY_VENDOR: { vendor: string; platforms: string[] }[] = [
  { vendor: "AWS", platforms: ["Amazon EMR on EC2", "Amazon EMR on EKS", "Amazon EMR Serverless", "AWS Glue (Spark jobs)", "Amazon Athena for Apache Spark"] },
  { vendor: "Microsoft", platforms: ["Microsoft Fabric (Spark runtime)", "Azure Synapse Analytics Apache Spark pools", "Azure HDInsight (Spark clusters)", "Azure HDInsight on AKS (Spark)"] },
  { vendor: "Databricks", platforms: ["Databricks Runtime (classic compute)", "Databricks serverless compute for notebooks and jobs", "Databricks SQL warehouses", "Databricks Connect"] },
  { vendor: "Google Cloud", platforms: ["Managed Service for Apache Spark clusters (formerly Dataproc on Compute Engine)", "Managed Service for Apache Spark serverless (formerly Google Cloud Serverless for Apache Spark / Dataproc Serverless)", "Managed Service for Apache Spark on GKE (formerly Dataproc on GKE)", "Spark in BigQuery Studio notebooks", "BigQuery stored procedures for Apache Spark"] },
  { vendor: "Oracle", platforms: ["OCI Data Flow"] },
  { vendor: "Cloudera", platforms: ["Cloudera Data Engineering (Cloudera on cloud)", "Cloudera Data Engineering (Cloudera Data Services on premises)", "Cloudera Runtime (Cloudera Base on premises / Data Hub on cloud)"] },
  { vendor: "Snowflake", platforms: ["Snowpark Connect for Spark"] },
  { vendor: "IBM", platforms: ["IBM watsonx.data Spark engine (Premium Edition 2.4.x)", "IBM watsonx.data Gluten-accelerated Spark engine (Premium Edition 2.4.x)", "IBM Analytics Engine (serverless)"] },
  { vendor: "Alibaba Cloud", platforms: ["Alibaba Cloud EMR Serverless Spark"] },
];
export const FEATURE_CATEGORIES: { title: string; blurb: string }[] = [
  { title: "Spark Connect", blurb: "The client/server protocol: thin clients in any language talk gRPC to a Spark server." },
  { title: "Structured Streaming", blurb: "Incremental processing, state, triggers and the real-time mode." },
  { title: "Declarative Pipelines", blurb: "Spark Declarative Pipelines (SDP): datasets and flows declared in SQL or Python, run as a graph." },
  { title: "SQL language", blurb: "Statements, clauses and SQL semantics." },
  { title: "Data types", blurb: "Types beyond the classics: variant, time, geospatial, collated strings." },
  { title: "Semantic layer", blurb: "Metric views and other ways to define business logic once." },
  { title: "PySpark", blurb: "Python APIs, UDFs, Arrow and Python-defined data sources." },
  { title: "Data sources", blurb: "Formats and connectors that ship with Spark." },
  { title: "Execution and performance", blurb: "How queries run: adaptive execution, caching, scheduling." },
  { title: "Operations", blurb: "Logging, UI, deployment and the runtime platform." },
  { title: "Machine learning", blurb: "Spark ML, including ML over Spark Connect." },
  { title: "Platform capabilities", blurb: "What the vendor adds around Spark: table formats, native engines, GPUs. Vendor-documented only." },
];
export const HEADLINE_FEATURE_COUNT = 101;

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

// Cell levels, strongest evidence first (from the viewer's legend).
export const SUPPORT_LEVELS: { label: string; meaning: string }[] = [
  { label: "Documented", meaning: "The vendor's documentation says the feature is supported on this runtime, with a quotation." },
  { label: "Ahead of Apache", meaning: "The vendor documents the feature on a runtime whose Apache Spark base does not have it yet (a backport or vendor build)." },
  { label: "In the Apache base", meaning: "The runtime's Apache Spark version contains the feature, verified in Spark's source at that release. The vendor's documentation says nothing either way." },
  { label: "Partial", meaning: "The vendor documents limits, such as only some APIs, languages or sources." },
  { label: "Preview", meaning: "Documented as preview, beta or experimental on this runtime." },
  { label: "Off by default", meaning: "Available, but the vendor turns it off by default (for example ANSI mode)." },
  { label: "Unsupported", meaning: "The vendor documents that the feature is not supported or not available." },
  { label: "Not in this Spark", meaning: "The runtime's Apache Spark version predates the feature, and the vendor documents no backport." },
  { label: "Not documented", meaning: "A platform capability (table format, engine) that the vendor's documentation does not mention for this runtime." },
  { label: "Unknown", meaning: "The vendor does not state which Spark version the runtime is based on, and documents nothing about the feature." },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Spark Matrix?",
    a: "Spark Matrix is an open-source comparison of Apache Spark features across managed Spark platforms. It records which Apache Spark release each managed runtime is based on and which features that runtime has, and it traces every cell to the Apache Spark source or to a primary vendor statement.",
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
