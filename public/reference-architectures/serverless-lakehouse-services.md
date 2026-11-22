# Serverless lakehouse services: Catalog and lineage as Neon Functions on branchable Postgres

> Every pull request gets its own catalog, database and bucket.

Serverless lakehouse services package the control plane of an open lakehouse (the catalog, the lineage service and the sharing server) as functions that run per database branch. In luminescent-lakehouse, Rust services built on axum are compiled to Node-API addons and deployed as Neon Functions; each Neon branch gets its own Postgres schema and storage bucket, so a pull request preview has a full, isolated catalog and lineage service that disappears with the branch.

## When to use it
- You want preview environments with their own catalog per pull request.
- You want to run lakehouse control-plane services without operating servers.

## When not to
- Data-plane compute: engines still run elsewhere and talk to these services over HTTP.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Catalog | Neon | Per-branch Postgres and storage bucket |  |
| Catalog | unitycatalog-rs | Catalog function (mangrove server) |  |
| Governance, lineage and policy | headwaters | OpenLineage ingest with Marquez-compatible reads |  |
| Serving | distributary | Sharing function; built and tested, not yet deployed |  |
| Open table format | Delta Lake | Managed tables under s3://lakehouse/managed |  |
| Consumers | Engines and apps | Call the functions over HTTPS |  |

## How data flows
1. **Build.** Each Rust service is compiled to a linux-arm64 Node-API addon and bundled within Neon's size limits.
2. **Migrate a branch.** Deploying to a Neon branch runs the database migrations for that branch.
3. **Deploy functions.** The catalog and lineage functions are applied to the branch from neon.ts.
4. **Promote.** Pull requests get preview branches, merges deploy to staging, and production needs manual approval.

## Run it

### [open-lakehouse/luminescent-lakehouse](https://github.com/open-lakehouse/luminescent-lakehouse)

Deploys open-lakehouse services (Unity Catalog, OpenLineage, OpenSharing) to Neon as functions.

```bash
just test <fn>         # host-native addon behind the fetch handler, node --test
just build <fn>        # linux-arm64 bundle + zip, gated on Neon's size limits
just test-arm64 <fn>   # the deployable bundle in node:24-bookworm-slim
just deploy <branch>   # migrate a Neon branch and apply neon.ts to it
```

## Caveats
- The opensharing function builds and passes tests but is not in neon.ts yet; only the catalog and lineage functions deploy.

## Frequently asked questions

### Can a data catalog run serverless?

Yes. luminescent-lakehouse runs a Unity Catalog implementation and an OpenLineage service as Neon Functions, with a separate Postgres branch and bucket per environment.

## Sources
- [luminescent-lakehouse](https://github.com/open-lakehouse/luminescent-lakehouse)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/serverless-lakehouse-services
