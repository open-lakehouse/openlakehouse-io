import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, ExternalLink, FileText } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import { GUIDE_NAV, type Guide, type GuideLink } from "@/content/agentic";
import { patternBySlug, patternPath } from "@/content/reference-architectures";

const publisher = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

function guideJsonLd(g: Guide) {
  const url = canonicalUrl(g.slug);
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: g.seoTitle,
      description: g.definition,
      url,
      mainEntityOfPage: url,
      datePublished: g.updated,
      dateModified: g.updated,
      author: publisher,
      publisher,
      keywords: g.keywords.join(", "),
      about: { "@type": "DefinedTerm", name: g.term, description: g.definition, url },
      citation: g.sources.map((s) => s.href),
    },
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: g.term,
      description: g.definition,
      url,
      inDefinedTermSet: { "@type": "DefinedTermSet", name: "Open Lakehouse glossary", url: canonicalUrl("/faq") },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: g.title, item: url },
      ],
    },
  ];
}

const isExternal = (href: string) => /^https?:/.test(href);
const SmartLink = ({ l }: { l: GuideLink }) =>
  isExternal(l.href) ? (
    <a href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
      {l.label} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  ) : (
    <Link to={l.href} className="inline-flex items-center gap-1.5 text-primary hover:underline">
      {l.label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );

/** The four cross-referenced guides, shown at the bottom of every guide page. */
export const GuideNav = ({ current }: { current?: string }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {GUIDE_NAV.map((g) => (
      <Link
        key={g.href}
        to={g.href}
        aria-current={g.href === current ? "page" : undefined}
        className={`group rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:border-primary ${g.href === current ? "border-primary bg-primary/5" : "border-border bg-card"}`}
      >
        <span className="font-semibold group-hover:text-primary">{g.label}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{g.blurb}</span>
      </Link>
    ))}
  </div>
);

export const GuidePage = ({ guide: g }: { guide: Guide }) => (
  <div className="flex min-h-screen flex-col">
    <Seo title={g.seoTitle} description={g.metaDescription} path={g.slug} type="article" suffix={false} jsonLd={guideJsonLd(g)} />
    <SiteHeader />
    <main className="flex-1">
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div aria-hidden className="refarch-grid-bg pointer-events-none absolute inset-0 opacity-20" />
        <div className="container relative py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-white/75">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span aria-current="page" className="text-white">
              {g.title}
            </span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-300">Guide</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">{g.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-white/85 md:text-xl">{g.tagline}</p>
        </div>
      </section>

      <div className="container grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_260px]">
        <article className="min-w-0 max-w-3xl">
          <div className="rounded-2xl border-l-4 border-primary bg-primary/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Definition</p>
            <p className="mt-2 text-lg leading-relaxed">{g.definition}</p>
          </div>

          {g.sections.map((s) => (
            <section key={s.id} className="mt-14">
              <h2 id={s.id} className="scroll-mt-24 text-2xl font-bold tracking-tight md:text-3xl">
                {s.heading}
              </h2>
              {s.paragraphs?.map((p) => (
                <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-foreground/90">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-5 space-y-4">
                  {s.bullets.map((b) => (
                    <li key={b.text.slice(0, 40)} className="rounded-xl border border-border bg-card p-4">
                      {b.term && <p className="font-semibold">{b.term}</p>}
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              {s.table && (
                <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="bg-secondary text-left">
                      <tr>
                        {s.table.columns.map((c) => (
                          <th key={c} className="p-3 font-semibold">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((r) => (
                        <tr key={r[0]} className="border-t border-border">
                          {r.map((cell, i) => (
                            <td key={i} className={`p-3 align-top ${i === 0 ? "font-medium" : "text-muted-foreground"}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {s.steps && (
                <ol className="relative mt-6 space-y-5 border-l-2 border-primary/30 pl-8">
                  {s.steps.map((st, i) => (
                    <li key={st.title} className="relative">
                      <span className="absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                      <p className="font-semibold">{st.title}</p>
                      <p className="mt-1 text-muted-foreground">{st.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}

          <section className="mt-14">
            <h2 id="reference-architectures" className="scroll-mt-24 text-2xl font-bold tracking-tight md:text-3xl">
              Reference architectures
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {g.architectures.map((a) => {
                const p = patternBySlug(a.slug);
                if (!p) return null;
                return (
                  <Link key={a.slug} to={patternPath(a.slug)} className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
                    <span className="font-semibold group-hover:text-primary">{p.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{a.why}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-14">
            <h2 id="faq" className="scroll-mt-24 text-2xl font-bold tracking-tight md:text-3xl">
              Frequently asked questions
            </h2>
            <dl className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
              {g.faqs.map((f) => (
                <div key={f.q} className="p-5">
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-2 text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="mb-3 text-sm font-semibold">On this page</p>
            <ul className="space-y-1.5 text-sm">
              {[...g.sections.map((s) => ({ id: s.id, heading: s.heading })), { id: "reference-architectures", heading: "Reference architectures" }, { id: "faq", heading: "FAQ" }].map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground hover:text-primary">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Keep learning</p>
            <ul className="space-y-2 text-sm">
              {g.learn.map((l) => (
                <li key={l.href}>
                  <SmartLink l={l} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Sources</p>
            <ul className="space-y-2 text-sm">
              {g.sources.map((l) => (
                <li key={l.href}>
                  <SmartLink l={l} />
                </li>
              ))}
            </ul>
          </div>
          <a href={`${g.slug}.md`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <FileText className="h-4 w-4" /> Markdown version
          </a>
        </aside>
      </div>

      <section className="border-t border-border bg-muted/30 py-14">
        <div className="container">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Guides</h2>
          <GuideNav current={g.slug} />
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
);
