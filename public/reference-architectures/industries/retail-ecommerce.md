# Open source data architecture for Retail and e-commerce

Retailers and online stores bring point-of-sale, clickstream, inventory, supply chain and loyalty data together for demand forecasting, replenishment, personalization and fraud.

## Source systems

| System | How data arrives |
|---|---|
| Point-of-sale systems | Streaming baskets, end-of-day batch |
| Web and app clickstream | Streaming events |
| Inventory and warehouse management | CDC |
| Supplier EDI | Batch X12 or EDIFACT documents |
| Loyalty and CRM | Batch |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [GS1 EPCIS](https://www.gs1.org/standards/epcis) | GS1 | Supply chain visibility events |
| [GTIN](https://www.gs1.org/standards/id-keys/gtin) | GS1 | Global trade item numbers that key the product master |
| [ANSI X12 (850, 856, 810)](https://x12.org) | X12 | Purchase orders, ship notices and invoices |
| [UN/EDIFACT](https://unece.org/trade/uncefact/introducing-unedifact) | UNECE | International EDI messages |
| [CloudEvents](https://cloudevents.io) | CNCF | Common envelope for clickstream and order events |

## Medallion layers in this industry's terms
- **Bronze:** Raw baskets, EDI documents and stock snapshots
- **Silver:** Sales, inventory and orders keyed by GTIN and store
- **Gold:** Forecasts, replenishment orders and customer segments

## Use cases and the architecture for each
- **Demand forecasting.** Train store-by-SKU forecasts and track which model version produced each order. Architecture: [ML and GenAI lifecycle on the lakehouse](https://openlakehouse.io/reference-architectures/ml-lifecycle).
- **Real-time inventory.** Keep stock positions current from POS and warehouse events so online orders do not oversell. Architecture: [Streaming medallion](https://openlakehouse.io/reference-architectures/streaming-medallion).
- **Supplier collaboration.** Share sell-through and stock tables with suppliers instead of sending reports. Architecture: [Open data sharing](https://openlakehouse.io/reference-architectures/open-data-sharing).
- **One definition of margin.** Define revenue, margin and sell-through once for BI, notebooks and agents. Architecture: [Semantic layer with Spark metric views](https://openlakehouse.io/reference-architectures/semantic-layer).
- **In-session recommendations.** Update product recommendations while the shopper is still browsing. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **Clickstream to sessions.** Sessionize web and app events with watermarks and land them as tables for funnel analysis. Architecture: [Streaming medallion](https://openlakehouse.io/reference-architectures/streaming-medallion).

Canonical page: https://openlakehouse.io/reference-architectures/industries/retail-ecommerce
