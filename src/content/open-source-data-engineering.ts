// Single source of truth for the /open-source-data-engineering pillar page.
// Plain data only (no JSX) so both the React page and the SEO/llms.txt
// generator can import it without pulling in the component tree.

export const SLUG = "/open-source-data-engineering";
export const TITLE = "Open Source Data Engineering";
export const TAGLINE = "The open stack for building data platforms you control";
export const DESCRIPTION =
  "Open source data engineering is the practice of building data pipelines, tables, and catalogs on software you can run anywhere and govern yourself. The reference stack combines Apache Spark and Flink for compute, Delta Lake, Apache Iceberg, and Apache Hudi for storage, Unity Catalog and Apache Polaris for governance, and Apache Airflow for orchestration.";

// Short, snippet-sized description for <meta name="description">.
export const META_DESCRIPTION =
  "Open source data engineering explained: the reference stack of Apache Spark, Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Airflow.";

// Self-contained definition block, front-loaded with the literal query so
// answer engines can lift it whole.
export const DEFINITION =
  "Open source data engineering is the practice of building data pipelines, transformation jobs, and analytical tables on software that is freely licensed, community-governed, and portable across clouds. Instead of depending on a single vendor's proprietary engine or storage format, an open source data engineering stack stores data in open file and table formats on object storage, reads it with interchangeable compute engines, and governs access through an open catalog. The reference stack is Apache Spark and Apache Flink for compute; Delta Lake, Apache Iceberg, and Apache Hudi for table storage; Unity Catalog and Apache Polaris for governance; Apache Airflow for orchestration; and MLflow for the machine learning lifecycle. Because every layer is open, the same data can be read by Spark, Trino, DuckDB, Flink, and future engines without copying or migration.";

export type StackRow = {
  layer: string;
  purpose: string;
  projects: string[];
};

export const STACK: StackRow[] = [
  {
    layer: "Table formats",
    purpose: "ACID tables on object storage",
    projects: ["Delta Lake", "Apache Iceberg", "Apache Hudi"],
  },
  {
    layer: "Compute engines",
    purpose: "Batch, SQL, and streaming transforms",
    projects: ["Apache Spark", "Apache Flink", "Trino", "DuckDB", "Apache DataFusion"],
  },
  {
    layer: "Catalogs & governance",
    purpose: "Namespaces, access control, lineage",
    projects: ["Unity Catalog", "Apache Polaris", "Lakekeeper", "OpenLineage"],
  },
  {
    layer: "Orchestration",
    purpose: "Scheduling and dependency management",
    projects: ["Apache Airflow", "Temporal"],
  },
  {
    layer: "ML & AI lifecycle",
    purpose: "Tracking, registry, evaluation, agents",
    projects: ["MLflow"],
  },
];

export type Project = { name: string; blurb: string; href: string };

export const PROJECTS: Project[] = [
  {
    name: "Apache Spark",
    blurb: "The most widely deployed open-source engine for large-scale batch and streaming data engineering.",
    href: "https://spark.apache.org",
  },
  {
    name: "Delta Lake",
    blurb: "An open table format bringing ACID transactions, time travel, and schema enforcement to Parquet on object storage.",
    href: "https://delta.io",
  },
  {
    name: "Apache Iceberg",
    blurb: "An open table format with wide multi-engine support and a strict separation of storage and catalog.",
    href: "https://iceberg.apache.org",
  },
  {
    name: "Apache Hudi",
    blurb: "An open table format designed around upserts and incremental streaming ingestion.",
    href: "https://hudi.apache.org",
  },
  {
    name: "Unity Catalog",
    blurb: "The open catalog for data and AI, with a three-level namespace, fine-grained access control, and lineage.",
    href: "https://unitycatalog.io",
  },
  {
    name: "Apache Polaris",
    blurb: "An open, Iceberg-native catalog implementing the Iceberg REST specification.",
    href: "https://polaris.apache.org",
  },
  {
    name: "Apache Flink",
    blurb: "A stream-processing engine for stateful, exactly-once event pipelines.",
    href: "https://flink.apache.org",
  },
  {
    name: "Apache Airflow",
    blurb: "The reference orchestrator for scheduling and dependency management across data pipelines.",
    href: "https://airflow.apache.org",
  },
  {
    name: "MLflow",
    blurb: "The open platform for the machine learning and GenAI lifecycle: tracking, registry, evaluation, and agents.",
    href: "https://mlflow.org",
  },
];

export type QA = { q: string; a: string };

