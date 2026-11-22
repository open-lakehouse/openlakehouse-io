import { Link, useParams } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { ArchitectureBoard } from "@/components/refarch/ArchitectureBoard";
import { FaqList, Hero, SectionHeading } from "@/components/refarch/parts";
import { industryJsonLd } from "@/lib/refarch-seo";
import NotFound from "@/pages/NotFound";
import { INDUSTRIES, industryBySlug, industryFaqs, industryPath, patternBySlug, patternPath } from "@/content/reference-architectures";

const IndustryPage = () => {
  const { slug } = useParams();
  const ind = industryBySlug(slug);
  if (!ind) return <NotFound />;

  // Most common pattern across this industry's use cases opens the board.
  const counts = new Map<string, number>();
  ind.useCases.forEach((u) => counts.set(u.pattern, (counts.get(u.pattern) ?? 0) + 1));
  const lead = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const siblings = INDUSTRIES.filter((i) => i.sector === ind.sector && i.slug !== ind.slug);
  const title = `Open source data architecture for ${ind.name}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Seo title={title} description={ind.summary} path={industryPath(ind.slug)} type="article" jsonLd={industryJsonLd(ind)} />
      <SiteHeader />
      <main className="flex-1">
        <Hero eyebrow={`${ind.sector} · Industry lens`} title={title} sub={ind.summary} crumbs={[{ name: "Home", to: "/" }, { name: "Reference Architectures", to: "/reference-architectures" }, { name: ind.name }]} />

        <section id="board" className="scroll-mt-20 border-b border-border bg-muted/30 py-12 md:py-16">
          <div className="container">
            <SectionHeading id="board-heading" eyebrow="Interactive" title={`${ind.name} on the open lakehouse`}>
              The board opens on the architecture most of these use cases need. Switch architectures to see the others; the {ind.name.toLowerCase()} sources stay in place.
            </SectionHeading>
            <ArchitectureBoard industry={ind} defaultPattern={lead} />
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <SectionHeading id="use-cases" eyebrow="Use cases" title={`${ind.name} use cases and the architecture for each`} />
          <div className="grid gap-4 md:grid-cols-2">
            {ind.useCases.map((u) => {
              const p = patternBySlug(u.pattern)!;
              return (
                <div key={u.title} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-semibold">{u.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{u.problem}</p>
                  <Link to={`${patternPath(p.slug)}?industry=${ind.slug}#board`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    {p.title} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container grid gap-8 pb-12 md:pb-16 lg:grid-cols-2">
          <div>
            <h2 id="sources" className="mb-4 text-2xl font-bold tracking-tight">
              Source systems
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left">
                  <tr>
                    <th className="p-3 font-semibold">System</th>
                    <th className="p-3 font-semibold">How data arrives</th>
                  </tr>
                </thead>
                <tbody>
                  {ind.sources.map((s) => (
                    <tr key={s.name} className="border-t border-border">
                      <td className="p-3 align-top font-medium">{s.name}</td>
                      <td className="p-3 align-top text-muted-foreground">{s.delivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 id="formats" className="mb-4 text-2xl font-bold tracking-tight">
              Data formats and standards
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left">
                  <tr>
                    <th className="p-3 font-semibold">Format</th>
                    <th className="p-3 font-semibold">Standards body</th>
                    <th className="p-3 font-semibold">Carries</th>
                  </tr>
                </thead>
                <tbody>
                  {ind.formats.map((f) => (
                    <tr key={f.name} className="border-t border-border">
                      <td className="p-3 align-top">
                        <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                          {f.name} <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-3 align-top">{f.body}</td>
                      <td className="p-3 align-top text-muted-foreground">{f.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container pb-12 md:pb-16">
          <h2 id="medallion" className="mb-4 text-2xl font-bold tracking-tight">
            Bronze, silver and gold in {ind.name.toLowerCase()} terms
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { k: "Bronze", v: ind.medallion.bronze, c: "border-yellow-700/50 bg-yellow-100/40 dark:bg-yellow-900/20" },
              { k: "Silver", v: ind.medallion.silver, c: "border-navy-400/60 bg-navy-100/60 dark:bg-navy-700/40" },
              { k: "Gold", v: ind.medallion.gold, c: "border-yellow-500/60 bg-yellow-200/40 dark:bg-yellow-800/20" },
            ].map((m) => (
              <div key={m.k} className={`rounded-2xl border p-5 ${m.c}`}>
                <p className="text-xs font-semibold uppercase tracking-widest">{m.k}</p>
                <p className="mt-2">{m.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container grid gap-10 pb-16 md:grid-cols-[2fr_1fr]">
          <div>
            <SectionHeading id="faq" eyebrow="Answers" title="Frequently asked questions" />
            <FaqList faqs={industryFaqs(ind)} />
          </div>
          <aside>
            <h2 className="mb-3 font-semibold">More in {ind.sector}</h2>
            <ul className="space-y-2">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link to={industryPath(s.slug)} className="inline-flex items-center gap-1 text-primary hover:underline">
                    {s.name} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/reference-architectures#industries" className="inline-flex items-center gap-1 text-primary hover:underline">
                  All industries <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default IndustryPage;
