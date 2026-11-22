# Open source data architecture for Healthcare providers

Health systems pull EHR, claims and device data into open tables mapped to a common data model, with strict access policy on every column that identifies a patient.

## Source systems

| System | How data arrives |
|---|---|
| Electronic health record | HL7 v2 feeds, FHIR APIs and bulk exports |
| Claims and billing | Batch X12 837 and 835 files |
| Imaging archive (PACS) | DICOM objects and metadata |
| Bedside and remote monitoring devices | Streaming vitals |

## Data formats and standards

| Format | Standards body | What it carries |
|---|---|---|
| [HL7 FHIR](https://hl7.org/fhir/) | HL7 International | REST resources and bulk NDJSON exports for clinical data |
| [HL7 v2](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185) | HL7 International | Pipe-delimited ADT, ORU and ORM messages |
| [DICOM](https://www.dicomstandard.org) | NEMA (DICOM Standards Committee) | Medical imaging objects and metadata |
| [OMOP CDM](https://ohdsi.github.io/CommonDataModel/) | OHDSI | Common data model for observational research |
| [X12 837/835](https://x12.org) | X12 | Claim and remittance transactions |

## Medallion layers in this industry's terms
- **Bronze:** Raw HL7, FHIR bundles and claim files
- **Silver:** OMOP-conformed persons, visits, conditions and measurements
- **Gold:** Quality measures, readmission risk and capacity dashboards

## Use cases and the architecture for each
- **Patient-level access policy.** Enforce row filters and column masks on PHI the same way in every engine that reads the tables. Architecture: [Policy pushdown and open lineage](https://openlakehouse.io/reference-architectures/policy-and-lineage).
- **Real-time deterioration alerts.** Score streaming vitals against early-warning rules and push alerts to care teams. Architecture: [Real-time streaming with Spark Real-Time Mode](https://openlakehouse.io/reference-architectures/real-time-streaming).
- **FHIR bulk export to OMOP.** Land FHIR NDJSON in bronze and transform it into the OMOP common data model. Architecture: [Batch medallion with Spark Declarative Pipelines](https://openlakehouse.io/reference-architectures/batch-medallion).
- **Readmission risk models.** Track experiments and promote models with a registry that records the training data version. Architecture: [ML and GenAI lifecycle on the lakehouse](https://openlakehouse.io/reference-architectures/ml-lifecycle).
- **Research data sharing.** Share de-identified cohorts with a university partner as live tables. Architecture: [Open data sharing](https://openlakehouse.io/reference-architectures/open-data-sharing).

Canonical page: https://openlakehouse.io/reference-architectures/industries/healthcare
