# Streaming medallion: Kafka, Spark Structured Streaming and Delta Lake in Unity Catalog

> Events in, governed tables out, minutes or seconds behind the source.

A streaming medallion architecture applies the bronze, silver and gold layout to event streams. Apache Kafka buffers events, an Apache Spark Structured Streaming job appends them to a bronze Delta Lake table with exactly-once checkpointing, and downstream streaming or declarative pipelines keep silver and gold tables up to date. Because the tables are open and registered in Unity Catalog OSS, batch jobs, BI tools and other engines read the same data the stream writes.

## When to use it
- Sources emit events continuously and consumers want tables, not topics.
- Latency of seconds to minutes is enough.
- You want one copy of history that both streaming and batch jobs read.

## When not to
- Request-path latency in milliseconds: see the real-time streaming pattern.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Applications, devices and CDC | Emit events |  |
| Ingestion and streaming | Debezium | Turns database changes into Kafka events |  |
| Ingestion and streaming | Apache Kafka | Durable event buffer | Confluent 7.5.0 images |
| Object storage | SeaweedFS | Tables and streaming checkpoints | 3.80 |
| Open table format | Delta Lake | Bronze, silver and gold tables | 4.3.1 |
| Catalog | Unity Catalog OSS | Registers every layer | 0.6.0 |
| Compute engines | Apache Spark | Structured Streaming from Kafka to bronze | 4.1.0 |
| Compute engines | Spark Declarative Pipelines | Silver and gold derived from bronze |  |
| Orchestration | Apache Airflow | Runs the batch side and maintenance | 3.1.6 |
| Serving | Spark Connect | Remote query access |  |
| Consumers | Next.js dashboard | Live views over gold |  |

## How data flows
1. **Buffer events.** Producers write JSON events to Kafka topics.
2. **Append to bronze.** A Structured Streaming query reads Kafka and appends to a bronze Delta table; its checkpoint makes the write exactly-once.
3. **Clean and deduplicate.** Silver applies a watermark and dropDuplicates so late and repeated events are handled deterministically.
4. **Aggregate.** Gold computes windowed aggregates, such as one-minute counts, and joins static dimension tables.
5. **Read anywhere.** Because every layer is a catalog table, batch jobs and other engines read the same data.

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

Chapter 9 builds Kafka to Structured Streaming to bronze on the course stack.

## Caveats
- Match the Kafka connector to your Spark version exactly; a spark-sql-kafka build for one Spark minor version can fail with NoSuchMethodError on another.
- Kafka is not registered in the catalog in the open-lakehouse stack; only the tables are.

## Industry use cases
- **Payments and fintech: Streaming payment history into tables.** Land every gateway event in a bronze table and keep silver current within seconds.
- **Manufacturing: Telemetry into tables.** Land MQTT and OPC UA readings in bronze and keep asset-level silver current.
- **Retail and e-commerce: Real-time inventory.** Keep stock positions current from POS and warehouse events so online orders do not oversell.
- **Retail and e-commerce: Clickstream to sessions.** Sessionize web and app events with watermarks and land them as tables for funnel analysis.
- **Telecommunications: CDR processing.** Process mediation files into rated usage tables every few minutes.
- **Cybersecurity: Security data lake.** Normalize every source to OCSF in silver and keep years of history cheaply.

## Frequently asked questions

### How do I stream Kafka into Delta Lake with open source tools?

Run an Apache Spark Structured Streaming query with the Kafka source and a Delta sink with a checkpoint location; register the table in Unity Catalog OSS so other engines can find it.

### Is the Kafka to Delta write exactly-once?

Yes for the table: Structured Streaming records Kafka offsets in its checkpoint and commits each micro-batch to the Delta log atomically, so a restarted query neither skips nor duplicates batches.

## Sources
- [open-lakehouse docs/architecture.md](https://github.com/open-lakehouse/open-lakehouse/blob/main/docs/architecture.md)
- [Structured Streaming + Kafka integration](https://spark.apache.org/docs/latest/streaming/structured-streaming-kafka-integration.html)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/streaming-medallion
