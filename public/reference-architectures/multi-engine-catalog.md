# One catalog, many engines: Unity Catalog OSS with Spark, DuckDB, PyIceberg and Trino on Delta and Iceberg

> Write once, read from whatever engine fits the question.

A multi-engine catalog architecture puts an open catalog between the tables and every engine that uses them. Unity Catalog OSS stores table metadata in Postgres, exposes Delta tables through its own API and Iceberg tables through the Iceberg REST catalog specification, and vends short-lived storage credentials per table. Apache Spark, DuckDB, PyIceberg and Trino then read and write the same data without copies, and access is decided once, in the catalog.

## When to use it
- Different teams prefer different engines for the same data.
- You want to stop copying data into a warehouse per tool.
- You want storage credentials vended per table instead of shared keys.

## When not to
- Expecting identical feature support in every engine: write support differs by engine, format and catalog version.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Pipelines and notebooks | Create and update tables |  |
| Object storage | RustFS | S3-compatible storage with STS credentials | 1.0.0 |
| Open table format | Delta Lake | Catalog-managed Delta tables |  |
| Open table format | Apache Iceberg | Native Iceberg tables through Iceberg REST |  |
| Catalog | Unity Catalog OSS | Delta API, Iceberg REST catalog and credential vending | 0.7.0 |
| Catalog | PostgreSQL | Catalog metadata | 16.3 |
| Compute engines | Apache Spark | Delta notebooks on Spark 4.2.0; Iceberg notebooks on Spark 4.1.3 | 4.2.0 / 4.1.3 |
| Compute engines | PyIceberg | JVM-free Iceberg reads and writes |  |
| Compute engines | DuckDB | Attaches the Iceberg REST endpoint for SQL reads |  |
| Compute engines | Trino | Distributed SQL over the same catalog |  |
| Consumers | marimo | Reactive notebooks on :2718 and :2719 |  |

## How data flows
1. **Create through the catalog.** A Spark session configured with the Unity Catalog connector creates a managed Delta table, or an Iceberg table through the Iceberg REST endpoint.
2. **Catalog records metadata.** Unity Catalog stores the table, its location and its format in Postgres.
3. **Credentials are vended.** When an engine loads a table, the catalog returns short-lived storage credentials scoped to that table's path.
4. **Another engine reads.** DuckDB or PyIceberg connects to the same Iceberg REST endpoint and reads the table directly from object storage.

## Run it

### [open-lakehouse/unitycatalog-playground](https://github.com/open-lakehouse/unitycatalog-playground)

Unity Catalog OSS on your machine with Spark, Delta and Iceberg in marimo notebooks, Postgres for metadata and RustFS for storage.

```bash
git clone https://github.com/open-lakehouse/unitycatalog-playground.git
cd unitycatalog-playground
just uc=local start
```

### [open-lakehouse/unitycatalog-rs](https://github.com/open-lakehouse/unitycatalog-rs)

A Rust implementation of the same catalog APIs, useful when you want a single binary or Helm chart.

```bash
pip install 'unitycatalog-rs[all]'   # the Python client, the uc CLI, the server and the web UI
uc dev                               # a server on http://localhost:8080, with the web UI
uc catalog list                      # upstream's bin/uc commands
```

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

Chapter 11 has DuckDB read the Spark-written Iceberg tables through Unity Catalog 0.7's Iceberg REST endpoint.

## Caveats
- iceberg-spark-runtime exists only for Spark 4.0 and 4.1 at the time of writing, which is why the playground's Iceberg notebook runs Spark 4.1.3.
- The RustFS STS credential in the playground expires after 12 hours; refresh it with just uc=local rotate-creds.
- The playground needs at least 4 GB of Docker memory and is not for production.

## Industry use cases
- **Telecommunications: Network planning on many engines.** Run heavy jobs in Spark and interactive exploration in Trino against one catalog.
- **Cybersecurity: Threat hunting with any engine.** Hunt in DuckDB or Trino over the same tables that Spark writes.

## Frequently asked questions

### What is an Iceberg REST catalog?

An HTTP API defined by the Apache Iceberg project for creating, loading and committing Iceberg tables. Any engine that speaks it can use any catalog that implements it, including Unity Catalog OSS, Apache Polaris and Lakekeeper.

### Can Spark and DuckDB share the same tables?

Yes. Point both at the same catalog: Spark through the Unity Catalog connector or Iceberg REST, DuckDB through its Iceberg extension attached to the Iceberg REST endpoint.

### What is credential vending?

The catalog hands an engine short-lived storage credentials scoped to one table's location when the engine loads it, so engines never hold long-lived bucket keys.

## Sources
- [unitycatalog-playground README](https://github.com/open-lakehouse/unitycatalog-playground#readme)
- [Iceberg REST catalog spec](https://iceberg.apache.org/rest-catalog-spec/)
- [Unity Catalog OSS](https://github.com/unitycatalog/unitycatalog)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/multi-engine-catalog
