import type { Pattern, RepoRef } from "./types";

// Open reference architectures. Every pattern is grounded in at least one
// public repository; versions are the ones those repos pin, and quickstart
// commands are copied verbatim from their READMEs. Numbers are quoted only
// when the repo commits the result file they come from.

const UPDATED = "2026-11-21";

// ---------- Shared repo references ----------

const OPEN_LAKEHOUSE: RepoRef = {
  name: "open-lakehouse/open-lakehouse",
  url: "https://github.com/open-lakehouse/open-lakehouse",
  description: "An open reference architecture for the lakehouse that runs on Docker, deploys to AWS, and is designed so an AI agent can set it up and tear it down.",
  license: "Apache-2.0",
  targets: ["laptop", "aws"],
  quickstart: [
    "git clone https://github.com/open-lakehouse/open-lakehouse",
    "cd open-lakehouse",
    "",
    "cp .env.example .env       # fill in POSTGRES_*, S3_* placeholders",
    "./lakehouse setup          # validate env, install deps, download ~860MB of JARs",
    "./lakehouse start all      # Spark 4.1 master + worker + Connect server + Kafka",
    "./lakehouse start unity-catalog",
    "./lakehouse start mlflow",
    "./lakehouse status --json  # confirm healthy (incl. spark.connect_grpc_listening)",
  ],
};

const MASTERCLASS: RepoRef = {
  name: "open-lakehouse/lakehouse-masterclass",
  url: "https://github.com/open-lakehouse/lakehouse-masterclass",
  description: "A textbook course that builds an open lakehouse on a laptop one service per chapter, following one order-events story from storage to agents.",
  license: "Apache-2.0",
  targets: ["laptop"],
};

const SPARK_DEMOS: RepoRef = {
  name: "lisancao/spark-demos",
  url: "https://github.com/lisancao/spark-demos",
  description: "One runnable demo per Apache Spark feature, each with a verification script and the post that explains it.",
  targets: ["laptop"],
};

const UC_PLAYGROUND: RepoRef = {
  name: "open-lakehouse/unitycatalog-playground",
  url: "https://github.com/open-lakehouse/unitycatalog-playground",
  description: "Unity Catalog OSS on your machine with Spark, Delta and Iceberg in marimo notebooks, Postgres for metadata and RustFS for storage.",
  license: "Apache-2.0",
  targets: ["laptop"],
  quickstart: [
    "git clone https://github.com/open-lakehouse/unitycatalog-playground.git",
    "cd unitycatalog-playground",
    "just uc=local start",
  ],
};

const UC_RS: RepoRef = {
  name: "open-lakehouse/unitycatalog-rs",
  url: "https://github.com/open-lakehouse/unitycatalog-rs",
  description: "A Rust reimplementation of Unity Catalog OSS with UC, Delta and Iceberg REST, Delta Sharing, credential vending, OPA and Cedar authorization, a web UI, CLI and TUI.",
  license: "Apache-2.0",
  targets: ["laptop", "kubernetes"],
  quickstart: [
    "pip install 'unitycatalog-rs[all]'   # the Python client, the uc CLI, the server and the web UI",
    "uc dev                               # a server on http://localhost:8080, with the web UI",
    "uc catalog list                      # upstream's bin/uc commands",
  ],
};

// ---------- Patterns ----------

