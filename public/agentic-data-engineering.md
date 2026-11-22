# Agentic Data Engineering

> AI agents write, test and run pipelines; the platform decides what they may do

Agentic data engineering is the practice of having AI agents write, test, run and maintain data pipelines, with the platform rather than the agent's instructions deciding what each agent is allowed to do. The agent produces declarative pipeline code; the platform validates it with a dry run against the real catalog, limits the agent to its own namespace, checks every tool call against policies, and records traces and lineage. People set the goals, own the policies and review the changes that matter. Built on open source (Apache Spark Declarative Pipelines, Apache Iceberg, Unity Catalog OSS, the Model Context Protocol, an agent harness such as Omnigent, and MLflow), it works with any model, local or hosted.

## What changes when an agent writes the pipeline

When a person writes a pipeline, much of the checking happens in their head: which tables are production, which calls are expensive, when to try a sample first. An agent knows none of that unless something tells it, and something has to stop it when it ignores what it was told. The lakehouse masterclass organizes that something into a harness of three parts.

- **Declare.** The agent writes declarative pipelines (Spark Declarative Pipelines). spark-pipelines dry-run resolves every dataset and its inputs without writing data, and a pipeline that fails the dry run does not run.
- **Scope.** The agent works in its own place: one folder of pipeline files and one namespace in the catalog. It can read production tables but writes only its own.
- **Context.** The agent is given what it needs to know, pinned to the versions you run: the pipeline API of your Spark release, the layout of a spec file, the rules a pipeline file must follow.

## The four checks on an agent's pipeline

| Check | The question | How the platform answers it |
| --- | --- | --- |
| API | Does the pipeline use the framework correctly? | A dry run, required by a policy before any run |
| Performance | Does the work stay on the cluster? | A policy that asks a person before code pulls results onto one machine |
| Scope | Did it touch only its own tables? | Policies plus a sandbox namespace in the catalog |
| Correctness | Are the numbers right? | Comparison against trusted gold tables |

## How an agentic data engineering workflow runs

1. **A person sets the goal.** For example: build a daily revenue table from the orders stream.
2. **The agent proposes a declarative pipeline.** It writes pipeline files through named tools, not a shell, so every write is visible to policies.
3. **The platform dry-runs it.** Spark Declarative Pipelines resolves every dataset against the real catalog and reports structural errors before data is touched.
4. **Policies gate each call.** The harness allows, denies or asks a person about each tool call and result. Errors in a policy count as deny.
5. **Changes go through review.** In production, agent output arrives as a pull request; CI dry-runs it and a controller applies it after approval.
6. **Runs happen under the agent's identity.** The agent's Spark Connect session and the catalog's credential vending limit what the run can read and write.
7. **Results are evaluated and traced.** Outputs are compared with trusted tables, sessions are traced in MLflow, and OpenLineage records which tables were read and written.

## Evidence: declarative pipelines catch agent mistakes early

The safe-spark-agents study ran AI agents on the same data engineering tasks with declarative and imperative pipelines: 528 runs across 22 tasks, 12 seeds and 2 arms. The Spark Declarative Pipelines dry run caught 79 structural defects before any data was processed; the imperative arm caught none at that stage. Declarative output was 49% fewer lines, at about 2.3 times the tokens. After a swap of the agent's skill file, timezone defects went from 7 to 0.

## Tools, not a shell

Agents get their tools from an MCP server. Each tool does one thing with named arguments: list, read or write a file in the agent's pipeline folder, dry-run or run its pipeline, run one SQL statement. A policy can read write_pipeline_file(path="spark-pipeline.yml", content=...) exactly; it can only guess what an arbitrary shell command will do. Skills packaged for the lakehouse, such as lakehouse-agent-kit, give agents connection profiles instead of hardcoded endpoints.

## The open source agentic data engineering stack

| Need | Open source choice |
| --- | --- |
| Pipeline framework the platform can validate | Spark Declarative Pipelines (Apache Spark 4.1 and later) |
| Tables with snapshots and rollback | Apache Iceberg or Delta Lake |
| Catalog with permissions and credential vending | Unity Catalog OSS, Apache Polaris, Lakekeeper |
| Remote, identity-pinned engine access | Spark Connect |
| Agent tools | Model Context Protocol servers |
| Agent harness, policies and sandboxing | Omnigent |
| Local or self-hosted models | Ollama, vLLM |
| Tracing and evaluation | MLflow |
| Lineage | OpenLineage |
| Scheduling approved pipelines | Apache Airflow |

## Reference architectures

- https://openlakehouse.io/reference-architectures/agentic-lakehouse: Where the agent runs, how it reaches Spark and what the catalog lets it touch.
- https://openlakehouse.io/reference-architectures/governed-ai-agents: The reference architecture for agents building Spark pipelines in governed, multi-tenant sandboxes.
- https://openlakehouse.io/reference-architectures/batch-medallion: The declarative medallion pipelines agents write, scheduled by Airflow.
- https://openlakehouse.io/reference-architectures/change-data-capture: AUTO CDC flows: a declarative target an agent can produce and the platform can check.
- https://openlakehouse.io/reference-architectures/laptop-open-lakehouse: A full stack on a laptop to give an agent something real to work against.

## Frequently asked questions

### What is agentic data engineering?

The practice of having AI agents write, test, run and maintain data pipelines while the platform enforces what they may do: declarative output validated by a dry run, a sandbox namespace, policies on every tool call, and traces and lineage of every action.

### Will AI agents replace data engineers?

In agentic data engineering, agents do the writing and running, and people set goals, design the platform, own the policies and review the changes that matter. The work moves from typing pipelines to defining what correct and safe mean and checking that agents meet it.

### Why should agents write declarative pipelines instead of scripts?

Because the platform can check declarative output before it runs. In the safe-spark-agents study, the Spark Declarative Pipelines dry run caught 79 structural defects before any data was processed, against none for imperative pipelines at that stage.

### What is an agent harness?

The software that runs an agent: it connects the model to tools, keeps session state, and enforces policies and sandboxing around every tool call. Omnigent is an open source harness that evaluates policies returning ALLOW, DENY or ASK before and after each tool runs.

### Do I need a frontier model for agentic data engineering?

No. The lakehouse masterclass runs its pipeline agent on a local open-weight model (qwen3:14b in Ollama with a 16K context window). Stronger models make fewer mistakes, which is why the harness checks their work rather than trusting it.

### How do I get started with agentic data engineering?

Build the open lakehouse on a laptop with the lakehouse masterclass, then follow its agentic data engineering chapter to add an agent with MCP tools and policies. Move to the governed AI agents reference architecture for multi-tenant production.

## Sources
- [Lakehouse masterclass, chapter 3](https://github.com/open-lakehouse/lakehouse-masterclass/blob/main/textbook/chapters/ch03-agentic-data-engineering.md)
- [safe-spark-agents-paper repository](https://github.com/open-lakehouse/safe-spark-agents-paper)
- [Spark Declarative Pipelines guide](https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html)
- [Model Context Protocol](https://modelcontextprotocol.io)

Canonical page: https://openlakehouse.io/agentic-data-engineering
