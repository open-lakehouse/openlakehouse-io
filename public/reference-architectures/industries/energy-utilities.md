# Open source data architecture for Energy and utilities

Utilities combine smart meter interval data, grid telemetry and asset records for load forecasting, outage response and regulatory filings.

## Source systems

| System | How data arrives |
|---|---|
| Advanced metering infrastructure (AMI) | Interval reads every 15 minutes, batch and streaming |
| SCADA and substation automation | Streaming telemetry |
| Outage management system | Streaming events |
| GIS and asset registry | Batch |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [IEC 61850](https://webstore.iec.ch/en/publication/6028) | IEC | Substation automation communication |
| [CIM (IEC 61970 / 61968)](https://cimug.ucaiug.org) | IEC | Common information model for grid and distribution |
| [Green Button](https://www.greenbuttonalliance.org) | Green Button Alliance | Customer energy usage data exchange |
| [DNP3 (IEEE 1815)](https://standards.ieee.org/ieee/1815/10003/) | IEEE | SCADA protocol for utilities |

## Medallion layers in this industry's terms
- **Bronze:** Raw interval reads and SCADA points
- **Silver:** Validated, estimated and edited (VEE) meter data on the CIM network model
- **Gold:** Load forecasts, outage KPIs and rate-case reports

## Use cases and the architecture for each
- **Load forecasting.** Train and track forecast models on years of interval data plus weather. Architecture: [ML and GenAI lifecycle on the lakehouse](https://openlakehouse.io/reference-architectures/ml-lifecycle).
- **Meter data at scale.** Process billions of interval reads a day through bronze, VEE silver and billing gold. Architecture: [Batch medallion with Spark Declarative Pipelines](https://openlakehouse.io/reference-architectures/batch-medallion).
- **Outage detection from streaming telemetry.** Correlate last-gasp meter events and SCADA alarms within seconds. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **Regulator and partner sharing.** Share reliability metrics with regulators as live tables. Architecture: [Open data sharing](https://openlakehouse.io/reference-architectures/open-data-sharing).
- **Self-hosted on AWS.** Run the open stack in the utility's own cloud account with infrastructure as code. Architecture: [Self-hosted catalog on AWS](https://openlakehouse.io/reference-architectures/cloud-deployment-aws).

Canonical page: https://openlakehouse.io/reference-architectures/industries/energy-utilities
