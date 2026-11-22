# Policy pushdown and open lineage: Cedar policies compiled to CEL, enforced in Spark and DataFusion, with OpenLineage

> Write access rules once, enforce them inside every engine, and record where every column came from.

Policy pushdown and open lineage is a governance architecture for multi-engine lakehouses. Access rules are authored once in the Cedar policy language, compiled to portable CEL expressions, and enforced inside each query engine's plan as row filters and column masks, so no engine depends on SQL views or per-engine rewrites. Alongside, every job emits OpenLineage events, which are stored as lakehouse tables and served through a lineage API, so auditors can trace a published number back to its sources.

## When to use it
- Several engines read the same sensitive tables.
- You need row filters and column masks that cannot be bypassed by choosing a different engine.
- Regulators or auditors ask where a value came from.

## When not to
- Production lineage storage today without evaluation: headwaters describes itself as experimental and recommends Marquez for production.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Policy authors | Write Cedar policies and tag templates |  |
| Governance, lineage and policy | Cedar | Policy language; deny always wins | cedar-policy 4 |
| Governance, lineage and policy | policast | Compiles Cedar to CEL and injects enforcement into the physical plan |  |
| Governance, lineage and policy | breakwater | Row filters and column masks inside the DataFusion planner |  |
| Catalog | Unity Catalog OSS | Policy decision point resolving tags | 0.4.1 in the demo |
| Object storage | RustFS | Demo object store |  |
| Open table format | Delta Lake | Governed tables and the lineage table |  |
| Compute engines | Apache Spark | Enforcement as Catalyst rules | 4.2 plugin |
| Compute engines | Apache DataFusion | Enforcement as plan rewrites | 53.1 |
| Governance, lineage and policy | OpenLineage | Lineage events from every job, column level from Spark |  |
| Governance, lineage and policy | open-lineage-connect | Ingests events and writes them to Delta and Iceberg tables |  |
| Governance, lineage and policy | headwaters | Lineage read API and UI |  |
| Consumers | Analysts, auditors | See only permitted rows and columns; trace lineage |  |

## How data flows
1. **Author once.** A policy author writes Cedar policies, including tag-based templates that apply to every column tagged, for example, as PHI.
2. **Compile.** policast compiles the policies to CEL expressions that any engine can evaluate.
3. **Enforce in the plan.** Spark applies them as Catalyst rules and DataFusion as plan rewrites, so filters and masks run inside the query, not in a view.
4. **Emit lineage.** A Spark 4 plugin emits OpenLineage events with column-level lineage for each job.
5. **Store lineage as tables.** An ingest service writes the events to Delta or Iceberg tables, which a lineage API and UI read.

## Run it

### [open-lakehouse/policast](https://github.com/open-lakehouse/policast)

Author governance once in Cedar, compile it to portable CEL, and push enforcement into Spark and DataFusion physical plans.

```bash
cp docker/.env.example .env
docker compose up -d sidecar
docker compose --profile demo run --rm datafusion-demo

# Same policies enforced on Spark (Catalyst rules, no sidecar):
docker compose --profile spark run --rm spark-demo   # or: just spark-demo
```

### [open-lakehouse/open-lineage-connect](https://github.com/open-lakehouse/open-lineage-connect)

OpenLineage end to end: a Go ingest service, a Rust service that writes events to Delta and Iceberg tables, and a Spark 4 plugin for column-level lineage.

```bash
make docker-compose-up        # builds both images, starts both services + MinIO
curl -sf http://localhost:8090/health
curl -sf http://localhost:8091/health
make docker-compose-down      # tears it down and removes the Delta volume
```

### [open-lakehouse/breakwater](https://github.com/open-lakehouse/breakwater)

Cedar fine-grained access control for DataFusion, with OCI-distributed policy bundles and a policy decision point service.

### [open-lakehouse/headwaters](https://github.com/open-lakehouse/headwaters)

Experimental Rust OpenLineage service with a Marquez-inspired read API and UI.

## Caveats
- In policast, deny always wins and grants never bypass column masks.
- headwaters is experimental and not a drop-in Marquez replacement.
- The policast demo pins Unity Catalog 0.4.1 as its policy decision point.

## Industry use cases
- **Banking: Regulatory reporting from one copy.** Build liquidity and capital reports from conformed silver tables with lineage an auditor can follow.
- **Healthcare providers: Patient-level access policy.** Enforce row filters and column masks on PHI the same way in every engine that reads the tables.
- **Telecommunications: Subscriber data protection.** Mask subscriber identifiers for analysts and keep lineage for regulators.
- **Cybersecurity: Least-privilege access to logs.** Restrict sensitive log fields by role in every engine.

## Frequently asked questions

### How do you enforce the same access policy in Spark and other engines?

Compile one policy source into an engine-neutral form and inject it into each engine's query plan. policast compiles Cedar policies to CEL and enforces them as Catalyst rules in Spark and as plan rewrites in DataFusion.

### What is OpenLineage?

An open standard, hosted by the LF AI & Data Foundation, for lineage events that describe jobs, runs and the datasets they read and write. Spark, Airflow, Flink and dbt have integrations.

### Can lineage be stored in the lakehouse itself?

Yes. open-lineage-connect writes OpenLineage events to Delta tables, Iceberg tables through a REST catalog, or both.

## Sources
- [policast README](https://github.com/open-lakehouse/policast#readme)
- [open-lineage-connect README](https://github.com/open-lakehouse/open-lineage-connect#readme)
- [OpenLineage](https://openlineage.io)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/policy-and-lineage
