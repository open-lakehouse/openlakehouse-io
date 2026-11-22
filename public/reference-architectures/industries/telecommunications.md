# Open source data architecture for Telecommunications

Operators collect network performance counters, call detail records and customer data for network planning, churn and service assurance.

## Source systems

| System | How data arrives |
|---|---|
| Network elements and OSS | Streaming performance counters and alarms |
| Mediation (CDRs and xDRs) | Batch files every few minutes |
| BSS: billing and CRM | CDC |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [3GPP charging data records](https://www.3gpp.org/specifications-technologies) | 3GPP | CDR formats defined in TS 32.297 and related specs |
| [TM Forum Open APIs](https://www.tmforum.org/oda/open-apis/) | TM Forum | Standard APIs for BSS and OSS integration |

## Medallion layers in this industry's terms
- **Bronze:** Raw counters, alarms and CDR files
- **Silver:** Cell, subscriber and session-level facts
- **Gold:** Network KPIs, churn scores and capacity plans

## Use cases and the architecture for each
- **Service assurance.** Correlate alarms and KPI drops across cells within seconds. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **CDR processing.** Process mediation files into rated usage tables every few minutes. Architecture: [Streaming medallion](https://openlakehouse.io/reference-architectures/streaming-medallion).
- **Churn models.** Train and track churn models on usage, care and billing features. Architecture: [ML and GenAI lifecycle on the lakehouse](https://openlakehouse.io/reference-architectures/ml-lifecycle).
- **Subscriber data protection.** Mask subscriber identifiers for analysts and keep lineage for regulators. Architecture: [Policy pushdown and open lineage](https://openlakehouse.io/reference-architectures/policy-and-lineage).
- **Network planning on many engines.** Run heavy jobs in Spark and interactive exploration in Trino against one catalog. Architecture: [One catalog, many engines](https://openlakehouse.io/reference-architectures/multi-engine-catalog).

Canonical page: https://openlakehouse.io/reference-architectures/industries/telecommunications
