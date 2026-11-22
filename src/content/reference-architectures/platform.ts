// The open platform every reference architecture is drawn on.
//
// The board has five zones, left to right: sources, ingestion, the platform,
// serving, teams. The platform is drawn top to bottom the way an agentic
// lakehouse works: agents and their control plane, the engine access they
// get (Spark Connect), the execution modes that run their work, and the data
// foundation underneath, with governance and operations across all of it.
//
// Every architecture lights up the slots it uses. Unused slots show the
// typical open source choice, dimmed, so each board reads as a whole
// platform. `defaults` lists component ids, first one is the open default.

import type { Group, Slot, Team } from "./types";

export const GROUPS: Group[] = [
  { id: "sources", zone: "sources", name: "Sources", intro: "Where the data comes from." },
  { id: "ingest", zone: "ingest", name: "Ingestion", intro: "How data gets into the lakehouse." },
  { id: "ai", zone: "platform", name: "AI and agents", intro: "The agents, the control plane that decides what they may do, and the models behind them." },
  { id: "access", zone: "platform", name: "Engine access", intro: "How agents, apps and people reach compute: a client session per identity." },
  { id: "execution", zone: "platform", name: "Execution", intro: "Spark's execution modes, plus engines that read the same tables." },
  { id: "data", zone: "platform", name: "Data foundation", intro: "Open tables in a governed catalog, on storage you own." },
  { id: "governance", zone: "platform", name: "Governance", intro: "Who can see what, where it came from, whether it is right." },
  { id: "operations", zone: "platform", name: "Operations", intro: "Scheduling, keeping tables healthy, observing and deploying the platform." },
  { id: "serving", zone: "serving", name: "Serving", intro: "How results leave the lakehouse." },
];

