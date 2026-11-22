# Self-hosted catalog on AWS: Unity Catalog OSS on ECS Fargate with Neon Postgres and S3, in Terraform

> The open catalog in your own AWS account, with no static storage keys.

A self-hosted open catalog on AWS runs Unity Catalog OSS as a container on Amazon ECS Fargate behind an Application Load Balancer, keeps catalog metadata in a managed Postgres database, stores configuration on EFS and secrets in AWS Secrets Manager, and vends credentials for an S3 data bucket through a bucket-scoped IAM role instead of static keys. Everything is declared in Terraform, so the catalog can be recreated in another account or region from code.

## When to use it
- You want an open catalog in your own cloud account.
- Data residency or sovereignty rules out a hosted service.

## When not to
- A full compute stack: this reference deploys the catalog server; compute is deployed separately.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Object storage | Amazon S3 | Data bucket reached through a bucket-scoped storage role |  |
| Catalog | Unity Catalog OSS | Catalog server, digest-pinned and mirrored to ECR | 0.7.0 |
| Catalog | Neon | Postgres for catalog metadata |  |
| Orchestration | Amazon ECS on Fargate | Runs the server in a two-AZ VPC behind a public ALB |  |
| Orchestration | Terraform | Declares the whole deployment | >= 1.11, AWS provider ~> 6.45 |
| Compute engines | Apache Spark | Any engine with a Unity Catalog or Iceberg REST client |  |
| Consumers | Engines and users | Reach the catalog through the ALB |  |

## How data flows
1. **Prepare a profile.** just init-profile and just doctor check AWS credentials and tooling.
2. **Sync state and secrets.** Terraform state and the Neon connection secret are synced into the account.
3. **Deploy.** just deploy uc-server applies Terraform: VPC, ALB, ECS service, EFS and the storage role.
4. **Bootstrap.** The bootstrap step creates the storage credential, the unity catalog and the unity.default schema.

## Run it

### [open-lakehouse/terraform-deploy-oss](https://github.com/open-lakehouse/terraform-deploy-oss)

Terraform and scripts for deploying open source lakehouse services to the cloud, starting with Unity Catalog on AWS.

```bash
just init-profile prod
just doctor
just sync terraform-state
just sync neon-secret
just deploy uc-server
```

### [open-lakehouse/open-lakehouse](https://github.com/open-lakehouse/open-lakehouse)

terraform/ holds AWS deployment for the rest of the stack, including Spark and MLflow on ECS (just deploy spark-ecs, just deploy mlflow-ecs).

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

## Caveats
- Upgrading Unity Catalog from 0.6.0 or earlier needs a schema change: ALTER TABLE uc_properties ALTER COLUMN property_value TYPE text;
- Unity Catalog 0.7.0 permanently deletes dropped managed table files after seven days.
- The default ingress CIDR is 0.0.0.0/0; narrow it before production.
- During the measured v0.7.0 cutover in the sandbox, 5 of 491 requests returned 502 within 8 seconds (docs/unitycatalog/observability.md).

## Industry use cases
- **Energy and utilities: Self-hosted on AWS.** Run the open stack in the utility's own cloud account with infrastructure as code.

## Frequently asked questions

### How do I deploy Unity Catalog OSS on AWS?

terraform-deploy-oss runs Unity Catalog 0.7.0 on ECS Fargate behind an ALB, with Neon Postgres for metadata, EFS for configuration and a bucket-scoped IAM role for S3, deployed with just deploy uc-server.

## Sources
- [terraform-deploy-oss](https://github.com/open-lakehouse/terraform-deploy-oss)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/cloud-deployment-aws
