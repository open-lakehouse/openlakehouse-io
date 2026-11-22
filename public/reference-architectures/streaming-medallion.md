# Streaming medallion: Kafka, Spark Structured Streaming and Apache Iceberg in Unity Catalog

> Events in, governed tables out, seconds behind the source.

A streaming medallion architecture applies the bronze, silver and gold layout to event streams. Apache Kafka buffers events, an Apache Spark Structured Streaming query appends them to a bronze Apache Iceberg table with its checkpoint on object storage, and a Spark Declarative Pipeline derives silver and gold. Because the tables are open and registered in Unity Catalog OSS, batch jobs, other engines and AI agents read the same data the stream writes.

## When to use it
- Sources emit events continuously and consumers want tables, not topics.
- Latency of seconds to minutes is enough.
- You want one copy of history that streaming jobs, batch jobs and agents all read.

## When not to
- Request-path latency in milliseconds: see the real-time streaming architecture.

## Components

| Capability | Component | Role | Version |
|---|---|---|---|
| Source systems | Applications, devices and CDC | Emit events |  |
| Event streaming | Apache Kafka | Durable event buffer (the orders topic) | Confluent 7.5.0 images |
| Change data capture | Debezium | Turns database changes into Kafka events |  |
| Spark Connect sessions | Spark Connect | The streaming query runs over Spark Connect | 4.3.0 |
| Declarative pipelines | Spark Declarative Pipelines | Silver and gold derived from bronze | 4.3.0 |
| Structured Streaming | Apache Spark | Kafka to iceberg.bronze.orders_raw, checkpoint at s3a://lakehouse/_checkpoints | 4.3.0 |
| Catalog and credentials | Unity Catalog OSS | Iceberg REST catalog for every layer | 0.7.0 |
| Open table format | Apache Iceberg | Bronze, silver and gold tables |  |
| Object storage | SeaweedFS | Tables and streaming checkpoints | 4.51 |
| Orchestration | Apache Airflow | Runs the batch side and table maintenance | 3.3.2 |
| Table maintenance | Iceberg maintenance procedures | Compaction keeps small streaming files in check |  |

## How data flows
1. **Buffer events.** Producers write JSON events to a Kafka topic, including resends and late events.
2. **Append to bronze.** A Structured Streaming query reads Kafka and appends to a bronze Iceberg table; its checkpoint makes the write exactly-once.
3. **Clean and deduplicate.** Silver handles late and repeated events deterministically.
4. **Aggregate.** Gold computes the aggregates consumers read.
5. **Compact.** Streaming writes many small files; a scheduled rewrite_data_files keeps reads fast.

## Run it

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

Chapter 9 streams Kafka into iceberg.bronze.orders_raw over Spark Connect; chapter 8 builds silver and gold; chapter 10 adds maintenance.

### [open-lakehouse/open-lakehouse](https://github.com/open-lakehouse/open-lakehouse)

The same flow writing Delta Lake bronze into Unity Catalog 0.6.0.

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
- Match the Kafka connector to your Spark version exactly; a spark-sql-kafka build for one Spark minor version can fail with NoSuchMethodError on another.
- Kafka itself is not registered in the catalog; only the tables are.

## Industry use cases
- **Payments and fintech: Streaming payment history into tables.** Land every gateway event in a bronze table and keep silver current within seconds.
- **Manufacturing: Telemetry into tables.** Land MQTT and OPC UA readings in bronze and keep asset-level silver current.
- **Retail and e-commerce: Real-time inventory.** Keep stock positions current from POS and warehouse events so online orders do not oversell.
- **Retail and e-commerce: Clickstream to sessions.** Sessionize web and app events with watermarks and land them as tables for funnel analysis.
- **Telecommunications: CDR processing.** Process mediation files into rated usage tables every few minutes.
- **Cybersecurity: Security data lake.** Normalize every source to OCSF in silver and keep years of history cheaply.

## Frequently asked questions

### How do I stream Kafka into Apache Iceberg with open source tools?

Run an Apache Spark Structured Streaming query with the Kafka source and an Iceberg table as the sink, with its checkpoint on object storage, and register the table in an Iceberg REST catalog such as Unity Catalog OSS 0.7 so other engines can read it.

### Is the Kafka to Iceberg write exactly-once?

Yes for the table: Structured Streaming records Kafka offsets in its checkpoint and commits each micro-batch atomically, so a restarted query neither skips nor duplicates batches.

## Sources
- [lakehouse-masterclass chapter 9](https://github.com/open-lakehouse/lakehouse-masterclass/blob/main/textbook/chapters/ch09-streaming.md)
- [Structured Streaming + Kafka integration](https://spark.apache.org/docs/latest/streaming/structured-streaming-kafka-integration.html)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/streaming-medallion
