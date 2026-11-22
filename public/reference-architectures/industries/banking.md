# Open source data architecture for Banking

Banks move core banking ledgers, card authorizations and payment messages into open tables so fraud, risk and regulatory reporting read one governed copy instead of a mart per team.

## Source systems

| System | How data arrives |
|---|---|
| Core banking system | Nightly batch extracts plus CDC from the ledger database |
| Card authorization switch | Streaming, one event per authorization |
| Payment hub | Streaming ISO 20022 messages |
| CRM and digital channels | Hourly batch and clickstream events |
| Market and reference data feeds | Intraday batch files |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [ISO 20022](https://www.iso20022.org) | ISO | XML message standard for payments and securities |
| [SWIFT MT](https://www.swift.com/standards/category-7-mt) | Swift | Legacy FIN messages still exchanged during the MX migration |
| [ISO 8583](https://www.iso.org/standard/79451.html) | ISO | Card transaction message format |

## Medallion layers in this industry's terms
- **Bronze:** Raw ledger extracts and payment messages
- **Silver:** Conformed accounts, customers and transactions
- **Gold:** Exposure, liquidity and fraud features

## Use cases and the architecture for each
- **Real-time card fraud scoring.** Score each authorization against recent account behaviour before the switch times out. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **Regulatory reporting from one copy.** Build liquidity and capital reports from conformed silver tables with lineage an auditor can follow. Architecture: [Policy pushdown and open lineage](https://openlakehouse.io/reference-architectures/policy-and-lineage).
- **Core banking CDC into the lakehouse.** Keep a current and historical (SCD type 2) view of accounts without full nightly reloads. Architecture: [Change data capture with SCD type 2](https://openlakehouse.io/reference-architectures/change-data-capture).
- **Credit risk model lifecycle.** Track, register and compare probability-of-default models trained on governed features. Architecture: [ML and GenAI lifecycle on the lakehouse](https://openlakehouse.io/reference-architectures/ml-lifecycle).
- **Analyst questions in plain language.** Let relationship managers ask about balances and products through governed metric definitions. Architecture: [Semantic layer with Spark metric views](https://openlakehouse.io/reference-architectures/semantic-layer).

Canonical page: https://openlakehouse.io/reference-architectures/industries/banking
