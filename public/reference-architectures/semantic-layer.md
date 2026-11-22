# Semantic layer with Spark metric views: Metrics declared in YAML, served over Spark Connect to BI, notebooks and agents

> Define revenue once. Every dashboard, notebook and agent gets the same number.

A semantic layer is the set of governed metric and dimension definitions that sit between tables and the tools that query them. In open source Apache Spark, a metric view declares measures and dimensions in YAML over a source table; consumers query it with the MEASURE() function and Spark expands the definition at query time. Served over Spark Connect or JDBC, the same definitions answer dashboards, notebooks and AI agents, so a metric cannot drift between tools.

## When to use it
- Different teams report different numbers for the same metric.
- You want AI agents to answer questions from governed definitions instead of writing raw SQL.

## When not to
- Spark versions before metric views shipped; the reference demo is verified on Spark 4.2.0.

## Components

| Capability | Component | Role | Version |
|---|---|---|---|
| Source systems | Gold tables | Facts and dimensions to measure |  |
| Spark Connect sessions | Spark Connect | Remote access for clients and agents |  |
| Batch and SQL | Apache Spark | Expands MEASURE() at query time | 4.2.0 |
| Catalog and credentials | Hive Metastore | Registers the metric view in the demo |  |
| Open table format | Delta Lake | Source tables |  |
| Semantic layer | Spark metric views | YAML measures and dimensions |  |
| Dashboards and notebooks | Apache Superset | Dashboards over the metric view |  |

## How data flows
1. **Declare metrics.** Write measures and dimensions in YAML over a source table.
2. **Register.** Create the metric view in the catalog.
3. **Query with MEASURE().** Clients select dimensions and MEASURE(metric); Spark expands the definition and aggregates at the requested grain.
4. **Serve everyone.** Dashboards connect over JDBC or Spark Connect, and agents use the same views as tools.

## Run it

### [lisancao/spark-demos](https://github.com/lisancao/spark-demos)

Demo 01_metrics_views: eight metric view examples, a doctor script and a grammar probe, verified on Spark 4.2.0.

## Caveats
- The reference demo is verified on Spark 4.2.0 and awaits official Spark 4.3 images for re-verification.

## Industry use cases
- **Banking: Analyst questions in plain language.** Let relationship managers ask about balances and products through governed metric definitions.
- **Manufacturing: OEE dashboards with one definition.** Define availability, performance and quality once and query them from BI and agents.
- **Retail and e-commerce: One definition of margin.** Define revenue, margin and sell-through once for BI, notebooks and agents.

## Frequently asked questions

### Does open source Spark have a semantic layer?

Yes. Spark metric views declare measures and dimensions in YAML over a table, and queries use the MEASURE() function to evaluate them.

### Why give AI agents a semantic layer?

Because an agent querying metric views uses the governed definition of each metric instead of inventing its own SQL, so its answers match the dashboards.

## Sources
- [spark-demos 01_metrics_views](https://github.com/lisancao/spark-demos/tree/main/demos/01_metrics_views)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/semantic-layer
