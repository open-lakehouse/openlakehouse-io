# The open lakehouse on a laptop: Spark, Delta Lake, Unity Catalog, Kafka, Airflow and MLflow in Docker

> The whole stack, one command at a time, on the machine in front of you.

The open lakehouse on a laptop is a reference architecture that runs every layer of an open source data platform in Docker on one machine: SeaweedFS as S3-compatible object storage, Delta Lake tables registered in Unity Catalog OSS, Apache Spark 4.1 behind a Spark Connect server, Apache Kafka for events, Apache Airflow 3 for orchestration and MLflow 3 for tracking. It exists so that a data engineer, a student or an AI agent can build, test and tear down a real lakehouse without a cloud account, and then point the same code at a cloud deployment.

## When to use it
- You want to learn how the layers of an open lakehouse fit together by running them.
- You need a local integration environment where pipelines run against a real catalog and object store before they reach production.
- You want an AI coding agent to have a full, disposable stack to work against.

## When not to
- Production workloads: the repo states that production hardening is out of scope.
- Writing Iceberg tables through the catalog: Unity Catalog OSS 0.6.0 accepts Delta writes only, and its Iceberg REST adapter is read-only.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Event producers and sample data | Generate order events for the demos |  |
| Ingestion and streaming | Apache Kafka | Event bus on :9092 | Confluent 7.5.0 images |
| Object storage | SeaweedFS | S3 API on :8333, bucket s3://lakehouse | 3.80 |
| Open table format | Delta Lake | The write path; every demo writes Delta into Unity Catalog | 4.3.1 |
| Open table format | Apache Iceberg | Read surface for other engines through Unity Catalog's Iceberg REST endpoint | 1.10.0 |
| Catalog | Unity Catalog OSS | The only catalog, on :8081 | 0.6.0 |
| Catalog | PostgreSQL | Unity Catalog metadata store | 16 |
| Compute engines | Apache Spark | Batch and Structured Streaming jobs, Connect-first | 4.1.0 (Scala 2.13, Java 21) |
| Compute engines | Spark Declarative Pipelines | Derives silver and gold from bronze | Spark 4.1 |
| Orchestration | Apache Airflow | Schedules the pipelines on :8085 | 3.1.6 |
| ML and AI | MLflow | Tracking server and AI Gateway on :5000 and :5001 | 3.14.0 |
| Serving | Spark Connect | gRPC endpoint sc://localhost:15002 for every client | 4.1.0 |
| Serving | Delta Sharing | Opt-in external sharing on :8443 | server 1.3.10 |
| Consumers | Next.js dashboard | Read-only viewer on :3000 |  |
| Consumers | Jupyter | Optional notebooks |  |

## How data flows
1. **Events arrive.** A producer writes order events to a Kafka topic.
2. **Bronze lands.** A Spark Structured Streaming job reads the topic and appends raw records to a bronze Delta table registered in Unity Catalog.
3. **Silver and gold derive.** Spark Declarative Pipelines reads bronze and maintains the silver and gold tables, which requires a Spark Connect server.
4. **Bytes stay in your bucket.** All table data and checkpoints live under s3://lakehouse/warehouse/ in SeaweedFS.
5. **Everything else reads.** Clients connect to sc://localhost:15002; DuckDB, Trino and PyIceberg read the same tables through Unity Catalog's Iceberg REST endpoint; the dashboard, MLflow and Delta Sharing recipients consume the results.

## Run it

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

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

A textbook course that builds an open lakehouse on a laptop one service per chapter, following one order-events story from storage to agents.

## Caveats
- Writes are Delta only in this stack. Unity Catalog OSS 0.6.0 rejects data_source_format=ICEBERG, so Iceberg is a read surface (docs/compatibility.md).
- Delta 4.2.0 fails catalog-managed Delta writes through Unity Catalog 0.6.x with "400 INVALID_ARGUMENT ... Invalid type_json". Delta 4.3.1 is the pin.
- Delta 4.0.x throws NoSuchMethodError on LogKey with Spark 4.1.
- The setup step downloads about 860 MB of JARs.

## Frequently asked questions

### Can I run a full open source lakehouse on a laptop?

Yes. The open-lakehouse repository runs Spark 4.1, Delta Lake 4.3.1, Unity Catalog OSS 0.6.0, Kafka, Airflow 3.1.6, MLflow 3.14.0 and SeaweedFS in Docker, started service by service with the ./lakehouse script.

### Why does the laptop stack write Delta and not Iceberg?

Unity Catalog OSS 0.6.0 only accepts Delta for writes and serves Iceberg read-only through its Iceberg REST endpoint. Unity Catalog 0.7.0 adds writable Iceberg REST, which the lakehouse masterclass uses.

### How do other engines read the tables?

DuckDB, Trino and PyIceberg read through Unity Catalog's Iceberg REST endpoint; Spark clients connect over Spark Connect at sc://localhost:15002.

## Sources
- [open-lakehouse README](https://github.com/open-lakehouse/open-lakehouse#readme)
- [docs/compatibility.md](https://github.com/open-lakehouse/open-lakehouse/blob/main/docs/compatibility.md)
- [docs/architecture.md](https://github.com/open-lakehouse/open-lakehouse/blob/main/docs/architecture.md)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/laptop-open-lakehouse
