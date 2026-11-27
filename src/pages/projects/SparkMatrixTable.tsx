import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Github, Table2 } from "lucide-react";
import { GapSummary, MatrixTable } from "@/components/spark-matrix/MatrixTable";
import { SHOWN_PLATFORMS, SPARK_FEATURES } from "@/lib/spark-matrix";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  APACHE_LATEST,
  DATA_GENERATED,
  DESCRIPTION,
  EXPLORER_PATH,
  FAQ_PATH,
  MATRIX_REPO,
  METHOD_PATH,
  PLATFORMS_BY_VENDOR,
  SLUG,
  TABLE_META_DESCRIPTION,
  TABLE_PATH,
  TABLE_TITLE,
  TAGLINE,
  TITLE,
} from "@/content/spark-matrix";

// ---------- JSON-LD ----------

const openLakehouseOrg = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

const datasetLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `${TITLE}: Apache Spark features across managed Spark platforms`,
  description: DESCRIPTION,
  url: canonicalUrl(TABLE_PATH),
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

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: TITLE, item: canonicalUrl(SLUG) },
    { "@type": "ListItem", position: 3, name: "Comparison table", item: canonicalUrl(TABLE_PATH) },
  ],
};

// ---------- Page ----------

const SparkMatrixTable = () => (
  <div className="min-h-screen flex flex-col">
    <Seo title={TABLE_TITLE} description={TABLE_META_DESCRIPTION} path={TABLE_PATH} jsonLd={[datasetLd, breadcrumbLd]} />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-10 md:py-14">
          <Link to={SLUG} className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> {TITLE}
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Open Lakehouse project</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">{TITLE}: the comparison table</h1>
          <p className="mt-3 text-lg md:text-xl text-white/85 max-w-3xl">{TAGLINE}</p>
          <p className="mt-3 text-base text-white/75 max-w-3xl">{DESCRIPTION}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={EXPLORER_PATH}
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-white/90"
            >
              <Table2 className="h-4 w-4" /> Open the full explorer
            </a>
            <Link
              to={METHOD_PATH}
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              How the data is built
            </Link>
            <Link
              to={FAQ_PATH}
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              FAQ
            </Link>
          </div>
        </div>
      </section>

      <section id="matrix" aria-labelledby="matrix-heading" className="container scroll-mt-20 py-8 md:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="max-w-3xl">
            <h2 id="matrix-heading" className="text-2xl md:text-3xl font-bold tracking-tight">
              Apache Spark features by managed Spark service
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {SPARK_FEATURES.length} Apache Spark features and the vendor capabilities around them, across{" "}
              {SHOWN_PLATFORMS.length} managed Spark services at their newest generally available runtime, next to Apache
              Spark {APACHE_LATEST} and earlier releases. Add the platforms you care about, then select a cell for the
              vendor quotation or the Apache source behind it.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Data build{" "}
            <time dateTime={DATA_GENERATED} className="font-semibold text-foreground">
              {DATA_GENERATED}
            </time>
          </p>
        </div>
        <MatrixTable />
        <GapSummary />
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why a version number is not enough</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              A runtime labelled "Spark 3.5" does not tell you whether it has Spark Connect, which SQL grammar it
              accepts, or what the vendor changed. Spark Matrix turns the version label into evidence. The full explorer
              compares every runtime in depth; the method and FAQ pages explain how each cell is sourced.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <a
              href={EXPLORER_PATH}
              className="group rounded-xl border border-primary/50 bg-card p-5 shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Table2 className="h-4 w-4 text-primary" /> Open the full explorer
              </span>
              <span className="mt-1.5 block text-sm text-muted-foreground">
                The deeper experience: every runtime of each service, the Apache Spark inventory, release notes and
                runtime freshness.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
            <Link
              to={METHOD_PATH}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <span className="text-base font-semibold text-foreground">How the data is built</span>
              <span className="mt-1.5 block text-sm text-muted-foreground">
                The evidence model, what is read from the Apache Spark source, support levels, and the platforms
                covered.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Read the method <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              to={FAQ_PATH}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <span className="text-base font-semibold text-foreground">Frequently asked questions</span>
              <span className="mt-1.5 block text-sm text-muted-foreground">
                What Spark Matrix covers, how feature support is decided, and how the data is kept current.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Read the FAQ <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
          {MATRIX_REPO && (
            <p className="mt-6 text-sm">
              <a href={MATRIX_REPO} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                <Github className="h-4 w-4" /> Source, data and platform records on GitHub
              </a>
            </p>
          )}
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default SparkMatrixTable;
