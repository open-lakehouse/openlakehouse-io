import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl } from "@/lib/seo";
import { getConcept } from "@/data/concepts";

const flowComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "credential-vending": lazy(() => import("@/components/concepts/CredentialVendingFlow")),
  "server-side-planning": lazy(() => import("@/components/concepts/ScanApiFlow")),
};

const TITLE = "Data Access";
const TAGLINE = "Trust in your open lakehouse";
const DESCRIPTION =
  "How an open lakehouse decides who can read and write data — and how engines reach storage without standing secrets. The three patterns: credential vending, server-side planning, and trusted compute.";

const concept = getConcept("data-access")!;

const approachContent: Record<string, { points: string[] }> = {
  "credential-vending": {
    points: [
      "Trust shifts from the client to the catalog and storage — no secret management on the client.",
      "Access is all-or-nothing per object prefix; scope a token to a table's storage prefix to partition access.",
      "First, highest-leverage step a platform should take to harden its security posture.",
    ],
  },
  "server-side-planning": {
    points: [
      "The catalog returns a file list + credential for a specific query, not raw table access.",
      "Enforces access at the file boundary; with a trusted query service, at the column and row level.",
      "Avoids leaking protected values through file-level statistics. Used by Delta Sharing.",
      "Cost: a filtering fleet to maintain and extra processing.",
    ],
  },
  "trusted-compute": {
    points: [
      "Enables row-level security and column masking when partitioning along boundaries is infeasible.",
      "Enforcement spans services: catalog denies, storage validates credentials, engine masks.",
      "Trust is established by credential or by identity attestation (hardware cert -> namespace -> binary hash).",
    ],
  },
};

const techArticleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: `${TITLE} — ${TAGLINE}`,
  description: DESCRIPTION,
  url: canonicalUrl("/concepts/data-access"),
  about: concept.approaches.map((a) => ({ "@type": "Thing", name: a.title })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Concepts", item: canonicalUrl("/concepts") },
    { "@type": "ListItem", position: 3, name: "Data Access", item: canonicalUrl("/concepts/data-access") },
  ],
};

const DataAccess = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title={`${TITLE} — ${TAGLINE}`}
      description={DESCRIPTION}
      path="/concepts/data-access"
      type="article"
      jsonLd={[techArticleLd, breadcrumbLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-20 md:py-28">
          <Link to="/concepts" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Concepts
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Concept</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">{TITLE}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-3xl">
            The catalog is the natural anchor for data access — it holds the metadata, evaluates policy, and brokers
            access between compute and storage. Three patterns make that real.
          </p>
        </div>
      </section>

      {/* On-page nav across the three approaches */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex gap-1 overflow-x-auto py-3 text-sm">
          {concept.approaches.map((a) => (
            <a
              key={a.slug}
              href={`#${a.slug}`}
              className="whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {a.title}
            </a>
          ))}
        </div>
      </nav>

      {concept.approaches.map((a, i) => {
        const c = approachContent[a.slug];
        const Icon = a.icon;
        const Flow = flowComponents[a.slug];
        const isLive = a.status === "live" && Flow;
        return (
          <section
            key={a.slug}
            id={a.slug}
            className={`container scroll-mt-32 py-16 md:py-20 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium uppercase tracking-widest text-primary">
                Pattern {i + 1} of {concept.approaches.length}
              </p>
            </div>
            <h2 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight">{a.title}</h2>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{a.summary}</p>

            <ul className="mt-8 max-w-3xl space-y-3">
              {c.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            {isLive && Flow ? (
              <div className="mt-10">
                <Suspense
                  fallback={<div className="h-[420px] rounded-2xl border border-border bg-card/40 animate-pulse" />}
                >
                  <Flow />
                </Suspense>
              </div>
            ) : (
              <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-card/40 px-4 py-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> Interactive architecture walkthrough coming soon.
              </div>
            )}
          </section>
        );
      })}
    </main>
    <SiteFooter />
  </div>
);

export default DataAccess;
