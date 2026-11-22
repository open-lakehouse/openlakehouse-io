# Batch medallion with Spark Declarative Pipelines: Spark 4.3, Apache Iceberg and Unity Catalog with bronze, silver and gold

> Declare the tables, let Spark work out the order, keep every layer in an open format.

A batch medallion architecture organizes lakehouse tables into three layers: bronze holds raw records as they arrived, silver holds cleaned and conformed records, and gold holds aggregates shaped for a specific use. In this open reference architecture, Spark Declarative Pipelines (Spark 4.1 and later) defines each layer as a table or materialized view, Spark resolves the dependency graph and runs it, the tables are Apache Iceberg in Unity Catalog OSS 0.7 on S3-compatible storage, Apache Airflow schedules and backfills the runs, and DuckDB reads the gold tables through the catalog's Iceberg REST endpoint.

## When to use it
- Your sources arrive as files, extracts or database snapshots on a schedule.
- You want idempotent bronze loads and reproducible silver and gold tables.
- You want to change a transformation without hand-ordering every downstream job.

## When not to
- Sub-second latency: use the real-time streaming pattern.
- Teams that need a released Iceberg runtime for Spark 4.3 today: the course builds one from an open Iceberg pull request as a temporary step.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Order-event generator and batch extracts | Daily and hourly files |  |
| Ingestion and streaming | Idempotent bronze loader | Appends each batch once, keyed so reruns do not duplicate |  |
| Ingestion and streaming | AUTO CDC (Spark Declarative Pipelines) | Applies change feeds as SCD type 1 or 2 |  |
| Object storage | SeaweedFS | s3://lakehouse/warehouse | 4.51 |
| Open table format | Apache Iceberg | Bronze, silver and gold tables | runtime 4.3_2.13 built from apache/iceberg#18749 |
| Catalog | Unity Catalog OSS | Writable Iceberg REST catalog | 0.7.0 |
| Compute engines | Apache Spark | Runs the pipeline over Spark Connect | 4.3.0 |
| Compute engines | Spark Declarative Pipelines | Declares bronze to silver to gold and resolves order | pyspark[pipelines]==4.3.0 |
| Orchestration | Apache Airflow | DAG with schedules and backfills | 3.3.2 |
| ML and AI | MLflow | Logs the gold snapshot id with each model run | 3.1.0 |
| Serving | DuckDB | Reads gold through Iceberg REST | 1.5.6 |
| Consumers | Analysts and notebooks | Query gold tables |  |

## How data flows
1. **Land bronze once.** Each batch is appended to a bronze Iceberg table with a key that makes reruns idempotent.
2. **Declare silver and gold.** A Spark Declarative Pipelines spec declares silver as cleaned bronze and gold as aggregates over silver.
3. **Spark plans the graph.** spark-pipelines run resolves dependencies, creates or updates each table in Unity Catalog and records the run.
4. **Airflow schedules.** An Airflow DAG triggers the pipeline on a schedule and replays past intervals for backfills.
5. **Serve from the same tables.** DuckDB attaches the Unity Catalog Iceberg REST endpoint and queries gold without copying it.

## Run it

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

Chapters 6 to 11 build this pattern: Iceberg through Unity Catalog, idempotent bronze, the SDP medallion, Airflow backfills and DuckDB serving.

### [open-lakehouse/open-lakehouse](https://github.com/open-lakehouse/open-lakehouse)

An open reference architecture for the lakehouse that runs on Docker, deploys to AWS, and is designed so an AI agent can set it up and tear it down.

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

### [lisancao/spark-demos](https://github.com/lisancao/spark-demos)

Demo 16 includes an AUTO CDC flow that writes SCD type 2 into Iceberg on Spark 4.3.0.

## Caveats
- There is no released Iceberg Spark runtime for Spark 4.3 yet; the course's chapter 5.5 builds it from apache/iceberg#18749 as a temporary step.
- Unity Catalog 0.7 or later is required for Iceberg writes through its REST catalog.
- Older SeaweedFS releases have an S3A _temporary rename bug; the course pins 4.51.

## Industry use cases
- **Payments and fintech: Ledger reconciliation.** Match gateway, processor and bank files every day and surface the breaks.
- **Healthcare providers: FHIR bulk export to OMOP.** Land FHIR NDJSON in bronze and transform it into the OMOP common data model.
- **Manufacturing: Quality and scrap analytics.** Join MES quality checks with ERP orders every shift to find where scrap comes from.
- **Energy and utilities: Meter data at scale.** Process billions of interval reads a day through bronze, VEE silver and billing gold.

## Frequently asked questions

### What is a medallion architecture?

A layout of lakehouse tables in three layers: bronze for raw data as it arrived, silver for cleaned and conformed data, and gold for aggregates built for a specific consumer.

### Do I need Databricks to use declarative pipelines?

No. Spark Declarative Pipelines is part of open source Apache Spark from 4.1, run with the spark-pipelines CLI against a Spark Connect server.

### Can DuckDB read tables that Spark writes?

Yes, when both go through the same catalog. In the masterclass, DuckDB attaches Unity Catalog's Iceberg REST endpoint and reads the gold Iceberg tables Spark wrote.

## Sources
- [lakehouse-masterclass COURSE.md](https://github.com/open-lakehouse/lakehouse-masterclass)
- [Spark Declarative Pipelines guide](https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/batch-medallion
