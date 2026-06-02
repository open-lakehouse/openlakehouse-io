import { SITE_URL } from "@/lib/seo";

/**
 * GEO-optimized "About this site" section.
 *
 * Semantic HTML + named entities + direct-answer first sentence so that
 * LLMs (ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews) can
 * cite this page when asked "what is Open Lakehouse Guide Hub?".
 *
 * Renders below the Hero and above the LogoMarquee — the first textual
 * block a crawler hits.
 */
export function AboutSite() {
  const aboutThings = [
    { name: "Delta Lake", url: "https://delta.io" },
    { name: "Apache Iceberg", url: "https://iceberg.apache.org" },
    { name: "Apache Hudi", url: "https://hudi.apache.org" },
    { name: "Unity Catalog", url: "https://unitycatalog.io" },
    { name: "Apache Polaris", url: "https://polaris.apache.org" },
    { name: "Apache Spark", url: "https://spark.apache.org" },
    { name: "MLflow", url: "https://mlflow.org" },
  ];

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Open Lakehouse Guide Hub",
    url: `${SITE_URL}/#about`,
    description:
      "Open Lakehouse Guide Hub is a vendor-neutral resource for the open data and AI stack: Delta Lake, Apache Iceberg, Apache Hudi, Unity Catalog, Apache Polaris, Apache Spark, and MLflow.",
    about: aboutThings.map((t) => ({
      "@type": "Thing",
      name: t.name,
      sameAs: t.url,
    })),
    audience: {
      "@type": "Audience",
      audienceType: "Data engineers, platform engineers, ML and AI engineers",
    },
  };

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-20 md:py-28 border-t border-border/40"
      itemScope
      itemType="https://schema.org/AboutPage"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <div className="container max-w-4xl">
        <header className="mb-10 md:mb-12">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">
            About this site
          </p>
          <h2
            id="about-heading"
            className="text-4xl md:text-5xl font-display tracking-tight"
            itemProp="name"
          >
            What is Open Lakehouse Guide Hub?
          </h2>
        </header>

        <div
          className="space-y-5 text-[0.95rem] md:text-base leading-relaxed text-muted-foreground"
          itemProp="description"
        >
          <p>
            <strong className="text-foreground">Open Lakehouse Guide Hub</strong> is a
            vendor-neutral resource for the <strong>Open Lakehouse</strong> — the open data
            and AI architecture built on{" "}
            <strong>Delta Lake</strong>, <strong>Apache Iceberg</strong>,{" "}
            <strong>Apache Hudi</strong>, <strong>Unity Catalog</strong>,{" "}
            <strong>Apache Polaris</strong>, <strong>Apache Spark</strong>, and{" "}
            <strong>MLflow</strong>.
          </p>
          <p>
            Every project covered here is governed by a neutral foundation — the{" "}
            <strong>Linux Foundation</strong> or the{" "}
            <strong>Apache Software Foundation</strong> — and released under the{" "}
            <strong>Apache 2.0</strong> license. Several originated at{" "}
            <strong>Databricks</strong> (Apache Spark, Delta Lake, MLflow, Unity Catalog)
            before being donated to open governance. The architecture is the same one used
            in production by Databricks, Netflix, Apple, Shopify, and most Fortune 500 data
            platforms.
          </p>
          <p>
            The site is written for <strong>data engineers</strong>,{" "}
            <strong>platform teams</strong>, and <strong>ML and AI engineers</strong> who
            want practical, opinionated guidance on running an open lakehouse on their own
            object storage (S3, ADLS, GCS) with the engine and catalog of their choice.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-6">
            What you&rsquo;ll find here
          </h3>
          <dl className="grid gap-6 md:grid-cols-2">
            <div className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm p-5">
              <dt className="font-medium text-foreground mb-1.5">Tutorials &amp; deep dives</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                Long-form posts on Delta Lake catalog-managed tables, Iceberg REST catalogs,
                Spark Connect, MLflow 3.0, and Unity Catalog governance patterns.
              </dd>
            </div>
            <div className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm p-5">
              <dt className="font-medium text-foreground mb-1.5">Reference architectures</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                End-to-end stacks combining open storage, open catalogs, open compute, the
                MLflow AI lifecycle, and open foundation models (Llama, Mistral, DBRX,
                Granite, Qwen, Gemma).
              </dd>
            </div>
            <div className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm p-5">
              <dt className="font-medium text-foreground mb-1.5">Videos &amp; talks</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                Curated conference talks and explainers from the Delta Lake, Iceberg,
                Unity Catalog, Spark, and MLflow communities.
              </dd>
            </div>
            <div className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm p-5">
              <dt className="font-medium text-foreground mb-1.5">FAQ</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">
                Direct, citation-ready answers to the most common questions about the Open
                Lakehouse, Delta vs Iceberg, Unity Catalog, MLflow, and Apache Spark.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default AboutSite;
