import type { Component, Layer, LayerId } from "./types";

// Board columns, left to right, plus the cross-cutting governance band.
export const LAYERS: Layer[] = [
  { id: "sources", name: "Sources", short: "Sources", question: "Where does the data come from?" },
  { id: "ingest", name: "Ingestion and streaming", short: "Ingest", question: "How does data get into the lakehouse?" },
  { id: "storage", name: "Object storage", short: "Storage", question: "Where do the bytes live?" },
  { id: "format", name: "Open table format", short: "Format", question: "What turns files into tables?" },
  { id: "catalog", name: "Catalog", short: "Catalog", question: "How do engines find and secure tables?" },
  { id: "compute", name: "Compute engines", short: "Compute", question: "What reads and writes the tables?" },
  { id: "orchestration", name: "Orchestration", short: "Orchestrate", question: "What runs the jobs, and when?" },
  { id: "ml", name: "ML and AI", short: "ML / AI", question: "Where do models and agents fit?" },
  { id: "serving", name: "Serving", short: "Serving", question: "How do results leave the lakehouse?" },
  { id: "consumers", name: "Consumers", short: "Consumers", question: "Who uses the output?" },
  { id: "governance", name: "Governance, lineage and policy", short: "Governance", question: "Who can see what, and where did it come from?" },
];

export const BOARD_LAYERS: LayerId[] = [
  "sources",
  "ingest",
  "storage",
  "format",
  "catalog",
  "compute",
  "orchestration",
  "ml",
  "serving",
  "consumers",
];

export const layerById = (id: LayerId) => LAYERS.find((l) => l.id === id)!;

const ASF = "Apache Software Foundation";
const LF = "Linux Foundation";
const LFAI = "LF AI & Data Foundation";

