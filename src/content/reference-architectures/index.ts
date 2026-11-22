// Open Reference Architectures: public entry point and pure helpers.
// No JSX and no browser APIs, so the pages, the prerenderer and the
// SEO generator all share one implementation of every export format.

import { COMPONENTS, componentById } from "./components";
import { CORE_SLOTS, GROUPS, PLATFORM_BANDS, PLATFORM_GROUPS, SLOTS, TEAMS, groupById, slotById, slotsInGroup } from "./platform";
import { INDUSTRIES, SECTORS, industryBySlug } from "./industries";
import { PATTERNS, PATTERN_CATEGORIES, PATTERN_GROUPS, patternBySlug } from "./patterns";
import { RESOURCE_GROUPS } from "./resources";
import type { Industry, Node, Pattern } from "./types";

export * from "./types";
export * from "./resources";
export { COMPONENTS, componentById };
export { CORE_SLOTS, GROUPS, PLATFORM_BANDS, PLATFORM_GROUPS, SLOTS, TEAMS, groupById, slotById, slotsInGroup };
export { INDUSTRIES, SECTORS, industryBySlug };
export { PATTERNS, PATTERN_CATEGORIES, PATTERN_GROUPS, patternBySlug };

export const HUB_PATH = "/reference-architectures";
export const HUB_TITLE = "Data Engineering Reference Architectures";
export const HUB_SHORT = "Reference Architectures";
export const HUB_TAGLINE = "Open source blueprints for batch, streaming and AI data platforms, each one backed by code you can run";
export const HUB_DESCRIPTION =
  "Open source data engineering reference architectures: interactive, runnable blueprints for batch and streaming medallion pipelines, real-time streaming, multi-engine catalogs, governed AI agents and data sharing, mapped to industry use cases and backed by public repositories.";
export const HUB_META =
  "Data engineering reference architectures built on open source: interactive diagrams for batch and streaming pipelines with Spark, Kafka, Delta Lake, Iceberg, Unity Catalog and Airflow, each backed by a runnable repo.";
export const HUB_DEFINITION =
  "An open reference architecture is a documented, runnable blueprint for a data platform in which every layer is open source and every interface between layers is an open format or protocol: Parquet files in an open table format such as Delta Lake or Apache Iceberg, an open catalog API such as Unity Catalog or the Iceberg REST specification, and open engine protocols such as Spark Connect or Arrow Flight SQL. Because the interfaces are open, any box in the diagram can be swapped for another project that speaks the same interface, and the whole architecture can run on a laptop, a Kubernetes cluster or any cloud.";
export const HUB_UPDATED = "2026-11-21";

export const patternPath = (slug: string) => `${HUB_PATH}/${slug}`;
export const industryPath = (slug: string) => `${HUB_PATH}/industries/${slug}`;

export const HUB_FAQS = [
  {
    q: "What is a reference architecture in data engineering?",
    a: "A reference architecture is a reusable blueprint that names the layers of a data platform (sources, ingestion, storage, table format, catalog, compute, orchestration, serving and governance), the component in each layer, and how data flows between them. Teams start from it instead of designing a platform from a blank page.",
  },
  {
    q: "What makes a reference architecture open?",
    a: "Every component is open source and every interface between components is an open format or protocol, so any box can be replaced by another project that speaks the same interface without migrating the data.",
  },
  {
    q: "What is the best open source data engineering stack?",
    a: "There is no single best stack; it depends on the workload. A common open baseline is Apache Spark for compute, Delta Lake or Apache Iceberg for tables, Unity Catalog OSS or an Iceberg REST catalog for governance, Apache Kafka for events, Apache Airflow for orchestration and MLflow for models. The architectures on this page show which combination fits batch, streaming, real-time, sharing and AI workloads.",
  },
  {
    q: "Is there a reference architecture for an agentic lakehouse?",
    a: "Yes. The governed AI agents architecture is the production shape of an agentic lakehouse: agents write Spark Declarative Pipelines as pull requests, CI dry-runs them against the real catalog, each tenant reaches Spark through an identity-pinned Spark Connect endpoint, and a governed Iceberg REST catalog authorizes every request. The agentic lakehouse and agentic data engineering guides on this site explain the concepts.",
  },
  {
    q: "Can I run these reference architectures myself?",
    a: "Yes. Every architecture links to at least one public repository with the versions it pins and the commands from its README, and most run on a laptop with Docker.",
  },
  {
    q: "How are these different from vendor reference architectures?",
    a: "Vendor reference architectures keep the vendor's platform fixed in the middle and vary the industry around it. Here the middle is also open: you can swap the table format, catalog, engine or orchestrator, and each choice is backed by code you can run.",
  },
  {
    q: "Is there a machine-readable version?",
    a: "Yes. /reference-architectures.json contains every architecture, component and industry lens, and each architecture page has a Markdown twin at the same path with a .md suffix.",
  },
];

