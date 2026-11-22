import type { Industry } from "./types";

// Industry lenses. An industry does not change the open stack in the middle; it
// changes the sources, the exchange formats, the vocabulary of each medallion
// layer, and which reference pattern each use case maps onto.
//
// Pattern slugs referenced here must exist in patterns.ts (checked by a test).

export const INDUSTRIES: Industry[] = [
  // Eight industries chosen for a strong batch or streaming story and public
  // exchange standards. Fewer, deeper lenses beat a long list of thin ones.
  {
    slug: "banking",
    name: "Banking",
    sector: "Financial services",
    summary:
      "Banks move core banking ledgers, card authorizations and payment messages into open tables so fraud, risk and regulatory reporting read one governed copy instead of a mart per team.",
    sources: [
      { name: "Core banking system", delivery: "Nightly batch extracts plus CDC from the ledger database" },
      { name: "Card authorization switch", delivery: "Streaming, one event per authorization" },
      { name: "Payment hub", delivery: "Streaming ISO 20022 messages" },
      { name: "CRM and digital channels", delivery: "Hourly batch and clickstream events" },
      { name: "Market and reference data feeds", delivery: "Intraday batch files" },
    ],
    formats: [
      { name: "ISO 20022", body: "ISO", url: "https://www.iso20022.org", what: "XML message standard for payments and securities" },
      { name: "SWIFT MT", body: "Swift", url: "https://www.swift.com/standards/category-7-mt", what: "Legacy FIN messages still exchanged during the MX migration" },
      { name: "ISO 8583", body: "ISO", url: "https://www.iso.org/standard/79451.html", what: "Card transaction message format" },
    ],
    medallion: { bronze: "Raw ledger extracts and payment messages", silver: "Conformed accounts, customers and transactions", gold: "Exposure, liquidity and fraud features" },
    useCases: [
      { title: "Real-time card fraud scoring", problem: "Score each authorization against recent account behaviour before the switch times out.", pattern: "real-time-streaming" },
      { title: "Regulatory reporting from one copy", problem: "Build liquidity and capital reports from conformed silver tables with lineage an auditor can follow.", pattern: "policy-and-lineage" },
      { title: "Core banking CDC into the lakehouse", problem: "Keep a current and historical (SCD type 2) view of accounts without full nightly reloads.", pattern: "change-data-capture" },
      { title: "Credit risk model lifecycle", problem: "Track, register and compare probability-of-default models trained on governed features.", pattern: "ml-lifecycle" },
      { title: "Analyst questions in plain language", problem: "Let relationship managers ask about balances and products through governed metric definitions.", pattern: "semantic-layer" },
    ],
  },
  {
    slug: "payments-fintech",
    name: "Payments and fintech",
    sector: "Financial services",
    summary:
      "Payment processors and fintechs run on event streams; the lakehouse holds the durable history that fraud models, reconciliation and merchant analytics read.",
    sources: [
      { name: "Payment gateway and acquirer", delivery: "Streaming authorization and capture events" },
      { name: "ACH and real-time payment rails", delivery: "Batch files and streaming ISO 20022" },
      { name: "Application databases", delivery: "CDC through Debezium" },
      { name: "Mobile app events", delivery: "Streaming clickstream" },
    ],
    formats: [
      { name: "ISO 8583", body: "ISO", url: "https://www.iso.org/standard/79451.html", what: "Card network messages" },
      { name: "ISO 20022", body: "ISO", url: "https://www.iso20022.org", what: "Real-time and cross-border payment messages" },
      { name: "Nacha ACH file format", body: "Nacha", url: "https://www.nacha.org", what: "Fixed-width US ACH batch files" },
    ],
    medallion: { bronze: "Raw gateway events and rail files", silver: "One row per payment with its lifecycle state", gold: "Merchant settlement, chargeback and fraud features" },
    useCases: [
      { title: "Sub-second fraud features", problem: "Maintain velocity counters per card and device and serve them while the payment is still in flight.", pattern: "real-time-streaming" },
      { title: "Ledger reconciliation", problem: "Match gateway, processor and bank files every day and surface the breaks.", pattern: "batch-medallion" },
      { title: "Streaming payment history into tables", problem: "Land every gateway event in a bronze table and keep silver current within seconds.", pattern: "streaming-medallion" },
      { title: "Migrating a Flink fraud job to Spark", problem: "Port keyed state and windows to Spark and measure whether latency holds.", pattern: "real-time-streaming" },
      { title: "Governed agent for merchant support", problem: "Let an agent answer settlement questions with tools limited by policy.", pattern: "governed-ai-agents" },
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare providers",
    sector: "Healthcare and life sciences",
    summary:
      "Health systems pull EHR, claims and device data into open tables mapped to a common data model, with strict access policy on every column that identifies a patient.",
    sources: [
      { name: "Electronic health record", delivery: "HL7 v2 feeds, FHIR APIs and bulk exports" },
      { name: "Claims and billing", delivery: "Batch X12 837 and 835 files" },
      { name: "Imaging archive (PACS)", delivery: "DICOM objects and metadata" },
      { name: "Bedside and remote monitoring devices", delivery: "Streaming vitals" },
    ],
    formats: [
      { name: "HL7 FHIR", body: "HL7 International", url: "https://hl7.org/fhir/", what: "REST resources and bulk NDJSON exports for clinical data" },
      { name: "HL7 v2", body: "HL7 International", url: "https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185", what: "Pipe-delimited ADT, ORU and ORM messages" },
      { name: "DICOM", body: "NEMA (DICOM Standards Committee)", url: "https://www.dicomstandard.org", what: "Medical imaging objects and metadata" },
      { name: "OMOP CDM", body: "OHDSI", url: "https://ohdsi.github.io/CommonDataModel/", what: "Common data model for observational research" },
      { name: "X12 837/835", body: "X12", url: "https://x12.org", what: "Claim and remittance transactions" },
    ],
    medallion: { bronze: "Raw HL7, FHIR bundles and claim files", silver: "OMOP-conformed persons, visits, conditions and measurements", gold: "Quality measures, readmission risk and capacity dashboards" },
    useCases: [
      { title: "Patient-level access policy", problem: "Enforce row filters and column masks on PHI the same way in every engine that reads the tables.", pattern: "policy-and-lineage" },
      { title: "Real-time deterioration alerts", problem: "Score streaming vitals against early-warning rules and push alerts to care teams.", pattern: "real-time-streaming" },
      { title: "FHIR bulk export to OMOP", problem: "Land FHIR NDJSON in bronze and transform it into the OMOP common data model.", pattern: "batch-medallion" },
      { title: "Readmission risk models", problem: "Track experiments and promote models with a registry that records the training data version.", pattern: "ml-lifecycle" },
      { title: "Research data sharing", problem: "Share de-identified cohorts with a university partner as live tables.", pattern: "open-data-sharing" },
    ],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    sector: "Manufacturing and industrial",
    summary:
      "Plants stream machine telemetry from the shop floor, join it with MES and ERP records, and use the result for predictive maintenance, quality and OEE.",
    sources: [
      { name: "PLCs and SCADA via OPC UA", delivery: "Streaming sensor tags" },
      { name: "Plant historian", delivery: "Batch backfill and streaming" },
      { name: "Manufacturing execution system (MES)", delivery: "CDC" },
      { name: "ERP", delivery: "Nightly batch" },
    ],
    formats: [
      { name: "OPC UA", body: "OPC Foundation", url: "https://opcfoundation.org/about/opc-technologies/opc-ua/", what: "Industrial machine-to-machine protocol and information model" },
      { name: "MQTT", body: "OASIS", url: "https://mqtt.org", what: "Lightweight publish/subscribe messaging for devices" },
      { name: "Sparkplug", body: "Eclipse Foundation", url: "https://sparkplug.eclipse.org", what: "MQTT topic and payload specification for industrial data" },
      { name: "ISA-95", body: "ISA", url: "https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard", what: "Model for enterprise and control system integration" },
    ],
    medallion: { bronze: "Raw tag readings and MES events", silver: "Asset-aligned time series on the ISA-95 hierarchy", gold: "OEE, scrap rate and failure predictions" },
    useCases: [
      { title: "Predictive maintenance", problem: "Compute rolling sensor features per asset and score failure risk continuously.", pattern: "real-time-streaming" },
      { title: "Telemetry into tables", problem: "Land MQTT and OPC UA readings in bronze and keep asset-level silver current.", pattern: "streaming-medallion" },
      { title: "OEE dashboards with one definition", problem: "Define availability, performance and quality once and query them from BI and agents.", pattern: "semantic-layer" },
      { title: "Supplier data exchange", problem: "Share quality and demand tables with suppliers as live tables.", pattern: "open-data-sharing" },
      { title: "Quality and scrap analytics", problem: "Join MES quality checks with ERP orders every shift to find where scrap comes from.", pattern: "batch-medallion" },
    ],
  },
  {
    slug: "energy-utilities",
    name: "Energy and utilities",
    sector: "Energy and resources",
    summary:
      "Utilities combine smart meter interval data, grid telemetry and asset records for load forecasting, outage response and regulatory filings.",
    sources: [
      { name: "Advanced metering infrastructure (AMI)", delivery: "Interval reads every 15 minutes, batch and streaming" },
      { name: "SCADA and substation automation", delivery: "Streaming telemetry" },
      { name: "Outage management system", delivery: "Streaming events" },
      { name: "GIS and asset registry", delivery: "Batch" },
    ],
    formats: [
      { name: "IEC 61850", body: "IEC", url: "https://webstore.iec.ch/en/publication/6028", what: "Substation automation communication" },
      { name: "CIM (IEC 61970 / 61968)", body: "IEC", url: "https://cimug.ucaiug.org", what: "Common information model for grid and distribution" },
      { name: "Green Button", body: "Green Button Alliance", url: "https://www.greenbuttonalliance.org", what: "Customer energy usage data exchange" },
      { name: "DNP3 (IEEE 1815)", body: "IEEE", url: "https://standards.ieee.org/ieee/1815/10003/", what: "SCADA protocol for utilities" },
    ],
    medallion: { bronze: "Raw interval reads and SCADA points", silver: "Validated, estimated and edited (VEE) meter data on the CIM network model", gold: "Load forecasts, outage KPIs and rate-case reports" },
    useCases: [
      { title: "Load forecasting", problem: "Train and track forecast models on years of interval data plus weather.", pattern: "ml-lifecycle" },
      { title: "Meter data at scale", problem: "Process billions of interval reads a day through bronze, VEE silver and billing gold.", pattern: "batch-medallion" },
      { title: "Outage detection from streaming telemetry", problem: "Correlate last-gasp meter events and SCADA alarms within seconds.", pattern: "real-time-streaming" },
      { title: "Regulator and partner sharing", problem: "Share reliability metrics with regulators as live tables.", pattern: "open-data-sharing" },
      { title: "Self-hosted on AWS", problem: "Run the open stack in the utility's own cloud account with infrastructure as code.", pattern: "cloud-deployment-aws" },
    ],
  },
  {
    slug: "retail-ecommerce",
    name: "Retail and e-commerce",
    sector: "Retail and consumer",
    summary:
      "Retailers and online stores bring point-of-sale, clickstream, inventory, supply chain and loyalty data together for demand forecasting, replenishment, personalization and fraud.",
    sources: [
      { name: "Point-of-sale systems", delivery: "Streaming baskets, end-of-day batch" },
      { name: "Web and app clickstream", delivery: "Streaming events" },
      { name: "Inventory and warehouse management", delivery: "CDC" },
      { name: "Supplier EDI", delivery: "Batch X12 or EDIFACT documents" },
      { name: "Loyalty and CRM", delivery: "Batch" },
    ],
    formats: [
      { name: "GS1 EPCIS", body: "GS1", url: "https://www.gs1.org/standards/epcis", what: "Supply chain visibility events" },
      { name: "GTIN", body: "GS1", url: "https://www.gs1.org/standards/id-keys/gtin", what: "Global trade item numbers that key the product master" },
      { name: "ANSI X12 (850, 856, 810)", body: "X12", url: "https://x12.org", what: "Purchase orders, ship notices and invoices" },
      { name: "UN/EDIFACT", body: "UNECE", url: "https://unece.org/trade/uncefact/introducing-unedifact", what: "International EDI messages" },
      { name: "CloudEvents", body: "CNCF", url: "https://cloudevents.io", what: "Common envelope for clickstream and order events" },
    ],
    medallion: { bronze: "Raw baskets, EDI documents and stock snapshots", silver: "Sales, inventory and orders keyed by GTIN and store", gold: "Forecasts, replenishment orders and customer segments" },
    useCases: [
      { title: "Demand forecasting", problem: "Train store-by-SKU forecasts and track which model version produced each order.", pattern: "ml-lifecycle" },
      { title: "Real-time inventory", problem: "Keep stock positions current from POS and warehouse events so online orders do not oversell.", pattern: "streaming-medallion" },
      { title: "Supplier collaboration", problem: "Share sell-through and stock tables with suppliers instead of sending reports.", pattern: "open-data-sharing" },
      { title: "One definition of margin", problem: "Define revenue, margin and sell-through once for BI, notebooks and agents.", pattern: "semantic-layer" },
      { title: "In-session recommendations", problem: "Update product recommendations while the shopper is still browsing.", pattern: "real-time-streaming" },
      { title: "Clickstream to sessions", problem: "Sessionize web and app events with watermarks and land them as tables for funnel analysis.", pattern: "streaming-medallion" },
    ],
  },
  {
    slug: "telecommunications",
    name: "Telecommunications",
    sector: "Technology, media and telecom",
    summary:
      "Operators collect network performance counters, call detail records and customer data for network planning, churn and service assurance.",
    sources: [
      { name: "Network elements and OSS", delivery: "Streaming performance counters and alarms" },
      { name: "Mediation (CDRs and xDRs)", delivery: "Batch files every few minutes" },
      { name: "BSS: billing and CRM", delivery: "CDC" },
    ],
    formats: [
      { name: "3GPP charging data records", body: "3GPP", url: "https://www.3gpp.org/specifications-technologies", what: "CDR formats defined in TS 32.297 and related specs" },
      { name: "TM Forum Open APIs", body: "TM Forum", url: "https://www.tmforum.org/oda/open-apis/", what: "Standard APIs for BSS and OSS integration" },
    ],
    medallion: { bronze: "Raw counters, alarms and CDR files", silver: "Cell, subscriber and session-level facts", gold: "Network KPIs, churn scores and capacity plans" },
    useCases: [
      { title: "Service assurance", problem: "Correlate alarms and KPI drops across cells within seconds.", pattern: "real-time-streaming" },
      { title: "CDR processing", problem: "Process mediation files into rated usage tables every few minutes.", pattern: "streaming-medallion" },
      { title: "Churn models", problem: "Train and track churn models on usage, care and billing features.", pattern: "ml-lifecycle" },
      { title: "Subscriber data protection", problem: "Mask subscriber identifiers for analysts and keep lineage for regulators.", pattern: "policy-and-lineage" },
      { title: "Network planning on many engines", problem: "Run heavy jobs in Spark and interactive exploration in Trino against one catalog.", pattern: "multi-engine-catalog" },
    ],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    sector: "Technology, media and telecom",
    summary:
      "Security teams keep years of logs in open tables at object-storage prices and run detections, hunts and investigations over them with several engines.",
    sources: [
      { name: "Endpoint, identity and network logs", delivery: "Streaming" },
      { name: "Cloud audit logs", delivery: "Streaming and batch" },
      { name: "Threat intelligence feeds", delivery: "Batch STIX bundles" },
    ],
    formats: [
      { name: "OCSF", body: "OCSF project", url: "https://ocsf.io", what: "Open Cybersecurity Schema Framework for normalized security events" },
      { name: "STIX / TAXII", body: "OASIS", url: "https://oasis-open.github.io/cti-documentation/", what: "Threat intelligence objects and transport" },
      { name: "Sigma", body: "SigmaHQ", url: "https://sigmahq.io", what: "Generic detection rule format" },
    ],
    medallion: { bronze: "Raw logs per source", silver: "OCSF-normalized events", gold: "Detections, incidents and entity timelines" },
    useCases: [
      { title: "Streaming detections", problem: "Evaluate detection rules on normalized events within seconds of arrival.", pattern: "real-time-streaming" },
      { title: "Security data lake", problem: "Normalize every source to OCSF in silver and keep years of history cheaply.", pattern: "streaming-medallion" },
      { title: "Threat hunting with any engine", problem: "Hunt in DuckDB or Trino over the same tables that Spark writes.", pattern: "multi-engine-catalog" },
      { title: "Least-privilege access to logs", problem: "Restrict sensitive log fields by role in every engine.", pattern: "policy-and-lineage" },
      { title: "Investigation agents", problem: "Let an agent query logs and draft incident timelines under strict tool policy.", pattern: "governed-ai-agents" },
    ],
  },

  // ---------------- Travel, transport and logistics ----------------
];

export const industryBySlug = (slug?: string) => INDUSTRIES.find((i) => i.slug === slug);

export const SECTORS = Array.from(new Set(INDUSTRIES.map((i) => i.sector)));
