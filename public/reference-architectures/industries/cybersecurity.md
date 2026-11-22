# Open source data architecture for Cybersecurity

Security teams keep years of logs in open tables at object-storage prices and run detections, hunts and investigations over them with several engines.

## Source systems

| System | How data arrives |
|---|---|
| Endpoint, identity and network logs | Streaming |
| Cloud audit logs | Streaming and batch |
| Threat intelligence feeds | Batch STIX bundles |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [OCSF](https://ocsf.io) | OCSF project | Open Cybersecurity Schema Framework for normalized security events |
| [STIX / TAXII](https://oasis-open.github.io/cti-documentation/) | OASIS | Threat intelligence objects and transport |
| [Sigma](https://sigmahq.io) | SigmaHQ | Generic detection rule format |

## Medallion layers in this industry's terms
- **Bronze:** Raw logs per source
- **Silver:** OCSF-normalized events
- **Gold:** Detections, incidents and entity timelines

## Use cases and the architecture for each
- **Streaming detections.** Evaluate detection rules on normalized events within seconds of arrival. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **Security data lake.** Normalize every source to OCSF in silver and keep years of history cheaply. Architecture: [Streaming medallion](https://openlakehouse.io/reference-architectures/streaming-medallion).
- **Threat hunting with any engine.** Hunt in DuckDB or Trino over the same tables that Spark writes. Architecture: [One catalog, many engines](https://openlakehouse.io/reference-architectures/multi-engine-catalog).
- **Least-privilege access to logs.** Restrict sensitive log fields by role in every engine. Architecture: [Policy pushdown and open lineage](https://openlakehouse.io/reference-architectures/policy-and-lineage).
- **Investigation agents.** Let an agent query logs and draft incident timelines under strict tool policy. Architecture: [Governed AI agents for data engineering](https://openlakehouse.io/reference-architectures/governed-ai-agents).

Canonical page: https://openlakehouse.io/reference-architectures/industries/cybersecurity
