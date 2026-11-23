import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, Github, Table2 } from "lucide-react";
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

// PENDING: the open-lakehouse/spark-matrix repository is private and its
// viewer (site/) is not deployed yet. When the repository goes public, set
// MATRIX_REPO to "https://github.com/open-lakehouse/spark-matrix"; when the
// viewer is deployed, set MATRIX_URL to its address. Every repository and
// "view the matrix" link on this page, and the JSON-LD, reads these two
// constants, and the page states that the links are pending while they are null.
const MATRIX_REPO: string | null = null;
const MATRIX_URL: string | null = null;

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
  ...(MATRIX_URL ? { distribution: [{ "@type": "DataDownload", contentUrl: MATRIX_URL, encodingFormat: "text/html" }] } : {}),
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
        <div className="container py-20 md:py-28">
          <Link
            to="/technologies/compute-engines"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Compute Engines
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Open Lakehouse project</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">{TITLE}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-3xl">{TAGLINE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {MATRIX_URL && (
              <a
                href={MATRIX_URL}
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/90"
              >
                <Table2 className="h-4 w-4" /> View the matrix
              </a>
            )}
            {MATRIX_REPO && (
              <a
                href={MATRIX_REPO}
                className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Github className="h-4 w-4" /> Source on GitHub
              </a>
            )}
            {!MATRIX_URL && !MATRIX_REPO && (
              <p className="text-sm text-white/80">
                The repository and the interactive viewer are not public yet. This page will link to them when they are.
              </p>
            )}
          </div>
        </div>
      </section>

      <article className="container py-16 md:py-24 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:tracking-tight">
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
          {VENDOR_COUNT} vendors. Each runtime is listed with the Spark version string the vendor publishes and its
          Apache Spark base.
        </p>
        <div className="not-prose grid gap-4 sm:grid-cols-2 my-6">
          {PLATFORMS_BY_VENDOR.map((v) => (
            <div key={v.vendor} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold">{v.vendor}</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {v.platforms.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 id="how-to-use">How to use it</h2>
        <p>
          Use the matrix to check a managed runtime before you depend on a feature: find the runtime, read its Apache
          Spark base, then open the cell for the feature to see the vendor quotation or the Apache source location
          behind it. To move a workload between platforms, compare the same feature row across the runtimes you are
          considering. A weekly refresh workflow reruns the harvester and opens a pull request when Apache release data
          changes; vendor records are updated from vendor documentation, and each records the date its cited pages were
          checked.
        </p>
        {MATRIX_URL || MATRIX_REPO ? (
          <ul className="not-prose space-y-2">
            {MATRIX_URL && (
              <li>
                <a href={MATRIX_URL} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  View the matrix <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            )}
            {MATRIX_REPO && (
              <li>
                <a href={MATRIX_REPO} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  Source, data and platform records on GitHub <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            )}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            The repository and the interactive viewer are not public yet. This page will link to them when they are.
          </p>
        )}

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
