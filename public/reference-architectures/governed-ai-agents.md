# Governed AI agents for data engineering: Spark Declarative Pipelines, Spark Connect, Kubernetes and a governed Iceberg REST catalog

> Agents write pipeline specs; the platform decides what they are allowed to touch.

Governed AI data engineering is an architecture in which AI agents author data pipelines but never hold direct power over data. The agent writes declarative Spark Declarative Pipelines specs as a pull request; CI dry-runs them against the real catalog; a controller applies approved changes. Each tenant reaches Spark only through one identity-pinned Spark Connect ingress behind mTLS, executors run as Kubernetes pods, and a governed Iceberg REST catalog authorizes every request and vends storage credentials scoped to that tenant. Each layer owns one job, so a mistake in one does not become a breach in another.

## When to use it
- You want AI agents to build or change pipelines without giving them production credentials.
- You need per-tenant isolation on shared Spark infrastructure.
- You want defects caught before any data is processed.

## When not to
- A single-user sandbox: the masterclass's local agent chapter is the lighter starting point.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | AI coding agent | Writes inert pipeline specs as a pull request |  |
| Orchestration | GitOps CI gate | PR-only output, dry run against the real catalog, reconcile |  |
| Compute engines | Spark Declarative Pipelines | Declarative authoring: specs, not imperative jobs | Spark 4.1.2 |
| Governance, lineage and policy | Envoy | mTLS on :15009; routes each client certificate to its tenant | 1.31.5 |
| Serving | Spark Connect | The single identity-pinned ingress per tenant | 4.1.2 |
| Orchestration | Kubernetes | Client-mode driver plus executor pods on EKS | EKS 1.31 |
| Compute engines | Apache Spark | Executors do the work | 4.1.2 |
| Open table format | Apache Iceberg | Tables under per-tenant prefixes | 1.11.0 |
| Catalog | Lakekeeper | Governed Iceberg REST catalog with per-principal authorization and credential vending | 0.13.1 |
| Governance, lineage and policy | OpenFGA | Authorization model behind the catalog | 1.14.0 |
| Object storage | Amazon S3 | Data under per-tenant prefixes with STS-scoped credentials |  |
| ML and AI | Omnigent | Agent harness with tools and policies |  |
| ML and AI | Ollama | Local model for the course's agent chapter |  |
| Consumers | Reviewers and downstream jobs | Approve PRs, read the governed tables |  |

## How data flows
1. **Agent proposes.** The agent writes Spark Declarative Pipelines specs and opens a pull request; it has no direct write path.
2. **CI dry-runs.** CI runs the pipeline in dry-run mode against the real catalog, catching structural defects before any data is processed.
3. **Identity-pinned ingress.** The tenant's client certificate reaches Envoy, which routes by its SPIFFE URI SAN to that tenant's Spark Connect server.
4. **Executors run.** Kubernetes schedules executor pods that do the work.
5. **Catalog authorizes.** Lakekeeper with OpenFGA authorizes each table operation and vends STS credentials scoped to the tenant's prefix.

## Run it

### [open-lakehouse/safe-spark-agents-paper](https://github.com/open-lakehouse/safe-spark-agents-paper)

Working paper, reproducible study and open reference architecture for safe, governed AI data engineering on Apache Spark.

```bash
cd study
python3 analysis/analyze.py results/results.powered.AB.n12.final.jsonl --tasks config/TASKS.lock.json --assume-backend local
```

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

Chapter 3 runs an agent on Omnigent with a local Ollama model, MCP tools and ALLOW, DENY and ASK policies; chapter 13 has a coding agent operate the stack through AGENTS.md.

### [open-lakehouse/lakehouse-agent-kit](https://github.com/open-lakehouse/lakehouse-agent-kit)

Early-stage agent skills for the open lakehouse, driven by a connection profile instead of hardcoded hosts (lakehouse-core ships today).

## Caveats
- The isolation proof runs on one Spark Connect server per tenant; a shared-server design is described as frontier work in the paper.
- The five isolation links are proven one at a time, not as one composed request.
- Unity Catalog OSS 0.5.0, evaluated as an alternate catalog, could not do per-principal authorization on its Iceberg REST path.

## Industry use cases
- **Payments and fintech: Governed agent for merchant support.** Let an agent answer settlement questions with tools limited by policy.
- **Cybersecurity: Investigation agents.** Let an agent query logs and draft incident timelines under strict tool policy.

## Frequently asked questions

### How do you let AI agents build data pipelines safely?

Give them a declarative output and no direct path to data: the agent writes Spark Declarative Pipelines specs as a pull request, CI dry-runs them against the real catalog, and execution happens through an identity-pinned Spark Connect ingress with a catalog that authorizes every table operation.

### Do declarative pipelines catch more agent mistakes?

In the safe-spark-agents study (528 runs: 22 tasks, 12 seeds, 2 arms), the Spark Declarative Pipelines dry run caught 79 structural defects before any data was processed, against 0 for the imperative arm. SDP output was 49% fewer lines at about 2.3 times the tokens.

## Sources
- [safe-spark-agents-paper](https://github.com/open-lakehouse/safe-spark-agents-paper)
- [Paper site](https://open-lakehouse.github.io/safe-spark-agents-paper/)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/governed-ai-agents
