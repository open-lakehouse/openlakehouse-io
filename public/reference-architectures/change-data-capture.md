# Change data capture with SCD type 2: AUTO CDC in Spark Declarative Pipelines, from a Kafka change feed into Apache Iceberg

> Keep the current state and every past version of each row, without hand-written MERGE logic.

Change data capture (CDC) with slowly changing dimensions type 2 turns a feed of row-level changes from an operational system into a table that holds both the current state and the full history of each row. In open source Apache Spark 4.3, an AUTO CDC flow in Spark Declarative Pipelines reads the change feed, orders events by a sequence column, applies inserts, updates and deletes by key, and stores the result as SCD type 2: a change to a tracked column closes the old version and opens a new one, while changes to untracked columns update the current version in place. The target must support row-level operations, which Apache Iceberg provides.

## When to use it
- An operational database or service emits change events and you need its tables in the lakehouse.
- Auditors or analysts ask what a row looked like at a past point in time.
- You want to stop maintaining hand-written MERGE statements for every replicated table.

## When not to
- Targets without row-level operations: AUTO CDC needs a DSv2 table that supports them.
- Spark releases before 4.3 for this exact flow; the reference demo is verified on Spark 4.3.0.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Operational database or service | Emits one event per insert, update or delete |  |
| Ingestion and streaming | Debezium | Turns database transaction logs into change events |  |
| Ingestion and streaming | Apache Kafka | The change feed topic (menu-changes in the demo) | apache/kafka 4.0.0 image |
| Object storage | Local filesystem | Iceberg warehouse directory in the demo |  |
| Open table format | Apache Iceberg | SCD type 2 target with row-level operations | Spark 4.3 runtime built from source |
| Catalog | Iceberg hadoop catalog | Declared in the pipeline spec |  |
| Compute engines | Spark Declarative Pipelines | Runs the pipeline with spark-pipelines run | pyspark==4.3.0 |
| Compute engines | AUTO CDC (Spark Declarative Pipelines) | KEYS, SEQUENCE BY, APPLY AS DELETE WHEN, STORED AS SCD TYPE 2 |  |
| Consumers | Analysts and audit queries | Read current rows or any past version |  |

## How data flows
1. **Changes are published.** Each insert, update or delete arrives on a Kafka topic as one JSON event with a key, a sequence number and an operation.
2. **Read the feed.** A Python table in the pipeline reads the topic with Structured Streaming and parses each event.
3. **Apply by key, in order.** The AUTO CDC flow groups events by key and orders them by the sequence column, so late or out-of-order events land correctly.
4. **Track history.** A change to a tracked column (price or station in the demo) closes the current version and opens a new one; a change to another column updates the current version in place; a delete closes the row's window.
5. **Query any point in time.** The Iceberg table holds every version with its validity window, so you can read the current state or the state at any past sequence.

## Run it

### [lisancao/spark-demos](https://github.com/lisancao/spark-demos)

Demo 16 (Spark 4.3 guide), scd2/ folder: a ghost-kitchen menu change feed on Kafka applied with AUTO CDC as SCD type 2 into Iceberg.

```bash
scd2/reset.sh       # Kafka up, an empty menu-changes topic, no table, no checkpoints
scd2/publish.sh scd2/incoming/batch-1.json && scd2/run.sh && scd2/history.sh
scd2/publish.sh scd2/incoming/batch-2.json && scd2/run.sh && scd2/history.sh
scd2/publish.sh scd2/incoming/batch-3.json && scd2/run.sh && scd2/history.sh
docker compose -f scd2/compose.yaml down -v   # when done
```

## Caveats
- Iceberg has not published a Spark 4.3 runtime (Maven Central stops at iceberg-spark-runtime-4.1); the demo builds iceberg-spark-runtime-4.3_2.13 from an Iceberg checkout with Spark 4.3 support.
- AUTO CDC needs a target that implements DSv2 row-level operations.
- The jars and spark.sql.extensions are static configs, so they are passed to spark-pipelines run, not set in the pipeline spec.
- Pipeline storage must be an absolute URI.

## Industry use cases
- **Banking: Core banking CDC into the lakehouse.** Keep a current and historical (SCD type 2) view of accounts without full nightly reloads.

## Frequently asked questions

### What is SCD type 2?

Slowly changing dimension type 2 keeps every version of a row: when a tracked attribute changes, the current version is closed and a new one is opened, so the table answers both what is true now and what was true at any earlier time.

### Can open source Spark do CDC without hand-written MERGE?

Yes. Spark Declarative Pipelines in Spark 4.3 has AUTO CDC flows: you declare the keys, the sequence column, the delete condition and STORED AS SCD TYPE 1 or 2, and Spark applies the change feed.

### How does AUTO CDC handle out-of-order events?

It orders events per key by the SEQUENCE BY column, so an event that arrives late is applied in sequence order rather than arrival order.

## Sources
- [spark-demos demo 16 README](https://github.com/lisancao/spark-demos/tree/main/demos/16_spark_43_guide)
- [menu.sql (the AUTO CDC flow)](https://github.com/lisancao/spark-demos/blob/main/demos/16_spark_43_guide/scd2/transformations/menu.sql)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/change-data-capture
