import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Braces, ExternalLink, FileText } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { ArchitectureBoard } from "@/components/refarch/ArchitectureBoard";
import { ArchitectureSearch } from "@/components/refarch/ArchitectureSearch";
import { FaqList, Hero, PatternCard, SectionHeading } from "@/components/refarch/parts";
import { hubJsonLd } from "@/lib/refarch-seo";
import {
  HUB_DEFINITION,
  HUB_FAQS,
  HUB_META,
  HUB_PATH,
  HUB_TAGLINE,
  HUB_UPDATED,
  INDUSTRIES,
  PATTERNS,
  PATTERN_GROUPS,
  RESOURCE_GROUPS,
  componentById,
  industryPath,
  patternBySlug,
  patternPath,
  patternsForComponent,
} from "@/content/reference-architectures";

// Answer-shaped chooser: the question people actually type, mapped to a pattern.
const CHOOSER: { q: string; slug: string }[] = [
  { q: "My data arrives as files or extracts every night or every hour.", slug: "batch-medallion" },
  { q: "I need current and historical versions of rows from a database change feed.", slug: "change-data-capture" },
  { q: "My sources emit events and I want tables a few seconds behind them.", slug: "streaming-medallion" },
  { q: "I need a decision while the event is still in flight, in milliseconds.", slug: "real-time-streaming" },
  { q: "Different teams want Spark, DuckDB, Trino or Python on the same data.", slug: "multi-engine-catalog" },
  { q: "I want AI agents to build pipelines without handing them production keys.", slug: "governed-ai-agents" },
  { q: "Partners or customers need live access to some of my tables.", slug: "open-data-sharing" },
  { q: "I want to learn the whole stack, or test against it, on my laptop.", slug: "laptop-open-lakehouse" },
];

const groupId = (category: string) => `group-${category.toLowerCase().replace(/\s+/g, "-")}`;

