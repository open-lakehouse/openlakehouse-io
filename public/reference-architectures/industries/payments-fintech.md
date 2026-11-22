# Open source data architecture for Payments and fintech

Payment processors and fintechs run on event streams; the lakehouse holds the durable history that fraud models, reconciliation and merchant analytics read.

## Source systems

| System | How data arrives |
|---|---|
| Payment gateway and acquirer | Streaming authorization and capture events |
| ACH and real-time payment rails | Batch files and streaming ISO 20022 |
| Application databases | CDC through Debezium |
| Mobile app events | Streaming clickstream |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [ISO 8583](https://www.iso.org/standard/79451.html) | ISO | Card network messages |
| [ISO 20022](https://www.iso20022.org) | ISO | Real-time and cross-border payment messages |
| [Nacha ACH file format](https://www.nacha.org) | Nacha | Fixed-width US ACH batch files |

## Medallion layers in this industry's terms
- **Bronze:** Raw gateway events and rail files
- **Silver:** One row per payment with its lifecycle state
- **Gold:** Merchant settlement, chargeback and fraud features

## Use cases and the architecture for each
- **Sub-second fraud features.** Maintain velocity counters per card and device and serve them while the payment is still in flight. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **Ledger reconciliation.** Match gateway, processor and bank files every day and surface the breaks. Architecture: [Batch medallion with Spark Declarative Pipelines](https://openlakehouse.io/reference-architectures/batch-medallion).
- **Streaming payment history into tables.** Land every gateway event in a bronze table and keep silver current within seconds. Architecture: [Streaming medallion](https://openlakehouse.io/reference-architectures/streaming-medallion).
- **Migrating a Flink fraud job to Spark.** Port keyed state and windows to Spark and measure whether latency holds. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **Governed agent for merchant support.** Let an agent answer settlement questions with tools limited by policy. Architecture: [Governed AI agents for data engineering](https://openlakehouse.io/reference-architectures/governed-ai-agents).

Canonical page: https://openlakehouse.io/reference-architectures/industries/payments-fintech