export const COMPONENTS: Component[] = [
  // ---------- Ingestion and streaming ----------
  { id: "kafka", name: "Apache Kafka", layer: "ingest", blurb: "A distributed event log that producers append to and consumers read from by offset.", url: "https://kafka.apache.org", repo: "https://github.com/apache/kafka", license: "Apache-2.0", steward: ASF },
  { id: "debezium", name: "Debezium", layer: "ingest", blurb: "Change data capture connectors that turn database transaction logs into event streams.", url: "https://debezium.io", repo: "https://github.com/debezium/debezium", license: "Apache-2.0" },
  { id: "kafka-connect", name: "Kafka Connect", layer: "ingest", blurb: "The Kafka framework for running source and sink connectors.", url: "https://kafka.apache.org/documentation/#connect", license: "Apache-2.0", steward: ASF },
  { id: "tributary", name: "tributary", layer: "ingest", blurb: "An open-lakehouse data generator that produces synthetic data to load into a lakehouse.", url: "https://github.com/open-lakehouse/tributary", repo: "https://github.com/open-lakehouse/tributary" },
  { id: "auto-cdc", name: "AUTO CDC (Spark Declarative Pipelines)", layer: "ingest", blurb: "The Spark Declarative Pipelines flow that applies an ordered change feed to a target table as SCD type 1 or type 2.", url: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html", license: "Apache-2.0", steward: ASF, sitePath: "/blog/apache-spark/auto-cdc-declarative-pipelines" },

  // ---------- Object storage ----------
  { id: "s3", name: "Amazon S3", layer: "storage", blurb: "Object storage on AWS; the de facto API that most lakehouse engines speak.", url: "https://aws.amazon.com/s3/" },
  { id: "seaweedfs", name: "SeaweedFS", layer: "storage", blurb: "A self-hosted distributed file and object store with an S3-compatible gateway.", url: "https://github.com/seaweedfs/seaweedfs", repo: "https://github.com/seaweedfs/seaweedfs", license: "Apache-2.0" },
  { id: "minio", name: "MinIO", layer: "storage", blurb: "A self-hosted S3-compatible object store.", url: "https://min.io", repo: "https://github.com/minio/minio", license: "AGPL-3.0" },
  { id: "local-fs", name: "Local filesystem", layer: "storage", blurb: "A directory on disk; every open table format can use it for development.", url: "https://en.wikipedia.org/wiki/File_system" },
  { id: "gcs-adls", name: "GCS / ADLS", layer: "storage", blurb: "Google Cloud Storage and Azure Data Lake Storage, the object stores on GCP and Azure.", url: "https://cloud.google.com/storage" },

  // ---------- Table formats ----------
  { id: "delta", name: "Delta Lake", layer: "format", blurb: "An open table format that adds ACID transactions, time travel and schema enforcement to Parquet files through a JSON transaction log.", url: "https://delta.io", repo: "https://github.com/delta-io/delta", license: "Apache-2.0", steward: LF, sitePath: "/technologies/delta-lake" },
  { id: "iceberg", name: "Apache Iceberg", layer: "format", blurb: "An open table format that tracks table state through a tree of metadata, manifest lists and manifests over Parquet, ORC or Avro files.", url: "https://iceberg.apache.org", repo: "https://github.com/apache/iceberg", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/lakehouse-formats" },
  { id: "hudi", name: "Apache Hudi", layer: "format", blurb: "An open table format built around record-level upserts, incremental queries and a timeline of table actions.", url: "https://hudi.apache.org", repo: "https://github.com/apache/hudi", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/lakehouse-formats" },
  { id: "parquet", name: "Apache Parquet", layer: "format", blurb: "The columnar file format that every open table format stores its data in by default.", url: "https://parquet.apache.org", license: "Apache-2.0", steward: ASF },

  // ---------- Catalogs ----------
  { id: "unity-catalog", name: "Unity Catalog OSS", layer: "catalog", blurb: "An open catalog for tables, volumes, functions and models with a three-level namespace, an Iceberg REST endpoint and credential vending.", url: "https://unitycatalog.io", repo: "https://github.com/unitycatalog/unitycatalog", license: "Apache-2.0", steward: LFAI, sitePath: "/technologies/catalogs" },
  { id: "unitycatalog-rs", name: "unitycatalog-rs", layer: "catalog", blurb: "An independent Rust implementation of the Unity Catalog OSS APIs, with Delta and Iceberg REST, Delta Sharing and credential vending.", url: "https://github.com/open-lakehouse/unitycatalog-rs", repo: "https://github.com/open-lakehouse/unitycatalog-rs" },
  { id: "polaris", name: "Apache Polaris", layer: "catalog", blurb: "A catalog that implements the Apache Iceberg REST catalog specification.", url: "https://polaris.apache.org", repo: "https://github.com/apache/polaris", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/catalogs" },
  { id: "lakekeeper", name: "Lakekeeper", layer: "catalog", blurb: "An Apache Iceberg REST catalog written in Rust.", url: "https://docs.lakekeeper.io", repo: "https://github.com/lakekeeper/lakekeeper", license: "Apache-2.0", sitePath: "/technologies/catalogs" },
  { id: "hive-metastore", name: "Hive Metastore", layer: "catalog", blurb: "The original Hadoop-era table catalog that Spark, Trino and others still read.", url: "https://hive.apache.org", license: "Apache-2.0", steward: ASF },

  // ---------- Compute ----------
  { id: "spark", name: "Apache Spark", layer: "compute", blurb: "A distributed engine for batch SQL, DataFrames, Structured Streaming and declarative pipelines, reachable remotely over Spark Connect.", url: "https://spark.apache.org", repo: "https://github.com/apache/spark", license: "Apache-2.0", steward: ASF, sitePath: "/learn/getting-started/apache-spark" },
  { id: "flink", name: "Apache Flink", layer: "compute", blurb: "A stateful stream processor with event-time windows, timers and exactly-once checkpoints.", url: "https://flink.apache.org", repo: "https://github.com/apache/flink", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/compute-engines" },
  { id: "trino", name: "Trino", layer: "compute", blurb: "A distributed SQL query engine that reads many catalogs and table formats in one query.", url: "https://trino.io", repo: "https://github.com/trinodb/trino", license: "Apache-2.0", steward: "Trino Software Foundation" },
  { id: "duckdb", name: "DuckDB", layer: "compute", blurb: "An in-process analytical SQL database that reads Parquet, Delta and Iceberg.", url: "https://duckdb.org", repo: "https://github.com/duckdb/duckdb", license: "MIT", steward: "DuckDB Foundation" },
  { id: "datafusion", name: "Apache DataFusion", layer: "compute", blurb: "An embeddable query engine in Rust built on Apache Arrow.", url: "https://datafusion.apache.org", repo: "https://github.com/apache/datafusion", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/compute-engines" },
  { id: "sdp", name: "Spark Declarative Pipelines", layer: "compute", blurb: "The Spark 4.1+ framework where you declare tables and flows and Spark works out the order, retries and incremental updates.", url: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html", license: "Apache-2.0", steward: ASF },
  { id: "spark-rtm", name: "Spark Real-Time Mode", layer: "compute", blurb: "A Structured Streaming trigger that processes records continuously for low-latency stateless and stateful queries.", url: "https://spark.apache.org/docs/latest/streaming/index.html", license: "Apache-2.0", steward: ASF },
  { id: "polars", name: "Polars", layer: "compute", blurb: "A DataFrame library in Rust with Python bindings, built on Apache Arrow.", url: "https://pola.rs", repo: "https://github.com/pola-rs/polars", license: "MIT" },

  // ---------- Orchestration ----------
  { id: "airflow", name: "Apache Airflow", layer: "orchestration", blurb: "A workflow scheduler where pipelines are Python DAGs of tasks.", url: "https://airflow.apache.org", repo: "https://github.com/apache/airflow", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/orchestration" },
  { id: "temporal", name: "Temporal", layer: "orchestration", blurb: "A durable execution engine for long-running workflows written as code.", url: "https://temporal.io", repo: "https://github.com/temporalio/temporal", license: "MIT", sitePath: "/technologies/orchestration" },
  { id: "dagster", name: "Dagster", layer: "orchestration", blurb: "An asset-oriented orchestrator for data pipelines.", url: "https://dagster.io", repo: "https://github.com/dagster-io/dagster", license: "Apache-2.0" },
  { id: "kubernetes", name: "Kubernetes", layer: "orchestration", blurb: "The container scheduler that most self-hosted lakehouse services run on in production.", url: "https://kubernetes.io", repo: "https://github.com/kubernetes/kubernetes", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },

  // ---------- ML and AI ----------
  { id: "mlflow", name: "MLflow", layer: "ml", blurb: "An open platform for experiment tracking, a model registry, GenAI tracing and evaluation.", url: "https://mlflow.org", repo: "https://github.com/mlflow/mlflow", license: "Apache-2.0", steward: LF, sitePath: "/learn/getting-started/mlflow" },
  { id: "omnigent", name: "Omnigent", layer: "ml", blurb: "An agent harness that runs AI agents with tools, skills and policies.", url: "https://omnigent.ai", sitePath: "/learn/getting-started/omnigent" },
  { id: "ollama", name: "Ollama", layer: "ml", blurb: "A local runtime for open-weight language models.", url: "https://ollama.com", repo: "https://github.com/ollama/ollama", license: "MIT" },
  { id: "mcp", name: "Model Context Protocol", layer: "ml", blurb: "An open protocol that exposes tools and data to AI agents.", url: "https://modelcontextprotocol.io", license: "MIT" },
  { id: "lakehouse-agent-kit", name: "lakehouse-agent-kit", layer: "ml", blurb: "Agent skills for Spark, Delta, Iceberg, Unity Catalog OSS, Kafka, Airflow and MLflow.", url: "https://github.com/open-lakehouse/lakehouse-agent-kit", repo: "https://github.com/open-lakehouse/lakehouse-agent-kit" },

  // ---------- Serving ----------
  { id: "delta-sharing", name: "Delta Sharing", layer: "serving", blurb: "An open REST protocol for sharing live tables across organizations without copying them.", url: "https://delta.io/sharing", repo: "https://github.com/delta-io/delta-sharing", license: "Apache-2.0", steward: LF },
  { id: "distributary", name: "distributary", layer: "serving", blurb: "A Rust implementation of the Delta Sharing protocol: client, admin API and a sharing server.", url: "https://github.com/open-lakehouse/distributary", repo: "https://github.com/open-lakehouse/distributary" },
  { id: "flight-sql", name: "Arrow Flight SQL", layer: "serving", blurb: "A gRPC protocol for running SQL and streaming Arrow record batches back to the client.", url: "https://arrow.apache.org/docs/format/FlightSql.html", license: "Apache-2.0", steward: ASF },
  { id: "hydrofoil", name: "hydrofoil", layer: "serving", blurb: "An open-lakehouse Arrow Flight SQL server over lakehouse tables.", url: "https://github.com/open-lakehouse/hydrofoil", repo: "https://github.com/open-lakehouse/hydrofoil" },
  { id: "spark-connect", name: "Spark Connect", layer: "serving", blurb: "Spark's gRPC client-server protocol; thin clients in Python, Scala, Go, Rust and more send plans to a remote Spark.", url: "https://spark.apache.org/docs/latest/spark-connect-overview.html", license: "Apache-2.0", steward: ASF, sitePath: "/blog/apache-spark/idiots-guide-spark-connect-clients" },
  { id: "metric-views", name: "Spark metric views", layer: "serving", blurb: "Spark's semantic layer: measures and dimensions declared in YAML over a source table and queried with MEASURE().", url: "https://github.com/lisancao/spark-demos/tree/main/demos/01_metrics_views", license: "Apache-2.0", steward: ASF },
  { id: "kafka-sink", name: "Kafka sink topic", layer: "serving", blurb: "Results written back to a Kafka topic for downstream services.", url: "https://kafka.apache.org" },

  // ---------- Consumers ----------
  { id: "superset", name: "Apache Superset", layer: "consumers", blurb: "An open source BI and dashboarding application.", url: "https://superset.apache.org", repo: "https://github.com/apache/superset", license: "Apache-2.0", steward: ASF },
  { id: "jupyter", name: "Jupyter", layer: "consumers", blurb: "Notebooks for interactive Python, SQL and Spark.", url: "https://jupyter.org", license: "BSD-3-Clause", steward: "Project Jupyter" },
  { id: "marimo", name: "marimo", layer: "consumers", blurb: "A reactive Python notebook stored as plain .py files.", url: "https://marimo.io", repo: "https://github.com/marimo-team/marimo", license: "Apache-2.0" },
  { id: "grafana", name: "Grafana", layer: "consumers", blurb: "Dashboards and alerting over metrics and SQL sources.", url: "https://grafana.com", repo: "https://github.com/grafana/grafana", license: "AGPL-3.0" },

  // ---------- Governance ----------
  { id: "openlineage", name: "OpenLineage", layer: "governance", blurb: "An open standard for emitting lineage events from jobs, with integrations for Spark, Airflow, Flink and dbt.", url: "https://openlineage.io", repo: "https://github.com/OpenLineage/OpenLineage", license: "Apache-2.0", steward: LFAI, sitePath: "/technologies/open-governance#open-lineage" },
  { id: "marquez", name: "Marquez", layer: "governance", blurb: "The reference OpenLineage metadata server and lineage UI.", url: "https://marquezproject.ai", repo: "https://github.com/MarquezProject/marquez", license: "Apache-2.0", steward: LFAI },
  { id: "policast", name: "policast", layer: "governance", blurb: "Author governance once in Cedar, compile it to portable CEL, and push enforcement into the query engine's physical plan.", url: "https://github.com/open-lakehouse/policast", repo: "https://github.com/open-lakehouse/policast", sitePath: "/technologies/open-governance#open-policies" },
  { id: "cedar", name: "Cedar", layer: "governance", blurb: "A policy language and evaluation engine for authorization.", url: "https://www.cedarpolicy.com", repo: "https://github.com/cedar-policy/cedar", license: "Apache-2.0" },
  { id: "opa", name: "Open Policy Agent", layer: "governance", blurb: "A general-purpose policy engine with the Rego language.", url: "https://www.openpolicyagent.org", repo: "https://github.com/open-policy-agent/opa", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },

  // ---------- Added for specific reference repos ----------
  { id: "rustfs", name: "RustFS", layer: "storage", blurb: "A self-hosted S3-compatible object store written in Rust.", url: "https://github.com/rustfs/rustfs", repo: "https://github.com/rustfs/rustfs", license: "Apache-2.0" },
  { id: "postgres", name: "PostgreSQL", layer: "catalog", blurb: "The relational database most open catalogs use to store their metadata.", url: "https://www.postgresql.org", license: "PostgreSQL" },
  { id: "pyiceberg", name: "PyIceberg", layer: "compute", blurb: "The pure-Python Apache Iceberg library for reading and writing Iceberg tables without a JVM.", url: "https://py.iceberg.apache.org", repo: "https://github.com/apache/iceberg-python", license: "Apache-2.0", steward: ASF },
  { id: "openfga", name: "OpenFGA", layer: "governance", blurb: "A relationship-based authorization service modelled on Google Zanzibar.", url: "https://openfga.dev", repo: "https://github.com/openfga/openfga", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "envoy", name: "Envoy", layer: "governance", blurb: "A proxy used here to terminate mTLS and route each client certificate to its own backend.", url: "https://www.envoyproxy.io", repo: "https://github.com/envoyproxy/envoy", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "breakwater", name: "breakwater", layer: "governance", blurb: "Cedar fine-grained access control for Apache DataFusion: an access gate plus row filters and column masks applied in the query planner.", url: "https://github.com/open-lakehouse/breakwater", repo: "https://github.com/open-lakehouse/breakwater", license: "Apache-2.0" },
  { id: "headwaters", name: "headwaters", layer: "governance", blurb: "Experimental Rust OpenLineage service: an append-only event log in Postgres, projected read tables, a read API and a UI.", url: "https://github.com/open-lakehouse/headwaters", repo: "https://github.com/open-lakehouse/headwaters", license: "Apache-2.0" },
  { id: "open-lineage-connect", name: "open-lineage-connect", layer: "governance", blurb: "An OpenLineage pipeline that stores lineage events as Delta and Iceberg tables, with a Spark 4 plugin for column-level lineage.", url: "https://github.com/open-lakehouse/open-lineage-connect", repo: "https://github.com/open-lakehouse/open-lineage-connect", license: "Apache-2.0" },
  { id: "ecs-fargate", name: "Amazon ECS on Fargate", layer: "orchestration", blurb: "AWS's serverless container runtime; it runs the catalog server without managing hosts.", url: "https://aws.amazon.com/fargate/" },
  { id: "neon", name: "Neon", layer: "catalog", blurb: "Serverless Postgres with branching; used for catalog metadata and, in luminescent-lakehouse, to host the services themselves.", url: "https://neon.com" },
  { id: "terraform", name: "Terraform", layer: "orchestration", blurb: "Infrastructure as code; the reference repos ship their cloud deployments as Terraform.", url: "https://www.terraform.io", license: "BUSL-1.1" },
  { id: "opentofu", name: "OpenTofu", layer: "orchestration", blurb: "An open source fork of Terraform governed by the Linux Foundation.", url: "https://opentofu.org", license: "MPL-2.0", steward: LF },
  { id: "redis", name: "Redis", layer: "serving", blurb: "An in-memory key-value store used to serve the latest streaming state to applications.", url: "https://redis.io" },
  { id: "valkey", name: "Valkey", layer: "serving", blurb: "A Linux Foundation fork of Redis under the BSD license.", url: "https://valkey.io", license: "BSD-3-Clause", steward: LF },
  { id: "dashboard", name: "Next.js dashboard", layer: "consumers", blurb: "The read-only web dashboard that ships with the open-lakehouse stack.", url: "https://github.com/open-lakehouse/open-lakehouse/tree/main/dashboard" },
  { id: "gitops", name: "GitOps CI gate", layer: "orchestration", blurb: "Pull-request-only changes with a dry run against the real catalog before anything is applied.", url: "https://github.com/open-lakehouse/safe-spark-agents-paper" },
  { id: "spark-connect-clients", name: "Spark Connect clients", layer: "consumers", blurb: "Thin clients in Python, Scala, Go, Rust, Swift and more that send query plans to a remote Spark Connect server.", url: "https://spark.apache.org/docs/latest/spark-connect-overview.html", sitePath: "/blog/apache-spark/idiots-guide-spark-connect-clients" },
];

export const componentById = (id?: string) => (id ? COMPONENTS.find((c) => c.id === id) : undefined);
