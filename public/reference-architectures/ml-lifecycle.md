# ML and GenAI lifecycle on the lakehouse: MLflow tracking, registry and AI Gateway over open tables

> Every model run points at the exact table version it was trained on.

The ML lifecycle on an open lakehouse ties experiments, models and GenAI traces to versioned tables. Features are built by Spark from silver and gold tables in an open format; each MLflow run records parameters, metrics, artifacts and the table snapshot or version it trained on; the MLflow model registry promotes versions; and the MLflow AI Gateway fronts model providers for GenAI applications. Because tables support time travel, any run can be reproduced against the exact data it saw.

## When to use it
- You need to reproduce a model from months ago.
- You train on lakehouse tables and want lineage from data to model.
- You run GenAI applications and want tracing and evaluation in the same place.

## When not to
- Low-latency online feature serving by itself: pair it with the real-time streaming pattern and a key-value store.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Gold feature tables | Training data |  |
| Open table format | Apache Iceberg | Snapshot ids give reproducible training sets |  |
| Catalog | Unity Catalog OSS | Tables, and in the course, the catalog the run reads through |  |
| Compute engines | Apache Spark | Feature engineering and batch scoring |  |
| ML and AI | MLflow | Tracking, registry, tracing, evaluation and AI Gateway | 3.14.0 in open-lakehouse; 3.1.0 in the course |
| Orchestration | Apache Airflow | Retraining schedules |  |
| Consumers | Jupyter | Experiments |  |
| Consumers | Applications | Call registered models and gateway routes |  |

## How data flows
1. **Build features.** Spark reads gold tables and writes a feature table.
2. **Record the data version.** The training run logs the table's snapshot id or version to MLflow alongside parameters and metrics.
3. **Register.** A good run's model is registered and promoted in the MLflow model registry.
4. **Serve and trace.** Applications call models and providers through the MLflow AI Gateway; traces land back in MLflow for evaluation.

## Run it

### [open-lakehouse/open-lakehouse](https://github.com/open-lakehouse/open-lakehouse)

Runs MLflow 3.14.0 tracking (:5000) and AI Gateway (:5001) next to Spark, Delta and Unity Catalog.

```bash
git clone https://github.com/open-lakehouse/open-lakehouse
cd open-lakehouse

cp .env.example .env       # fill in POSTGRES_*, S3_* placeholders
./lakehouse setup          # validate env, install deps, download ~860MB of JARs
./lakehouse start all      # Spark 4.1 master + worker + Connect server + Kafka
./lakehouse start unity-catalog
./lakehouse start mlflow
./lakehouse status --json  # confirm healthy (incl. spark.connect_grpc_listening)
```

### [open-lakehouse/lakehouse-masterclass](https://github.com/open-lakehouse/lakehouse-masterclass)

Chapter 12 trains a model on gold and logs the gold Iceberg snapshot id to MLflow.

## Caveats
- MLflow 3.x matches --allowed-hosts exactly; the open-lakehouse stack sets localhost:5000 explicitly.

## Industry use cases
- **Banking: Credit risk model lifecycle.** Track, register and compare probability-of-default models trained on governed features.
- **Healthcare providers: Readmission risk models.** Track experiments and promote models with a registry that records the training data version.
- **Energy and utilities: Load forecasting.** Train and track forecast models on years of interval data plus weather.
- **Retail and e-commerce: Demand forecasting.** Train store-by-SKU forecasts and track which model version produced each order.
- **Telecommunications: Churn models.** Train and track churn models on usage, care and billing features.

## Frequently asked questions

### How do I make an ML model reproducible on a lakehouse?

Log the table snapshot id (Iceberg) or version (Delta Lake) used for training to the MLflow run; time travel then lets you read exactly that data again.

### Is MLflow open source?

Yes. MLflow is Apache-2.0 licensed and hosted by the Linux Foundation.

## Sources
- [MLflow docs](https://mlflow.org/docs/latest/)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/ml-lifecycle
