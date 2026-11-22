# The Agentic Lakehouse

> An open lakehouse that AI agents can find, query and change, safely

An agentic lakehouse is an open data lakehouse built so that AI agents can find, query and change data safely. It combines open tables such as Apache Iceberg or Delta Lake on object storage; a catalog that tells agents what data exists and what they may touch; tools that expose lakehouse actions to agents through the Model Context Protocol (MCP); declarative pipelines that agents write and the platform validates before anything runs; policies that allow a tool call, deny it, or ask a person first; and tracing and lineage that record what every agent did. Because the data, the governance and the agent harness are open source, agents built on any model or framework work against the same governed tables.

## How the pieces fit, from agent to table

1. **A control plane decides what agents may do.** Omnigent runs each agent and checks every tool call, model request and file operation against policies set per session, per agent and server-wide; any DENY blocks the action and any ASK waits for a person. MLflow traces and evaluates each step and can front model providers through its AI Gateway.
2. **Each session runs in a sandbox.** The agent's code runs in a container or microVM, on a laptop or a Kubernetes cluster. Provider credentials stay outside the sandbox; the agent holds only its own identity.
3. **The agent gets a Spark client, not a database password.** Inside the sandbox it connects over Spark Connect. For fast iteration that can be a local Spark with Project Feather's shuffle-free single-task execution, working on a subset of the data; for production runs it is a remote endpoint pinned to the agent's or tenant's identity.
4. **Spark runs the work in the mode it needs.** Batch and SQL, Structured Streaming, Real-Time Mode for millisecond paths, and Spark Declarative Pipelines, which the platform dry-runs before anything executes.
5. **The catalog and the tables hold the line.** Unity Catalog OSS (or another Iceberg REST catalog) authorizes every request and vends storage credentials scoped to what the agent may touch; Apache Iceberg snapshots make every write inspectable and reversible.

## Why a lakehouse is a good home for agents

An agent can only act on what it can discover and only be trusted with what the platform can check. An open lakehouse provides both through interfaces that already exist for engines.

- **The catalog is a machine-readable map.** Namespaces, tables, schemas and permissions are available over an API (the Iceberg REST catalog or the Unity Catalog API), so an agent asks the catalog what exists instead of guessing from file paths.
- **Open formats work with any engine.** An agent can read the same Iceberg table with Spark, DuckDB or PyIceberg, so its tools do not depend on one vendor's engine.
- **Snapshots make changes reversible.** Every commit to an Iceberg or Delta table is a snapshot. A bad write by an agent can be inspected with time travel and rolled back.
- **Declarative pipelines are checkable output.** When an agent writes a Spark Declarative Pipelines spec instead of an imperative script, the platform can resolve every dataset and dependency with a dry run before any data is written.
- **Lineage and traces record what happened.** OpenLineage events show which tables an agent's job read and wrote; MLflow traces show which tools the agent called, with their inputs and outputs.

## The layers of an agentic lakehouse

Each layer is open source and replaceable, because the interface between layers is an open standard.

| Layer | What it does for agents | Open source projects |
| --- | --- | --- |
| Tables and storage | Durable, versioned data any engine can read | Apache Iceberg, Delta Lake, Apache Parquet on S3-compatible storage |
| Catalog and permissions | Tells agents what exists and what they may read or write; vends scoped storage credentials | Unity Catalog OSS, Apache Polaris, Lakekeeper |
| Engines | Run the queries and pipelines agents request | Apache Spark (over Spark Connect), DuckDB, Trino |
| Pipelines | Give agents a declarative output the platform can validate | Spark Declarative Pipelines |
| Agent tools | Named actions with named arguments: read a table, dry-run a pipeline, run one SQL statement | Model Context Protocol servers, lakehouse-agent-kit skills |
| Agent harness and policy | Runs the agent and decides, per tool call, whether to allow, deny or ask a person | Omnigent |
| Models | The language model behind the agent, local or hosted | Open-weight models served by Ollama or vLLM; MLflow AI Gateway in front of providers |
| Observability and evaluation | Traces of every agent step, evaluation against trusted results, lineage of every write | MLflow tracing and evaluation, OpenLineage |
| Orchestration | Schedules approved pipelines so agents do not race scheduled runs | Apache Airflow |

## Guardrails that make it safe

Instructions are text a model weighs against everything else in its context. A guardrail is a fact the platform enforces. An agentic lakehouse relies on the second kind.

