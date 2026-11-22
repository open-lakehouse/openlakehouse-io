import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Github, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { CodeBlock } from "@/components/CodeBlock";
import { ArchitectureBoard } from "@/components/refarch/ArchitectureBoard";
import { ComponentLink, FaqList, Hero, LinkList, PatternCard, SectionHeading } from "@/components/refarch/parts";
import { patternJsonLd } from "@/lib/refarch-seo";
import NotFound from "@/pages/NotFound";
import {
  PATTERNS,
  componentById,
  industryPath,
  layerById,
  patternBySlug,
  patternPath,
  patternUseCases,
  type DeployTarget,
} from "@/content/reference-architectures";

const TARGET_LABEL: Record<DeployTarget, string> = {
  laptop: "Laptop (Docker)",
  kubernetes: "Kubernetes",
  aws: "AWS",
  serverless: "Serverless",
  "cloud-agnostic": "Any cloud",
};

const ArchitecturePage = () => {
  const { slug } = useParams();
  const p = patternBySlug(slug);
  if (!p) return <NotFound />;

  const targets = Array.from(new Set(p.repos.flatMap((r) => r.targets)));
  const uses = patternUseCases(p.slug);
  const related = PATTERNS.filter((o) => o.slug !== p.slug)
    .map((o) => ({ o, score: (o.category === p.category ? 2 : 0) + o.nodes.filter((n) => n.component && p.nodes.some((m) => m.component === n.component)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.o);

  return (
    <div className="flex min-h-screen flex-col">
      <Seo
        title={`${p.title}: ${p.stackLine}`}
        description={p.definition.length > 158 ? `${p.definition.slice(0, p.definition.lastIndexOf(" ", 155))}...` : p.definition}
        path={patternPath(p.slug)}
        type="article"
        jsonLd={patternJsonLd(p)}
      />
      <SiteHeader />
      <main className="flex-1">
        <Hero eyebrow={`${p.category} · Open reference architecture`} title={p.title} sub={p.stackLine} crumbs={[{ name: "Home", to: "/" }, { name: "Reference Architectures", to: "/reference-architectures" }, { name: p.title }]}>
          <p className="mt-4 max-w-3xl text-white/75">{p.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {targets.map((t) => (
              <span key={t} className="rounded-full border border-white/30 px-3 py-1 text-white/90">
                {TARGET_LABEL[t]}
              </span>
            ))}
            <span className="rounded-full border border-white/30 px-3 py-1 text-white/70">Updated {p.updated}</span>
          </div>
        </Hero>

        <section className="container py-12 md:py-16">
          <div className="max-w-3xl rounded-2xl border-l-4 border-primary bg-primary/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">In one paragraph</p>
            <p className="mt-2 text-lg leading-relaxed">{p.definition}</p>
          </div>
        </section>

        <section id="board" className="scroll-mt-20 border-y border-border bg-muted/30 py-12 md:py-16">
          <div className="container">
            <ArchitectureBoard pattern={p} />
          </div>
        </section>

        <section className="container grid gap-6 py-12 md:grid-cols-2 md:py-16">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 id="when-to-use" className="flex items-center gap-2 text-xl font-bold">
              <CheckCircle2 className="h-5 w-5 text-primary" /> When to use it
            </h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {p.whenToUse.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 id="when-not" className="flex items-center gap-2 text-xl font-bold">
              <XCircle className="h-5 w-5 text-muted-foreground" /> When to pick something else
            </h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {p.notFor.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container pb-12 md:pb-16">
          <SectionHeading id="data-flow" eyebrow="Walkthrough" title="How data moves through it" />
          <ol className="relative max-w-3xl space-y-6 border-l-2 border-primary/30 pl-8">
            {p.steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="container pb-12 md:pb-16">
          <SectionHeading id="components" eyebrow="Bill of materials" title="Components and versions">
            Versions are the ones pinned in the reference repositories below.
          </SectionHeading>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="p-3 font-semibold">Layer</th>
                  <th className="p-3 font-semibold">Component</th>
                  <th className="p-3 font-semibold">Role in this architecture</th>
                  <th className="p-3 font-semibold">Version</th>
                  <th className="p-3 font-semibold">License</th>
                </tr>
              </thead>
              <tbody>
                {p.nodes.map((n, i) => {
                  const c = componentById(n.component);
                  return (
                    <tr key={i} className="border-t border-border">
                      <td className="p-3 align-top text-muted-foreground">{layerById(n.layer).short}</td>
                      <td className="p-3 align-top">
                        <ComponentLink id={n.component} fallback={n.label} />
                        {n.swaps?.length ? (
                          <span className="mt-1 block text-xs text-muted-foreground">or {n.swaps.map((s) => componentById(s)?.name).join(", ")}</span>
                        ) : null}
                      </td>
                      <td className="p-3 align-top">{n.role}</td>
                      <td className="p-3 align-top font-mono text-xs">{n.version ?? ""}</td>
                      <td className="p-3 align-top text-xs">{c?.license ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="container pb-12 md:pb-16">
          <SectionHeading id="run-it" eyebrow="Run it" title="Reference code" />
          <div className="space-y-6">
            {p.repos.map((r) => (
              <div key={r.name} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lg font-semibold hover:text-primary">
                    <Github className="h-5 w-5" /> {r.name}
                  </a>
                  <span className="flex flex-wrap gap-1.5 text-xs">
                    {r.license && <span className="rounded-md bg-muted px-2 py-0.5">{r.license}</span>}
                    {r.targets.map((t) => (
                      <span key={t} className="rounded-md bg-muted px-2 py-0.5">
                        {TARGET_LABEL[t]}
                      </span>
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">{r.description}</p>
                {r.quickstart?.length ? (
                  <CodeBlock className="bg-navy-900 text-navy-100 text-xs leading-relaxed">
                    <code>{r.quickstart.join("\n")}</code>
                  </CodeBlock>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {p.caveats.length > 0 && (
          <section className="container pb-12 md:pb-16">
            <div className="max-w-3xl rounded-2xl border border-yellow-500/50 bg-yellow-100/40 p-6 dark:bg-yellow-900/20">
              <h2 id="caveats" className="flex items-center gap-2 text-xl font-bold">
                <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" /> Caveats from the reference repos
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                {p.caveats.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {uses.length > 0 && (
          <section className="container pb-12 md:pb-16">
            <SectionHeading id="industries" eyebrow="Industry lenses" title="Where this architecture shows up" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {uses.map(({ industry, useCase }) => (
                <Link
                  key={`${industry.slug}-${useCase.title}`}
                  to={`${patternPath(p.slug)}?industry=${industry.slug}#board`}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{industry.name}</span>
                  <span className="mt-1 block font-semibold">{useCase.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{useCase.problem}</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Each card opens the board with that industry's sources. Full industry pages:{" "}
              {Array.from(new Set(uses.map((u) => u.industry)))
                .slice(0, 8)
                .map((ind, i, arr) => (
                  <span key={ind.slug}>
                    <Link to={industryPath(ind.slug)} className="text-primary hover:underline">
                      {ind.name}
                    </Link>
                    {i < arr.length - 1 ? ", " : ""}
                  </span>
                ))}
              .
            </p>
          </section>
        )}

        <section className="container grid gap-10 pb-12 md:grid-cols-[2fr_1fr] md:pb-16">
          <div>
            <SectionHeading id="faq" eyebrow="Answers" title="Frequently asked questions" />
            <FaqList faqs={p.faqs} />
          </div>
          <aside className="space-y-8">
            <div>
              <h2 id="learn" className="mb-3 font-semibold">
                Keep learning
              </h2>
              <LinkList links={p.learn} />
            </div>
            <div>
              <h2 id="sources" className="mb-3 font-semibold">
                Sources
              </h2>
              <LinkList links={p.sources} />
            </div>
            <a href={`${patternPath(p.slug)}.md`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
              <FileText className="h-4 w-4" /> Markdown version of this page
            </a>
          </aside>
        </section>

        <section className="border-t border-border bg-muted/30 py-12 md:py-16">
          <div className="container">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 id="related" className="text-2xl font-bold tracking-tight">
                Related architectures
              </h2>
              <Link to="/reference-architectures#architectures" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                All architectures <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((o) => (
                <PatternCard key={o.slug} pattern={o} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ArchitecturePage;
