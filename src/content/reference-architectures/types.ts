// Data model for the Open Reference Architectures section.
// Plain data only (no JSX, no asset imports) so the React pages, the
// prerenderer, and the SEO/llms.txt generator can all import it.

export type LayerId =
  | "sources"
  | "ingest"
  | "storage"
  | "format"
  | "catalog"
  | "compute"
  | "orchestration"
  | "ml"
  | "serving"
  | "consumers"
  | "governance";

export type Layer = {
  id: LayerId;
  name: string;
  short: string;
  question: string; // the question this layer answers, phrased the way people search
};

export type Component = {
  id: string;
  name: string;
  layer: LayerId;
  blurb: string; // one sentence, literal, citable
  url: string;
  repo?: string;
  license?: string; // SPDX id
  steward?: string; // foundation or company that governs the project
  /** Site page that covers this project, if one exists. */
  sitePath?: string;
};

export type DeployTarget = "laptop" | "kubernetes" | "aws" | "serverless" | "cloud-agnostic";

export type Node = {
  /** Component id, or a free-form label for things that are not projects (e.g. "Operational databases"). */
  component?: string;
  label?: string;
  layer: LayerId;
  role: string; // what this box does in THIS architecture
  version?: string; // as pinned in the reference repo
  /** Only shown in the detailed view. */
  detail?: boolean;
  /** Component ids that can take this slot. */
  swaps?: string[];
};

export type RepoRef = {
  name: string; // owner/repo
  url: string;
  description: string;
  license?: string;
  targets: DeployTarget[];
  quickstart?: string[]; // verbatim commands from the repo README
};

export type LinkRef = { label: string; href: string; note?: string };

export type Faq = { q: string; a: string };

export type Pattern = {
  slug: string;
  title: string;
  /** Query-shaped H1 suffix, e.g. "with Kafka, Spark and Delta Lake" */
  stackLine: string;
  tagline: string;
  category: PatternCategory;
  /** Self-contained definition paragraph that an answer engine can lift whole. */
  definition: string;
  whenToUse: string[];
  notFor: string[];
  nodes: Node[];
  /** Numbered walk through the data path, one literal sentence each. */
  steps: { title: string; body: string }[];
  repos: RepoRef[];
  caveats: string[];
  learn: LinkRef[];
  faqs: Faq[];
  sources: LinkRef[];
  keywords: string[];
  updated: string; // YYYY-MM-DD
};

export type PatternCategory = "Batch" | "Streaming" | "Platform" | "More patterns";

export type DataFormat = { name: string; body: string; url: string; what: string };

export type UseCase = { title: string; problem: string; pattern: string };

export type Industry = {
  slug: string;
  name: string;
  sector: string;
  summary: string;
  sources: { name: string; delivery: string }[];
  formats: DataFormat[];
  medallion: { bronze: string; silver: string; gold: string };
  useCases: UseCase[];
};
