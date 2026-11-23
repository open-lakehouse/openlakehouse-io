import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ExternalLink, Github, Table2 } from "lucide-react";
import { MatrixTable } from "@/components/spark-matrix/MatrixTable";
import { SHOWN_PLATFORMS, RETIRED_PLATFORMS, SPARK_FEATURES, defaultRuntime } from "@/lib/spark-matrix";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  APACHE_FIRST,
  APACHE_LATEST,
  DATA_GENERATED,
  DEFINITION,
  DESCRIPTION,
  EXPLORER_PATH,
  FAQS,
  FEATURE_CATEGORIES,
  HEADLINE_FEATURE_COUNT,
  INVENTORY_SOURCES,
  META_DESCRIPTION,
  PLATFORMS_BY_VENDOR,
  PLATFORM_COUNT,
  QUESTIONS_ANSWERED,
  SLUG,
  SUPPORT_LEVELS,
  TAGLINE,
  TITLE,
  VENDOR_COUNT,
} from "@/content/spark-matrix";

// PENDING: the open-lakehouse/spark-matrix repository is private. When it
// goes public, set MATRIX_REPO to "https://github.com/open-lakehouse/spark-matrix";
// the repository links on this page and the JSON-LD read this constant.
const MATRIX_REPO: string | null = null;

// ---------- JSON-LD ----------

const openLakehouseOrg = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

const datasetLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `${TITLE}: Apache Spark features across managed Spark platforms`,
  description: DESCRIPTION,
  url: canonicalUrl(SLUG),
  ...(MATRIX_REPO ? { sameAs: [MATRIX_REPO] } : {}),
  creator: openLakehouseOrg,
  publisher: openLakehouseOrg,
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  isAccessibleForFree: true,
  dateModified: DATA_GENERATED,
  keywords: [
    "Apache Spark",
    "managed Spark platforms",
    "Spark feature comparison",
    "Spark Connect",
    "Spark runtime versions",
    "Amazon EMR",
    "AWS Glue",
    "Databricks Runtime",
    "Dataproc",
    "Microsoft Fabric",
  ],
  isBasedOn: [
    { "@type": "SoftwareSourceCode", name: "Apache Spark", codeRepository: "https://github.com/apache/spark" },
    { "@type": "WebSite", name: "Apache Spark website release announcements", url: "https://spark.apache.org/news/" },
  ],
  variableMeasured: [
    "Apache Spark base version of each managed runtime",
    "Feature support level per runtime",
    "First and removal Apache Spark release of each API, SQL construct, configuration and protocol message",
  ],
  about: PLATFORMS_BY_VENDOR.flatMap((v) =>
    v.platforms.map((name) => ({ "@type": "SoftwareApplication", name, provider: { "@type": "Organization", name: v.vendor } })),
  ),
  distribution: [
    { "@type": "DataDownload", name: "Spark Matrix explorer", contentUrl: canonicalUrl(EXPLORER_PATH), encodingFormat: "text/html" },
    ...["matrix", "features", "platforms", "releases", "inventory"].map((name) => ({
      "@type": "DataDownload",
      name: `${name}.json`,
      contentUrl: canonicalUrl(`${EXPLORER_PATH}data/${name}.json`),
      encodingFormat: "application/json",
    })),
  ],
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

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Compute Engines", item: canonicalUrl("/technologies/compute-engines") },
    { "@type": "ListItem", position: 3, name: TITLE, item: canonicalUrl(SLUG) },
  ],
};

// ---------- Page ----------

