# The open lakehouse on a laptop: Spark 4.3, Apache Iceberg, Unity Catalog, Kafka, Airflow, MLflow and an agent, in Docker

> The whole stack, one service at a time, on the machine in front of you.

The open lakehouse on a laptop runs every layer of an open source data platform in Docker on one machine: SeaweedFS as S3-compatible storage, Apache Iceberg tables in Unity Catalog OSS 0.7 through its Iceberg REST endpoint, Apache Spark 4.3 behind a Spark Connect server, Spark Declarative Pipelines for the medallion, Kafka for events, Airflow 3 for scheduling and table maintenance, DuckDB reading the same tables, MLflow for models, and an AI agent on Omnigent with a local model, MCP tools and policies. It exists so a data engineer, a student or an AI agent can build, test and tear down a real lakehouse without a cloud account.

## When to use it
- You want to learn how the layers of an open lakehouse fit together by building them.
- You need a local integration environment with a real catalog and object store.
- You want an AI agent to have a full, disposable stack to work against.

## When not to
- Production: the course's Terraform chapter is illustrative and not applied.
- Teams that need a released Iceberg runtime for Spark 4.3 today: the course builds one from an open Iceberg pull request.

## Components

| Capability | Component | Role | Version |
|---|---|---|---|
| Source systems | Order-event generator | Batch and streaming order events, the course's one dataset |  |
| Batch and file ingestion | Idempotent bronze loader | Appends each batch once |  |
| Event streaming | Apache Kafka | Order events for the streaming chapter | Confluent 7.5.0 images |
| Agent harness and policy | Omnigent | Runs the SDP agent and evaluates ALLOW, DENY and ASK policies on every tool call | 0.22.0 |
| Tools and skills | Model Context Protocol | Named tools: read and write pipeline files, dry-run or run the pipeline, run one SQL statement; no shell |  |
| Models and gateway | Ollama | Local model sdp-qwen3, built from qwen3:14b with a 16K context window |  |
| ML lifecycle | MLflow | Tracks a model trained on gold and logs the gold snapshot id | 3.1.0 |
| Spark Connect sessions | Spark Connect | sc://spark-connect:15002 for every client, the agent included | 4.3.0 |
| Batch and SQL | Apache Spark | Ingestion and queries over Spark Connect | 4.3.0 |
| Declarative pipelines | Spark Declarative Pipelines | Bronze to silver to gold; the agent's output, gated on a dry run | pyspark[pipelines]==4.3.0 |
| Structured Streaming | Apache Spark | Kafka to iceberg.bronze.orders_raw with a checkpoint on S3 | 4.3.0 |
| Other engines | DuckDB | Reads gold through the Iceberg REST endpoint | 1.5.6 |
| Catalog and credentials | Unity Catalog OSS | Writable Iceberg REST catalog; a sandbox namespace for the agent | 0.7.0 |
| Open table format | Apache Iceberg | Bronze, silver and gold tables; snapshots for time travel and rollback | runtime 4.3_2.13 built from apache/iceberg#18749 |
| Object storage | SeaweedFS | s3://lakehouse/warehouse | 4.51 |
| Orchestration | Apache Airflow | Schedules the medallion with backfills | 3.3.2 |
| Table maintenance | Iceberg maintenance procedures | A DAG that runs rewrite_data_files, rewrite_manifests and expire_snapshots |  |

## How data flows
1. **Storage and compute.** SeaweedFS serves the S3 API; Spark 4.3 runs behind a Spark Connect server that every client, including the agent, reaches at sc://.
2. **Tables and catalog.** Unity Catalog OSS 0.7 is the Iceberg REST catalog; tables are named iceberg.<namespace>.<table>, and the agent gets its own sandbox namespace.
3. **Bronze, silver, gold.** Batch loads and a Structured Streaming job land bronze; a Spark Declarative Pipeline derives silver and gold.
4. **Schedule and maintain.** Airflow runs the pipeline with backfills and a second DAG compacts files and expires snapshots.
5. **Serve and learn.** DuckDB reads gold through the same catalog, MLflow trains on it and records the snapshot id.
6. **Hand it to an agent.** An agent on Omnigent with a local model and MCP tools writes pipelines into its sandbox; policies require a passing dry run and ask before code pulls results onto one machine.

## Run it

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

The course that builds this stack chapter by chapter, from storage to agents. You write the Compose file yourself; there is no single command.

### [open-lakehouse/open-lakehouse](https://github.com/open-lakehouse/open-lakehouse)

The same layers prebuilt, writing Delta Lake into Unity Catalog 0.6.0 with Spark 4.1, started with one script.

```bash
git clone https://github.com/open-lakehouse/open-lakehouse
cd open-lakehouse

cp .env.example .env       # fill in POSTGRES_*, S3_* placeholders
./lakehouse setup          # validate env, install deps, download ~860MB of JARs
./lakehouse start all      # Spark 4.1 master + worker + Connect server + Kafka
./lakehouse start unity-catalog
./lakehouse start mlflow
./lakehouse status --json  # confirm healthy (incl. spark.connect_grpc_listening)
```

## Caveats
- There is no released Iceberg Spark runtime for Spark 4.3; chapter 5.5 builds it from apache/iceberg#18749 as a temporary step.
- Unity Catalog 0.7 or later is required for Iceberg writes through its REST catalog.
- The course recommends 16 GB of RAM; the agent's model needs about 12 GB of memory.
- Older SeaweedFS releases have an S3A _temporary rename bug; the course pins 4.51.
- In open-lakehouse, writes are Delta only: Unity Catalog 0.6.0 serves Iceberg read-only.

## Frequently asked questions

### Can I run a full open source lakehouse on a laptop?

Yes. The lakehouse masterclass builds Iceberg tables in Unity Catalog OSS 0.7 on SeaweedFS with Spark 4.3, Kafka, Airflow 3.3.2, DuckDB and MLflow in Docker, and adds an AI agent on Omnigent with a local Ollama model. The open-lakehouse repository offers a prebuilt Delta variant.

### Can an AI agent work on a local lakehouse safely?

Yes. In the masterclass the agent writes only to its own sandbox namespace, uses named MCP tools instead of a shell, and policies require a passing dry run before any pipeline runs.

### How do other engines read the tables?

Through Unity Catalog's Iceberg REST endpoint. DuckDB attaches it and reads the gold tables Spark wrote, without copies.

## Sources
- [lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)
- [open-lakehouse docs/compatibility.md](https://github.com/open-lakehouse/open-lakehouse/blob/main/docs/compatibility.md)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/laptop-open-lakehouse