export const SLOTS: Slot[] = [
  // ---------- Sources ----------
  { id: "sources", group: "sources", name: "Source systems", short: "Sources", question: "Where does the data come from?", what: "Operational databases, applications, devices, files and partner feeds. An industry lens fills this in with that industry's systems.", defaults: [] },

  // ---------- Ingestion ----------
  { id: "ingest-batch", group: "ingest", name: "Batch and file ingestion", short: "Batch loads", question: "How do files and extracts land?", what: "Loads files, extracts and API pulls into bronze tables, idempotently so reruns do not duplicate rows.", defaults: ["spark", "dlt"] },
  { id: "ingest-stream", group: "ingest", name: "Event streaming", short: "Events", question: "How do events arrive?", what: "A durable event log that producers append to and the lakehouse reads from by offset.", defaults: ["kafka"] },
  { id: "ingest-cdc", group: "ingest", name: "Change data capture", short: "CDC", question: "How do database changes arrive?", what: "Turns database transaction logs into change events and applies them to tables as current state and history.", defaults: ["debezium", "auto-cdc"] },

  // ---------- AI and agents ----------
  { id: "agent-harness", group: "ai", name: "Agent harness and policy", short: "Harness + policy", question: "What runs the agent, and who decides what it may do?", what: "Runs agents with tools and session state, and checks every tool call, model request and file operation against policies that allow it, deny it, or ask a person. Policies are set per session, per agent and server-wide.", defaults: ["omnigent"] },
  { id: "agent-sandbox", group: "ai", name: "Agent sandboxes", short: "Sandboxes", question: "Where does the agent's code run?", what: "An isolated container or microVM per agent session, locally or on a cluster. Provider credentials stay outside the sandbox; the agent gets only the scoped access it needs.", defaults: ["kubernetes", "omnigent-sandbox"] },
  { id: "agent-tools", group: "ai", name: "Tools and skills", short: "Tools", question: "What can the agent call?", what: "Named actions with named arguments (read a table, dry-run a pipeline, run one SQL statement) served over the Model Context Protocol, plus skills that carry version-pinned context.", defaults: ["mcp", "lakehouse-agent-kit"] },
  { id: "agent-models", group: "ai", name: "Models and gateway", short: "Models", question: "Which model does the agent use, and through what?", what: "Open-weight models served locally or on a cluster, and a gateway in front of hosted providers for routing, keys and cost limits.", defaults: ["ollama", "vllm", "mlflow"] },
  { id: "agent-observability", group: "ai", name: "Tracing and evaluation", short: "Traces + evals", question: "What did the agent do, and was it right?", what: "Records every agent step with inputs and outputs, and scores results against trusted data and judges.", defaults: ["mlflow", "opentelemetry"] },
  { id: "ml", group: "ai", name: "ML lifecycle", short: "ML models", question: "How are models trained, tracked and registered?", what: "Experiment tracking, a model registry and the table version each model trained on.", defaults: ["mlflow"] },

  // ---------- Engine access ----------
  { id: "spark-connect", group: "access", name: "Spark Connect sessions", short: "Spark Connect", question: "How do agents and apps reach Spark?", what: "A thin gRPC client per identity sends query plans to a remote Spark. In production each agent or tenant gets its own authenticated endpoint; in a sandbox it can point at a local Spark working on a subset of the data, against the same catalog.", defaults: ["spark-connect"] },

  // ---------- Execution ----------
  { id: "batch", group: "execution", name: "Batch and SQL", short: "Batch", question: "What runs scheduled and ad hoc work?", what: "Distributed batch jobs, DataFrames and SQL over the tables.", defaults: ["spark"] },
  { id: "pipelines", group: "execution", name: "Declarative pipelines", short: "Pipelines", question: "How are tables declared and kept up to date?", what: "Declare tables and flows; Spark infers dependencies, checks the graph with a dry run, and runs it. The output agents should write.", defaults: ["sdp"] },
  { id: "streaming", group: "execution", name: "Structured Streaming", short: "Streaming", question: "What processes events in micro-batches?", what: "Incremental processing of event streams with exactly-once table writes, watermarks and state.", defaults: ["spark", "flink"] },
  { id: "realtime", group: "execution", name: "Real-Time Mode", short: "Real-time", question: "What handles millisecond decisions?", what: "Continuous processing for decisions made while the event is still in flight.", defaults: ["spark-rtm", "flink"] },
  { id: "local", group: "execution", name: "Local mode (Project Feather)", short: "Local + Feather", question: "What runs an agent's small, fast queries?", what: "Spark in one process, with Spark 4.3's shuffle-free single-task execution for small queries. Fast to start and cheap, for prototyping and agent sandboxes.", defaults: ["spark-feather"] },
  { id: "sql", group: "execution", name: "Other engines", short: "Other engines", question: "What else reads the same tables?", what: "Engines that read the same governed tables through the catalog, without copies.", defaults: ["duckdb", "trino", "pyiceberg"] },

  // ---------- Data foundation ----------
  { id: "catalog", group: "data", name: "Catalog and credentials", short: "Catalog", question: "How do engines and agents find tables, and what may they touch?", what: "Namespaces, schemas and permissions over an API, and short-lived storage credentials vended per table and identity.", defaults: ["unity-catalog", "polaris", "lakekeeper"] },
  { id: "format", group: "data", name: "Open table format", short: "Table format", question: "What turns files into tables?", what: "ACID transactions, schema evolution, snapshots and time travel over Parquet files.", defaults: ["iceberg", "delta", "hudi"] },
  { id: "storage", group: "data", name: "Object storage", short: "Storage", question: "Where do the bytes live?", what: "S3-compatible object storage you control.", defaults: ["seaweedfs", "rustfs", "minio", "s3"] },

  // ---------- Governance ----------
  { id: "access-policy", group: "governance", name: "Access control and policy", short: "Access policy", question: "Who may read which rows and columns?", what: "Grants, row filters and column masks, enforced the same way in every engine.", defaults: ["unity-catalog", "cedar", "openfga", "opa"] },
  { id: "lineage", group: "governance", name: "Lineage", short: "Lineage", question: "Where did this value come from?", what: "Events from every job and query describing what was read and written, down to columns.", defaults: ["openlineage", "marquez"] },
  { id: "quality", group: "governance", name: "Data quality and contracts", short: "Quality", question: "Is the data right?", what: "Expectations and contracts checked as data lands and before it is published.", defaults: ["great-expectations", "soda-core"] },
  { id: "metadata", group: "governance", name: "Discovery and audit", short: "Discovery", question: "What data exists, and who used it?", what: "Search, ownership, glossary and an audit trail across the platform.", defaults: ["datahub", "openmetadata"] },

  // ---------- Operations ----------
  { id: "orchestration", group: "operations", name: "Orchestration", short: "Orchestration", question: "What runs the jobs, and when?", what: "Schedules, dependencies, retries and backfills. Agents trigger runs through it instead of racing scheduled ones.", defaults: ["airflow", "dagster", "temporal"] },
  { id: "maintenance", group: "operations", name: "Table maintenance", short: "Maintenance", question: "What keeps tables fast and storage bounded?", what: "Compaction, manifest rewrites and snapshot expiry, on a schedule.", defaults: ["iceberg-maintenance"] },
  { id: "observability", group: "operations", name: "Platform observability", short: "Observability", question: "Is the platform healthy?", what: "Metrics, logs and traces from every service, and the Spark UI and event logs for every job.", defaults: ["opentelemetry", "prometheus", "grafana"] },
  { id: "deploy", group: "operations", name: "Runtime, CI/CD and IaC", short: "Deploy", question: "Where does it run, and how do changes ship?", what: "The cluster or containers it runs on, infrastructure as code, and the pipeline that reviews and applies changes, including agents' pull requests.", defaults: ["kubernetes", "opentofu", "argocd"] },
  { id: "identity", group: "operations", name: "Identity and secrets", short: "Identity", question: "Who is each person, service and agent?", what: "Single sign-on for people, workload identity for services and agents, and secret storage.", defaults: ["keycloak", "spiffe", "openbao"] },

  // ---------- Serving ----------
  { id: "semantic", group: "serving", name: "Semantic layer", short: "Metrics", question: "Where are metrics defined once?", what: "Governed measures and dimensions that dashboards, notebooks and agents all query.", defaults: ["metric-views"] },
  { id: "bi", group: "serving", name: "Dashboards and notebooks", short: "BI + notebooks", question: "Where do people look at results?", what: "BI dashboards and notebooks over the governed tables.", defaults: ["superset", "marimo", "jupyter"] },
  { id: "apps", group: "serving", name: "Apps and APIs", short: "Apps + APIs", question: "How do applications get results?", what: "Arrow Flight SQL, Kafka topics and key-value stores for applications.", defaults: ["flight-sql", "kafka-sink"] },
  { id: "sharing", group: "serving", name: "Data sharing", short: "Sharing", question: "How do other organizations get live data?", what: "An open protocol for read access to live tables without copying them.", defaults: ["delta-sharing"] },
];

