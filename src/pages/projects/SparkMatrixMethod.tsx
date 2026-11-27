import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Table2 } from "lucide-react";
import { SHOWN_PLATFORMS, RETIRED_PLATFORMS, defaultRuntime } from "@/lib/spark-matrix";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl } from "@/lib/seo";
import {
  APACHE_FIRST,
  APACHE_LATEST,
  DATA_GENERATED,
  DEFINITION,
  EXPLORER_PATH,
  FAQ_PATH,
  FEATURE_CATEGORIES,
  HEADLINE_FEATURE_COUNT,
  INVENTORY_SOURCES,
  METHOD_META_DESCRIPTION,
  METHOD_PATH,
  METHOD_TITLE,
  PLATFORM_COUNT,
  QUESTIONS_ANSWERED,
  SLUG,
  SUPPORT_LEVELS,
  TITLE,
  VENDOR_COUNT,
} from "@/content/spark-matrix";

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: TITLE, item: canonicalUrl(SLUG) },
    { "@type": "ListItem", position: 3, name: "Method", item: canonicalUrl(METHOD_PATH) },
  ],
};

const SparkMatrixMethod = () => (
  <div className="min-h-screen flex flex-col">
    <Seo title={METHOD_TITLE} description={METHOD_META_DESCRIPTION} path={METHOD_PATH} jsonLd={[breadcrumbLd]} />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-10 md:py-14">
          <Link to={SLUG} className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> {TITLE}
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Open Lakehouse project</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">How Spark Matrix is built</h1>
          <p className="mt-3 text-lg md:text-xl text-white/85 max-w-3xl">
            The evidence model behind every cell: what is read from the Apache Spark source, how vendor claims are
            handled, the support levels, and the features and platforms compared.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={SLUG}
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-white/90"
            >
              <Table2 className="h-4 w-4" /> Back to the matrix
            </Link>
            <a
              href={EXPLORER_PATH}
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Table2 className="h-4 w-4" /> Open the full explorer
            </a>
          </div>
        </div>
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
            <Link to={SLUG} className="inline-flex items-center gap-1.5 text-primary hover:underline">
              The matrix <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
          <li>
            <a href={EXPLORER_PATH} className="inline-flex items-center gap-1.5 text-primary hover:underline">
              The full explorer: every runtime, the Apache Spark inventory, release notes and freshness{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <Link to={FAQ_PATH} className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Frequently asked questions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        </ul>
      </article>
    </main>
    <SiteFooter />
  </div>
);

export default SparkMatrixMethod;