const ReferenceArchitectures = () => (
  <div className="flex min-h-screen flex-col">
    <Seo title="Open Source Data Engineering Reference Architectures" description={HUB_META} path={HUB_PATH} jsonLd={hubJsonLd()} />
    <SiteHeader />
    <main className="flex-1">
      <Hero eyebrow="Open source" title="Data engineering reference architectures" sub={`${HUB_TAGLINE}.`}>
        <div className="mt-8">
          <ArchitectureSearch dark />
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a href="#explorer" className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 font-semibold text-navy-900 hover:bg-green-400">
            Open the board <ArrowDown className="h-4 w-4" />
          </a>
          {PATTERN_GROUPS.slice(0, 3).map((g) => (
            <a key={g.category} href={`#${groupId(g.category)}`} className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 font-semibold text-white hover:bg-white/10">
              {g.category}
            </a>
          ))}
          <a href="#resources" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 font-semibold text-white hover:bg-white/10">
            Resources
          </a>
        </div>
      </Hero>

      {/* ---------- Definition + Batch / Streaming / Platform ---------- */}
      <section id="architectures" className="scroll-mt-20 container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 id="what-is" className="text-2xl font-bold tracking-tight md:text-3xl">
              What is an open reference architecture?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">{HUB_DEFINITION}</p>
          </div>
          <aside className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold">How these differ from a diagram in a slide deck</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Swappable.</strong> Choose Delta Lake or Iceberg, Unity Catalog or Polaris, Spark or Flink, and see what changes.
              </li>
              <li>
                <strong className="text-foreground">Runnable.</strong> Each architecture links to a public repo with pinned versions and the commands from its README.
              </li>
              <li>
                <strong className="text-foreground">Caveats included.</strong> Version incompatibilities and known gaps from those repos are listed on every page.
              </li>
              <li>
                <strong className="text-foreground">Machine-readable.</strong> Export YAML, Mermaid or JSON, or copy an architecture as a prompt for your AI assistant.
              </li>
            </ul>
          </aside>
        </div>

        <div className="mt-16 space-y-14">
          {PATTERN_GROUPS.map((g) => (
            <div key={g.category} id={groupId(g.category)} className="scroll-mt-24">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {g.category === "More patterns" ? "More patterns" : `${g.category} architectures`}
                </h2>
                <p className="max-w-xl text-sm text-muted-foreground">{g.blurb}</p>
              </div>
              <div className={`grid gap-4 sm:grid-cols-2 ${g.category === "More patterns" ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
                {PATTERNS.filter((p) => p.category === g.category).map((p) => (
                  <PatternCard key={p.slug} pattern={p} note={g.category === "More patterns" ? undefined : p.tagline} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Explorer ---------- */}
      <section id="explorer" className="scroll-mt-20 border-y border-border bg-muted/30 py-14 md:py-20">
        <div className="container">
          <SectionHeading id="explorer-heading" eyebrow="Interactive" title="The architecture board">
            Pick an architecture and an industry, switch between simplified and detailed views, select any box to inspect or swap it, then share the link or export what's on screen.
          </SectionHeading>
          <ArchitectureBoard />
        </div>
      </section>

      {/* ---------- Chooser ---------- */}
      <section className="container py-14 md:py-20">
        <SectionHeading id="which-architecture" eyebrow="Start from the problem" title="Which data engineering architecture should I use?" />
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="p-4 font-semibold">If this sounds like you</th>
                <th className="p-4 font-semibold">Start with</th>
              </tr>
            </thead>
            <tbody>
              {CHOOSER.map((c) => {
                const p = patternBySlug(c.slug)!;
                return (
                  <tr key={c.slug} className="border-t border-border">
                    <td className="p-4 align-top">{c.q}</td>
                    <td className="p-4 align-top">
                      <Link to={patternPath(p.slug)} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                        {p.title} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Industries ---------- */}
      <section id="industries" className="scroll-mt-20 border-y border-border bg-muted/30 py-14 md:py-20">
        <div className="container">
          <SectionHeading id="industries-heading" eyebrow="Industry lenses" title="Data engineering architectures by industry">
            An industry does not change the open stack in the middle. It changes the source systems, the exchange formats, what bronze, silver and gold mean, and which architecture each use case needs.
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((i) => (
              <Link key={i.slug} to={industryPath(i.slug)} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{i.sector}</span>
                <span className="mt-2 text-lg font-bold tracking-tight group-hover:text-primary">{i.name}</span>
                <span className="mt-2 flex-1 text-sm text-muted-foreground">{i.useCases.slice(0, 3).map((u) => u.title).join(" · ")}</span>
                <span className="mt-4 text-xs text-muted-foreground">{i.formats.map((f) => f.name).join(", ")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Resources ---------- */}
      <section id="resources" className="scroll-mt-20 container py-14 md:py-20">
        <SectionHeading id="resources-heading" eyebrow="Resources" title="Open source data engineering resources">
          The projects, specs and runnable stacks behind these architectures, grouped by what you would look them up for. Projects link to the architectures that use them.
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {RESOURCE_GROUPS.map((g) => (
            <div key={g.id} id={`resources-${g.id}`} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold">{g.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{g.intro}</p>
              <ul className="mt-4 space-y-3">
                {g.items.map((r) => {
                  const used = r.component && componentById(r.component) ? patternsForComponent(r.component).slice(0, 3) : [];
                  return (
                    <li key={r.url} className="text-sm">
                      <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                        {r.name} <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground"> {r.what}</span>
                      {used.length > 0 && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          In:{" "}
                          {used.map((p, i) => (
                            <span key={p.slug}>
                              <Link to={patternPath(p.slug)} className="hover:text-primary hover:underline">
                                {p.title}
                              </Link>
                              {i < used.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="scroll-mt-20 container pb-14 md:pb-20">
        <SectionHeading id="faq-heading" eyebrow="Answers" title="Frequently asked questions" />
        <div className="max-w-3xl">
          <FaqList faqs={HUB_FAQS} />
        </div>
      </section>

      {/* ---------- Machine-readable ---------- */}
      <section className="container pb-20">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">For agents and tools</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The full catalog is published as JSON, every architecture page has a Markdown twin, and all of it is indexed in llms.txt. Last updated {HUB_UPDATED}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/reference-architectures.json" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary">
              <Braces className="h-4 w-4" /> reference-architectures.json
            </a>
            <a href="/llms.txt" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary">
              <FileText className="h-4 w-4" /> llms.txt
            </a>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default ReferenceArchitectures;
