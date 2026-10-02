import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl } from "@/lib/seo";
import {
  DEFINITION,
  DESCRIPTION,
  FAQS,
  META_DESCRIPTION,
  PRINCIPLES,
  PRIMARY_SOURCES,
  PROJECTS,
  SLUG,
  STACK,
  TAGLINE,
  TITLE,
} from "@/content/open-source-data-engineering";

// ---------- JSON-LD ----------

const techArticleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: `${TITLE} - ${TAGLINE}`,
  description: DESCRIPTION,
  url: canonicalUrl(SLUG),
  about: [
    { "@type": "Thing", name: "Open source data engineering" },
    { "@type": "Thing", name: "Data lakehouse architecture" },
    { "@type": "Thing", name: "Open table formats" },
  ],
  keywords:
    "open source data engineering, open source data engineering stack, open source data platform, data lakehouse, Delta Lake, Apache Iceberg, Unity Catalog, MLflow, Apache Spark",
  mentions: PROJECTS.map((p) => ({
    "@type": "SoftwareApplication",
    name: p.name,
    url: p.href,
    applicationCategory: "DataManagement",
  })),
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Open source data engineering stack",
  itemListElement: PROJECTS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "SoftwareApplication",
      name: p.name,
      description: p.blurb,
      url: p.href,
      applicationCategory: "DataManagement",
    },
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Technologies", item: canonicalUrl("/technologies") },
    { "@type": "ListItem", position: 3, name: TITLE, item: canonicalUrl(SLUG) },
  ],
};

// ---------- Page ----------

const OpenSourceDataEngineering = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title={TITLE}
      description={META_DESCRIPTION}
      path={SLUG}
      type="article"
      jsonLd={[techArticleLd, faqLd, itemListLd, breadcrumbLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-20 md:py-28">
          <Link
            to="/technologies"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Technologies
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Guide</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">{TITLE}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-3xl">{TAGLINE}</p>
        </div>
      </section>

      <article className="container py-16 md:py-24 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:tracking-tight">
        <p className="lead text-lg">{DEFINITION}</p>

        <h2 id="the-stack">The open source data engineering stack</h2>
        <p>
          An open source data engineering platform is assembled from interchangeable layers. Each
          layer is independently replaceable because the formats and protocols between them are
          open.
        </p>
        <div className="overflow-x-auto not-prose my-6">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 font-semibold">Layer</th>
                <th className="text-left p-3 font-semibold">What it does</th>
                <th className="text-left p-3 font-semibold">Common projects</th>
              </tr>
            </thead>
            <tbody>
              {STACK.map((row) => (
                <tr key={row.layer} className="border-t border-border">
                  <td className="p-3 align-top font-medium">{row.layer}</td>
                  <td className="p-3 align-top text-muted-foreground">{row.purpose}</td>
                  <td className="p-3 align-top">{row.projects.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="projects">Projects in the stack</h2>
        <p>
          These are the open-source projects most data engineering teams standardize on, and the
          foundation that governs each one.
        </p>
        <dl className="not-prose space-y-5">
          {PROJECTS.map((p) => (
            <div key={p.name}>
              <dt className="font-semibold">
                <a href={p.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {p.name}
                </a>
              </dt>
              <dd className="mt-1 text-muted-foreground">{p.blurb}</dd>
            </div>
          ))}
        </dl>

        <h2 id="why-open">Why teams choose open source data engineering</h2>
        <ul>
          {PRINCIPLES.map((p) => (
            <li key={p.title}>
              <strong>{p.title}.</strong> {p.body}
            </li>
          ))}
        </ul>

        <h2 id="faq">Frequently asked questions</h2>
        <dl className="not-prose space-y-6">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>

        <h2 id="learn-more">Keep going</h2>
        <ul className="not-prose space-y-2">
          <li>
            <Link to="/technologies" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Browse every technology category <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <Link to="/technologies/delta-lake" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Delta Lake: what it is and how it works <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <Link to="/learn/getting-started" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Five-minute intros to the core projects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <Link to="/faq" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Citable answers about the open lakehouse <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        </ul>

        <h2 id="primary-sources">Primary sources</h2>
        <ul className="not-prose space-y-2">
          {PRIMARY_SOURCES.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                {l.label} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </article>
    </main>
    <SiteFooter />
  </div>
);

export default OpenSourceDataEngineering;
