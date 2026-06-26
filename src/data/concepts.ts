import {
  ShieldCheck,
  KeyRound,
  ServerCog,
  ShieldHalf,
  GitFork,
  Workflow,
  Radar,
  Scale,
  Activity,
  Server,
  Bot,
  Boxes,
  Gavel,
  Network,
  type LucideIcon,
} from "lucide-react";

export type ConceptApproach = {
  slug: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  status: "live" | "coming-soon";
};

export type Concept = {
  slug: string;
  title: string;
  icon: LucideIcon;
  blurb: string;
  status: "live" | "coming-soon";
  approaches: ConceptApproach[];
};

export const concepts: Concept[] = [
  {
    slug: "data-access",
    title: "Data Access",
    icon: ShieldCheck,
    blurb:
      "Who can read and write data — and how engines reach storage without holding standing secrets. Three patterns power it today.",
    status: "live",
    approaches: [
      {
        slug: "credential-vending",
        title: "Credential Vending",
        icon: KeyRound,
        summary:
          "The catalog holds the storage credential and hands clients short-lived, down-scoped tokens — so no one keeps standing access to storage.",
        status: "live",
      },
      {
        slug: "server-side-planning",
        title: "Server-Side Planning / Scan APIs",
        icon: ServerCog,
        summary:
          "The client asks the catalog to plan a query; it returns the exact files to read plus a credential for them — enabling file-, column-, and row-level control.",
        status: "live",
      },
      {
        slug: "trusted-compute",
        title: "Trusted Compute",
        icon: ShieldHalf,
        summary:
          "The engine is trusted to apply catalog policies and keep raw data and credentials out of the user's reach — enabling row-level security and column masking.",
        status: "coming-soon",
      },
    ],
  },
  {
    slug: "lineage",
    title: "Lineage & ABAC",
    icon: GitFork,
    blurb:
      "How an open lakehouse learns where data came from, discovers what's sensitive, and propagates that knowledge into attribute-based access decisions — all on OpenLineage.",
    status: "live",
    approaches: [
      {
        slug: "event-emission",
        title: "Lineage Event Emission",
        icon: Workflow,
        summary:
          "Engines emit OpenLineage run events at planning time — table- and column-level lineage describing every query's inputs and outputs — to a lineage service.",
        status: "live",
      },
      {
        slug: "data-discovery",
        title: "Discovery & Findings",
        icon: Radar,
        summary:
          "Analysis services inspect the data, discover sensitive columns like PII, and raise findings — which propagate through the lineage graph to every field they reach.",
        status: "live",
      },
      {
        slug: "abac-policy",
        title: "ABAC Policy Decisions",
        icon: Scale,
        summary:
          "A catalog queries which fields inherit a sensitive tag downstream and uses the answer to make attribute-based access control decisions — mask, deny, or allow.",
        status: "live",
      },
    ],
  },
  {
    slug: "observability",
    title: "Observability",
    icon: Activity,
    blurb:
      "One standard — OpenTelemetry — for understanding the whole stack: infrastructure traces flowing to Jaeger, agentic and workflow traces flowing to MLflow.",
    status: "coming-soon",
    approaches: [
      {
        slug: "system-level",
        title: "System-Level Observability",
        icon: Server,
        summary:
          "Cross-service distributed traces over OpenTelemetry — engine, gateway, and platform services exporting OTLP to a shared collector like Jaeger.",
        status: "coming-soon",
      },
      {
        slug: "agentic-level",
        title: "Agentic-Level Observability",
        icon: Bot,
        summary:
          "Workflow and agent traces in MLflow's trace model (WORKFLOW / CHAIN / TASK) exported over the same OpenTelemetry protocol for experiment-correlated visibility.",
        status: "coming-soon",
      },
    ],
  },
  {
    slug: "open-table-formats",
    title: "Open Table Formats",
    icon: Boxes,
    blurb:
      "How open table formats turn a pile of files in object storage into a transactional table — ACID, time travel, and schema evolution without a proprietary engine.",
    status: "coming-soon",
    approaches: [],
  },
  {
    slug: "policy-governance",
    title: "Policy & Governance",
    icon: Gavel,
    blurb:
      "Policy as code for the lakehouse — expressive, auditable rules (Cedar) distributed as versioned bundles and enforced consistently across engines.",
    status: "coming-soon",
    approaches: [],
  },
  {
    slug: "compute-federation",
    title: "Compute & Query Federation",
    icon: Network,
    blurb:
      "Many engines, one set of tables and one set of policies — how an open lakehouse lets compute meet data wherever it lives, without copies or lock-in.",
    status: "coming-soon",
    approaches: [],
  },
];

export const getConcept = (slug: string): Concept | undefined =>
  concepts.find((c) => c.slug === slug);