- **A sandbox namespace.** The agent reads production tables but writes only to its own namespace in the catalog, for example iceberg.sandbox_sdp in the lakehouse masterclass.
- **Dry run before run.** A pipeline that does not pass spark-pipelines dry-run does not run.
- **Policies on every tool call.** The harness evaluates each tool call and each tool result against policies that return ALLOW, DENY or ASK. A policy that raises an error counts as DENY, so the system fails closed.
- **No shell tool.** Agents get specific tools such as write_pipeline_file(path, content), which a policy can inspect exactly, instead of a shell whose effect a policy can only guess.
- **Identity-pinned access.** In production, each agent or tenant reaches Spark through its own authenticated Spark Connect endpoint, and the catalog vends storage credentials scoped to that tenant's tables.
- **A person approves irreversible steps.** Dropping tables, deleting objects or wiping volumes require explicit human confirmation.

## Agentic lakehouse vs. a lakehouse with a chatbot

A chatbot over a lakehouse answers questions by generating SQL. An agentic lakehouse lets agents act: create and change pipelines, run them, check the results and operate the platform. Acting needs more than read access to tables. It needs a sandbox to write into, a checkable output format, policies that stop unsafe calls, and a record of what was done. Those are the parts that make a lakehouse agentic.

Agents that only answer questions still benefit from the same design: a semantic layer such as Spark metric views gives them governed metric definitions, so their answers match the dashboards.

## Build one

1. **Start on a laptop.** The lakehouse masterclass builds Iceberg tables in Unity Catalog OSS on SeaweedFS with Spark 4.3, then adds an SDP agent on Omnigent with a local Ollama model, MCP tools and policies.
2. **Give agents a sandbox.** Create a namespace the agent owns and grant it write access only there.
3. **Make the output declarative.** Have the agent write Spark Declarative Pipelines and gate every run on a passing dry run.
4. **Add policies and tracing.** Write policies for the checks you care about (API use, performance, scope) and trace every session.
5. **Move to a governed deployment.** Put each agent behind an identity-pinned Spark Connect endpoint and a catalog that authorizes every request, as in the governed AI agents reference architecture.

## Reference architectures

- https://openlakehouse.io/reference-architectures/agentic-lakehouse: The whole picture on one board: Omnigent and MLflow over sandboxed Spark Connect sessions, on Iceberg and Unity Catalog.
- https://openlakehouse.io/reference-architectures/governed-ai-agents: The production shape: PR-only agent output, dry runs in CI, identity-pinned Spark Connect and a governed Iceberg REST catalog.
- https://openlakehouse.io/reference-architectures/multi-engine-catalog: One catalog that every engine and every agent tool reads, with credential vending.
- https://openlakehouse.io/reference-architectures/policy-and-lineage: Access rules enforced inside each engine's plan, and lineage for every job.
- https://openlakehouse.io/reference-architectures/semantic-layer: Governed metric definitions that agents query instead of inventing SQL.
- https://openlakehouse.io/reference-architectures/ml-lifecycle: Tracing, evaluation and a model gateway for the models behind your agents.

## Frequently asked questions

### What is an agentic lakehouse?

An open data lakehouse built so AI agents can find, query and change data safely: open tables, a catalog that agents read for metadata and permissions, MCP tools, declarative pipelines the platform validates, policies on every tool call, and tracing and lineage of what agents did.

### Is an agentic lakehouse a product?

No. It is an architecture you assemble from open source projects: Apache Iceberg or Delta Lake for tables, Unity Catalog OSS, Apache Polaris or Lakekeeper for the catalog, Apache Spark and DuckDB for engines, MCP for tools, an agent harness such as Omnigent for policies, and MLflow and OpenLineage for tracing and lineage.

### How do AI agents access lakehouse data?

Through tools the agent can call, usually served over the Model Context Protocol, which in turn use the catalog to find tables and an engine to read or write them. The catalog decides what the agent's identity may access and can vend short-lived storage credentials scoped to specific tables.

### How do you stop an AI agent from damaging production data?

Let it write only to its own sandbox namespace, require declarative pipelines that pass a dry run, evaluate every tool call against policies that fail closed, give it specific tools instead of a shell, and require a person to approve irreversible operations. Table snapshots let you roll back a bad write.

### Which table format is best for an agentic lakehouse?

Any open table format with a catalog API works. Apache Iceberg is a strong default because the Iceberg REST catalog specification is implemented by many catalogs and read by many engines, so agent tools can use one interface everywhere. Delta Lake works the same way through Unity Catalog.

### Can I build an agentic lakehouse on a laptop?

Yes. The open source lakehouse masterclass runs Iceberg, Unity Catalog OSS, Spark 4.3, Kafka, Airflow and MLflow in Docker and adds an agent on Omnigent with a local Ollama model, MCP tools and policies.

## Sources
- [Lakehouse masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)
- [Safe, governed AI data engineering on Apache Spark (paper)](https://open-lakehouse.github.io/safe-spark-agents-paper/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Iceberg REST catalog specification](https://iceberg.apache.org/rest-catalog-spec/)
- [Spark Declarative Pipelines guide](https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html)

Canonical page: https://openlakehouse.io/agentic-lakehouse
