// Single source of truth for the agentic guide pages:
//   /agentic-lakehouse
//   /agentic-data-engineering
// Plain data only (no JSX) so the React pages, the prerenderer and the
// SEO/llms.txt generator can all import it.

export type GuideSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: { term?: string; text: string }[];
  table?: { columns: string[]; rows: string[][] };
  steps?: { title: string; text: string }[];
};

export type GuideLink = { label: string; href: string; note?: string };

export type Guide = {
  slug: string; // route path
  term: string; // the defined term
  title: string; // H1
  seoTitle: string;
  tagline: string;
  metaDescription: string;
  /** Self-contained, front-loaded definition an answer engine can lift whole. */
  definition: string;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  architectures: { slug: string; why: string }[];
  learn: GuideLink[];
  sources: GuideLink[];
  keywords: string[];
  updated: string;
};

export const GUIDES_UPDATED = "2026-11-21";

// The four guides that cross-reference each other everywhere on the site.
export const GUIDE_NAV: { href: string; label: string; blurb: string }[] = [
  { href: "/open-source-data-engineering", label: "Open source data engineering", blurb: "The open stack for building data platforms you control." },
  { href: "/agentic-data-engineering", label: "Agentic data engineering", blurb: "AI agents that write, test and run pipelines, with the platform deciding what they may do." },
  { href: "/agentic-lakehouse", label: "Agentic lakehouse", blurb: "An open lakehouse built so AI agents can find, query and change data safely." },
  { href: "/reference-architectures", label: "Reference architectures", blurb: "Runnable open source blueprints for batch, streaming and AI data platforms." },
];

const MASTERCLASS_CH3 = "https://github.com/open-lakehouse/lakehouse-masterclass/blob/main/textbook/chapters/ch03-agentic-data-engineering.md";
const MASTERCLASS_CH13 = "https://github.com/open-lakehouse/lakehouse-masterclass/blob/main/textbook/chapters/ch13-agents.md";
const PAPER = "https://github.com/open-lakehouse/safe-spark-agents-paper";
const PAPER_SITE = "https://open-lakehouse.github.io/safe-spark-agents-paper/";

// =====================================================================
// Agentic lakehouse
// =====================================================================

