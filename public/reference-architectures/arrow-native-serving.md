# Arrow-native serving: Arrow Flight SQL and Spark Connect clients over lakehouse tables

> Results leave as Arrow columns, not rows, in whatever language the client speaks.

Arrow-native serving delivers lakehouse query results as Apache Arrow record batches over gRPC instead of row-by-row JDBC. Two open protocols do this: Arrow Flight SQL, a generic SQL-over-Flight protocol, and Spark Connect, Spark's client-server protocol. A Flight SQL server built on Apache DataFusion can answer queries over Delta tables with policy enforcement and lineage built in, while Spark Connect lets thin clients in Python, Go, Rust, Swift and other languages send plans to a remote Spark and hand the Arrow results straight to DuckDB or Polars.

## When to use it
- Clients pull large result sets into Python, Rust or other analytical tools.
- You want to query the lakehouse from a language without a JVM.
- You want policy and lineage enforced at the serving edge.

## When not to
- Clients that only speak ODBC or JDBC: put a Flight SQL JDBC driver or a SQL gateway in front.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Open table format | Delta Lake | Tables served |  |
| Catalog | Unity Catalog OSS | Resolves tables and vends credentials |  |
| Compute engines | Apache DataFusion | Query engine inside the Flight SQL server | 55 |
| Compute engines | Apache Spark | Remote engine behind Spark Connect | 4.2.0 in the demos |
| Serving | hydrofoil | Flight SQL server with Cedar policy and OpenLineage |  |
| Serving | Arrow Flight SQL | Protocol |  |
| Serving | Spark Connect | gRPC protocol for Spark clients |  |
| Governance, lineage and policy | breakwater | Cedar enforcement in the DataFusion planner |  |
| Governance, lineage and policy | OpenLineage | Lineage emitted per query |  |
| Consumers | Spark Connect clients | Python, Scala, Go, Rust, OCaml, Swift clients |  |
| Consumers | DuckDB | Joins Arrow results locally |  |

## How data flows
1. **Client sends a query or plan.** A Flight SQL client sends SQL, or a Spark Connect client sends an unresolved logical plan over gRPC.
2. **Server resolves tables.** The server resolves table names through the catalog and obtains storage access.
3. **Policy applies.** In hydrofoil, Cedar policies are enforced inside the DataFusion plan before execution.
4. **Arrow streams back.** Results stream to the client as Arrow record batches.
5. **Zero-copy downstream.** The client hands the same Arrow batches to DuckDB or Polars without conversion.

## Run it

### [open-lakehouse/hydrofoil](https://github.com/open-lakehouse/hydrofoil)

A Flight SQL server over open-table-format tables, built on DataFusion 55 with Cedar policy enforcement, OpenLineage and OpenTelemetry tracing.

### [lisancao/spark-demos](https://github.com/lisancao/spark-demos)

Demos 02 (Spark Connect setup), 08 (OCaml client) and 09 (Rust client with DuckDB 2.0 and Polars on the same Arrow batches).

## Caveats
- hydrofoil's README does not yet document running the Flight SQL server; its architecture is recorded in docs/adr.

## Frequently asked questions

### What is the difference between Arrow Flight SQL and Spark Connect?

Both stream Apache Arrow over gRPC. Flight SQL is a generic SQL protocol any engine can implement; Spark Connect carries Spark's own logical plans, so clients get the full DataFrame API of a remote Spark.

### Can I use Spark from Rust or Go?

Yes, through Spark Connect clients. spark-demos demo 09 uses the Rust client and passes the Arrow results to DuckDB and Polars.

## Sources
- [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
- [Spark Connect overview](https://spark.apache.org/docs/latest/spark-connect-overview.html)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/arrow-native-serving