const ALL_PATTERNS: Pattern[] = [
  // =====================================================================
  {
    slug: "laptop-open-lakehouse",
    title: "The open lakehouse on a laptop",
    stackLine: "Spark, Delta Lake, Unity Catalog, Kafka, Airflow and MLflow in Docker",
    tagline: "The whole stack, one command at a time, on the machine in front of you.",
    category: "Platform",
    definition:
      "The open lakehouse on a laptop is a reference architecture that runs every layer of an open source data platform in Docker on one machine: SeaweedFS as S3-compatible object storage, Delta Lake tables registered in Unity Catalog OSS, Apache Spark 4.1 behind a Spark Connect server, Apache Kafka for events, Apache Airflow 3 for orchestration and MLflow 3 for tracking. It exists so that a data engineer, a student or an AI agent can build, test and tear down a real lakehouse without a cloud account, and then point the same code at a cloud deployment.",
    whenToUse: [
      "You want to learn how the layers of an open lakehouse fit together by running them.",
      "You need a local integration environment where pipelines run against a real catalog and object store before they reach production.",
      "You want an AI coding agent to have a full, disposable stack to work against.",
    ],
    notFor: [
      "Production workloads: the repo states that production hardening is out of scope.",
      "Writing Iceberg tables through the catalog: Unity Catalog OSS 0.6.0 accepts Delta writes only, and its Iceberg REST adapter is read-only.",
    ],
    nodes: [
      { label: "Event producers and sample data", layer: "sources", role: "Generate order events for the demos" },
      { component: "kafka", layer: "ingest", role: "Event bus on :9092", version: "Confluent 7.5.0 images" },
      { component: "seaweedfs", layer: "storage", role: "S3 API on :8333, bucket s3://lakehouse", version: "3.80", swaps: ["minio", "rustfs", "s3"] },
      { component: "delta", layer: "format", role: "The write path; every demo writes Delta into Unity Catalog", version: "4.3.1", swaps: ["iceberg"] },
      { component: "iceberg", layer: "format", role: "Read surface for other engines through Unity Catalog's Iceberg REST endpoint", version: "1.10.0", detail: true },
      { component: "unity-catalog", layer: "catalog", role: "The only catalog, on :8081", version: "0.6.0", swaps: ["unitycatalog-rs", "polaris", "lakekeeper"] },
      { component: "postgres", layer: "catalog", role: "Unity Catalog metadata store", version: "16", detail: true },
      { component: "spark", layer: "compute", role: "Batch and Structured Streaming jobs, Connect-first", version: "4.1.0 (Scala 2.13, Java 21)" },
      { component: "sdp", layer: "compute", role: "Derives silver and gold from bronze", version: "Spark 4.1", detail: true },
      { component: "airflow", layer: "orchestration", role: "Schedules the pipelines on :8085", version: "3.1.6", swaps: ["dagster", "temporal"] },
      { component: "mlflow", layer: "ml", role: "Tracking server and AI Gateway on :5000 and :5001", version: "3.14.0" },
      { component: "spark-connect", layer: "serving", role: "gRPC endpoint sc://localhost:15002 for every client", version: "4.1.0" },
      { component: "delta-sharing", layer: "serving", role: "Opt-in external sharing on :8443", version: "server 1.3.10", detail: true },
      { component: "dashboard", layer: "consumers", role: "Read-only viewer on :3000" },
      { component: "jupyter", layer: "consumers", role: "Optional notebooks", detail: true, swaps: ["marimo"] },
    ],
    steps: [
      { title: "Events arrive", body: "A producer writes order events to a Kafka topic." },
      { title: "Bronze lands", body: "A Spark Structured Streaming job reads the topic and appends raw records to a bronze Delta table registered in Unity Catalog." },
      { title: "Silver and gold derive", body: "Spark Declarative Pipelines reads bronze and maintains the silver and gold tables, which requires a Spark Connect server." },
      { title: "Bytes stay in your bucket", body: "All table data and checkpoints live under s3://lakehouse/warehouse/ in SeaweedFS." },
      { title: "Everything else reads", body: "Clients connect to sc://localhost:15002; DuckDB, Trino and PyIceberg read the same tables through Unity Catalog's Iceberg REST endpoint; the dashboard, MLflow and Delta Sharing recipients consume the results." },
    ],
    repos: [OPEN_LAKEHOUSE, MASTERCLASS],
    caveats: [
      "Writes are Delta only in this stack. Unity Catalog OSS 0.6.0 rejects data_source_format=ICEBERG, so Iceberg is a read surface (docs/compatibility.md).",
      "Delta 4.2.0 fails catalog-managed Delta writes through Unity Catalog 0.6.x with \"400 INVALID_ARGUMENT ... Invalid type_json\". Delta 4.3.1 is the pin.",
      "Delta 4.0.x throws NoSuchMethodError on LogKey with Spark 4.1.",
      "The setup step downloads about 860 MB of JARs.",
    ],
    learn: [
      { label: "Open lakehouse on your laptop", href: "/blog/apache-spark/open-lakehouse-on-your-laptop" },
      { label: "Lakehouse at home demos", href: "/blog/apache-spark/lakehouse-at-home-demos" },
      { label: "Getting started with Unity Catalog", href: "/learn/getting-started/unity-catalog" },
      { label: "Lakehouse masterclass (course)", href: "https://github.com/open-lakehouse/lakehouse-masterclass" },
    ],
    faqs: [
      { q: "Can I run a full open source lakehouse on a laptop?", a: "Yes. The open-lakehouse repository runs Spark 4.1, Delta Lake 4.3.1, Unity Catalog OSS 0.6.0, Kafka, Airflow 3.1.6, MLflow 3.14.0 and SeaweedFS in Docker, started service by service with the ./lakehouse script." },
      { q: "Why does the laptop stack write Delta and not Iceberg?", a: "Unity Catalog OSS 0.6.0 only accepts Delta for writes and serves Iceberg read-only through its Iceberg REST endpoint. Unity Catalog 0.7.0 adds writable Iceberg REST, which the lakehouse masterclass uses." },
      { q: "How do other engines read the tables?", a: "DuckDB, Trino and PyIceberg read through Unity Catalog's Iceberg REST endpoint; Spark clients connect over Spark Connect at sc://localhost:15002." },
    ],
    sources: [
      { label: "open-lakehouse README", href: "https://github.com/open-lakehouse/open-lakehouse#readme" },
      { label: "docs/compatibility.md", href: "https://github.com/open-lakehouse/open-lakehouse/blob/main/docs/compatibility.md" },
      { label: "docs/architecture.md", href: "https://github.com/open-lakehouse/open-lakehouse/blob/main/docs/architecture.md" },
    ],
    keywords: ["open source data lakehouse docker", "local data lakehouse", "lakehouse on a laptop", "Unity Catalog OSS docker compose", "Spark Delta Kafka Airflow docker"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "batch-medallion",
    title: "Batch medallion with Spark Declarative Pipelines",
    stackLine: "Spark 4.3, Apache Iceberg and Unity Catalog with bronze, silver and gold",
    tagline: "Declare the tables, let Spark work out the order, keep every layer in an open format.",
    category: "Batch",
    definition:
      "A batch medallion architecture organizes lakehouse tables into three layers: bronze holds raw records as they arrived, silver holds cleaned and conformed records, and gold holds aggregates shaped for a specific use. In this open reference architecture, Spark Declarative Pipelines (Spark 4.1 and later) defines each layer as a table or materialized view, Spark resolves the dependency graph and runs it, the tables are Apache Iceberg in Unity Catalog OSS 0.7 on S3-compatible storage, Apache Airflow schedules and backfills the runs, and DuckDB reads the gold tables through the catalog's Iceberg REST endpoint.",
    whenToUse: [
      "Your sources arrive as files, extracts or database snapshots on a schedule.",
      "You want idempotent bronze loads and reproducible silver and gold tables.",
      "You want to change a transformation without hand-ordering every downstream job.",
    ],
    notFor: [
      "Sub-second latency: use the real-time streaming pattern.",
      "Teams that need a released Iceberg runtime for Spark 4.3 today: the course builds one from an open Iceberg pull request as a temporary step.",
    ],
    nodes: [
      { label: "Order-event generator and batch extracts", layer: "sources", role: "Daily and hourly files" },
      { label: "Idempotent bronze loader", layer: "ingest", role: "Appends each batch once, keyed so reruns do not duplicate" },
      { component: "auto-cdc", layer: "ingest", role: "Applies change feeds as SCD type 1 or 2", detail: true },
      { component: "seaweedfs", layer: "storage", role: "s3://lakehouse/warehouse", version: "4.51", swaps: ["minio", "rustfs", "s3", "gcs-adls"] },
      { component: "iceberg", layer: "format", role: "Bronze, silver and gold tables", version: "runtime 4.3_2.13 built from apache/iceberg#18749", swaps: ["delta", "hudi"] },
      { component: "unity-catalog", layer: "catalog", role: "Writable Iceberg REST catalog", version: "0.7.0", swaps: ["polaris", "lakekeeper", "unitycatalog-rs"] },
      { component: "spark", layer: "compute", role: "Runs the pipeline over Spark Connect", version: "4.3.0" },
      { component: "sdp", layer: "compute", role: "Declares bronze to silver to gold and resolves order", version: "pyspark[pipelines]==4.3.0" },
      { component: "airflow", layer: "orchestration", role: "DAG with schedules and backfills", version: "3.3.2", swaps: ["dagster", "temporal"] },
      { component: "mlflow", layer: "ml", role: "Logs the gold snapshot id with each model run", version: "3.1.0", detail: true },
      { component: "duckdb", layer: "serving", role: "Reads gold through Iceberg REST", version: "1.5.6", swaps: ["trino", "pyiceberg"] },
      { label: "Analysts and notebooks", layer: "consumers", role: "Query gold tables" },
    ],
    steps: [
      { title: "Land bronze once", body: "Each batch is appended to a bronze Iceberg table with a key that makes reruns idempotent." },
      { title: "Declare silver and gold", body: "A Spark Declarative Pipelines spec declares silver as cleaned bronze and gold as aggregates over silver." },
      { title: "Spark plans the graph", body: "spark-pipelines run resolves dependencies, creates or updates each table in Unity Catalog and records the run." },
      { title: "Airflow schedules", body: "An Airflow DAG triggers the pipeline on a schedule and replays past intervals for backfills." },
      { title: "Serve from the same tables", body: "DuckDB attaches the Unity Catalog Iceberg REST endpoint and queries gold without copying it." },
    ],
    repos: [
      { ...MASTERCLASS, description: "Chapters 6 to 11 build this pattern: Iceberg through Unity Catalog, idempotent bronze, the SDP medallion, Airflow backfills and DuckDB serving." },
      OPEN_LAKEHOUSE,
      { ...SPARK_DEMOS, description: "Demo 16 includes an AUTO CDC flow that writes SCD type 2 into Iceberg on Spark 4.3.0." },
    ],
    caveats: [
      "There is no released Iceberg Spark runtime for Spark 4.3 yet; the course's chapter 5.5 builds it from apache/iceberg#18749 as a temporary step.",
      "Unity Catalog 0.7 or later is required for Iceberg writes through its REST catalog.",
      "Older SeaweedFS releases have an S3A _temporary rename bug; the course pins 4.51.",
    ],
    learn: [
      { label: "AUTO CDC in Spark Declarative Pipelines", href: "/blog/apache-spark/auto-cdc-declarative-pipelines" },
      { label: "Getting started with Apache Spark", href: "/learn/getting-started/apache-spark" },
      { label: "Spark Declarative Pipelines programming guide", href: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html" },
    ],
    faqs: [
      { q: "What is a medallion architecture?", a: "A layout of lakehouse tables in three layers: bronze for raw data as it arrived, silver for cleaned and conformed data, and gold for aggregates built for a specific consumer." },
      { q: "Do I need Databricks to use declarative pipelines?", a: "No. Spark Declarative Pipelines is part of open source Apache Spark from 4.1, run with the spark-pipelines CLI against a Spark Connect server." },
      { q: "Can DuckDB read tables that Spark writes?", a: "Yes, when both go through the same catalog. In the masterclass, DuckDB attaches Unity Catalog's Iceberg REST endpoint and reads the gold Iceberg tables Spark wrote." },
    ],
    sources: [
      { label: "lakehouse-masterclass COURSE.md", href: "https://github.com/open-lakehouse/lakehouse-masterclass" },
      { label: "Spark Declarative Pipelines guide", href: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html" },
    ],
    keywords: ["medallion architecture open source", "bronze silver gold Spark", "Spark Declarative Pipelines example", "Iceberg medallion", "SCD type 2 Spark"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "change-data-capture",
    title: "Change data capture with SCD type 2",
    stackLine: "AUTO CDC in Spark Declarative Pipelines, from a Kafka change feed into Apache Iceberg",
    tagline: "Keep the current state and every past version of each row, without hand-written MERGE logic.",
    category: "Batch",
    definition:
      "Change data capture (CDC) with slowly changing dimensions type 2 turns a feed of row-level changes from an operational system into a table that holds both the current state and the full history of each row. In open source Apache Spark 4.3, an AUTO CDC flow in Spark Declarative Pipelines reads the change feed, orders events by a sequence column, applies inserts, updates and deletes by key, and stores the result as SCD type 2: a change to a tracked column closes the old version and opens a new one, while changes to untracked columns update the current version in place. The target must support row-level operations, which Apache Iceberg provides.",
    whenToUse: [
      "An operational database or service emits change events and you need its tables in the lakehouse.",
      "Auditors or analysts ask what a row looked like at a past point in time.",
      "You want to stop maintaining hand-written MERGE statements for every replicated table.",
    ],
    notFor: [
      "Targets without row-level operations: AUTO CDC needs a DSv2 table that supports them.",
      "Spark releases before 4.3 for this exact flow; the reference demo is verified on Spark 4.3.0.",
    ],
    nodes: [
      { label: "Operational database or service", layer: "sources", role: "Emits one event per insert, update or delete" },
      { component: "debezium", layer: "ingest", role: "Turns database transaction logs into change events", detail: true },
      { component: "kafka", layer: "ingest", role: "The change feed topic (menu-changes in the demo)", version: "apache/kafka 4.0.0 image" },
      { component: "local-fs", layer: "storage", role: "Iceberg warehouse directory in the demo", swaps: ["s3", "seaweedfs", "minio", "rustfs"] },
      { component: "iceberg", layer: "format", role: "SCD type 2 target with row-level operations", version: "Spark 4.3 runtime built from source" },
      { label: "Iceberg hadoop catalog", layer: "catalog", role: "Declared in the pipeline spec", swaps: ["unity-catalog", "polaris", "lakekeeper"] },
      { component: "sdp", layer: "compute", role: "Runs the pipeline with spark-pipelines run", version: "pyspark==4.3.0" },
      { component: "auto-cdc", layer: "compute", role: "KEYS, SEQUENCE BY, APPLY AS DELETE WHEN, STORED AS SCD TYPE 2" },
      { label: "Analysts and audit queries", layer: "consumers", role: "Read current rows or any past version" },
    ],
    steps: [
      { title: "Changes are published", body: "Each insert, update or delete arrives on a Kafka topic as one JSON event with a key, a sequence number and an operation." },
      { title: "Read the feed", body: "A Python table in the pipeline reads the topic with Structured Streaming and parses each event." },
      { title: "Apply by key, in order", body: "The AUTO CDC flow groups events by key and orders them by the sequence column, so late or out-of-order events land correctly." },
      { title: "Track history", body: "A change to a tracked column (price or station in the demo) closes the current version and opens a new one; a change to another column updates the current version in place; a delete closes the row's window." },
      { title: "Query any point in time", body: "The Iceberg table holds every version with its validity window, so you can read the current state or the state at any past sequence." },
    ],
    repos: [
      {
        ...SPARK_DEMOS,
        description: "Demo 16 (Spark 4.3 guide), scd2/ folder: a ghost-kitchen menu change feed on Kafka applied with AUTO CDC as SCD type 2 into Iceberg.",
        quickstart: [
          "scd2/reset.sh       # Kafka up, an empty menu-changes topic, no table, no checkpoints",
          "scd2/publish.sh scd2/incoming/batch-1.json && scd2/run.sh && scd2/history.sh",
          "scd2/publish.sh scd2/incoming/batch-2.json && scd2/run.sh && scd2/history.sh",
          "scd2/publish.sh scd2/incoming/batch-3.json && scd2/run.sh && scd2/history.sh",
          "docker compose -f scd2/compose.yaml down -v   # when done",
        ],
      },
    ],
    caveats: [
      "Iceberg has not published a Spark 4.3 runtime (Maven Central stops at iceberg-spark-runtime-4.1); the demo builds iceberg-spark-runtime-4.3_2.13 from an Iceberg checkout with Spark 4.3 support.",
      "AUTO CDC needs a target that implements DSv2 row-level operations.",
      "The jars and spark.sql.extensions are static configs, so they are passed to spark-pipelines run, not set in the pipeline spec.",
      "Pipeline storage must be an absolute URI.",
    ],
    learn: [
      { label: "AUTO CDC: turning an event log into current state", href: "/blog/apache-spark/auto-cdc-declarative-pipelines" },
      { label: "Batch medallion pattern", href: "/reference-architectures/batch-medallion" },
      { label: "Spark Declarative Pipelines guide", href: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html" },
    ],
    faqs: [
      { q: "What is SCD type 2?", a: "Slowly changing dimension type 2 keeps every version of a row: when a tracked attribute changes, the current version is closed and a new one is opened, so the table answers both what is true now and what was true at any earlier time." },
      { q: "Can open source Spark do CDC without hand-written MERGE?", a: "Yes. Spark Declarative Pipelines in Spark 4.3 has AUTO CDC flows: you declare the keys, the sequence column, the delete condition and STORED AS SCD TYPE 1 or 2, and Spark applies the change feed." },
      { q: "How does AUTO CDC handle out-of-order events?", a: "It orders events per key by the SEQUENCE BY column, so an event that arrives late is applied in sequence order rather than arrival order." },
    ],
    sources: [
      { label: "spark-demos demo 16 README", href: "https://github.com/lisancao/spark-demos/tree/main/demos/16_spark_43_guide" },
      { label: "menu.sql (the AUTO CDC flow)", href: "https://github.com/lisancao/spark-demos/blob/main/demos/16_spark_43_guide/scd2/transformations/menu.sql" },
    ],
    keywords: ["change data capture Spark", "SCD type 2 Spark", "AUTO CDC Spark Declarative Pipelines", "CDC to Iceberg", "Kafka CDC lakehouse"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "streaming-medallion",
    title: "Streaming medallion",
    stackLine: "Kafka, Spark Structured Streaming and Delta Lake in Unity Catalog",
    tagline: "Events in, governed tables out, minutes or seconds behind the source.",
    category: "Streaming",
    definition:
      "A streaming medallion architecture applies the bronze, silver and gold layout to event streams. Apache Kafka buffers events, an Apache Spark Structured Streaming job appends them to a bronze Delta Lake table with exactly-once checkpointing, and downstream streaming or declarative pipelines keep silver and gold tables up to date. Because the tables are open and registered in Unity Catalog OSS, batch jobs, BI tools and other engines read the same data the stream writes.",
    whenToUse: [
      "Sources emit events continuously and consumers want tables, not topics.",
      "Latency of seconds to minutes is enough.",
      "You want one copy of history that both streaming and batch jobs read.",
    ],
    notFor: [
      "Request-path latency in milliseconds: see the real-time streaming pattern.",
    ],
    nodes: [
      { label: "Applications, devices and CDC", layer: "sources", role: "Emit events" },
      { component: "debezium", layer: "ingest", role: "Turns database changes into Kafka events", detail: true },
      { component: "kafka", layer: "ingest", role: "Durable event buffer", version: "Confluent 7.5.0 images" },
      { component: "seaweedfs", layer: "storage", role: "Tables and streaming checkpoints", version: "3.80", swaps: ["minio", "rustfs", "s3"] },
      { component: "delta", layer: "format", role: "Bronze, silver and gold tables", version: "4.3.1", swaps: ["iceberg", "hudi"] },
      { component: "unity-catalog", layer: "catalog", role: "Registers every layer", version: "0.6.0", swaps: ["polaris", "lakekeeper"] },
      { component: "spark", layer: "compute", role: "Structured Streaming from Kafka to bronze", version: "4.1.0", swaps: ["flink"] },
      { component: "sdp", layer: "compute", role: "Silver and gold derived from bronze", detail: true },
      { component: "airflow", layer: "orchestration", role: "Runs the batch side and maintenance", version: "3.1.6", detail: true },
      { component: "spark-connect", layer: "serving", role: "Remote query access" },
      { component: "dashboard", layer: "consumers", role: "Live views over gold" },
    ],
    steps: [
      { title: "Buffer events", body: "Producers write JSON events to Kafka topics." },
      { title: "Append to bronze", body: "A Structured Streaming query reads Kafka and appends to a bronze Delta table; its checkpoint makes the write exactly-once." },
      { title: "Clean and deduplicate", body: "Silver applies a watermark and dropDuplicates so late and repeated events are handled deterministically." },
      { title: "Aggregate", body: "Gold computes windowed aggregates, such as one-minute counts, and joins static dimension tables." },
      { title: "Read anywhere", body: "Because every layer is a catalog table, batch jobs and other engines read the same data." },
    ],
    repos: [
      OPEN_LAKEHOUSE,
      { ...MASTERCLASS, description: "Chapter 9 builds Kafka to Structured Streaming to bronze on the course stack." },
    ],
    caveats: [
      "Match the Kafka connector to your Spark version exactly; a spark-sql-kafka build for one Spark minor version can fail with NoSuchMethodError on another.",
      "Kafka is not registered in the catalog in the open-lakehouse stack; only the tables are.",
    ],
    learn: [
      { label: "Real-time streaming pattern", href: "/reference-architectures/real-time-streaming" },
      { label: "Getting started with Delta Lake", href: "/learn/getting-started/delta-lake" },
      { label: "Structured Streaming guide", href: "https://spark.apache.org/docs/latest/streaming/index.html" },
    ],
    faqs: [
      { q: "How do I stream Kafka into Delta Lake with open source tools?", a: "Run an Apache Spark Structured Streaming query with the Kafka source and a Delta sink with a checkpoint location; register the table in Unity Catalog OSS so other engines can find it." },
      { q: "Is the Kafka to Delta write exactly-once?", a: "Yes for the table: Structured Streaming records Kafka offsets in its checkpoint and commits each micro-batch to the Delta log atomically, so a restarted query neither skips nor duplicates batches." },
    ],
    sources: [
      { label: "open-lakehouse docs/architecture.md", href: "https://github.com/open-lakehouse/open-lakehouse/blob/main/docs/architecture.md" },
      { label: "Structured Streaming + Kafka integration", href: "https://spark.apache.org/docs/latest/streaming/structured-streaming-kafka-integration.html" },
    ],
    keywords: ["Kafka to Delta Lake", "streaming medallion architecture", "Spark Structured Streaming Kafka Delta", "streaming lakehouse open source"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "real-time-streaming",
    title: "Real-time streaming with Spark Real-Time Mode",
    stackLine: "Kafka in, Kafka out, milliseconds in between",
    tagline: "Continuous processing for fraud, recommendations and live boards, measured end to end.",
    category: "Streaming",
    definition:
      "Real-time streaming is the architecture for decisions that must happen while an event is still in flight: score a payment, update a recommendation, move a leaderboard. In open source Apache Spark, Real-Time Mode is a Structured Streaming trigger that processes records continuously instead of in micro-batches. The reference pipelines read from Kafka, transform or keep state with transformWithState, and write back to Kafka or a key-value store, with latency measured from producer timestamp to consumer.",
    whenToUse: [
      "Your SLA is in tens or hundreds of milliseconds, not seconds.",
      "You are porting Apache Flink jobs and want to know which ones move to Spark.",
      "You already run Spark for batch and want one engine for both.",
    ],
    notFor: [
      "Writing large analytical tables: use the streaming medallion pattern and keep this path thin.",
      "Python UDFs in the hot path: Real-Time Mode does not support them.",
    ],
    nodes: [
      { label: "Payments, clicks, game events", layer: "sources", role: "Producers with event timestamps" },
      { component: "kafka", layer: "ingest", role: "Input topic, 16 partitions in the reference runs", version: "Confluent 7.6.0 image" },
      { component: "spark-rtm", layer: "compute", role: "Continuous processing trigger", version: "Spark 4.1 to 4.3" },
      { component: "spark", layer: "compute", role: "transformWithState for keyed state, on RocksDB", version: "4.3.0" },
      { component: "flink", layer: "compute", role: "The engine being compared or migrated from", detail: true },
      { component: "kafka-sink", layer: "serving", role: "Output and latency topics" },
      { component: "redis", layer: "serving", role: "Latest state for applications", detail: true, swaps: ["valkey"] },
      { component: "delta", layer: "format", role: "Optional history table written by a separate query", detail: true, swaps: ["iceberg"] },
      { label: "Fraud engine, app UI, live board", layer: "consumers", role: "Read results within milliseconds" },
    ],
    steps: [
      { title: "Produce with timestamps", body: "A generator writes keyed events to Kafka with the send time embedded." },
      { title: "Process continuously", body: "A Structured Streaming query with the real-time trigger processes each record as it arrives instead of waiting for a micro-batch." },
      { title: "Keep state", body: "Stateful steps such as deduplication, windows or a custom transformWithState processor keep per-key state in RocksDB." },
      { title: "Emit", body: "Results go to an output Kafka topic or a key-value store." },
      { title: "Measure", body: "A consumer subtracts the embedded send time from arrival time and reports p50, p95 and p99." },
    ],
    repos: [
      {
        name: "lisancao/spark-rtm-quickstart",
        url: "https://github.com/lisancao/spark-rtm-quickstart",
        description: "Five Real-Time Mode pipelines on Spark 4.1 with Kafka and a latency consumer, compared against micro-batch.",
        targets: ["laptop"],
        quickstart: [
          "# Start Kafka + Spark",
          "docker compose up -d",
          "",
          "# Create Kafka topics",
          "docker exec kafka kafka-topics --bootstrap-server localhost:9092 \\",
          "    --create --topic rtm-input --partitions 16 --if-not-exists",
          "docker exec kafka kafka-topics --bootstrap-server localhost:9092 \\",
          "    --create --topic rtm-output --partitions 16 --if-not-exists",
          "docker exec kafka kafka-topics --bootstrap-server localhost:9092 \\",
          "    --create --topic rtm-latency --partitions 16 --if-not-exists",
          "",
          "# Start the data generator (in a separate terminal)",
          "python data_generator/producer.py --rate 1000 --keys 100",
          "",
          "# Run a pipeline",
          "docker exec spark spark-submit /opt/spark-data/pipelines/01_stateless_passthrough.py",
        ],
      },
      { ...SPARK_DEMOS, description: "Demo 14 (bookshop recommender, Spark 4.3.0) and demo 10 (chained transformWithState lobby board) compare micro-batch with Real-Time Mode and commit the numbers in NOTES.md." },
      {
        name: "lisancao/flink-to-spark-rtm",
        url: "https://github.com/lisancao/flink-to-spark-rtm",
        description: "Four streaming patterns (stateless, tumbling window, sliding window, keyed state) written for both Flink 1.20 and Spark 4.1 Real-Time Mode, with migration notes.",
        targets: ["laptop"],
      },
    ],
    caveats: [
      "Open source Spark 4.1 Real-Time Mode is stateless only; stateful queries need a later release (the stateful demos run on Spark 4.3).",
      "Python UDFs are not supported in Real-Time Mode.",
      "PySpark 4.1 has no trigger(realTime=...) argument; the quickstart uses a Py4J helper.",
      "transformWithState requires the RocksDB state store provider.",
      "Size task slots to source partitions plus shuffles times shuffle partitions, or the query stalls.",
    ],
    learn: [
      { label: "Spark 4.3 Real-Time Mode demo (demo 14)", href: "https://github.com/lisancao/spark-demos/tree/main/demos/14_real_time_mode" },
      { label: "Stateful streaming demo (demo 10)", href: "https://github.com/lisancao/spark-demos/tree/main/demos/10_stateful_streaming" },
      { label: "Apache Flink on this site", href: "/technologies/compute-engines" },
    ],
    faqs: [
      { q: "How fast is Spark Real-Time Mode?", a: "In the spark-rtm-quickstart run committed in results/latency-results.md (stateless, 500 events per second, 16 cores), end-to-end p50 was 17 ms and p99 was 21 to 26 ms across six runs. In spark-demos demo 14 on Spark 4.3.0, a stateless enrichment step measured p50 0 ms and p99 1 ms in real-time mode against 115 ms and 204 ms in micro-batch." },
      { q: "Can Spark replace Flink for low-latency streaming?", a: "For many stateless and windowed jobs, yes; flink-to-spark-rtm writes the same four patterns for both engines. Keyed state with timers is where migrations need the most care, since Spark expresses it through transformWithState." },
      { q: "Does Real-Time Mode support stateful queries?", a: "Not in open source Spark 4.1. The stateful reference demos (transformWithState, dedup and windows) run on Spark 4.3." },
    ],
    sources: [
      { label: "spark-rtm-quickstart results/latency-results.md", href: "https://github.com/lisancao/spark-rtm-quickstart/blob/main/results/latency-results.md" },
      { label: "spark-demos demo 14 NOTES.md", href: "https://github.com/lisancao/spark-demos/blob/main/demos/14_real_time_mode/NOTES.md" },
      { label: "spark-demos demo 10 NOTES.md", href: "https://github.com/lisancao/spark-demos/blob/main/demos/10_stateful_streaming/NOTES.md" },
    ],
    keywords: ["Spark Real-Time Mode", "Spark real time streaming latency", "Flink to Spark migration", "transformWithState example", "low latency streaming open source"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "multi-engine-catalog",
    title: "One catalog, many engines",
    stackLine: "Unity Catalog OSS with Spark, DuckDB, PyIceberg and Trino on Delta and Iceberg",
    tagline: "Write once, read from whatever engine fits the question.",
    category: "Platform",
    definition:
      "A multi-engine catalog architecture puts an open catalog between the tables and every engine that uses them. Unity Catalog OSS stores table metadata in Postgres, exposes Delta tables through its own API and Iceberg tables through the Iceberg REST catalog specification, and vends short-lived storage credentials per table. Apache Spark, DuckDB, PyIceberg and Trino then read and write the same data without copies, and access is decided once, in the catalog.",
    whenToUse: [
      "Different teams prefer different engines for the same data.",
      "You want to stop copying data into a warehouse per tool.",
      "You want storage credentials vended per table instead of shared keys.",
    ],
    notFor: [
      "Expecting identical feature support in every engine: write support differs by engine, format and catalog version.",
    ],
    nodes: [
      { label: "Pipelines and notebooks", layer: "sources", role: "Create and update tables" },
      { component: "rustfs", layer: "storage", role: "S3-compatible storage with STS credentials", version: "1.0.0", swaps: ["seaweedfs", "minio", "s3"] },
      { component: "delta", layer: "format", role: "Catalog-managed Delta tables", swaps: ["iceberg"] },
      { component: "iceberg", layer: "format", role: "Native Iceberg tables through Iceberg REST" },
      { component: "unity-catalog", layer: "catalog", role: "Delta API, Iceberg REST catalog and credential vending", version: "0.7.0", swaps: ["unitycatalog-rs", "polaris", "lakekeeper"] },
      { component: "postgres", layer: "catalog", role: "Catalog metadata", version: "16.3", detail: true },
      { component: "spark", layer: "compute", role: "Delta notebooks on Spark 4.2.0; Iceberg notebooks on Spark 4.1.3", version: "4.2.0 / 4.1.3" },
      { component: "pyiceberg", layer: "compute", role: "JVM-free Iceberg reads and writes" },
      { component: "duckdb", layer: "compute", role: "Attaches the Iceberg REST endpoint for SQL reads", swaps: ["trino", "datafusion", "polars"] },
      { component: "trino", layer: "compute", role: "Distributed SQL over the same catalog", detail: true },
      { component: "marimo", layer: "consumers", role: "Reactive notebooks on :2718 and :2719", swaps: ["jupyter"] },
    ],
    steps: [
      { title: "Create through the catalog", body: "A Spark session configured with the Unity Catalog connector creates a managed Delta table, or an Iceberg table through the Iceberg REST endpoint." },
      { title: "Catalog records metadata", body: "Unity Catalog stores the table, its location and its format in Postgres." },
      { title: "Credentials are vended", body: "When an engine loads a table, the catalog returns short-lived storage credentials scoped to that table's path." },
      { title: "Another engine reads", body: "DuckDB or PyIceberg connects to the same Iceberg REST endpoint and reads the table directly from object storage." },
    ],
    repos: [
      UC_PLAYGROUND,
      { ...UC_RS, description: "A Rust implementation of the same catalog APIs, useful when you want a single binary or Helm chart." },
      { ...MASTERCLASS, description: "Chapter 11 has DuckDB read the Spark-written Iceberg tables through Unity Catalog 0.7's Iceberg REST endpoint." },
    ],
    caveats: [
      "iceberg-spark-runtime exists only for Spark 4.0 and 4.1 at the time of writing, which is why the playground's Iceberg notebook runs Spark 4.1.3.",
      "The RustFS STS credential in the playground expires after 12 hours; refresh it with just uc=local rotate-creds.",
      "The playground needs at least 4 GB of Docker memory and is not for production.",
    ],
    learn: [
      { label: "Catalogs on this site", href: "/technologies/catalogs" },
      { label: "Delta catalog-managed tables", href: "/blog/delta-lake/delta-catalog-managed-tables" },
      { label: "DuckDB Delta grows up", href: "/blog/delta-lake/duckdb-delta-grows-up" },
    ],
    faqs: [
      { q: "What is an Iceberg REST catalog?", a: "An HTTP API defined by the Apache Iceberg project for creating, loading and committing Iceberg tables. Any engine that speaks it can use any catalog that implements it, including Unity Catalog OSS, Apache Polaris and Lakekeeper." },
      { q: "Can Spark and DuckDB share the same tables?", a: "Yes. Point both at the same catalog: Spark through the Unity Catalog connector or Iceberg REST, DuckDB through its Iceberg extension attached to the Iceberg REST endpoint." },
      { q: "What is credential vending?", a: "The catalog hands an engine short-lived storage credentials scoped to one table's location when the engine loads it, so engines never hold long-lived bucket keys." },
    ],
    sources: [
      { label: "unitycatalog-playground README", href: "https://github.com/open-lakehouse/unitycatalog-playground#readme" },
      { label: "Iceberg REST catalog spec", href: "https://iceberg.apache.org/rest-catalog-spec/" },
      { label: "Unity Catalog OSS", href: "https://github.com/unitycatalog/unitycatalog" },
    ],
    keywords: ["Iceberg REST catalog", "Unity Catalog OSS Iceberg", "multi-engine lakehouse", "DuckDB Unity Catalog", "credential vending"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "governed-ai-agents",
    title: "Governed AI agents for data engineering",
    stackLine: "Spark Declarative Pipelines, Spark Connect, Kubernetes and a governed Iceberg REST catalog",
    tagline: "Agents write pipeline specs; the platform decides what they are allowed to touch.",
    category: "Platform",
    definition:
      "Governed AI data engineering is an architecture in which AI agents author data pipelines but never hold direct power over data. The agent writes declarative Spark Declarative Pipelines specs as a pull request; CI dry-runs them against the real catalog; a controller applies approved changes. Each tenant reaches Spark only through one identity-pinned Spark Connect ingress behind mTLS, executors run as Kubernetes pods, and a governed Iceberg REST catalog authorizes every request and vends storage credentials scoped to that tenant. Each layer owns one job, so a mistake in one does not become a breach in another.",
    whenToUse: [
      "You want AI agents to build or change pipelines without giving them production credentials.",
      "You need per-tenant isolation on shared Spark infrastructure.",
      "You want defects caught before any data is processed.",
    ],
    notFor: [
      "A single-user sandbox: the masterclass's local agent chapter is the lighter starting point.",
    ],
    nodes: [
      { label: "AI coding agent", layer: "sources", role: "Writes inert pipeline specs as a pull request" },
      { component: "gitops", layer: "orchestration", role: "PR-only output, dry run against the real catalog, reconcile" },
      { component: "sdp", layer: "compute", role: "Declarative authoring: specs, not imperative jobs", version: "Spark 4.1.2" },
      { component: "envoy", layer: "governance", role: "mTLS on :15009; routes each client certificate to its tenant", version: "1.31.5" },
      { component: "spark-connect", layer: "serving", role: "The single identity-pinned ingress per tenant", version: "4.1.2" },
      { component: "kubernetes", layer: "orchestration", role: "Client-mode driver plus executor pods on EKS", version: "EKS 1.31" },
      { component: "spark", layer: "compute", role: "Executors do the work", version: "4.1.2" },
      { component: "iceberg", layer: "format", role: "Tables under per-tenant prefixes", version: "1.11.0", swaps: ["delta"] },
      { component: "lakekeeper", layer: "catalog", role: "Governed Iceberg REST catalog with per-principal authorization and credential vending", version: "0.13.1", swaps: ["unity-catalog", "polaris"] },
      { component: "openfga", layer: "governance", role: "Authorization model behind the catalog", version: "1.14.0" },
      { component: "s3", layer: "storage", role: "Data under per-tenant prefixes with STS-scoped credentials", swaps: ["minio"] },
      { component: "omnigent", layer: "ml", role: "Agent harness with tools and policies", detail: true },
      { component: "ollama", layer: "ml", role: "Local model for the course's agent chapter", detail: true },
      { label: "Reviewers and downstream jobs", layer: "consumers", role: "Approve PRs, read the governed tables" },
    ],
    steps: [
      { title: "Agent proposes", body: "The agent writes Spark Declarative Pipelines specs and opens a pull request; it has no direct write path." },
      { title: "CI dry-runs", body: "CI runs the pipeline in dry-run mode against the real catalog, catching structural defects before any data is processed." },
      { title: "Identity-pinned ingress", body: "The tenant's client certificate reaches Envoy, which routes by its SPIFFE URI SAN to that tenant's Spark Connect server." },
      { title: "Executors run", body: "Kubernetes schedules executor pods that do the work." },
      { title: "Catalog authorizes", body: "Lakekeeper with OpenFGA authorizes each table operation and vends STS credentials scoped to the tenant's prefix." },
    ],
    repos: [
      {
        name: "open-lakehouse/safe-spark-agents-paper",
        url: "https://github.com/open-lakehouse/safe-spark-agents-paper",
        description: "Working paper, reproducible study and open reference architecture for safe, governed AI data engineering on Apache Spark.",
        targets: ["kubernetes", "aws", "laptop"],
        quickstart: [
          "cd study",
          "python3 analysis/analyze.py results/results.powered.AB.n12.final.jsonl --tasks config/TASKS.lock.json --assume-backend local",
        ],
      },
      { ...MASTERCLASS, description: "Chapter 3 runs an agent on Omnigent with a local Ollama model, MCP tools and ALLOW, DENY and ASK policies; chapter 13 has a coding agent operate the stack through AGENTS.md." },
      {
        name: "open-lakehouse/lakehouse-agent-kit",
        url: "https://github.com/open-lakehouse/lakehouse-agent-kit",
        description: "Early-stage agent skills for the open lakehouse, driven by a connection profile instead of hardcoded hosts (lakehouse-core ships today).",
        targets: ["cloud-agnostic"],
      },
    ],
    caveats: [
      "The isolation proof runs on one Spark Connect server per tenant; a shared-server design is described as frontier work in the paper.",
      "The five isolation links are proven one at a time, not as one composed request.",
      "Unity Catalog OSS 0.5.0, evaluated as an alternate catalog, could not do per-principal authorization on its Iceberg REST path.",
    ],
    learn: [
      { label: "Agentic data engineering (guide)", href: "/agentic-data-engineering" },
      { label: "The agentic lakehouse (guide)", href: "/agentic-lakehouse" },
      { label: "Getting started with Omnigent", href: "/learn/getting-started/omnigent" },
      { label: "MLflow for agents", href: "/learn/getting-started/mlflow" },
      { label: "Safe Spark agents paper", href: "https://github.com/open-lakehouse/safe-spark-agents-paper" },
    ],
    faqs: [
      { q: "How do you let AI agents build data pipelines safely?", a: "Give them a declarative output and no direct path to data: the agent writes Spark Declarative Pipelines specs as a pull request, CI dry-runs them against the real catalog, and execution happens through an identity-pinned Spark Connect ingress with a catalog that authorizes every table operation." },
      { q: "Do declarative pipelines catch more agent mistakes?", a: "In the safe-spark-agents study (528 runs: 22 tasks, 12 seeds, 2 arms), the Spark Declarative Pipelines dry run caught 79 structural defects before any data was processed, against 0 for the imperative arm. SDP output was 49% fewer lines at about 2.3 times the tokens." },
    ],
    sources: [
      { label: "safe-spark-agents-paper", href: "https://github.com/open-lakehouse/safe-spark-agents-paper" },
      { label: "Paper site", href: "https://open-lakehouse.github.io/safe-spark-agents-paper/" },
    ],
    keywords: ["AI agents data engineering", "governed AI agents Spark", "agentic data engineering", "Spark Connect multi-tenant", "Lakekeeper OpenFGA"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "policy-and-lineage",
    title: "Policy pushdown and open lineage",
    stackLine: "Cedar policies compiled to CEL, enforced in Spark and DataFusion, with OpenLineage",
    tagline: "Write access rules once, enforce them inside every engine, and record where every column came from.",
    category: "More patterns",
    definition:
      "Policy pushdown and open lineage is a governance architecture for multi-engine lakehouses. Access rules are authored once in the Cedar policy language, compiled to portable CEL expressions, and enforced inside each query engine's plan as row filters and column masks, so no engine depends on SQL views or per-engine rewrites. Alongside, every job emits OpenLineage events, which are stored as lakehouse tables and served through a lineage API, so auditors can trace a published number back to its sources.",
    whenToUse: [
      "Several engines read the same sensitive tables.",
      "You need row filters and column masks that cannot be bypassed by choosing a different engine.",
      "Regulators or auditors ask where a value came from.",
    ],
    notFor: [
      "Production lineage storage today without evaluation: headwaters describes itself as experimental and recommends Marquez for production.",
    ],
    nodes: [
      { label: "Policy authors", layer: "sources", role: "Write Cedar policies and tag templates" },
      { component: "cedar", layer: "governance", role: "Policy language; deny always wins", version: "cedar-policy 4" },
      { component: "policast", layer: "governance", role: "Compiles Cedar to CEL and injects enforcement into the physical plan" },
      { component: "breakwater", layer: "governance", role: "Row filters and column masks inside the DataFusion planner", detail: true },
      { component: "unity-catalog", layer: "catalog", role: "Policy decision point resolving tags", version: "0.4.1 in the demo", swaps: ["unitycatalog-rs", "lakekeeper"] },
      { component: "rustfs", layer: "storage", role: "Demo object store", swaps: ["minio", "s3"] },
      { component: "delta", layer: "format", role: "Governed tables and the lineage table", swaps: ["iceberg"] },
      { component: "spark", layer: "compute", role: "Enforcement as Catalyst rules", version: "4.2 plugin" },
      { component: "datafusion", layer: "compute", role: "Enforcement as plan rewrites", version: "53.1" },
      { component: "openlineage", layer: "governance", role: "Lineage events from every job, column level from Spark" },
      { component: "open-lineage-connect", layer: "governance", role: "Ingests events and writes them to Delta and Iceberg tables" },
      { component: "headwaters", layer: "governance", role: "Lineage read API and UI", detail: true, swaps: ["marquez"] },
      { label: "Analysts, auditors", layer: "consumers", role: "See only permitted rows and columns; trace lineage" },
    ],
    steps: [
      { title: "Author once", body: "A policy author writes Cedar policies, including tag-based templates that apply to every column tagged, for example, as PHI." },
      { title: "Compile", body: "policast compiles the policies to CEL expressions that any engine can evaluate." },
      { title: "Enforce in the plan", body: "Spark applies them as Catalyst rules and DataFusion as plan rewrites, so filters and masks run inside the query, not in a view." },
      { title: "Emit lineage", body: "A Spark 4 plugin emits OpenLineage events with column-level lineage for each job." },
      { title: "Store lineage as tables", body: "An ingest service writes the events to Delta or Iceberg tables, which a lineage API and UI read." },
    ],
    repos: [
      {
        name: "open-lakehouse/policast",
        url: "https://github.com/open-lakehouse/policast",
        description: "Author governance once in Cedar, compile it to portable CEL, and push enforcement into Spark and DataFusion physical plans.",
        license: "Apache-2.0",
        targets: ["laptop"],
        quickstart: [
          "cp docker/.env.example .env",
          "docker compose up -d sidecar",
          "docker compose --profile demo run --rm datafusion-demo",
          "",
          "# Same policies enforced on Spark (Catalyst rules, no sidecar):",
          "docker compose --profile spark run --rm spark-demo   # or: just spark-demo",
        ],
      },
      {
        name: "open-lakehouse/open-lineage-connect",
        url: "https://github.com/open-lakehouse/open-lineage-connect",
        description: "OpenLineage end to end: a Go ingest service, a Rust service that writes events to Delta and Iceberg tables, and a Spark 4 plugin for column-level lineage.",
        license: "Apache-2.0",
        targets: ["laptop"],
        quickstart: [
          "make docker-compose-up        # builds both images, starts both services + MinIO",
          "curl -sf http://localhost:8090/health",
          "curl -sf http://localhost:8091/health",
          "make docker-compose-down      # tears it down and removes the Delta volume",
        ],
      },
      {
        name: "open-lakehouse/breakwater",
        url: "https://github.com/open-lakehouse/breakwater",
        description: "Cedar fine-grained access control for DataFusion, with OCI-distributed policy bundles and a policy decision point service.",
        license: "Apache-2.0",
        targets: ["cloud-agnostic"],
      },
      {
        name: "open-lakehouse/headwaters",
        url: "https://github.com/open-lakehouse/headwaters",
        description: "Experimental Rust OpenLineage service with a Marquez-inspired read API and UI.",
        license: "Apache-2.0",
        targets: ["laptop"],
      },
    ],
    caveats: [
      "In policast, deny always wins and grants never bypass column masks.",
      "headwaters is experimental and not a drop-in Marquez replacement.",
      "The policast demo pins Unity Catalog 0.4.1 as its policy decision point.",
    ],
    learn: [
      { label: "Open governance on this site", href: "/technologies/open-governance" },
      { label: "Tracing OpenClaw", href: "/blog/agentic/openclaw-tracing" },
    ],
    faqs: [
      { q: "How do you enforce the same access policy in Spark and other engines?", a: "Compile one policy source into an engine-neutral form and inject it into each engine's query plan. policast compiles Cedar policies to CEL and enforces them as Catalyst rules in Spark and as plan rewrites in DataFusion." },
      { q: "What is OpenLineage?", a: "An open standard, hosted by the LF AI & Data Foundation, for lineage events that describe jobs, runs and the datasets they read and write. Spark, Airflow, Flink and dbt have integrations." },
      { q: "Can lineage be stored in the lakehouse itself?", a: "Yes. open-lineage-connect writes OpenLineage events to Delta tables, Iceberg tables through a REST catalog, or both." },
    ],
    sources: [
      { label: "policast README", href: "https://github.com/open-lakehouse/policast#readme" },
      { label: "open-lineage-connect README", href: "https://github.com/open-lakehouse/open-lineage-connect#readme" },
      { label: "OpenLineage", href: "https://openlineage.io" },
    ],
    keywords: ["Cedar policy Spark", "row level security open source lakehouse", "column masking Spark", "OpenLineage Spark column lineage", "data governance open source"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "open-data-sharing",
    title: "Open data sharing",
    stackLine: "Delta Sharing servers over Unity Catalog and open tables",
    tagline: "Share live tables with another organization without copying them or sending files.",
    category: "Platform",
    definition:
      "Open data sharing is an architecture for giving another organization read access to live lakehouse tables through an open protocol instead of file exports. A Delta Sharing server authenticates the recipient, checks which shares and tables they may read, and returns short-lived URLs or credentials for the underlying files; the recipient reads them with any Delta Sharing client, including pandas, Spark and other engines. Data stays in the provider's storage and the recipient always sees the current version.",
    whenToUse: [
      "Partners, customers or regulators need recurring access to the same tables.",
      "You want to stop running file-drop jobs.",
      "Recipients use different tools than you do.",
    ],
    notFor: [
      "Write access for recipients: the protocol is read-only.",
    ],
    nodes: [
      { label: "Provider pipelines", layer: "sources", role: "Maintain the tables to share" },
      { component: "s3", layer: "storage", role: "Provider's bucket; data never moves", swaps: ["gcs-adls", "minio", "seaweedfs"] },
      { component: "delta", layer: "format", role: "Shared tables", swaps: ["iceberg"] },
      { component: "unity-catalog", layer: "catalog", role: "Source of shares and table locations", swaps: ["unitycatalog-rs"] },
      { component: "delta-sharing", layer: "serving", role: "Open REST protocol for recipients", version: "server 1.3.10 in open-lakehouse" },
      { component: "distributary", layer: "serving", role: "Composable Rust sharing server with Postgres or SQLite stores", detail: true },
      { component: "spark", layer: "compute", role: "Provider-side writes" },
      { label: "Recipients: pandas, Spark, BI tools", layer: "consumers", role: "Read with a bearer token profile" },
    ],
    steps: [
      { title: "Define a share", body: "The provider groups tables into a share and grants it to a recipient." },
      { title: "Issue a profile", body: "The recipient receives a profile file with the server endpoint and a bearer token." },
      { title: "Recipient queries", body: "The client lists shares and tables and asks to read one, optionally with predicate hints." },
      { title: "Server returns file URLs", body: "The server checks the grant and returns short-lived URLs for the current table files." },
      { title: "Read directly", body: "The client reads Parquet files from the provider's storage; nothing is copied into the recipient's platform." },
    ],
    repos: [
      {
        name: "open-lakehouse/distributary",
        url: "https://github.com/open-lakehouse/distributary",
        description: "OpenSharing and Delta Sharing in Rust: protocol models, client, admin API and a composable sharing server.",
        license: "Apache-2.0",
        targets: ["cloud-agnostic"],
        quickstart: ["cargo check --workspace --all-features", "cargo nextest run --workspace --all-features"],
      },
      { ...UC_RS, description: "A catalog that serves a Delta Sharing server alongside the Unity Catalog, Delta and Iceberg REST APIs." },
      { ...OPEN_LAKEHOUSE, description: "Ships an opt-in Delta Sharing server (1.3.10) on :8443 next to the rest of the stack." },
    ],
    caveats: [
      "distributary's README gives developer commands only; its architecture document plans presigned-URL queries, change data feed and recipient tokens.",
    ],
    learn: [
      { label: "Delta Lake on this site", href: "/technologies/delta-lake" },
      { label: "Delta Sharing protocol", href: "https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md" },
    ],
    faqs: [
      { q: "What is Delta Sharing?", a: "An open REST protocol, governed with Delta Lake under the Linux Foundation, for sharing live tables across organizations. Recipients read the provider's files through short-lived URLs with any compatible client." },
      { q: "Do recipients need the same platform as the provider?", a: "No. Clients exist for pandas, Apache Spark and other tools, and the open-lakehouse repos include Rust implementations of the server and client." },
    ],
    sources: [
      { label: "Delta Sharing protocol", href: "https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md" },
      { label: "distributary", href: "https://github.com/open-lakehouse/distributary" },
    ],
    keywords: ["Delta Sharing open source", "data sharing lakehouse", "share tables without copying", "Delta Sharing server Rust"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "semantic-layer",
    title: "Semantic layer with Spark metric views",
    stackLine: "Metrics declared in YAML, served over Spark Connect to BI, notebooks and agents",
    tagline: "Define revenue once. Every dashboard, notebook and agent gets the same number.",
    category: "More patterns",
    definition:
      "A semantic layer is the set of governed metric and dimension definitions that sit between tables and the tools that query them. In open source Apache Spark, a metric view declares measures and dimensions in YAML over a source table; consumers query it with the MEASURE() function and Spark expands the definition at query time. Served over Spark Connect or JDBC, the same definitions answer dashboards, notebooks and AI agents, so a metric cannot drift between tools.",
    whenToUse: [
      "Different teams report different numbers for the same metric.",
      "You want AI agents to answer questions from governed definitions instead of writing raw SQL.",
    ],
    notFor: [
      "Spark versions before metric views shipped; the reference demo is verified on Spark 4.2.0.",
    ],
    nodes: [
      { label: "Gold tables", layer: "sources", role: "Facts and dimensions to measure" },
      { component: "delta", layer: "format", role: "Source tables", swaps: ["iceberg"] },
      { component: "hive-metastore", layer: "catalog", role: "Registers the metric view in the demo", swaps: ["unity-catalog"] },
      { component: "spark", layer: "compute", role: "Expands MEASURE() at query time", version: "4.2.0" },
      { component: "metric-views", layer: "serving", role: "YAML measures and dimensions" },
      { component: "spark-connect", layer: "serving", role: "Remote access for clients and agents" },
      { component: "superset", layer: "consumers", role: "Dashboards over the metric view", detail: true, swaps: ["grafana"] },
      { label: "Notebooks and AI agents", layer: "consumers", role: "Ask questions through the same definitions" },
    ],
    steps: [
      { title: "Declare metrics", body: "Write measures and dimensions in YAML over a source table." },
      { title: "Register", body: "Create the metric view in the catalog." },
      { title: "Query with MEASURE()", body: "Clients select dimensions and MEASURE(metric); Spark expands the definition and aggregates at the requested grain." },
      { title: "Serve everyone", body: "Dashboards connect over JDBC or Spark Connect, and agents use the same views as tools." },
    ],
    repos: [{ ...SPARK_DEMOS, description: "Demo 01_metrics_views: eight metric view examples, a doctor script and a grammar probe, verified on Spark 4.2.0." }],
    caveats: [
      "The reference demo is verified on Spark 4.2.0 and awaits official Spark 4.3 images for re-verification.",
    ],
    learn: [
      { label: "Metric views demo", href: "https://github.com/lisancao/spark-demos/tree/main/demos/01_metrics_views" },
      { label: "Spark Connect clients guide", href: "/blog/apache-spark/idiots-guide-spark-connect-clients" },
    ],
    faqs: [
      { q: "Does open source Spark have a semantic layer?", a: "Yes. Spark metric views declare measures and dimensions in YAML over a table, and queries use the MEASURE() function to evaluate them." },
      { q: "Why give AI agents a semantic layer?", a: "Because an agent querying metric views uses the governed definition of each metric instead of inventing its own SQL, so its answers match the dashboards." },
    ],
    sources: [{ label: "spark-demos 01_metrics_views", href: "https://github.com/lisancao/spark-demos/tree/main/demos/01_metrics_views" }],
    keywords: ["Spark metric views", "open source semantic layer", "MEASURE function Spark", "semantic layer for AI agents"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "ml-lifecycle",
    title: "ML and GenAI lifecycle on the lakehouse",
    stackLine: "MLflow tracking, registry and AI Gateway over open tables",
    tagline: "Every model run points at the exact table version it was trained on.",
    category: "More patterns",
    definition:
      "The ML lifecycle on an open lakehouse ties experiments, models and GenAI traces to versioned tables. Features are built by Spark from silver and gold tables in an open format; each MLflow run records parameters, metrics, artifacts and the table snapshot or version it trained on; the MLflow model registry promotes versions; and the MLflow AI Gateway fronts model providers for GenAI applications. Because tables support time travel, any run can be reproduced against the exact data it saw.",
    whenToUse: [
      "You need to reproduce a model from months ago.",
      "You train on lakehouse tables and want lineage from data to model.",
      "You run GenAI applications and want tracing and evaluation in the same place.",
    ],
    notFor: [
      "Low-latency online feature serving by itself: pair it with the real-time streaming pattern and a key-value store.",
    ],
    nodes: [
      { label: "Gold feature tables", layer: "sources", role: "Training data" },
      { component: "iceberg", layer: "format", role: "Snapshot ids give reproducible training sets", swaps: ["delta"] },
      { component: "unity-catalog", layer: "catalog", role: "Tables, and in the course, the catalog the run reads through", swaps: ["polaris", "lakekeeper"] },
      { component: "spark", layer: "compute", role: "Feature engineering and batch scoring", swaps: ["duckdb", "polars"] },
      { component: "mlflow", layer: "ml", role: "Tracking, registry, tracing, evaluation and AI Gateway", version: "3.14.0 in open-lakehouse; 3.1.0 in the course" },
      { component: "airflow", layer: "orchestration", role: "Retraining schedules", detail: true },
      { component: "jupyter", layer: "consumers", role: "Experiments", swaps: ["marimo"] },
      { label: "Applications", layer: "consumers", role: "Call registered models and gateway routes" },
    ],
    steps: [
      { title: "Build features", body: "Spark reads gold tables and writes a feature table." },
      { title: "Record the data version", body: "The training run logs the table's snapshot id or version to MLflow alongside parameters and metrics." },
      { title: "Register", body: "A good run's model is registered and promoted in the MLflow model registry." },
      { title: "Serve and trace", body: "Applications call models and providers through the MLflow AI Gateway; traces land back in MLflow for evaluation." },
    ],
    repos: [
      { ...OPEN_LAKEHOUSE, description: "Runs MLflow 3.14.0 tracking (:5000) and AI Gateway (:5001) next to Spark, Delta and Unity Catalog." },
      { ...MASTERCLASS, description: "Chapter 12 trains a model on gold and logs the gold Iceberg snapshot id to MLflow." },
    ],
    caveats: [
      "MLflow 3.x matches --allowed-hosts exactly; the open-lakehouse stack sets localhost:5000 explicitly.",
    ],
    learn: [
      { label: "Getting started with MLflow", href: "/learn/getting-started/mlflow" },
      { label: "Agentic posts", href: "/blog/category/agentic" },
    ],
    faqs: [
      { q: "How do I make an ML model reproducible on a lakehouse?", a: "Log the table snapshot id (Iceberg) or version (Delta Lake) used for training to the MLflow run; time travel then lets you read exactly that data again." },
      { q: "Is MLflow open source?", a: "Yes. MLflow is Apache-2.0 licensed and hosted by the Linux Foundation." },
    ],
    sources: [{ label: "MLflow docs", href: "https://mlflow.org/docs/latest/" }],
    keywords: ["MLflow lakehouse", "reproducible machine learning time travel", "MLflow AI Gateway", "open source MLOps stack"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "arrow-native-serving",
    title: "Arrow-native serving",
    stackLine: "Arrow Flight SQL and Spark Connect clients over lakehouse tables",
    tagline: "Results leave as Arrow columns, not rows, in whatever language the client speaks.",
    category: "More patterns",
    definition:
      "Arrow-native serving delivers lakehouse query results as Apache Arrow record batches over gRPC instead of row-by-row JDBC. Two open protocols do this: Arrow Flight SQL, a generic SQL-over-Flight protocol, and Spark Connect, Spark's client-server protocol. A Flight SQL server built on Apache DataFusion can answer queries over Delta tables with policy enforcement and lineage built in, while Spark Connect lets thin clients in Python, Go, Rust, Swift and other languages send plans to a remote Spark and hand the Arrow results straight to DuckDB or Polars.",
    whenToUse: [
      "Clients pull large result sets into Python, Rust or other analytical tools.",
      "You want to query the lakehouse from a language without a JVM.",
      "You want policy and lineage enforced at the serving edge.",
    ],
    notFor: [
      "Clients that only speak ODBC or JDBC: put a Flight SQL JDBC driver or a SQL gateway in front.",
    ],
    nodes: [
      { component: "delta", layer: "format", role: "Tables served", swaps: ["iceberg"] },
      { component: "unity-catalog", layer: "catalog", role: "Resolves tables and vends credentials", swaps: ["unitycatalog-rs"] },
      { component: "datafusion", layer: "compute", role: "Query engine inside the Flight SQL server", version: "55" },
      { component: "spark", layer: "compute", role: "Remote engine behind Spark Connect", version: "4.2.0 in the demos" },
      { component: "hydrofoil", layer: "serving", role: "Flight SQL server with Cedar policy and OpenLineage" },
      { component: "flight-sql", layer: "serving", role: "Protocol", detail: true },
      { component: "spark-connect", layer: "serving", role: "gRPC protocol for Spark clients" },
      { component: "breakwater", layer: "governance", role: "Cedar enforcement in the DataFusion planner", detail: true },
      { component: "openlineage", layer: "governance", role: "Lineage emitted per query", detail: true },
      { component: "spark-connect-clients", layer: "consumers", role: "Python, Scala, Go, Rust, OCaml, Swift clients" },
      { component: "duckdb", layer: "consumers", role: "Joins Arrow results locally", swaps: ["polars"] },
    ],
    steps: [
      { title: "Client sends a query or plan", body: "A Flight SQL client sends SQL, or a Spark Connect client sends an unresolved logical plan over gRPC." },
      { title: "Server resolves tables", body: "The server resolves table names through the catalog and obtains storage access." },
      { title: "Policy applies", body: "In hydrofoil, Cedar policies are enforced inside the DataFusion plan before execution." },
      { title: "Arrow streams back", body: "Results stream to the client as Arrow record batches." },
      { title: "Zero-copy downstream", body: "The client hands the same Arrow batches to DuckDB or Polars without conversion." },
    ],
    repos: [
      {
        name: "open-lakehouse/hydrofoil",
        url: "https://github.com/open-lakehouse/hydrofoil",
        description: "A Flight SQL server over open-table-format tables, built on DataFusion 55 with Cedar policy enforcement, OpenLineage and OpenTelemetry tracing.",
        license: "Apache-2.0",
        targets: ["cloud-agnostic"],
      },
      { ...SPARK_DEMOS, description: "Demos 02 (Spark Connect setup), 08 (OCaml client) and 09 (Rust client with DuckDB 2.0 and Polars on the same Arrow batches)." },
    ],
    caveats: [
      "hydrofoil's README does not yet document running the Flight SQL server; its architecture is recorded in docs/adr.",
    ],
    learn: [
      { label: "An idiot's guide to Spark Connect clients", href: "/blog/apache-spark/idiots-guide-spark-connect-clients" },
      { label: "Arrow and Spark", href: "/blog/apache-spark/arrow-and-spark" },
    ],
    faqs: [
      { q: "What is the difference between Arrow Flight SQL and Spark Connect?", a: "Both stream Apache Arrow over gRPC. Flight SQL is a generic SQL protocol any engine can implement; Spark Connect carries Spark's own logical plans, so clients get the full DataFrame API of a remote Spark." },
      { q: "Can I use Spark from Rust or Go?", a: "Yes, through Spark Connect clients. spark-demos demo 09 uses the Rust client and passes the Arrow results to DuckDB and Polars." },
    ],
    sources: [
      { label: "Arrow Flight SQL", href: "https://arrow.apache.org/docs/format/FlightSql.html" },
      { label: "Spark Connect overview", href: "https://spark.apache.org/docs/latest/spark-connect-overview.html" },
    ],
    keywords: ["Arrow Flight SQL lakehouse", "Spark Connect Rust", "Spark Connect Go", "DataFusion Flight SQL server"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "cloud-deployment-aws",
    title: "Self-hosted catalog on AWS",
    stackLine: "Unity Catalog OSS on ECS Fargate with Neon Postgres and S3, in Terraform",
    tagline: "The open catalog in your own AWS account, with no static storage keys.",
    category: "More patterns",
    definition:
      "A self-hosted open catalog on AWS runs Unity Catalog OSS as a container on Amazon ECS Fargate behind an Application Load Balancer, keeps catalog metadata in a managed Postgres database, stores configuration on EFS and secrets in AWS Secrets Manager, and vends credentials for an S3 data bucket through a bucket-scoped IAM role instead of static keys. Everything is declared in Terraform, so the catalog can be recreated in another account or region from code.",
    whenToUse: [
      "You want an open catalog in your own cloud account.",
      "Data residency or sovereignty rules out a hosted service.",
    ],
    notFor: [
      "A full compute stack: this reference deploys the catalog server; compute is deployed separately.",
    ],
    nodes: [
      { component: "s3", layer: "storage", role: "Data bucket reached through a bucket-scoped storage role" },
      { component: "unity-catalog", layer: "catalog", role: "Catalog server, digest-pinned and mirrored to ECR", version: "0.7.0", swaps: ["unitycatalog-rs", "polaris", "lakekeeper"] },
      { component: "neon", layer: "catalog", role: "Postgres for catalog metadata", swaps: ["postgres"] },
      { component: "ecs-fargate", layer: "orchestration", role: "Runs the server in a two-AZ VPC behind a public ALB", swaps: ["kubernetes"] },
      { component: "terraform", layer: "orchestration", role: "Declares the whole deployment", version: ">= 1.11, AWS provider ~> 6.45", swaps: ["opentofu"] },
      { component: "spark", layer: "compute", role: "Any engine with a Unity Catalog or Iceberg REST client", swaps: ["trino", "duckdb"] },
      { label: "Engines and users", layer: "consumers", role: "Reach the catalog through the ALB" },
    ],
    steps: [
      { title: "Prepare a profile", body: "just init-profile and just doctor check AWS credentials and tooling." },
      { title: "Sync state and secrets", body: "Terraform state and the Neon connection secret are synced into the account." },
      { title: "Deploy", body: "just deploy uc-server applies Terraform: VPC, ALB, ECS service, EFS and the storage role." },
      { title: "Bootstrap", body: "The bootstrap step creates the storage credential, the unity catalog and the unity.default schema." },
    ],
    repos: [
      {
        name: "open-lakehouse/terraform-deploy-oss",
        url: "https://github.com/open-lakehouse/terraform-deploy-oss",
        description: "Terraform and scripts for deploying open source lakehouse services to the cloud, starting with Unity Catalog on AWS.",
        targets: ["aws"],
        quickstart: ["just init-profile prod", "just doctor", "just sync terraform-state", "just sync neon-secret", "just deploy uc-server"],
      },
      { ...OPEN_LAKEHOUSE, description: "terraform/ holds AWS deployment for the rest of the stack, including Spark and MLflow on ECS (just deploy spark-ecs, just deploy mlflow-ecs)." },
    ],
    caveats: [
      "Upgrading Unity Catalog from 0.6.0 or earlier needs a schema change: ALTER TABLE uc_properties ALTER COLUMN property_value TYPE text;",
      "Unity Catalog 0.7.0 permanently deletes dropped managed table files after seven days.",
      "The default ingress CIDR is 0.0.0.0/0; narrow it before production.",
      "During the measured v0.7.0 cutover in the sandbox, 5 of 491 requests returned 502 within 8 seconds (docs/unitycatalog/observability.md).",
    ],
    learn: [
      { label: "Multi-engine catalog pattern", href: "/reference-architectures/multi-engine-catalog" },
      { label: "Getting started with Unity Catalog", href: "/learn/getting-started/unity-catalog" },
    ],
    faqs: [
      { q: "How do I deploy Unity Catalog OSS on AWS?", a: "terraform-deploy-oss runs Unity Catalog 0.7.0 on ECS Fargate behind an ALB, with Neon Postgres for metadata, EFS for configuration and a bucket-scoped IAM role for S3, deployed with just deploy uc-server." },
    ],
    sources: [{ label: "terraform-deploy-oss", href: "https://github.com/open-lakehouse/terraform-deploy-oss" }],
    keywords: ["deploy Unity Catalog AWS", "Unity Catalog ECS Fargate", "Unity Catalog Terraform", "self-hosted data catalog AWS"],
    updated: UPDATED,
  },

  // =====================================================================
  {
    slug: "serverless-lakehouse-services",
    title: "Serverless lakehouse services",
    stackLine: "Catalog and lineage as Neon Functions on branchable Postgres",
    tagline: "Every pull request gets its own catalog, database and bucket.",
    category: "More patterns",
    definition:
      "Serverless lakehouse services package the control plane of an open lakehouse (the catalog, the lineage service and the sharing server) as functions that run per database branch. In luminescent-lakehouse, Rust services built on axum are compiled to Node-API addons and deployed as Neon Functions; each Neon branch gets its own Postgres schema and storage bucket, so a pull request preview has a full, isolated catalog and lineage service that disappears with the branch.",
    whenToUse: [
      "You want preview environments with their own catalog per pull request.",
      "You want to run lakehouse control-plane services without operating servers.",
    ],
    notFor: [
      "Data-plane compute: engines still run elsewhere and talk to these services over HTTP.",
    ],
    nodes: [
      { component: "neon", layer: "catalog", role: "Per-branch Postgres and storage bucket" },
      { component: "unitycatalog-rs", layer: "catalog", role: "Catalog function (mangrove server)" },
      { component: "headwaters", layer: "governance", role: "OpenLineage ingest with Marquez-compatible reads" },
      { component: "distributary", layer: "serving", role: "Sharing function; built and tested, not yet deployed", detail: true },
      { component: "delta", layer: "format", role: "Managed tables under s3://lakehouse/managed" },
      { label: "Engines and apps", layer: "consumers", role: "Call the functions over HTTPS" },
    ],
    steps: [
      { title: "Build", body: "Each Rust service is compiled to a linux-arm64 Node-API addon and bundled within Neon's size limits." },
      { title: "Migrate a branch", body: "Deploying to a Neon branch runs the database migrations for that branch." },
      { title: "Deploy functions", body: "The catalog and lineage functions are applied to the branch from neon.ts." },
      { title: "Promote", body: "Pull requests get preview branches, merges deploy to staging, and production needs manual approval." },
    ],
    repos: [
      {
        name: "open-lakehouse/luminescent-lakehouse",
        url: "https://github.com/open-lakehouse/luminescent-lakehouse",
        description: "Deploys open-lakehouse services (Unity Catalog, OpenLineage, OpenSharing) to Neon as functions.",
        license: "Apache-2.0",
        targets: ["serverless"],
        quickstart: [
          "just test <fn>         # host-native addon behind the fetch handler, node --test",
          "just build <fn>        # linux-arm64 bundle + zip, gated on Neon's size limits",
          "just test-arm64 <fn>   # the deployable bundle in node:24-bookworm-slim",
          "just deploy <branch>   # migrate a Neon branch and apply neon.ts to it",
        ],
      },
    ],
    caveats: ["The opensharing function builds and passes tests but is not in neon.ts yet; only the catalog and lineage functions deploy."],
    learn: [{ label: "Self-hosted catalog on AWS", href: "/reference-architectures/cloud-deployment-aws" }],
    faqs: [
      { q: "Can a data catalog run serverless?", a: "Yes. luminescent-lakehouse runs a Unity Catalog implementation and an OpenLineage service as Neon Functions, with a separate Postgres branch and bucket per environment." },
    ],
    sources: [{ label: "luminescent-lakehouse", href: "https://github.com/open-lakehouse/luminescent-lakehouse" }],
    keywords: ["serverless data catalog", "Neon functions lakehouse", "preview environments data platform"],
    updated: UPDATED,
  },
];

// Display order: batch first, then streaming, then platform patterns.
const ORDER = [
  "batch-medallion",
  "change-data-capture",
  "streaming-medallion",
  "real-time-streaming",
  "multi-engine-catalog",
  "governed-ai-agents",
  "open-data-sharing",
  "laptop-open-lakehouse",
  "policy-and-lineage",
  "semantic-layer",
  "ml-lifecycle",
  "arrow-native-serving",
  "cloud-deployment-aws",
  "serverless-lakehouse-services",
];

export const PATTERNS: Pattern[] = [...ALL_PATTERNS].sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

export const PATTERN_GROUPS: { category: Pattern["category"]; blurb: string }[] = [
  { category: "Batch", blurb: "Files, extracts, snapshots and change feeds, turned into medallion tables and full row history on a schedule." },
  { category: "Streaming", blurb: "Events in, tables or decisions out, from minutes down to milliseconds behind the source." },
  { category: "Platform", blurb: "The pieces every pipeline leans on: one catalog for every engine, safe agents, sharing, a full local stack." },
  { category: "More patterns", blurb: "Governance, semantics, ML, serving and deployment patterns that build on the ones above." },
];

export const patternBySlug = (slug?: string) => PATTERNS.find((p) => p.slug === slug);

export const PATTERN_CATEGORIES = PATTERN_GROUPS.map((g) => g.category);