// ---------- Board state helpers ----------

/** Apply swaps (node index -> component id) to a pattern's nodes. */
export function applySwaps(pattern: Pattern, swaps: Record<number, string>): Node[] {
  return pattern.nodes.map((n, i) => {
    const to = swaps[i];
    if (!to || !n.swaps?.includes(to)) return n;
    return { ...n, component: to, version: undefined, role: n.role };
  });
}

export const nodeName = (n: Node) => componentById(n.component)?.name ?? n.label ?? "";

/** Nodes keyed by slot, honouring the simplified/detailed view. */
export function nodesBySlot(nodes: Node[], detailed: boolean) {
  const map = new Map<string, Node[]>();
  for (const n of nodes.filter((x) => detailed || !x.detail)) {
    if (!map.has(n.slot)) map.set(n.slot, []);
    map.get(n.slot)!.push(n);
  }
  return map;
}

/** Slot order for exports: zones left to right, platform groups top to bottom. */
const SLOT_ORDER = SLOTS.map((x) => x.id);
const bySlotOrder = (a: Node, b: Node) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);

/** Teams whose work touches the slots this architecture uses. */
export function teamsForNodes(nodes: Node[]) {
  const used = new Set(nodes.map((n) => n.slot));
  return TEAMS.filter((t) => t.slots.some((sl) => used.has(sl)));
}

/** Industry use cases that map to a pattern, across all industries. */
export function patternUseCases(slug: string) {
  return INDUSTRIES.flatMap((ind) =>
    ind.useCases.filter((u) => u.pattern === slug).map((u) => ({ industry: ind, useCase: u })),
  );
}

export function patternsForComponent(componentId: string) {
  return PATTERNS.filter((p) => p.nodes.some((n) => n.component === componentId || n.swaps?.includes(componentId)));
}

// ---------- Export formats ----------

const yamlStr = (s: string) => (/^[\w .,/()+-]*$/.test(s) && !/^\s|\s$/.test(s) && s !== "" ? s : JSON.stringify(s));

export function toYaml(pattern: Pattern, nodes: Node[], industry?: Industry): string {
  const out: string[] = [];
  out.push(`# Open reference architecture, exported from https://openlakehouse.io${patternPath(pattern.slug)}`);
  out.push(`apiVersion: openlakehouse.io/v1`);
  out.push(`kind: ReferenceArchitecture`);
  out.push(`metadata:`);
  out.push(`  name: ${pattern.slug}`);
  out.push(`  title: ${yamlStr(pattern.title)}`);
  out.push(`  category: ${yamlStr(pattern.category)}`);
  if (industry) out.push(`  industry: ${industry.slug}`);
  out.push(`  updated: "${pattern.updated}"`);
  out.push(`spec:`);
  out.push(`  capabilities:`);
  for (const sl of SLOTS) {
    const inSlot = nodes.filter((n) => n.slot === sl.id);
    if (!inSlot.length) continue;
    out.push(`    - capability: ${sl.id}`);
    out.push(`      group: ${sl.group}`);
    out.push(`      components:`);
    for (const n of inSlot) {
      const c = componentById(n.component);
      out.push(`        - name: ${yamlStr(nodeName(n))}`);
      if (c) out.push(`          id: ${c.id}`);
      out.push(`          role: ${yamlStr(n.role)}`);
      if (n.version) out.push(`          version: ${yamlStr(n.version)}`);
      if (c?.license) out.push(`          license: ${c.license}`);
      if (c?.url) out.push(`          url: ${c.url}`);
      if (n.swaps?.length) out.push(`          swappableWith: [${n.swaps.join(", ")}]`);
    }
  }
  if (industry) {
    out.push(`  industryLens:`);
    out.push(`    sources:`);
    for (const s of industry.sources) out.push(`      - ${yamlStr(`${s.name}: ${s.delivery}`)}`);
    out.push(`    formats: [${industry.formats.map((f) => yamlStr(f.name)).join(", ")}]`);
  }
  out.push(`  repositories:`);
  for (const r of pattern.repos) out.push(`    - ${r.url}`);
  return out.join("\n") + "\n";
}