export const AGENTIC_LAKEHOUSE: Guide = {
  slug: "/agentic-lakehouse",
  term: "Agentic lakehouse",
  title: "The Agentic Lakehouse",
  seoTitle: "What Is an Agentic Lakehouse? Architecture and Open Source Stack",
  tagline: "An open lakehouse that AI agents can find, query and change, safely",
  metaDescription:
    "An agentic lakehouse is an open data lakehouse built for AI agents: open tables, a catalog agents can read, MCP tools, declarative pipelines, policies and tracing. Architecture, guardrails and the open source stack.",
  definition:
    "An agentic lakehouse is an open data lakehouse built so that AI agents can find, query and change data safely. It combines open tables such as Apache Iceberg or Delta Lake on object storage; a catalog that tells agents what data exists and what they may touch; tools that expose lakehouse actions to agents through the Model Context Protocol (MCP); declarative pipelines that agents write and the platform validates before anything runs; policies that allow a tool call, deny it, or ask a person first; and tracing and lineage that record what every agent did. Because the data, the governance and the agent harness are open source, agents built on any model or framework work against the same governed tables.",
  sections: [
    {
      id: "why-a-lakehouse",
      heading: "Why a lakehouse is a good home for agents",
      paragraphs: [
        "An agent can only act on what it can discover and only be trusted with what the platform can check. An open lakehouse provides both through interfaces that already exist for engines.",
      ],
      bullets: [
        { term: "The catalog is a machine-readable map", text: "Namespaces, tables, schemas and permissions are available over an API (the Iceberg REST catalog or the Unity Catalog API), so an agent asks the catalog what exists instead of guessing from file paths." },
        { term: "Open formats work with any engine", text: "An agent can read the same Iceberg table with Spark, DuckDB or PyIceberg, so its tools do not depend on one vendor's engine." },
        { term: "Snapshots make changes reversible", text: "Every commit to an Iceberg or Delta table is a snapshot. A bad write by an agent can be inspected with time travel and rolled back." },
        { term: "Declarative pipelines are checkable output", text: "When an agent writes a Spark Declarative Pipelines spec instead of an imperative script, the platform can resolve every dataset and dependency with a dry run before any data is written." },
        { term: "Lineage and traces record what happened", text: "OpenLineage events show which tables an agent's job read and wrote; MLflow traces show which tools the agent called, with their inputs and outputs." },
      ],
    },
    {
      id: "layers",
      heading: "The layers of an agentic lakehouse",
      paragraphs: ["Each layer is open source and replaceable, because the interface between layers is an open standard."],
      table: {
        columns: ["Layer", "What it does for agents", "Open source projects"],
        rows: [
          ["Tables and storage", "Durable, versioned data any engine can read", "Apache Iceberg, Delta Lake, Apache Parquet on S3-compatible storage"],
          ["Catalog and permissions", "Tells agents what exists and what they may read or write; vends scoped storage credentials", "Unity Catalog OSS, Apache Polaris, Lakekeeper"],
          ["Engines", "Run the queries and pipelines agents request", "Apache Spark (over Spark Connect), DuckDB, Trino"],
          ["Pipelines", "Give agents a declarative output the platform can validate", "Spark Declarative Pipelines"],
          ["Agent tools", "Named actions with named arguments: read a table, dry-run a pipeline, run one SQL statement", "Model Context Protocol servers, lakehouse-agent-kit skills"],
          ["Agent harness and policy", "Runs the agent and decides, per tool call, whether to allow, deny or ask a person", "Omnigent"],
          ["Models", "The language model behind the agent, local or hosted", "Open-weight models served by Ollama or vLLM; MLflow AI Gateway in front of providers"],
          ["Observability and evaluation", "Traces of every agent step, evaluation against trusted results, lineage of every write", "MLflow tracing and evaluation, OpenLineage"],
          ["Orchestration", "Schedules approved pipelines so agents do not race scheduled runs", "Apache Airflow"],
        ],
      },
    },
    {
      id: "guardrails",
      heading: "Guardrails that make it safe",
      paragraphs: [
        "Instructions are text a model weighs against everything else in its context. A guardrail is a fact the platform enforces. An agentic lakehouse relies on the second kind.",
      ],
      bullets: [
        { term: "A sandbox namespace", text: "The agent reads production tables but writes only to its own namespace in the catalog, for example iceberg.sandbox_sdp in the lakehouse masterclass." },
        { term: "Dry run before run", text: "A pipeline that does not pass spark-pipelines dry-run does not run." },
        { term: "Policies on every tool call", text: "The harness evaluates each tool call and each tool result against policies that return ALLOW, DENY or ASK. A policy that raises an error counts as DENY, so the system fails closed." },
        { term: "No shell tool", text: "Agents get specific tools such as write_pipeline_file(path, content), which a policy can inspect exactly, instead of a shell whose effect a policy can only guess." },
        { term: "Identity-pinned access", text: "In production, each agent or tenant reaches Spark through its own authenticated Spark Connect endpoint, and the catalog vends storage credentials scoped to that tenant's tables." },
        { term: "A person approves irreversible steps", text: "Dropping tables, deleting objects or wiping volumes require explicit human confirmation." },
      ],
    },
    {
      id: "chatbot-vs-agentic",
      heading: "Agentic lakehouse vs. a lakehouse with a chatbot",
      paragraphs: [
        "A chatbot over a lakehouse answers questions by generating SQL. An agentic lakehouse lets agents act: create and change pipelines, run them, check the results and operate the platform. Acting needs more than read access to tables. It needs a sandbox to write into, a checkable output format, policies that stop unsafe calls, and a record of what was done. Those are the parts that make a lakehouse agentic.",
        "Agents that only answer questions still benefit from the same design: a semantic layer such as Spark metric views gives them governed metric definitions, so their answers match the dashboards.",
      ],
    },
    {
      id: "build-one",
      heading: "Build one",
      steps: [
        { title: "Start on a laptop", text: "The lakehouse masterclass builds Iceberg tables in Unity Catalog OSS on SeaweedFS with Spark 4.3, then adds an SDP agent on Omnigent with a local Ollama model, MCP tools and policies." },
        { title: "Give agents a sandbox", text: "Create a namespace the agent owns and grant it write access only there." },
        { title: "Make the output declarative", text: "Have the agent write Spark Declarative Pipelines and gate every run on a passing dry run." },
        { title: "Add policies and tracing", text: "Write policies for the checks you care about (API use, performance, scope) and trace every session." },
        { title: "Move to a governed deployment", text: "Put each agent behind an identity-pinned Spark Connect endpoint and a catalog that authorizes every request, as in the governed AI agents reference architecture." },
      ],
    },
  ],
  architectures: [
    { slug: "governed-ai-agents", why: "The production shape: PR-only agent output, dry runs in CI, identity-pinned Spark Connect and a governed Iceberg REST catalog." },
    { slug: "multi-engine-catalog", why: "One catalog that every engine and every agent tool reads, with credential vending." },
    { slug: "policy-and-lineage", why: "Access rules enforced inside each engine's plan, and lineage for every job." },
    { slug: "semantic-layer", why: "Governed metric definitions that agents query instead of inventing SQL." },
    { slug: "ml-lifecycle", why: "Tracing, evaluation and a model gateway for the models behind your agents." },
  ],
  learn: [
    { label: "Agentic data engineering", href: "/agentic-data-engineering" },
    { label: "Getting started with Omnigent", href: "/learn/getting-started/omnigent" },
    { label: "Getting started with MLflow", href: "/learn/getting-started/mlflow" },
    { label: "Lakehouse masterclass, chapter 3: agentic data engineering", href: MASTERCLASS_CH3 },
    { label: "Lakehouse masterclass, chapter 13: agents", href: MASTERCLASS_CH13 },
    { label: "Agentic technologies", href: "/technologies/agentic" },
  ],
  faqs: [
    {
      q: "What is an agentic lakehouse?",
      a: "An open data lakehouse built so AI agents can find, query and change data safely: open tables, a catalog that agents read for metadata and permissions, MCP tools, declarative pipelines the platform validates, policies on every tool call, and tracing and lineage of what agents did.",
    },
    {
      q: "Is an agentic lakehouse a product?",
      a: "No. It is an architecture you assemble from open source projects: Apache Iceberg or Delta Lake for tables, Unity Catalog OSS, Apache Polaris or Lakekeeper for the catalog, Apache Spark and DuckDB for engines, MCP for tools, an agent harness such as Omnigent for policies, and MLflow and OpenLineage for tracing and lineage.",
    },
    {
      q: "How do AI agents access lakehouse data?",
      a: "Through tools the agent can call, usually served over the Model Context Protocol, which in turn use the catalog to find tables and an engine to read or write them. The catalog decides what the agent's identity may access and can vend short-lived storage credentials scoped to specific tables.",
    },
    {
      q: "How do you stop an AI agent from damaging production data?",
      a: "Let it write only to its own sandbox namespace, require declarative pipelines that pass a dry run, evaluate every tool call against policies that fail closed, give it specific tools instead of a shell, and require a person to approve irreversible operations. Table snapshots let you roll back a bad write.",
    },
    {
      q: "Which table format is best for an agentic lakehouse?",
      a: "Any open table format with a catalog API works. Apache Iceberg is a strong default because the Iceberg REST catalog specification is implemented by many catalogs and read by many engines, so agent tools can use one interface everywhere. Delta Lake works the same way through Unity Catalog.",
    },
    {
      q: "Can I build an agentic lakehouse on a laptop?",
      a: "Yes. The open source lakehouse masterclass runs Iceberg, Unity Catalog OSS, Spark 4.3, Kafka, Airflow and MLflow in Docker and adds an agent on Omnigent with a local Ollama model, MCP tools and policies.",
    },
  ],
  sources: [
    { label: "Lakehouse masterclass", href: "https://github.com/open-lakehouse/lakehouse-masterclass" },
    { label: "Safe, governed AI data engineering on Apache Spark (paper)", href: PAPER_SITE },
    { label: "Model Context Protocol", href: "https://modelcontextprotocol.io" },
    { label: "Iceberg REST catalog specification", href: "https://iceberg.apache.org/rest-catalog-spec/" },
    { label: "Spark Declarative Pipelines guide", href: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html" },
  ],
  keywords: ["agentic lakehouse", "AI agents lakehouse", "lakehouse for AI agents", "agent-ready data platform", "MCP lakehouse", "agentic data platform"],
  updated: GUIDES_UPDATED,
};

// =====================================================================
// Agentic data engineering
// =====================================================================

export const AGENTIC_DATA_ENGINEERING: Guide = {
  slug: "/agentic-data-engineering",
  term: "Agentic data engineering",
  title: "Agentic Data Engineering",
  seoTitle: "Agentic Data Engineering: How AI Agents Build Pipelines Safely",
  tagline: "AI agents write, test and run pipelines; the platform decides what they may do",
  metaDescription:
    "Agentic data engineering: AI agents write, test and run data pipelines while the platform enforces scope, dry runs and policies. The declare, scope, context harness, four checks, evidence and open source stack.",
  definition:
    "Agentic data engineering is the practice of having AI agents write, test, run and maintain data pipelines, with the platform rather than the agent's instructions deciding what each agent is allowed to do. The agent produces declarative pipeline code; the platform validates it with a dry run against the real catalog, limits the agent to its own namespace, checks every tool call against policies, and records traces and lineage. People set the goals, own the policies and review the changes that matter. Built on open source (Apache Spark Declarative Pipelines, Apache Iceberg, Unity Catalog OSS, the Model Context Protocol, an agent harness such as Omnigent, and MLflow), it works with any model, local or hosted.",
  sections: [
    {
      id: "what-changes",
      heading: "What changes when an agent writes the pipeline",
      paragraphs: [
        "When a person writes a pipeline, much of the checking happens in their head: which tables are production, which calls are expensive, when to try a sample first. An agent knows none of that unless something tells it, and something has to stop it when it ignores what it was told. The lakehouse masterclass organizes that something into a harness of three parts.",
      ],
      bullets: [
        { term: "Declare", text: "The agent writes declarative pipelines (Spark Declarative Pipelines). spark-pipelines dry-run resolves every dataset and its inputs without writing data, and a pipeline that fails the dry run does not run." },
        { term: "Scope", text: "The agent works in its own place: one folder of pipeline files and one namespace in the catalog. It can read production tables but writes only its own." },
        { term: "Context", text: "The agent is given what it needs to know, pinned to the versions you run: the pipeline API of your Spark release, the layout of a spec file, the rules a pipeline file must follow." },
      ],
    },
    {
      id: "four-checks",
      heading: "The four checks on an agent's pipeline",
      table: {
        columns: ["Check", "The question", "How the platform answers it"],
        rows: [
          ["API", "Does the pipeline use the framework correctly?", "A dry run, required by a policy before any run"],
          ["Performance", "Does the work stay on the cluster?", "A policy that asks a person before code pulls results onto one machine"],
          ["Scope", "Did it touch only its own tables?", "Policies plus a sandbox namespace in the catalog"],
          ["Correctness", "Are the numbers right?", "Comparison against trusted gold tables"],
        ],
      },
    },
    {
      id: "workflow",
      heading: "How an agentic data engineering workflow runs",
      steps: [
        { title: "A person sets the goal", text: "For example: build a daily revenue table from the orders stream." },
        { title: "The agent proposes a declarative pipeline", text: "It writes pipeline files through named tools, not a shell, so every write is visible to policies." },
        { title: "The platform dry-runs it", text: "Spark Declarative Pipelines resolves every dataset against the real catalog and reports structural errors before data is touched." },
        { title: "Policies gate each call", text: "The harness allows, denies or asks a person about each tool call and result. Errors in a policy count as deny." },
        { title: "Changes go through review", text: "In production, agent output arrives as a pull request; CI dry-runs it and a controller applies it after approval." },
        { title: "Runs happen under the agent's identity", text: "The agent's Spark Connect session and the catalog's credential vending limit what the run can read and write." },
        { title: "Results are evaluated and traced", text: "Outputs are compared with trusted tables, sessions are traced in MLflow, and OpenLineage records which tables were read and written." },
      ],
    },
    {
      id: "evidence",
      heading: "Evidence: declarative pipelines catch agent mistakes early",
      paragraphs: [
        "The safe-spark-agents study ran AI agents on the same data engineering tasks with declarative and imperative pipelines: 528 runs across 22 tasks, 12 seeds and 2 arms. The Spark Declarative Pipelines dry run caught 79 structural defects before any data was processed; the imperative arm caught none at that stage. Declarative output was 49% fewer lines, at about 2.3 times the tokens. After a swap of the agent's skill file, timezone defects went from 7 to 0.",
      ],
    },
    {
      id: "tools",
      heading: "Tools, not a shell",
      paragraphs: [
        "Agents get their tools from an MCP server. Each tool does one thing with named arguments: list, read or write a file in the agent's pipeline folder, dry-run or run its pipeline, run one SQL statement. A policy can read write_pipeline_file(path=\"spark-pipeline.yml\", content=...) exactly; it can only guess what an arbitrary shell command will do. Skills packaged for the lakehouse, such as lakehouse-agent-kit, give agents connection profiles instead of hardcoded endpoints.",
      ],
    },
    {
      id: "stack",
      heading: "The open source agentic data engineering stack",
      table: {
        columns: ["Need", "Open source choice"],
        rows: [
          ["Pipeline framework the platform can validate", "Spark Declarative Pipelines (Apache Spark 4.1 and later)"],
          ["Tables with snapshots and rollback", "Apache Iceberg or Delta Lake"],
          ["Catalog with permissions and credential vending", "Unity Catalog OSS, Apache Polaris, Lakekeeper"],
          ["Remote, identity-pinned engine access", "Spark Connect"],
          ["Agent tools", "Model Context Protocol servers"],
          ["Agent harness, policies and sandboxing", "Omnigent"],
          ["Local or self-hosted models", "Ollama, vLLM"],
          ["Tracing and evaluation", "MLflow"],
          ["Lineage", "OpenLineage"],
          ["Scheduling approved pipelines", "Apache Airflow"],
        ],
      },
    },
  ],
  architectures: [
    { slug: "governed-ai-agents", why: "The reference architecture for agents building Spark pipelines in governed, multi-tenant sandboxes." },
    { slug: "batch-medallion", why: "The declarative medallion pipelines agents write, scheduled by Airflow." },
    { slug: "change-data-capture", why: "AUTO CDC flows: a declarative target an agent can produce and the platform can check." },
    { slug: "laptop-open-lakehouse", why: "A full stack on a laptop to give an agent something real to work against." },
  ],
  learn: [
    { label: "The agentic lakehouse", href: "/agentic-lakehouse" },
    { label: "Lakehouse masterclass, chapter 3: agentic data engineering", href: MASTERCLASS_CH3 },
    { label: "Lakehouse masterclass, chapter 13: agents", href: MASTERCLASS_CH13 },
    { label: "Safe, governed AI data engineering on Apache Spark (paper)", href: PAPER_SITE },
    { label: "Getting started with Omnigent", href: "/learn/getting-started/omnigent" },
    { label: "Installing Omnigent", href: "/learn/getting-started/omnigent-install" },
    { label: "Tracing an agent with MLflow (OpenClaw)", href: "/blog/agentic/openclaw-tracing" },
  ],
  faqs: [
    {
      q: "What is agentic data engineering?",
      a: "The practice of having AI agents write, test, run and maintain data pipelines while the platform enforces what they may do: declarative output validated by a dry run, a sandbox namespace, policies on every tool call, and traces and lineage of every action.",
    },
    {
      q: "Will AI agents replace data engineers?",
      a: "In agentic data engineering, agents do the writing and running, and people set goals, design the platform, own the policies and review the changes that matter. The work moves from typing pipelines to defining what correct and safe mean and checking that agents meet it.",
    },
    {
      q: "Why should agents write declarative pipelines instead of scripts?",
      a: "Because the platform can check declarative output before it runs. In the safe-spark-agents study, the Spark Declarative Pipelines dry run caught 79 structural defects before any data was processed, against none for imperative pipelines at that stage.",
    },
    {
      q: "What is an agent harness?",
      a: "The software that runs an agent: it connects the model to tools, keeps session state, and enforces policies and sandboxing around every tool call. Omnigent is an open source harness that evaluates policies returning ALLOW, DENY or ASK before and after each tool runs.",
    },
    {
      q: "Do I need a frontier model for agentic data engineering?",
      a: "No. The lakehouse masterclass runs its pipeline agent on a local open-weight model (qwen3:14b in Ollama with a 16K context window). Stronger models make fewer mistakes, which is why the harness checks their work rather than trusting it.",
    },
    {
      q: "How do I get started with agentic data engineering?",
      a: "Build the open lakehouse on a laptop with the lakehouse masterclass, then follow its agentic data engineering chapter to add an agent with MCP tools and policies. Move to the governed AI agents reference architecture for multi-tenant production.",
    },
  ],
  sources: [
    { label: "Lakehouse masterclass, chapter 3", href: MASTERCLASS_CH3 },
    { label: "safe-spark-agents-paper repository", href: PAPER },
    { label: "Spark Declarative Pipelines guide", href: "https://spark.apache.org/docs/latest/declarative-pipelines-programming-guide.html" },
    { label: "Model Context Protocol", href: "https://modelcontextprotocol.io" },
  ],
  keywords: ["agentic data engineering", "AI agents data engineering", "AI agents data pipelines", "agentic ETL", "agent harness", "Spark Declarative Pipelines agents"],
  updated: GUIDES_UPDATED,
};

export const GUIDES: Guide[] = [AGENTIC_LAKEHOUSE, AGENTIC_DATA_ENGINEERING];

/** Markdown twin of a guide, for llms-full.txt and <path>.md. */
export function guideMarkdown(g: Guide): string {
  const out: string[] = [`# ${g.title}`, "", `> ${g.tagline}`, "", g.definition, ""];
  for (const s of g.sections) {
    out.push(`## ${s.heading}`, "");
    for (const p of s.paragraphs ?? []) out.push(p, "");
    for (const b of s.bullets ?? []) out.push(`- ${b.term ? `**${b.term}.** ` : ""}${b.text}`);
    if (s.bullets?.length) out.push("");
    if (s.table) {
      out.push(`| ${s.table.columns.join(" | ")} |`, `| ${s.table.columns.map(() => "---").join(" | ")} |`);
      for (const r of s.table.rows) out.push(`| ${r.join(" | ")} |`);
      out.push("");
    }
    (s.steps ?? []).forEach((st, i) => out.push(`${i + 1}. **${st.title}.** ${st.text}`));
    if (s.steps?.length) out.push("");
  }
  out.push("## Reference architectures", "");
  for (const a of g.architectures) out.push(`- https://openlakehouse.io/reference-architectures/${a.slug}: ${a.why}`);
  out.push("", "## Frequently asked questions", "");
  for (const f of g.faqs) out.push(`### ${f.q}`, "", f.a, "");
  out.push("## Sources", ...g.sources.map((s) => `- [${s.label}](${s.href})`), "", `Canonical page: https://openlakehouse.io${g.slug}`);
  return out.join("\n") + "\n";
}
