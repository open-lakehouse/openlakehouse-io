// Curated open source data engineering resources, grouped by what you would
// look them up for. Unlike an "awesome" list, every group links back to the
// architectures that use these projects. Entries that are components refer to
// components.ts by id; the rest are specs, runnable stacks and learning.

export type Resource = {
  name: string;
  url: string;
  what: string;
  /** Component id, when the resource is a project in the catalog. */
  component?: string;
};

export type ResourceGroup = { id: string; title: string; intro: string; items: Resource[] };

const c = (component: string, name: string, url: string, what: string): Resource => ({ component, name, url, what });

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "runnable-stacks",
    title: "Runnable stacks and courses",
    intro: "Clone one of these and you have a working open lakehouse to learn on or test against.",
    items: [
      { name: "open-lakehouse", url: "https://github.com/open-lakehouse/open-lakehouse", what: "Spark, Delta Lake, Unity Catalog, Kafka, Airflow and MLflow in Docker, with an AWS path." },
      { name: "unitycatalog-playground", url: "https://github.com/open-lakehouse/unitycatalog-playground", what: "Unity Catalog OSS with Spark, Delta and Iceberg in marimo notebooks." },
      { name: "lakehouse-masterclass", url: "https://github.com/open-lakehouse/lakehouse-masterclass", what: "A textbook course that builds an open lakehouse one service per chapter." },
      { name: "Spark Masterclass", url: "https://open-lakehouse.github.io/spark-masterclass/", what: "A runnable online book on Apache Spark 4.3; every number traces to a script." },
      { name: "spark-demos", url: "https://github.com/lisancao/spark-demos", what: "One runnable demo per Spark feature: metric views, Spark Connect, Real-Time Mode and more." },
      { name: "safe-spark-agents-paper", url: "https://github.com/open-lakehouse/safe-spark-agents-paper", what: "A reproducible study and reference architecture for AI agents building Spark pipelines." },
    ],
  },
  {
    id: "table-formats",
    title: "Open table formats",
    intro: "ACID tables on object storage, readable by many engines.",
    items: [
      c("delta", "Delta Lake", "https://github.com/delta-io/delta", "Transaction-log table format; the protocol is in PROTOCOL.md."),
      { name: "delta-rs", url: "https://github.com/delta-io/delta-rs", what: "Native Rust and Python library for Delta tables, no JVM." },
      { name: "delta-kernel-rs", url: "https://github.com/delta-io/delta-kernel-rs", what: "A Rust kernel that engines embed to read and write Delta." },
      c("iceberg", "Apache Iceberg", "https://github.com/apache/iceberg", "Metadata-tree table format with a REST catalog specification."),
      c("pyiceberg", "PyIceberg", "https://github.com/apache/iceberg-python", "Pure-Python Iceberg reads and writes."),
      { name: "iceberg-rust", url: "https://github.com/apache/iceberg-rust", what: "The Rust implementation of Apache Iceberg." },
      c("hudi", "Apache Hudi", "https://github.com/apache/hudi", "Table format built around upserts and incremental queries."),
    ],
  },
  {
    id: "catalogs",
    title: "Catalogs",
    intro: "Where engines find tables, and where access is decided.",
    items: [
      c("unity-catalog", "Unity Catalog OSS", "https://github.com/unitycatalog/unitycatalog", "Tables, volumes, functions and models, with Iceberg REST and credential vending."),
      c("polaris", "Apache Polaris", "https://github.com/apache/polaris", "An implementation of the Iceberg REST catalog specification."),
      c("lakekeeper", "Lakekeeper", "https://github.com/lakekeeper/lakekeeper", "Iceberg REST catalog in Rust."),
      c("unitycatalog-rs", "unitycatalog-rs", "https://github.com/open-lakehouse/unitycatalog-rs", "Rust implementation of the Unity Catalog OSS APIs."),
    ],
  },
  {
    id: "engines",
    title: "Compute engines",
    intro: "What reads and writes the tables, from a laptop to a cluster.",
    items: [
      c("spark", "Apache Spark", "https://github.com/apache/spark", "Batch, SQL, Structured Streaming and declarative pipelines."),
      c("flink", "Apache Flink", "https://github.com/apache/flink", "Stateful stream processing."),
      c("trino", "Trino", "https://github.com/trinodb/trino", "Distributed SQL across catalogs."),
      c("duckdb", "DuckDB", "https://github.com/duckdb/duckdb", "In-process analytical SQL."),
      c("datafusion", "Apache DataFusion", "https://github.com/apache/datafusion", "Embeddable Rust query engine on Arrow."),
      c("polars", "Polars", "https://github.com/pola-rs/polars", "Arrow-native DataFrames in Rust and Python."),
    ],
  },
  {
    id: "streaming",
    title: "Streaming and ingestion",
    intro: "Getting events and database changes into the lakehouse.",
    items: [
      c("kafka", "Apache Kafka", "https://github.com/apache/kafka", "The event log most streaming architectures start from."),
      c("debezium", "Debezium", "https://github.com/debezium/debezium", "Change data capture from database logs."),
      { name: "spark-rtm-quickstart", url: "https://github.com/lisancao/spark-rtm-quickstart", what: "Spark Real-Time Mode pipelines with a latency harness." },
    ],
  },
  {
    id: "orchestration",
    title: "Orchestration",
    intro: "What runs the jobs, and when.",
    items: [
      c("airflow", "Apache Airflow", "https://github.com/apache/airflow", "Python DAG scheduler."),
      c("dagster", "Dagster", "https://github.com/dagster-io/dagster", "Asset-oriented orchestration."),
      c("temporal", "Temporal", "https://github.com/temporalio/temporal", "Durable execution for long-running workflows."),
    ],
  },
  {
    id: "governance",
    title: "Governance, lineage and policy",
    intro: "Who can see what, and where it came from.",
    items: [
      c("openlineage", "OpenLineage", "https://github.com/OpenLineage/OpenLineage", "Open standard for lineage events."),
      c("marquez", "Marquez", "https://github.com/MarquezProject/marquez", "Reference OpenLineage server and UI."),
      c("policast", "policast", "https://github.com/open-lakehouse/policast", "Cedar policies compiled to CEL and enforced inside Spark and DataFusion plans."),
      c("breakwater", "breakwater", "https://github.com/open-lakehouse/breakwater", "Cedar row filters and column masks for DataFusion."),
      c("open-lineage-connect", "open-lineage-connect", "https://github.com/open-lakehouse/open-lineage-connect", "OpenLineage events stored as Delta and Iceberg tables."),
    ],
  },
  {
    id: "ml-ai",
    title: "ML and AI",
    intro: "Models, traces and agents on top of the lakehouse.",
    items: [
      c("mlflow", "MLflow", "https://github.com/mlflow/mlflow", "Tracking, registry, GenAI tracing, evaluation and AI Gateway."),
      c("lakehouse-agent-kit", "lakehouse-agent-kit", "https://github.com/open-lakehouse/lakehouse-agent-kit", "Agent skills for the open lakehouse stack."),
      c("mcp", "Model Context Protocol", "https://modelcontextprotocol.io", "Open protocol for giving agents tools and data."),
    ],
  },
  {
    id: "specs",
    title: "Specs and protocols",
    intro: "The open interfaces that make every box swappable. Read these when two projects disagree.",
    items: [
      { name: "Delta Lake protocol", url: "https://github.com/delta-io/delta/blob/master/PROTOCOL.md", what: "How the Delta transaction log works." },
      { name: "Iceberg table spec", url: "https://iceberg.apache.org/spec/", what: "Iceberg metadata, manifests and snapshots." },
      { name: "Iceberg REST catalog spec", url: "https://iceberg.apache.org/rest-catalog-spec/", what: "The HTTP API catalogs implement for Iceberg." },
      { name: "Delta Sharing protocol", url: "https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md", what: "REST protocol for sharing live tables." },
      { name: "Spark Connect", url: "https://spark.apache.org/docs/latest/spark-connect-overview.html", what: "Spark's client-server protocol." },
      { name: "Arrow Flight SQL", url: "https://arrow.apache.org/docs/format/FlightSql.html", what: "SQL over Arrow Flight." },
      { name: "OpenLineage spec", url: "https://github.com/OpenLineage/OpenLineage/tree/main/spec", what: "The lineage event model and facets." },
    ],
  },
];
