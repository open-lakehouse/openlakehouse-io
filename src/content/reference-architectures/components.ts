import type { Component } from "./types";

const ASF = "Apache Software Foundation";
const LF = "Linux Foundation";
const LFAI = "LF AI & Data Foundation";

export const COMPONENTS: Component[] = [
  // ---------- Ingestion and streaming ----------
  { id: "kafka", name: "Apache Kafka", slot: "ingest-stream", blurb: "A distributed event log that producers append to and consumers read from by offset.", url: "https://kafka.apache.org", repo: "https://github.com/apache/kafka", license: "Apache-2.0", steward: ASF },
  { id: "debezium", name: "Debezium", slot: "ingest-cdc", blurb: "Change data capture connectors that turn database transaction logs into event streams.", url: "https://debezium.io", repo: "https://github.com/debezium/debezium", license: "Apache-2.0" },
  { id: "kafka-connect", name: "Kafka Connect", slot: "ingest-stream", blurb: "The Kafka framework for running source and sink connectors.", url: "https://kafka.apache.org/documentation/#connect", license: "Apache-2.0", steward: ASF },
  { id: "tributary", name: "tributary", slot: "sources", blurb: "An open-lakehouse data generator that produces synthetic data to load into a lakehouse.", url: "https://github.com/open-lakehouse/tributary", repo: "https://github.com/open-lakehouse/tributary" },
  { id: "auto-cdc", name: "AUTO CDC (Spark Declarative Pipelines)", slot: "ingest-cdc", blurb: "The Spark Declarative Pipelines flow that applies an ordered change feed to a target table as SCD type 1 or type 2.", url: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html", license: "Apache-2.0", steward: ASF, sitePath: "/blog/apache-spark/auto-cdc-declarative-pipelines" },

  // ---------- Object storage ----------
  { id: "s3", name: "Amazon S3", slot: "storage", blurb: "Object storage on AWS; the de facto API that most lakehouse engines speak.", url: "https://aws.amazon.com/s3/" },
  { id: "seaweedfs", name: "SeaweedFS", slot: "storage", blurb: "A self-hosted distributed file and object store with an S3-compatible gateway.", url: "https://github.com/seaweedfs/seaweedfs", repo: "https://github.com/seaweedfs/seaweedfs", license: "Apache-2.0" },
  { id: "minio", name: "MinIO", slot: "storage", blurb: "A self-hosted S3-compatible object store.", url: "https://min.io", repo: "https://github.com/minio/minio", license: "AGPL-3.0" },
  { id: "local-fs", name: "Local filesystem", slot: "storage", blurb: "A directory on disk; every open table format can use it for development.", url: "https://en.wikipedia.org/wiki/File_system" },
  { id: "gcs-adls", name: "GCS / ADLS", slot: "storage", blurb: "Google Cloud Storage and Azure Data Lake Storage, the object stores on GCP and Azure.", url: "https://cloud.google.com/storage" },

  // ---------- Table formats ----------
  { id: "delta", name: "Delta Lake", slot: "format", blurb: "An open table format that adds ACID transactions, time travel and schema enforcement to Parquet files through a JSON transaction log.", url: "https://delta.io", repo: "https://github.com/delta-io/delta", license: "Apache-2.0", steward: LF, sitePath: "/technologies/delta-lake" },
  { id: "iceberg", name: "Apache Iceberg", slot: "format", blurb: "An open table format that tracks table state through a tree of metadata, manifest lists and manifests over Parquet, ORC or Avro files.", url: "https://iceberg.apache.org", repo: "https://github.com/apache/iceberg", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/lakehouse-formats" },
  { id: "hudi", name: "Apache Hudi", slot: "format", blurb: "An open table format built around record-level upserts, incremental queries and a timeline of table actions.", url: "https://hudi.apache.org", repo: "https://github.com/apache/hudi", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/lakehouse-formats" },
  { id: "parquet", name: "Apache Parquet", slot: "format", blurb: "The columnar file format that every open table format stores its data in by default.", url: "https://parquet.apache.org", license: "Apache-2.0", steward: ASF },

  // ---------- Catalogs ----------
  { id: "unity-catalog", name: "Unity Catalog OSS", slot: "catalog", blurb: "An open catalog for tables, volumes, functions and models with a three-level namespace, an Iceberg REST endpoint and credential vending.", url: "https://unitycatalog.io", repo: "https://github.com/unitycatalog/unitycatalog", license: "Apache-2.0", steward: LFAI, sitePath: "/technologies/catalogs" },
  { id: "unitycatalog-rs", name: "unitycatalog-rs", slot: "catalog", blurb: "An independent Rust implementation of the Unity Catalog OSS APIs, with Delta and Iceberg REST, Delta Sharing and credential vending.", url: "https://github.com/open-lakehouse/unitycatalog-rs", repo: "https://github.com/open-lakehouse/unitycatalog-rs" },
  { id: "polaris", name: "Apache Polaris", slot: "catalog", blurb: "A catalog that implements the Apache Iceberg REST catalog specification.", url: "https://polaris.apache.org", repo: "https://github.com/apache/polaris", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/catalogs" },
  { id: "lakekeeper", name: "Lakekeeper", slot: "catalog", blurb: "An Apache Iceberg REST catalog written in Rust.", url: "https://docs.lakekeeper.io", repo: "https://github.com/lakekeeper/lakekeeper", license: "Apache-2.0", sitePath: "/technologies/catalogs" },
  { id: "hive-metastore", name: "Hive Metastore", slot: "catalog", blurb: "The original Hadoop-era table catalog that Spark, Trino and others still read.", url: "https://hive.apache.org", license: "Apache-2.0", steward: ASF },

  // ---------- Compute ----------
  { id: "spark", name: "Apache Spark", slot: "batch", blurb: "A distributed engine for batch SQL, DataFrames, Structured Streaming and declarative pipelines, reachable remotely over Spark Connect.", url: "https://spark.apache.org", repo: "https://github.com/apache/spark", license: "Apache-2.0", steward: ASF, sitePath: "/learn/getting-started/apache-spark" },
  { id: "flink", name: "Apache Flink", slot: "streaming", blurb: "A stateful stream processor with event-time windows, timers and exactly-once checkpoints.", url: "https://flink.apache.org", repo: "https://github.com/apache/flink", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/compute-engines" },
  { id: "trino", name: "Trino", slot: "sql", blurb: "A distributed SQL query engine that reads many catalogs and table formats in one query.", url: "https://trino.io", repo: "https://github.com/trinodb/trino", license: "Apache-2.0", steward: "Trino Software Foundation" },
  { id: "duckdb", name: "DuckDB", slot: "sql", blurb: "An in-process analytical SQL database that reads Parquet, Delta and Iceberg.", url: "https://duckdb.org", repo: "https://github.com/duckdb/duckdb", license: "MIT", steward: "DuckDB Foundation" },
  { id: "datafusion", name: "Apache DataFusion", slot: "sql", blurb: "An embeddable query engine in Rust built on Apache Arrow.", url: "https://datafusion.apache.org", repo: "https://github.com/apache/datafusion", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/compute-engines" },
  { id: "sdp", name: "Spark Declarative Pipelines", slot: "pipelines", blurb: "The Spark 4.1+ framework where you declare tables and flows and Spark works out the order, retries and incremental updates.", url: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html", license: "Apache-2.0", steward: ASF },
  { id: "spark-rtm", name: "Spark Real-Time Mode", slot: "realtime", blurb: "A Structured Streaming trigger that processes records continuously for low-latency stateless and stateful queries.", url: "https://spark.apache.org/docs/latest/streaming/index.html", license: "Apache-2.0", steward: ASF },
  { id: "polars", name: "Polars", slot: "sql", blurb: "A DataFrame library in Rust with Python bindings, built on Apache Arrow.", url: "https://pola.rs", repo: "https://github.com/pola-rs/polars", license: "MIT" },

  // ---------- Orchestration ----------
  { id: "airflow", name: "Apache Airflow", slot: "orchestration", blurb: "A workflow scheduler where pipelines are Python DAGs of tasks.", url: "https://airflow.apache.org", repo: "https://github.com/apache/airflow", license: "Apache-2.0", steward: ASF, sitePath: "/technologies/orchestration" },
  { id: "temporal", name: "Temporal", slot: "orchestration", blurb: "A durable execution engine for long-running workflows written as code.", url: "https://temporal.io", repo: "https://github.com/temporalio/temporal", license: "MIT", sitePath: "/technologies/orchestration" },
  { id: "dagster", name: "Dagster", slot: "orchestration", blurb: "An asset-oriented orchestrator for data pipelines.", url: "https://dagster.io", repo: "https://github.com/dagster-io/dagster", license: "Apache-2.0" },
  { id: "kubernetes", name: "Kubernetes", slot: "deploy", blurb: "The container scheduler that most self-hosted lakehouse services run on in production.", url: "https://kubernetes.io", repo: "https://github.com/kubernetes/kubernetes", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },

  // ---------- ML and AI ----------
  { id: "mlflow", name: "MLflow", slot: "ml", blurb: "An open platform for experiment tracking, a model registry, GenAI tracing and evaluation.", url: "https://mlflow.org", repo: "https://github.com/mlflow/mlflow", license: "Apache-2.0", steward: LF, sitePath: "/learn/getting-started/mlflow" },
  { id: "omnigent", name: "Omnigent", slot: "agent-harness", blurb: "An agent harness that runs AI agents with tools, skills and policies.", url: "https://omnigent.ai", sitePath: "/learn/getting-started/omnigent" },
  { id: "ollama", name: "Ollama", slot: "agent-models", blurb: "A local runtime for open-weight language models.", url: "https://ollama.com", repo: "https://github.com/ollama/ollama", license: "MIT" },
  { id: "mcp", name: "Model Context Protocol", slot: "agent-tools", blurb: "An open protocol that exposes tools and data to AI agents.", url: "https://modelcontextprotocol.io", license: "MIT" },
  { id: "lakehouse-agent-kit", name: "lakehouse-agent-kit", slot: "agent-tools", blurb: "Agent skills for Spark, Delta, Iceberg, Unity Catalog OSS, Kafka, Airflow and MLflow.", url: "https://github.com/open-lakehouse/lakehouse-agent-kit", repo: "https://github.com/open-lakehouse/lakehouse-agent-kit" },

  // ---------- Serving ----------
  { id: "delta-sharing", name: "Delta Sharing", slot: "sharing", blurb: "An open REST protocol for sharing live tables across organizations without copying them.", url: "https://delta.io/sharing", repo: "https://github.com/delta-io/delta-sharing", license: "Apache-2.0", steward: LF },
  { id: "distributary", name: "distributary", slot: "sharing", blurb: "A Rust implementation of the Delta Sharing protocol: client, admin API and a sharing server.", url: "https://github.com/open-lakehouse/distributary", repo: "https://github.com/open-lakehouse/distributary" },
  { id: "flight-sql", name: "Arrow Flight SQL", slot: "apps", blurb: "A gRPC protocol for running SQL and streaming Arrow record batches back to the client.", url: "https://arrow.apache.org/docs/format/FlightSql.html", license: "Apache-2.0", steward: ASF },
  { id: "hydrofoil", name: "hydrofoil", slot: "apps", blurb: "An open-lakehouse Arrow Flight SQL server over lakehouse tables.", url: "https://github.com/open-lakehouse/hydrofoil", repo: "https://github.com/open-lakehouse/hydrofoil" },
  { id: "spark-connect", name: "Spark Connect", slot: "spark-connect", blurb: "Spark's gRPC client-server protocol; thin clients in Python, Scala, Go, Rust and more send plans to a remote Spark.", url: "https://spark.apache.org/docs/latest/spark-connect-overview.html", license: "Apache-2.0", steward: ASF, sitePath: "/blog/apache-spark/idiots-guide-spark-connect-clients" },
  { id: "metric-views", name: "Spark metric views", slot: "semantic", blurb: "Spark's semantic layer: measures and dimensions declared in YAML over a source table and queried with MEASURE().", url: "https://github.com/lisancao/spark-demos/tree/main/demos/01_metrics_views", license: "Apache-2.0", steward: ASF },
  { id: "kafka-sink", name: "Kafka sink topic", slot: "apps", blurb: "Results written back to a Kafka topic for downstream services.", url: "https://kafka.apache.org" },

  // ---------- Consumers ----------
  { id: "superset", name: "Apache Superset", slot: "bi", blurb: "An open source BI and dashboarding application.", url: "https://superset.apache.org", repo: "https://github.com/apache/superset", license: "Apache-2.0", steward: ASF },
  { id: "jupyter", name: "Jupyter", slot: "bi", blurb: "Notebooks for interactive Python, SQL and Spark.", url: "https://jupyter.org", license: "BSD-3-Clause", steward: "Project Jupyter" },
  { id: "marimo", name: "marimo", slot: "bi", blurb: "A reactive Python notebook stored as plain .py files.", url: "https://marimo.io", repo: "https://github.com/marimo-team/marimo", license: "Apache-2.0" },
  { id: "grafana", name: "Grafana", slot: "observability", blurb: "Dashboards and alerting over metrics and SQL sources.", url: "https://grafana.com", repo: "https://github.com/grafana/grafana", license: "AGPL-3.0" },

  // ---------- Governance ----------
  { id: "openlineage", name: "OpenLineage", slot: "lineage", blurb: "An open standard for emitting lineage events from jobs, with integrations for Spark, Airflow, Flink and dbt.", url: "https://openlineage.io", repo: "https://github.com/OpenLineage/OpenLineage", license: "Apache-2.0", steward: LFAI, sitePath: "/technologies/open-governance#open-lineage" },
  { id: "marquez", name: "Marquez", slot: "lineage", blurb: "The reference OpenLineage metadata server and lineage UI.", url: "https://marquezproject.ai", repo: "https://github.com/MarquezProject/marquez", license: "Apache-2.0", steward: LFAI },
  { id: "policast", name: "policast", slot: "access-policy", blurb: "Author governance once in Cedar, compile it to portable CEL, and push enforcement into the query engine's physical plan.", url: "https://github.com/open-lakehouse/policast", repo: "https://github.com/open-lakehouse/policast", sitePath: "/technologies/open-governance#open-policies" },
  { id: "cedar", name: "Cedar", slot: "access-policy", blurb: "A policy language and evaluation engine for authorization.", url: "https://www.cedarpolicy.com", repo: "https://github.com/cedar-policy/cedar", license: "Apache-2.0" },
  { id: "opa", name: "Open Policy Agent", slot: "access-policy", blurb: "A general-purpose policy engine with the Rego language.", url: "https://www.openpolicyagent.org", repo: "https://github.com/open-policy-agent/opa", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },

  // ---------- Added for specific reference repos ----------
  { id: "rustfs", name: "RustFS", slot: "storage", blurb: "A self-hosted S3-compatible object store written in Rust.", url: "https://github.com/rustfs/rustfs", repo: "https://github.com/rustfs/rustfs", license: "Apache-2.0" },
  { id: "postgres", name: "PostgreSQL", slot: "catalog", blurb: "The relational database most open catalogs use to store their metadata.", url: "https://www.postgresql.org", license: "PostgreSQL" },
  { id: "pyiceberg", name: "PyIceberg", slot: "sql", blurb: "The pure-Python Apache Iceberg library for reading and writing Iceberg tables without a JVM.", url: "https://py.iceberg.apache.org", repo: "https://github.com/apache/iceberg-python", license: "Apache-2.0", steward: ASF },
  { id: "openfga", name: "OpenFGA", slot: "access-policy", blurb: "A relationship-based authorization service modelled on Google Zanzibar.", url: "https://openfga.dev", repo: "https://github.com/openfga/openfga", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "envoy", name: "Envoy", slot: "access-policy", blurb: "A proxy used here to terminate mTLS and route each client certificate to its own backend.", url: "https://www.envoyproxy.io", repo: "https://github.com/envoyproxy/envoy", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "breakwater", name: "breakwater", slot: "access-policy", blurb: "Cedar fine-grained access control for Apache DataFusion: an access gate plus row filters and column masks applied in the query planner.", url: "https://github.com/open-lakehouse/breakwater", repo: "https://github.com/open-lakehouse/breakwater", license: "Apache-2.0" },
  { id: "headwaters", name: "headwaters", slot: "lineage", blurb: "Experimental Rust OpenLineage service: an append-only event log in Postgres, projected read tables, a read API and a UI.", url: "https://github.com/open-lakehouse/headwaters", repo: "https://github.com/open-lakehouse/headwaters", license: "Apache-2.0" },
  { id: "open-lineage-connect", name: "open-lineage-connect", slot: "lineage", blurb: "An OpenLineage pipeline that stores lineage events as Delta and Iceberg tables, with a Spark 4 plugin for column-level lineage.", url: "https://github.com/open-lakehouse/open-lineage-connect", repo: "https://github.com/open-lakehouse/open-lineage-connect", license: "Apache-2.0" },
  { id: "ecs-fargate", name: "Amazon ECS on Fargate", slot: "deploy", blurb: "AWS's serverless container runtime; it runs the catalog server without managing hosts.", url: "https://aws.amazon.com/fargate/" },
  { id: "neon", name: "Neon", slot: "catalog", blurb: "Serverless Postgres with branching; used for catalog metadata and, in luminescent-lakehouse, to host the services themselves.", url: "https://neon.com" },
  { id: "terraform", name: "Terraform", slot: "deploy", blurb: "Infrastructure as code; the reference repos ship their cloud deployments as Terraform.", url: "https://www.terraform.io", license: "BUSL-1.1" },
  { id: "opentofu", name: "OpenTofu", slot: "deploy", blurb: "An open source fork of Terraform governed by the Linux Foundation.", url: "https://opentofu.org", license: "MPL-2.0", steward: LF },
  { id: "redis", name: "Redis", slot: "apps", blurb: "An in-memory key-value store used to serve the latest streaming state to applications.", url: "https://redis.io" },
  { id: "valkey", name: "Valkey", slot: "apps", blurb: "A Linux Foundation fork of Redis under the BSD license.", url: "https://valkey.io", license: "BSD-3-Clause", steward: LF },
  { id: "dashboard", name: "Next.js dashboard", slot: "bi", blurb: "The read-only web dashboard that ships with the open-lakehouse stack.", url: "https://github.com/open-lakehouse/open-lakehouse/tree/main/dashboard" },
  { id: "gitops", name: "GitOps CI gate", slot: "deploy", blurb: "Pull-request-only changes with a dry run against the real catalog before anything is applied.", url: "https://github.com/open-lakehouse/safe-spark-agents-paper" },
  { id: "spark-connect-clients", name: "Spark Connect clients", slot: "spark-connect", blurb: "Thin clients in Python, Scala, Go, Rust, Swift and more that send query plans to a remote Spark Connect server.", url: "https://spark.apache.org/docs/latest/spark-connect-overview.html", sitePath: "/blog/apache-spark/idiots-guide-spark-connect-clients" },

  // ---------- Platform slots added for the full platform board ----------
  { id: "dlt", name: "dlt", slot: "ingest-batch", blurb: "A Python library for loading data from APIs, databases and files into tables.", url: "https://dlthub.com", repo: "https://github.com/dlt-hub/dlt", license: "Apache-2.0" },
  { id: "omnigent-sandbox", name: "Omnigent sandbox hosts", slot: "agent-sandbox", blurb: "Run the Omnigent runner in a remote container or microVM per session; provider credentials stay on the launching process and never enter the sandbox.", url: "https://omnigent.ai/docs/deploy/cloud-sandbox-host" },
  { id: "vllm", name: "vLLM", slot: "agent-models", blurb: "A high-throughput inference server for open-weight language models.", url: "https://vllm.ai", repo: "https://github.com/vllm-project/vllm", license: "Apache-2.0" },
  { id: "opentelemetry", name: "OpenTelemetry", slot: "observability", blurb: "The open standard and SDKs for traces, metrics and logs.", url: "https://opentelemetry.io", repo: "https://github.com/open-telemetry", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "prometheus", name: "Prometheus", slot: "observability", blurb: "A metrics database and alerting system.", url: "https://prometheus.io", repo: "https://github.com/prometheus/prometheus", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "spark-feather", name: "Spark local mode (Project Feather)", slot: "local", blurb: "Spark in a single process; Spark 4.3 adds shuffle-free single-task execution for small queries (spark.sql.optimizer.singleTaskExecution.enabled, off by default).", url: "https://issues.apache.org/jira/browse/SPARK-56978", license: "Apache-2.0", steward: ASF },
  { id: "great-expectations", name: "Great Expectations", slot: "quality", blurb: "Declarative data quality tests (expectations) run against tables and batches.", url: "https://greatexpectations.io", repo: "https://github.com/great-expectations/great_expectations", license: "Apache-2.0" },
  { id: "soda-core", name: "Soda Core", slot: "quality", blurb: "Data quality checks written in YAML and run against tables.", url: "https://github.com/sodadata/soda-core", repo: "https://github.com/sodadata/soda-core", license: "Apache-2.0" },
  { id: "datahub", name: "DataHub", slot: "metadata", blurb: "A metadata platform for search, ownership, glossary and lineage across data systems.", url: "https://datahubproject.io", repo: "https://github.com/datahub-project/datahub", license: "Apache-2.0" },
  { id: "openmetadata", name: "OpenMetadata", slot: "metadata", blurb: "A metadata platform for discovery, governance, quality and collaboration.", url: "https://open-metadata.org", repo: "https://github.com/open-metadata/OpenMetadata", license: "Apache-2.0" },
  { id: "iceberg-maintenance", name: "Iceberg maintenance procedures", slot: "maintenance", blurb: "rewrite_data_files, rewrite_manifests and expire_snapshots, called from Spark SQL on a schedule.", url: "https://iceberg.apache.org/docs/latest/maintenance/", license: "Apache-2.0", steward: ASF },
  { id: "argocd", name: "Argo CD", slot: "deploy", blurb: "GitOps continuous delivery for Kubernetes.", url: "https://argoproj.github.io/cd/", repo: "https://github.com/argoproj/argo-cd", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "keycloak", name: "Keycloak", slot: "identity", blurb: "Identity and access management with single sign-on, OIDC and SAML.", url: "https://www.keycloak.org", repo: "https://github.com/keycloak/keycloak", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "spiffe", name: "SPIFFE / SPIRE", slot: "identity", blurb: "Workload identity: cryptographic identities for services and agents.", url: "https://spiffe.io", repo: "https://github.com/spiffe/spire", license: "Apache-2.0", steward: "Cloud Native Computing Foundation" },
  { id: "openbao", name: "OpenBao", slot: "identity", blurb: "An open source fork of HashiCorp Vault for secrets management.", url: "https://openbao.org", repo: "https://github.com/openbao/openbao", license: "MPL-2.0" },
];

export const componentById = (id?: string) => (id ? COMPONENTS.find((c) => c.id === id) : undefined);
