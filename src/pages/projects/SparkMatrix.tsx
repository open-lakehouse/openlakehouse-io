import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Table2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl } from "@/lib/seo";
import {
  EXPLORER_PATH,
  FAQ_PATH,
  META_DESCRIPTION,
  METHOD_PATH,
  SLUG,
  TABLE_PATH,
  TAGLINE,
  TITLE,
} from "@/content/spark-matrix";

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Compute Engines", item: canonicalUrl("/technologies/compute-engines") },
    { "@type": "ListItem", position: 3, name: TITLE, item: canonicalUrl(SLUG) },
  ],
};

// Links to every prerendered home of the Spark Matrix content, reused by the
// crawlable fallback below.
const DESTINATIONS: { href: string; internal: boolean; title: string; blurb: string }[] = [
  {
    href: EXPLORER_PATH,
    internal: false,
    title: "The full explorer",
    blurb: "Every runtime of each service, the Apache Spark inventory, release notes and runtime freshness.",
  },
  {
    href: TABLE_PATH,
    internal: true,
    title: "The comparison table",
    blurb: "Apache Spark features across managed Spark services, every cell traced to a source.",
  },
  {
    href: METHOD_PATH,
    internal: true,
    title: "How the data is built",
    blurb: "The evidence model, what is read from the Apache Spark source, support levels, and the platforms covered.",
  },
  {
    href: FAQ_PATH,
    internal: true,
    title: "Frequently asked questions",
    blurb: "What Spark Matrix covers, how feature support is decided, and how the data is kept current.",
  },
];

// /spark-matrix presents the full explorer as the default experience. The
// browser is forwarded to the explorer on mount; the prerendered markup below
// stays readable for crawlers and visitors without JavaScript, and links to
// every prerendered page that holds the matrix data, methodology and FAQ.
const SparkMatrix = () => {
  useEffect(() => {
    window.location.replace(EXPLORER_PATH);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${TITLE}: Apache Spark features across managed Spark platforms`}
        description={META_DESCRIPTION}
        path={SLUG}
        jsonLd={[breadcrumbLd]}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-brand-gradient text-primary-foreground">
          <div className="container py-10 md:py-14">
            <Link
              to="/technologies/compute-engines"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Compute Engines
            </Link>
            <p className="text-sm font-medium uppercase tracking-widest text-white/80">Open Lakehouse project</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">{TITLE}</h1>
            <p className="mt-3 text-lg md:text-xl text-white/85 max-w-3xl">{TAGLINE}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={EXPLORER_PATH}
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-white/90"
              >
                <Table2 className="h-4 w-4" /> Open the full explorer
              </a>
              <Link
                to={TABLE_PATH}
                className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                The comparison table
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <p className="text-base text-muted-foreground">
            Opening the full explorer. If it does not load,{" "}
            <a href={EXPLORER_PATH} className="font-medium text-primary hover:underline">
              open it here
            </a>
            , or follow one of these:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {DESTINATIONS.map((d) => {
              const inner = (
                <>
                  <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Table2 className="h-4 w-4 text-primary" /> {d.title}
                  </span>
                  <span className="mt-1.5 block text-sm text-muted-foreground">{d.blurb}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </>
              );
              const className =
                "rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary";
              return d.internal ? (
                <Link key={d.href} to={d.href} className={className}>
                  {inner}
                </Link>
              ) : (
                <a key={d.href} href={d.href} className={className}>
                  {inner}
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default SparkMatrix;
