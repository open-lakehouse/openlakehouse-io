# The agentic lakehouse: Omnigent and MLflow over sandboxed Spark Connect sessions, on Iceberg and Unity Catalog

> Agents get a sandbox, a Spark session and a catalog identity. The platform decides the rest.

The agentic lakehouse architecture gives each AI agent a governed path to data. Omnigent runs the agent and evaluates policies on every tool call, model request and file operation, at session, agent and server level; MLflow traces and evaluates every step and fronts model providers. Each agent session runs in a sandbox, locally or on Kubernetes, with provider credentials kept outside it. Inside, the agent gets a Spark client over Spark Connect: a local Spark with Project Feather's shuffle-free execution for fast work on a subset of data, or a remote session pinned to its identity. Through Spark it can run batch, streaming, Real-Time Mode and declarative pipelines against Apache Iceberg tables in Unity Catalog, which authorizes each request and vends storage credentials scoped to what the agent may touch.

## When to use it
- You want agents to build and operate pipelines, not only answer questions.
- You need one governance story for people, services and agents.
- You want agents to iterate fast on small data without touching production.

## When not to
- A single question-answering assistant over a few tables: the semantic layer architecture is lighter.

## Components

| Capability | Component | Role | Version |
|---|---|---|---|
| Source systems | Operational systems and event streams | The data agents work on |  |
| Event streaming | Apache Kafka | Events agents can build streaming pipelines over |  |
| Agent harness and policy | Omnigent | Runs agents; policies return ALLOW, DENY or ASK at session, agent and server level |  |
| Agent sandboxes | Omnigent sandbox hosts | A container or microVM per session; provider credentials never enter it |  |
| Agent sandboxes | Kubernetes | Cluster for sandboxes and Spark executors |  |
| Tools and skills | Model Context Protocol | Named lakehouse tools: read a table, dry-run a pipeline, run one SQL statement |  |
| Models and gateway | MLflow | AI Gateway in front of hosted providers |  |
| Tracing and evaluation | MLflow | Traces every agent step; evaluates results against trusted tables |  |
| Spark Connect sessions | Spark Connect | One client session per agent: local in the sandbox, or a remote endpoint pinned to its identity |  |
| Batch and SQL | Apache Spark | Batch and SQL on the cluster after review |  |
| Declarative pipelines | Spark Declarative Pipelines | The agent's output; a dry run must pass before it runs |  |
| Structured Streaming | Apache Spark | Structured Streaming jobs agents can author |  |
| Real-Time Mode | Spark Real-Time Mode | Real-Time Mode for millisecond paths |  |
| Local mode (Project Feather) | Spark local mode (Project Feather) | Fast local Spark on a subset of data, same catalog | Spark 4.3 |
| Catalog and credentials | Unity Catalog OSS | Authorizes each request; vends credentials scoped to the agent's namespace |  |
| Open table format | Apache Iceberg | Snapshots make every agent write inspectable and reversible |  |
| Object storage | SeaweedFS | Object storage |  |
| Lineage | OpenLineage | Which tables each agent job read and wrote |  |
| Orchestration | Apache Airflow | Runs approved pipelines; agents trigger runs through it |  |
| Runtime, CI/CD and IaC | GitOps CI gate | Agent changes arrive as pull requests; CI dry-runs them before anything is applied |  |
| Identity and secrets | SPIFFE / SPIRE | A workload identity per agent and tenant |  |

## How data flows
1. **A session starts in a sandbox.** Omnigent starts the agent in a container or microVM, locally or on Kubernetes. The sandbox gets the agent's own identity; provider credentials stay outside.
2. **Policies wrap every call.** Each tool call, model request and file operation passes session, agent and server policies. Any DENY blocks it; any ASK waits for a person.
3. **The agent gets a Spark session.** Inside the sandbox it connects over Spark Connect to a local Spark with Project Feather enabled, working on a subset of the data registered in the same catalog.
4. **It writes declarative pipelines.** The agent writes Spark Declarative Pipelines into its own namespace and dry-runs them against the real catalog.
5. **Changes go through review.** Passing work becomes a pull request; CI dry-runs it again and a controller applies it after approval.
6. **Production runs under identity.** Approved pipelines run on the cluster in batch, streaming or Real-Time Mode, through an endpoint pinned to the agent's or tenant's identity; the catalog vends credentials only for its tables.
7. **Everything is traced.** MLflow records each agent step and evaluation; OpenLineage records every table read and written; Iceberg snapshots let you roll back.

## Run it

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

The local version: an SDP agent on Omnigent with a local model, MCP tools and ALLOW, DENY and ASK policies, writing into a sandbox namespace on Iceberg and Unity Catalog (chapters 3 and 13).

### [open-lakehouse/safe-spark-agents-paper](https://github.com/open-lakehouse/safe-spark-agents-paper)

The production version: PR-only agent output, CI dry runs, identity-pinned Spark Connect behind mTLS, Kubernetes executors and a governed Iceberg REST catalog with per-tenant credential vending.

### [lisancao/spark-demos](https://github.com/lisancao/spark-demos)

Demo 07 measures the local-mode overheads Project Feather targets; demo 16 shows Spark 4.3's shuffle-free single-task execution.

## Caveats
- Project Feather's shuffle-free single-task execution ships off by default in Spark 4.3 and applies to in-memory relations at or below 1,000 rows by default.
- Omnigent sandbox providers differ in network egress control; check the provider before relying on it for isolation.
- This architecture combines the masterclass and the paper; no single repo deploys all of it yet.

## Frequently asked questions

### How do you give an AI agent access to Spark safely?

Give each agent its own Spark Connect session: a local Spark in its sandbox for fast work on a subset of data, and a remote endpoint pinned to its identity for production runs. The catalog authorizes every request and vends storage credentials scoped to the agent's namespace.

### What do Omnigent and MLflow each do in an agentic lakehouse?

Omnigent runs the agent, keeps its session in a sandbox, and enforces policies on every tool call, model request and file operation. MLflow traces and evaluates what the agent did and can front model providers through its AI Gateway.

### What is Project Feather and why does it matter for agents?

Project Feather (SPARK-56978) cuts Spark's local-mode latency. Spark 4.3 adds shuffle-free single-task execution for small queries, which suits agents that issue many small queries while they iterate.

## Sources
- [Omnigent policies](https://omnigent.ai/docs/policies/overview)
- [Omnigent cloud sandbox hosts](https://omnigent.ai/docs/deploy/cloud-sandbox-host)
- [SPARK-56978 (Project Feather)](https://issues.apache.org/jira/browse/SPARK-56978)
- [spark-demos demo 07](https://github.com/lisancao/spark-demos/tree/main/demos/07_project_feather)
- [safe-spark-agents paper](https://open-lakehouse.github.io/safe-spark-agents-paper/)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/agentic-lakehouse