const mmId = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "_");
const mmLabel = (s: string) => s.replace(/"/g, "'");

export function toMermaid(pattern: Pattern, nodes: Node[]): string {
  const out: string[] = ["flowchart LR"];
  const groupsPresent = GROUPS.filter((g) => nodes.some((n) => slotById(n.slot).group === g.id));
  for (const g of groupsPresent) {
    out.push(`  subgraph ${mmId(g.id)}["${mmLabel(g.name)}"]`);
    nodes.forEach((n, i) => {
      if (slotById(n.slot).group !== g.id) return;
      const v = n.version ? `<br/><small>${mmLabel(n.version)}</small>` : "";
      out.push(`    n${i}["${mmLabel(nodeName(n))}${v}"]`);
    });
    out.push("  end");
  }
  const flow = ["sources", "ingest", "ai", "access", "execution", "data", "serving"].filter((id) => groupsPresent.some((g) => g.id === id));
  for (let i = 0; i < flow.length - 1; i++) out.push(`  ${mmId(flow[i])} --> ${mmId(flow[i + 1])}`);
  for (const band of ["governance", "operations"]) if (groupsPresent.some((g) => g.id === band) && flow.includes("data")) out.push(`  ${band} -.-> data`);
  out.push(`  %% ${pattern.title}: https://openlakehouse.io${patternPath(pattern.slug)}`);
  return out.join("\n") + "\n";
}

export function toJson(pattern: Pattern, nodes: Node[], industry?: Industry) {
  return {
    $schema: "https://openlakehouse.io/reference-architectures.json",
    url: `https://openlakehouse.io${patternPath(pattern.slug)}`,
    slug: pattern.slug,
    title: pattern.title,
    category: pattern.category,
    definition: pattern.definition,
    industry: industry?.slug,
    components: nodes.map((n) => {
      const c = componentById(n.component);
      return { capability: n.slot, name: nodeName(n), id: c?.id, role: n.role, version: n.version, license: c?.license, url: c?.url, swappableWith: n.swaps };
    }),
    repositories: pattern.repos.map((r) => ({ name: r.name, url: r.url, license: r.license, targets: r.targets })),
    updated: pattern.updated,
  };
}

/** A self-contained prompt for pasting the architecture into any AI assistant. */
export function toAiPrompt(pattern: Pattern, nodes: Node[], industry?: Industry): string {
  const lines = [
    `I am designing a data platform based on the "${pattern.title}" open reference architecture (https://openlakehouse.io${patternPath(pattern.slug)}).`,
    industry ? `Industry: ${industry.name}. Typical sources: ${industry.sources.map((s) => s.name).join("; ")}. Exchange formats: ${industry.formats.map((f) => f.name).join(", ")}.` : "",
    "",
    "Components by capability:",
    ...[...nodes].sort(bySlotOrder).map((n) => `- ${slotById(n.slot).name}: ${nodeName(n)}${n.version ? ` (${n.version})` : ""}, ${n.role}`),
    "",
    "Known caveats:",
    ...pattern.caveats.map((c) => `- ${c}`),
    "",
    `Reference code: ${pattern.repos.map((r) => r.url).join(", ")}`,
    "",
    "Help me adapt this architecture to my requirements. Ask me about data volume, latency, team skills and where it will run before recommending changes, and say which components you would swap and why.",
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}

/** Markdown twin of a pattern page (served at <path>.md and used in llms-full.txt). */
export function patternMarkdown(p: Pattern): string {
  const out: string[] = [];
  out.push(`# ${p.title}: ${p.stackLine}`, "", `> ${p.tagline}`, "", p.definition, "");
  out.push("## When to use it", ...p.whenToUse.map((w) => `- ${w}`), "");
  out.push("## When not to", ...p.notFor.map((w) => `- ${w}`), "");
  out.push("## Components", "", "| Capability | Component | Role | Version |", "|---|---|---|---|");
  for (const n of [...p.nodes].sort(bySlotOrder)) out.push(`| ${slotById(n.slot).name} | ${nodeName(n)} | ${n.role} | ${n.version ?? ""} |`);
  out.push("", "## How data flows");
  p.steps.forEach((s, i) => out.push(`${i + 1}. **${s.title}.** ${s.body}`));
  out.push("", "## Run it");
  for (const r of p.repos) {
    out.push("", `### [${r.name}](${r.url})`, "", r.description);
    if (r.quickstart?.length) out.push("", "```bash", ...r.quickstart, "```");
  }
  if (p.caveats.length) out.push("", "## Caveats", ...p.caveats.map((c) => `- ${c}`));
  const uses = patternUseCases(p.slug);
  if (uses.length) {
    out.push("", "## Industry use cases");
    for (const { industry, useCase } of uses) out.push(`- **${industry.name}: ${useCase.title}.** ${useCase.problem}`);
  }
  out.push("", "## Frequently asked questions");
  for (const f of p.faqs) out.push("", `### ${f.q}`, "", f.a);
  out.push("", "## Sources", ...p.sources.map((s) => `- [${s.label}](${s.href})`));
  out.push("", `Last updated: ${p.updated}. Canonical page: https://openlakehouse.io${patternPath(p.slug)}`);
  return out.join("\n") + "\n";
}

export function industryMarkdown(ind: Industry): string {
  const out: string[] = [];
  out.push(`# Open source data architecture for ${ind.name}`, "", ind.summary, "");
  out.push("## Source systems", "", "| System | How data arrives |", "|---|---|");
  for (const s of ind.sources) out.push(`| ${s.name} | ${s.delivery} |`);
  out.push("", "## Data formats and standards", "", "| Format | Standards body | What it carries |", "|---|---|---|");
  for (const f of ind.formats) out.push(`| [${f.name}](${f.url}) | ${f.body} | ${f.what} |`);
  out.push("", "## Medallion layers in this industry's terms");
  out.push(`- **Bronze:** ${ind.medallion.bronze}`, `- **Silver:** ${ind.medallion.silver}`, `- **Gold:** ${ind.medallion.gold}`);
  out.push("", "## Use cases and the architecture for each");
  for (const u of ind.useCases) {
    const p = patternBySlug(u.pattern);
    out.push(`- **${u.title}.** ${u.problem} Architecture: [${p?.title}](https://openlakehouse.io${patternPath(u.pattern)}).`);
  }
  out.push("", `Canonical page: https://openlakehouse.io${industryPath(ind.slug)}`);
  return out.join("\n") + "\n";
}

export function industryFaqs(ind: Industry) {
  const patterns = Array.from(new Set(ind.useCases.map((u) => u.pattern))).map((s) => patternBySlug(s)!);
  return [
    {
      q: `What is an open source data architecture for ${ind.name.toLowerCase()}?`,
      a: `${ind.summary} The open architectures that fit its main use cases are ${patterns.map((p) => p.title).join(", ")}.`,
    },
    {
      q: `Which data formats matter for ${ind.name.toLowerCase()} data engineering?`,
      a: `${ind.formats.map((f) => `${f.name} (${f.body}): ${f.what}`).join("; ")}.`,
    },
    {
      q: `What goes in the bronze, silver and gold layers for ${ind.name.toLowerCase()}?`,
      a: `Bronze: ${ind.medallion.bronze}. Silver: ${ind.medallion.silver}. Gold: ${ind.medallion.gold}.`,
    },
  ];
}

/** Full machine-readable dataset, published at /reference-architectures.json. */
export function dataset() {
  return {
    name: HUB_TITLE,
    description: HUB_DESCRIPTION,
    url: `https://openlakehouse.io${HUB_PATH}`,
    updated: HUB_UPDATED,
    groups: GROUPS,
    capabilities: SLOTS,
    teams: TEAMS,
    components: COMPONENTS,
    patterns: PATTERNS.map((p) => ({ ...p, url: `https://openlakehouse.io${patternPath(p.slug)}` })),
    industries: INDUSTRIES.map((i) => ({ ...i, url: `https://openlakehouse.io${industryPath(i.slug)}` })),
    resources: RESOURCE_GROUPS,
  };
}

// ---------- Search ----------

export type SearchHit = { kind: "Architecture" | "Industry" | "Use case" | "Component" | "Format" | "Resource"; title: string; sub: string; href: string; external?: boolean; hay: string; rank: number };

let INDEX: SearchHit[] | null = null;

export function searchIndex(): SearchHit[] {
  if (INDEX) return INDEX;
  const out: SearchHit[] = [];
  for (const p of PATTERNS) {
    out.push({
      kind: "Architecture",
      title: p.title,
      sub: p.stackLine,
      href: patternPath(p.slug),
      hay: [p.title, p.stackLine, p.tagline, p.category, ...p.keywords, ...p.nodes.map((n) => `${nodeName(n)} ${n.role} ${slotById(n.slot).name}`)].join(" "),
      rank: 0,
    });
  }
  for (const i of INDUSTRIES) {
    out.push({
      kind: "Industry",
      title: i.name,
      sub: i.summary,
      href: industryPath(i.slug),
      hay: [i.name, i.sector, i.summary, ...i.sources.map((s) => s.name), ...i.formats.map((f) => f.name)].join(" "),
      rank: 1,
    });
    for (const u of i.useCases) {
      out.push({ kind: "Use case", title: u.title, sub: `${i.name}: ${u.problem}`, href: `${patternPath(u.pattern)}?industry=${i.slug}`, hay: `${u.title} ${u.problem} ${i.name}`, rank: 3 });
    }
    for (const f of i.formats) {
      out.push({ kind: "Format", title: f.name, sub: `${f.body}. ${f.what}. Used in ${i.name}.`, href: industryPath(i.slug), hay: `${f.name} ${f.body} ${f.what} ${i.name}`, rank: 4 });
    }
  }
  for (const c of COMPONENTS) {
    const used = patternsForComponent(c.id);
    if (!used.length) continue;
    out.push({
      kind: "Component",
      title: c.name,
      sub: `${c.blurb} In: ${used.map((p) => p.title).join(", ")}.`,
      href: patternPath(used[0].slug),
      hay: `${c.name} ${c.id} ${c.blurb} ${slotById(c.slot).name}`,
      rank: 2,
    });
  }
  for (const g of RESOURCE_GROUPS) {
    for (const r of g.items) {
      if (r.component) continue;
      out.push({ kind: "Resource", title: r.name, sub: r.what, href: r.url, external: true, hay: `${r.name} ${r.what} ${g.title}`, rank: 5 });
    }
  }
  INDEX = out.map((h) => ({ ...h, hay: h.hay.toLowerCase() }));
  return INDEX;
}

export function search(query: string, limit = 12): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const seen = new Set<string>();
  return searchIndex()
    .filter((h) => terms.every((t) => h.hay.includes(t)))
    .map((h) => ({ h, score: h.rank - (h.title.toLowerCase().includes(terms[0]) ? 10 : 0) }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.h)
    .filter((h) => {
      const k = `${h.kind}:${h.title}:${h.href}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}