export const TEAMS: Team[] = [
  {
    id: "data-engineering",
    name: "Data engineers",
    cares: "Pipelines that are correct, idempotent and cheap to rerun.",
    slots: ["ingest-batch", "ingest-stream", "ingest-cdc", "batch", "pipelines", "streaming", "realtime", "orchestration", "quality", "maintenance", "format"],
    learn: [
      { label: "Spark Masterclass (book)", href: "https://lisancao.github.io/spark-masterclass/" },
      { label: "Lakehouse masterclass, chapters 7 to 10", href: "https://github.com/open-lakehouse/lakehouse-masterclass/tree/main/textbook/chapters" },
      { label: "Getting started with Apache Spark", href: "/learn/getting-started/apache-spark" },
    ],
  },
  {
    id: "agents",
    name: "AI agents",
    cares: "Tools with clear arguments, a sandbox to write into, fast feedback from dry runs, and version-pinned context.",
    slots: ["agent-tools", "agent-sandbox", "spark-connect", "local", "pipelines", "semantic"],
    learn: [
      { label: "Agentic data engineering", href: "/agentic-data-engineering" },
      { label: "The agentic lakehouse", href: "/agentic-lakehouse" },
      { label: "Lakehouse masterclass, chapter 3", href: "https://github.com/open-lakehouse/lakehouse-masterclass/blob/main/textbook/chapters/ch03-agentic-data-engineering.md" },
    ],
  },
  {
    id: "ai-engineering",
    name: "ML and AI engineers",
    cares: "Reproducible models, traced and evaluated agents, and a model gateway they control.",
    slots: ["ml", "agent-models", "agent-observability", "agent-harness", "agent-tools"],
    learn: [
      { label: "Getting started with MLflow", href: "/learn/getting-started/mlflow" },
      { label: "Getting started with Omnigent", href: "/learn/getting-started/omnigent" },
      { label: "Lakehouse masterclass, chapters 12 and 13", href: "https://github.com/open-lakehouse/lakehouse-masterclass/tree/main/textbook/chapters" },
    ],
  },
  {
    id: "analytics",
    name: "Analysts and analytics engineers",
    cares: "One definition of each metric, fast SQL, and dashboards that match.",
    slots: ["sql", "semantic", "bi", "batch"],
    learn: [
      { label: "Spark metric views demo", href: "https://github.com/lisancao/spark-demos/tree/main/demos/01_metrics_views" },
      { label: "DuckDB Delta grows up", href: "/blog/delta-lake/duckdb-delta-grows-up" },
    ],
  },
  {
    id: "platform",
    name: "Platform engineers",
    cares: "A platform that is boring to run: deployable from code, observable, with identities for every person, service and agent.",
    slots: ["storage", "catalog", "deploy", "identity", "observability", "agent-sandbox", "spark-connect"],
    learn: [
      { label: "open-lakehouse repository", href: "https://github.com/open-lakehouse/open-lakehouse" },
      { label: "Getting started with Unity Catalog", href: "/learn/getting-started/unity-catalog" },
    ],
  },
  {
    id: "governance",
    name: "Governance and security",
    cares: "Policies that hold in every engine and for every agent, lineage for audits, and least privilege by default.",
    slots: ["access-policy", "lineage", "metadata", "catalog", "agent-harness", "identity"],
    learn: [
      { label: "Open governance", href: "/technologies/open-governance" },
      { label: "Policy pushdown and open lineage", href: "/reference-architectures/policy-and-lineage" },
    ],
  },
  {
    id: "partners",
    name: "External partners",
    cares: "Live, read-only access to the tables they are entitled to.",
    slots: ["sharing"],
    learn: [{ label: "Open data sharing", href: "/reference-architectures/open-data-sharing" }],
  },
];

export const groupById = (id: string) => GROUPS.find((g) => g.id === id)!;
export const slotById = (id: string) => SLOTS.find((s) => s.id === id)!;
export const slotsInGroup = (group: string) => SLOTS.filter((s) => s.group === group);
export const PLATFORM_GROUPS = ["ai", "access", "execution", "data"] as const;
export const PLATFORM_BANDS = ["governance", "operations"] as const;
/** Slots that always show, even in the simplified view. */
export const CORE_SLOTS = ["catalog", "format", "storage", "spark-connect"];