const SparkMatrix = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title={`${TITLE}: Apache Spark features across managed Spark platforms`}
      description={META_DESCRIPTION}
      path={SLUG}
      jsonLd={[datasetLd, faqLd, breadcrumbLd]}
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
              href="#matrix"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-white/90"
            >
              <ArrowDown className="h-4 w-4" /> The matrix
            </a>
            <a
              href={EXPLORER_PATH}
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Table2 className="h-4 w-4" /> Open the full explorer
            </a>
            {MATRIX_REPO && (
              <a
                href={MATRIX_REPO}
                className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Github className="h-4 w-4" /> Source on GitHub
              </a>
            )}
          </div>
        </div>
      </section>

      <section id="matrix" aria-labelledby="matrix-heading" className="container scroll-mt-20 py-8 md:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="max-w-3xl">
            <h2 id="matrix-heading" className="text-2xl md:text-3xl font-bold tracking-tight">
              Apache Spark features by managed Spark service
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {SPARK_FEATURES.length} Apache Spark features and the vendor capabilities around them, across{" "}
              {SHOWN_PLATFORMS.length} managed Spark services at their newest generally available runtime, next to Apache
              Spark {APACHE_LATEST} and earlier releases. Select a cell for the vendor quotation or the Apache source
              behind it.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Data build <time dateTime={DATA_GENERATED}>{DATA_GENERATED}</time>
            <br />
            <a href={EXPLORER_PATH} className="inline-flex items-center gap-1 text-primary hover:underline">
              Every runtime, the Apache inventory and release notes: open the full explorer <ArrowRight className="h-3 w-3" />
            </a>
          </p>
        </div>
        <MatrixTable />
      </section>

      <article className="container py-12 md:py-16 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:tracking-tight">
        <p className="lead text-lg">{DEFINITION}</p>

        <h2 id="why">Why a version number is not enough</h2>
        <p>
          A platform that says "Spark 3.5" does not tell you whether it has Spark Connect, which SQL grammar it accepts,
          whether <code>transformWithState</code> exists, or what the vendor changed. Spark Matrix turns the version label
          into evidence. Its inventory goes below headline features to individual SQL functions, configuration keys,
          parser rules, APIs, data sources, Spark Connect protocol messages, error conditions and language and runtime
          requirements.
        </p>

        <h2 id="questions">What Spark Matrix answers</h2>
        <ul>
          {QUESTIONS_ANSWERED.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>

        <h2 id="evidence-model">The evidence model</h2>
        <p>Every cell in the matrix comes from one of two kinds of evidence, joined at the runtime's Apache Spark base:</p>
        <ol>
          <li>
            <strong>The Apache Spark source tree.</strong> A harvester reads each Apache Spark feature-release tag from{" "}
            {APACHE_FIRST} to {APACHE_LATEST} and detects what that release contains. Each inventory record has its first
            release, its removal release when there is one, and a link to the source location.
          </li>
          <li>
            <strong>Primary vendor documentation.</strong> Each managed runtime links to the vendor page that states its
            Spark version. Each explicit support claim carries a quotation from the vendor's documentation and its URL.
          </li>
        </ol>
        <p>
          An explicit vendor statement wins. Otherwise the matrix reports only what the runtime's stated Apache base
          contains. A vendor-documented backport is shown as ahead of Apache; an undocumented capability is not guessed.
          When vendor documentation is silent or contradictory, the matrix records an open question instead of turning
          absence into an answer.
        </p>

        <h3 id="apache-inventory">What is read from the Apache source</h3>
        <div className="overflow-x-auto not-prose my-6">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 font-semibold">Inventory item</th>
                <th className="text-left p-3 font-semibold">Source artifact</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY_SOURCES.map((row) => (
                <tr key={row.item} className="border-t border-border">
                  <td className="p-3 align-top font-medium">{row.item}</td>
                  <td className="p-3 align-top text-muted-foreground font-mono text-xs">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Headline features are defined by detection rules: the catalog describes how to recognize a feature in the
          source, not which release introduced it. The build evaluates each rule against the release tags and, in strict
          mode, fails when a rule no longer matches the newest release. Release dates and notes come from the Apache
          Spark website release announcements.
        </p>

        <h3 id="support-levels">Support levels</h3>
        <p>Each cell shows one level, listed here from strongest evidence to weakest:</p>
        <dl className="not-prose space-y-3 my-6">
          {SUPPORT_LEVELS.map((l) => (
            <div key={l.label}>
              <dt className="font-semibold">{l.label}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">{l.meaning}</dd>
            </div>
          ))}
        </dl>

        <h2 id="features">Features compared</h2>
        <p>
          The matrix tracks {HEADLINE_FEATURE_COUNT} headline features in these categories, alongside the full
          inventory of functions, configurations, syntax and APIs:
        </p>
        <ul>
          {FEATURE_CATEGORIES.map((c) => (
            <li key={c.title}>
              <strong>{c.title}.</strong> {c.blurb}
            </li>
          ))}
        </ul>

        <h2 id="platforms">Platforms covered</h2>
        <p>
          As of the {DATA_GENERATED} data build, the matrix records {PLATFORM_COUNT} managed Spark services from{" "}
          {VENDOR_COUNT} vendors. The table lists the runtime each service is shown at in the matrix, the Spark version
          string the vendor publishes, and its Apache Spark base.
        </p>
        <div className="overflow-x-auto not-prose my-6">
          <table className="w-full text-sm border border-border">
            <caption className="sr-only">Managed Spark services and the runtime shown in the matrix</caption>
            <thead className="bg-secondary">
              <tr>
                <th scope="col" className="text-left p-2 font-semibold">Service</th>
                <th scope="col" className="text-left p-2 font-semibold">Runtime shown</th>
                <th scope="col" className="text-left p-2 font-semibold">Vendor Spark version</th>
                <th scope="col" className="text-left p-2 font-semibold">Apache base</th>
              </tr>
            </thead>
            <tbody>
              {SHOWN_PLATFORMS.map((p) => {
                const r = defaultRuntime(p);
                return (
                  <tr key={p.id} className="border-t border-border align-top">
                    <th scope="row" className="p-2 text-left font-normal">
                      <span className="block text-xs text-muted-foreground">{p.vendor}</span>
                      <span className="font-medium">{p.name}</span>
                    </th>
                    <td className="p-2">
                      {r?.source ? (
                        <a href={r.source} className="text-primary hover:underline" rel="noreferrer">
                          {r.label}
                        </a>
                      ) : (
                        (r?.label ?? "not stated")
                      )}
                    </td>
                    <td className="p-2 font-mono text-xs">{r?.spark ?? "not stated"}</td>
                    <td className="p-2 font-mono text-xs">{r?.spark_base ?? "not stated"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {RETIRED_PLATFORMS.length > 0 && (
          <p>
            Retired services, where every runtime is end of life or deprecated, are left out of the matrix and kept in the
            explorer: {RETIRED_PLATFORMS.map((p) => p.name).join(", ")}.
          </p>
        )}

        <h2 id="how-to-use">How to use it</h2>
        <p>
          Use the matrix to check a managed runtime before you depend on a feature: find the runtime, read its Apache
          Spark base, then open the cell for the feature to see the vendor quotation or the Apache source location
          behind it. To move a workload between platforms, compare the same feature row across the runtimes you are
          considering. A weekly refresh workflow reruns the harvester and opens a pull request when Apache release data
          changes; vendor records are updated from vendor documentation, and each records the date its cited pages were
          checked.
        </p>
        <ul className="not-prose space-y-2">
          <li>
            <a href="#matrix" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              The matrix, on this page <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <a href={EXPLORER_PATH} className="inline-flex items-center gap-1.5 text-primary hover:underline">
              The full explorer: every runtime, the Apache Spark inventory, release notes and freshness{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </li>
          {MATRIX_REPO && (
            <li>
              <a href={MATRIX_REPO} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                Source, data and platform records on GitHub <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
          )}
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

        <h2 id="keep-going">Keep going</h2>
        <ul className="not-prose space-y-2">
          <li>
            <Link to="/spark-masterclass" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Spark Masterclass: an open, runnable online book on Apache Spark 4.3 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <Link to="/technologies/compute-engines" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Compute engines for the open lakehouse <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <Link to="/open-source-data-engineering" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Open source data engineering: the reference stack <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        </ul>
      </article>
    </main>
    <SiteFooter />
  </div>
);

export default SparkMatrix;