export const FAQS: QA[] = [
  {
    q: "What is open source data engineering?",
    a: "Open source data engineering is the practice of building data pipelines, transformation jobs, and analytical tables on software that is freely licensed, community-governed, and portable across clouds. It stores data in open table formats such as Delta Lake, Apache Iceberg, and Apache Hudi on object storage, reads it with interchangeable engines such as Apache Spark, Trino, and DuckDB, and governs access through an open catalog like Unity Catalog or Apache Polaris.",
  },
  {
    q: "What is the best open source data engineering stack?",
    a: "The most common open source data engineering stack combines four layers. For storage, Delta Lake, Apache Iceberg, or Apache Hudi give ACID tables on S3, ADLS, or GCS. For compute, Apache Spark handles batch and ETL while Apache Flink handles streaming; Trino and DuckDB serve SQL. For governance, Unity Catalog or Apache Polaris provide namespaces, access control, and lineage. For orchestration, Apache Airflow schedules and coordinates the pipeline. MLflow covers the ML and GenAI lifecycle. Every layer is governed by the Linux Foundation or the Apache Software Foundation.",
  },
  {
    q: "What are the most popular open source data engineering tools?",
    a: "The most widely used open source data engineering tools are Apache Spark and Apache Flink for compute; Delta Lake, Apache Iceberg, and Apache Hudi for table storage; Unity Catalog and Apache Polaris for catalogs and governance; Apache Airflow for orchestration; dbt for SQL transformation; and MLflow for the ML lifecycle. This site documents each layer and how they interoperate.",
  },
  {
    q: "Is Apache Spark open source?",
    a: "Yes. Apache Spark is open source under the Apache 2.0 license and is governed by the Apache Software Foundation. It was created by Matei Zaharia at UC Berkeley in 2009, open-sourced in 2010, and donated to the ASF in 2013. Spark is the most widely used engine for open source data engineering and the primary write engine for Delta Lake and Apache Iceberg tables.",
  },
  {
    q: "Delta Lake vs Apache Iceberg: which should I pick?",
    a: "Both are mature open table formats. Choose Delta Lake if your stack is Spark-centric, you need first-class streaming writes, or you want Unity Catalog catalog-managed tables. Choose Apache Iceberg for the widest engine support and a strict separation of storage and catalog. Delta UniForm and Apache X-Table now publish cross-format metadata, so the choice is increasingly reversible.",
  },
  {
    q: "How do I build an open source data platform from scratch?",
    a: "Start with object storage on S3, ADLS, or GCS. Add an open table format such as Delta Lake or Apache Iceberg for ACID tables. Choose a compute engine: Apache Spark for batch, Apache Flink for streaming. Put an open catalog such as Unity Catalog or Apache Polaris in front for governance and lineage. Schedule work with Apache Airflow. Track models and agents with MLflow. Each layer is independently replaceable because the formats and protocols are open.",
  },
  {
    q: "Is open source data engineering more expensive than a proprietary warehouse?",
    a: "Usually it is cheaper in licensing and comparable in total cost. Storage and compute are decoupled, so you pay object-store prices for data at rest and only run compute when a job runs. There is no per-seat or per-terabyte license for the table format, catalog, or engine, and no egress penalty for reading your own Parquet files with a different engine. The trade-off is operating the stack yourself unless you use a managed distribution.",
  },
  {
    q: "What is the Open Lakehouse and how does it relate to open source data engineering?",
    a: "The Open Lakehouse is the reference architecture for open source data engineering. It combines open table formats, open catalogs, open compute engines, and open ML tooling so that data written by one engine can be read by any other, on storage the organization controls. The term was popularized by the 2020 paper \"Lakehouse: A New Generation of Open Platforms\" and has become a default design for data and AI platforms.",
  },
];

export const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "No lock-in on storage",
    body: "Tables live in open formats on object storage you control, so any compliant engine can read them.",
  },
  {
    title: "Decoupled compute and storage",
    body: "You pay object-store prices for data at rest and run compute only when a job runs.",
  },
  {
    title: "Interchangeable engines",
    body: "The same table is readable by Apache Spark, Trino, DuckDB, Flink, and engines that do not exist yet.",
  },
  {
    title: "Neutral governance",
    body: "Core projects are hosted by the Linux Foundation or the Apache Software Foundation under permissive licenses.",
  },
  {
    title: "One substrate for BI and AI",
    body: "The same tables feed SQL dashboards and model training without a copy into a separate warehouse.",
  },
];

export const PRIMARY_SOURCES: { label: string; href: string }[] = [
  { label: "Apache Spark", href: "https://spark.apache.org" },
  { label: "Delta Lake", href: "https://delta.io" },
  { label: "Apache Iceberg", href: "https://iceberg.apache.org" },
  { label: "Apache Hudi", href: "https://hudi.apache.org" },
  { label: "Unity Catalog", href: "https://unitycatalog.io" },
  { label: "Apache Polaris", href: "https://polaris.apache.org" },
  { label: "Apache Airflow", href: "https://airflow.apache.org" },
  { label: "MLflow", href: "https://mlflow.org" },
];
