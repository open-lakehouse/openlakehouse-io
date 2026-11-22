# Open source data architecture for Manufacturing

Plants stream machine telemetry from the shop floor, join it with MES and ERP records, and use the result for predictive maintenance, quality and OEE.

## Source systems

| System | How data arrives |
|---|---|
| PLCs and SCADA via OPC UA | Streaming sensor tags |
| Plant historian | Batch backfill and streaming |
| Manufacturing execution system (MES) | CDC |
| ERP | Nightly batch |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [OPC UA](https://opcfoundation.org/about/opc-technologies/opc-ua/) | OPC Foundation | Industrial machine-to-machine protocol and information model |
| [MQTT](https://mqtt.org) | OASIS | Lightweight publish/subscribe messaging for devices |
| [Sparkplug](https://sparkplug.eclipse.org) | Eclipse Foundation | MQTT topic and payload specification for industrial data |
| [ISA-95](https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard) | ISA | Model for enterprise and control system integration |

## Medallion layers in this industry's terms
- **Bronze:** Raw tag readings and MES events
- **Silver:** Asset-aligned time series on the ISA-95 hierarchy
- **Gold:** OEE, scrap rate and failure predictions

## Use cases and the architecture for each
- **Predictive maintenance.** Compute rolling sensor features per asset and score failure risk continuously. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **Telemetry into tables.** Land MQTT and OPC UA readings in bronze and keep asset-level silver current. Architecture: [Streaming medallion](https://openlakehouse.io/reference-architectures/streaming-medallion).
- **OEE dashboards with one definition.** Define availability, performance and quality once and query them from BI and agents. Architecture: [Semantic layer with Spark metric views](https://openlakehouse.io/reference-architectures/semantic-layer).
- **Supplier data exchange.** Share quality and demand tables with suppliers as live tables. Architecture: [Open data sharing](https://openlakehouse.io/reference-architectures/open-data-sharing).
- **Quality and scrap analytics.** Join MES quality checks with ERP orders every shift to find where scrap comes from. Architecture: [Batch medallion with Spark Declarative Pipelines](https://openlakehouse.io/reference-architectures/batch-medallion).

Canonical page: https://openlakehouse.io/reference-architectures/industries/manufacturing
