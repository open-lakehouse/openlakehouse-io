# Open data sharing: Delta Sharing servers over Unity Catalog and open tables

> Share live tables with another organization without copying them or sending files.

Open data sharing is an architecture for giving another organization read access to live lakehouse tables through an open protocol instead of file exports. A Delta Sharing server authenticates the recipient, checks which shares and tables they may read, and returns short-lived URLs or credentials for the underlying files; the recipient reads them with any Delta Sharing client, including pandas, Spark and other engines. Data stays in the provider's storage and the recipient always sees the current version.

## When to use it
- Partners, customers or regulators need recurring access to the same tables.
- You want to stop running file-drop jobs.
- Recipients use different tools than you do.

## When not to
- Write access for recipients: the protocol is read-only.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Provider pipelines | Maintain the tables to share |  |
| Object storage | Amazon S3 | Provider's bucket; data never moves |  |
| Open table format | Delta Lake | Shared tables |  |
| Catalog | Unity Catalog OSS | Source of shares and table locations |  |
| Serving | Delta Sharing | Open REST protocol for recipients | server 1.3.10 in open-lakehouse |
| Serving | distributary | Composable Rust sharing server with Postgres or SQLite stores |  |
| Compute engines | Apache Spark | Provider-side writes |  |
| Consumers | Recipients: pandas, Spark, BI tools | Read with a bearer token profile |  |

## How data flows
1. **Define a share.** The provider groups tables into a share and grants it to a recipient.
2. **Issue a profile.** The recipient receives a profile file with the server endpoint and a bearer token.
3. **Recipient queries.** The client lists shares and tables and asks to read one, optionally with predicate hints.
4. **Server returns file URLs.** The server checks the grant and returns short-lived URLs for the current table files.
5. **Read directly.** The client reads Parquet files from the provider's storage; nothing is copied into the recipient's platform.

## Run it

### [open-lakehouse/distributary](https://github.com/open-lakehouse/distributary)

OpenSharing and Delta Sharing in Rust: protocol models, client, admin API and a composable sharing server.

```bash
cargo check --workspace --all-features
cargo nextest run --workspace --all-features
```

### [open-lakehouse/unitycatalog-rs](https://github.com/open-lakehouse/unitycatalog-rs)

A catalog that serves a Delta Sharing server alongside the Unity Catalog, Delta and Iceberg REST APIs.

```bash
pip install 'unitycatalog-rs[all]'   # the Python client, the uc CLI, the server and the web UI
uc dev                               # a server on http://localhost:8080, with the web UI
uc catalog list                      # upstream's bin/uc commands
```

### [open-lakehouse/open-lakehouse](https://github.com/open-lakehouse/open-lakehouse)

Ships an opt-in Delta Sharing server (1.3.10) on :8443 next to the rest of the stack.

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
- distributary's README gives developer commands only; its architecture document plans presigned-URL queries, change data feed and recipient tokens.

## Industry use cases
- **Healthcare providers: Research data sharing.** Share de-identified cohorts with a university partner as live tables.
- **Manufacturing: Supplier data exchange.** Share quality and demand tables with suppliers as live tables.
- **Energy and utilities: Regulator and partner sharing.** Share reliability metrics with regulators as live tables.
- **Retail and e-commerce: Supplier collaboration.** Share sell-through and stock tables with suppliers instead of sending reports.

## Frequently asked questions

### What is Delta Sharing?

An open REST protocol, governed with Delta Lake under the Linux Foundation, for sharing live tables across organizations. Recipients read the provider's files through short-lived URLs with any compatible client.

### Do recipients need the same platform as the provider?

No. Clients exist for pandas, Apache Spark and other tools, and the open-lakehouse repos include Rust implementations of the server and client.

## Sources
- [Delta Sharing protocol](https://github.com/delta-io/delta-sharing/blob/main/PROTOCOL.md)
- [distributary](https://github.com/open-lakehouse/distributary)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/open-data-sharing
