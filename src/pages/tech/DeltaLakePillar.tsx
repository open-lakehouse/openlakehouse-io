import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl } from "@/lib/seo";

// ---------- Page data ----------

const TITLE = "Delta Lake";
const TAGLINE = "An open-source storage framework for the lakehouse";
const DESCRIPTION =
  "Delta Lake is an open-source storage framework that brings ACID transactions, time travel, and schema enforcement to data lakes. It was originally developed at Databricks, open-sourced in 2019, and donated to the Linux Foundation in 2022.";

const timeline: { date: string; label: string; href?: string }[] = [
  { date: "April 2019", label: "Delta Lake is open-sourced by Databricks under the Apache 2.0 license.", href: "https://delta.io" },
  { date: "October 2019", label: "Delta Lake joins the Linux Foundation as a graduated open-source project." },
  { date: "June 2022", label: "Delta Lake 2.0 released — all enterprise features fully open-sourced.", href: "https://delta.io/blog/2022-08-02-delta-2-0-the-foundation-of-your-data-lakehouse-is-open/" },
  { date: "June 2023", label: "Delta Lake 3.0 introduces UniForm — Iceberg-compatible metadata over Delta tables.", href: "https://delta.io/blog/2023-10-17-delta-lake-3-0-uniform/" },
  { date: "October 2024", label: "Delta Kernel — Rust-based reusable library — reaches production readiness." },
  { date: "March 2026", label: "Delta Lake 4.1.0 ships catalog-managed tables, Apache Spark 4.1.0 support, and server-side planning.", href: "/blog/delta-lake/delta-lake-4-1-0-released" },
];

const comparison = {
  headers: ["", "Delta Lake", "Apache Iceberg", "Apache Hudi"],
  rows: [
    ["Originated at", "Databricks (2019)", "Netflix (2017)", "Uber (2017)"],
    ["Governed by", "Linux Foundation", "Apache Software Foundation", "Apache Software Foundation"],
    ["Transaction log", "JSON commits in _delta_log", "Snapshot + manifest files", "Timeline of instants"],
    ["Cross-format reads", "UniForm (Iceberg + Hudi)", "Native; X-Table for Delta/Hudi", "X-Table for Delta/Iceberg"],
    ["Catalog model", "Catalog-managed tables (Unity Catalog)", "Iceberg REST + Polaris / Nessie / Lakekeeper", "Hudi Metaserver / Hive"],
    ["Streaming writes", "First-class via Spark Structured Streaming", "Supported (Flink, Spark)", "First-class (designed around it)"],
    ["Primary language(s)", "Scala, Rust (Kernel), Python", "Java, Python, Rust", "Java, Python"],
  ],
};

const faqs: { q: string; a: string }[] = [
  {
    q: "What is Delta Lake?",
    a: "Delta Lake is an open-source storage framework that adds ACID transactions, scalable metadata, time travel, and schema enforcement on top of Parquet files in object storage. It turns a data lake into a lakehouse — usable for both BI and AI workloads.",
  },
  {
    q: "Who created Delta Lake?",
    a: "Delta Lake was created by engineers at Databricks and open-sourced under the Apache 2.0 license in April 2019. It is now hosted by the Linux Foundation, with maintainers and contributors from Databricks, Microsoft, Apple, and the broader community.",
  },
  {
    q: "Is Delta Lake fully open-source?",
    a: "Yes. With Delta Lake 2.0 (June 2022), all enterprise features previously available only on Databricks — including OPTIMIZE, Z-ORDER, change data feed, column mapping, and table restoration — were contributed to the open-source project.",
  },
  {
    q: "Delta Lake vs Apache Iceberg — which should I use?",
    a: "Both are mature open table formats. Choose Delta Lake if your stack is Spark-centric, you need first-class streaming writes, or you want Unity Catalog's catalog-managed tables. Choose Iceberg for the widest engine support and a strict separation of storage and catalog. With Delta UniForm and X-Table, the two formats are increasingly interoperable.",
  },
  {
    q: "What is a catalog-managed Delta table?",
    a: "A catalog-managed table delegates transaction coordination from the filesystem to a catalog like Unity Catalog. The catalog becomes the single source of truth for table state, enabling fine-grained access control, faster query planning, and atomic CTAS operations. Catalog-managed tables shipped in Delta Lake 4.1.0 and Unity Catalog 0.4.0.",
  },
  {
    q: "What is Delta Kernel?",
    a: "Delta Kernel is a reusable Rust and Java library that implements the Delta Lake protocol once and exposes it to any engine. ClickHouse, DuckDB, and other engines integrate Delta Kernel rather than re-implementing the spec, ensuring correctness as the protocol evolves.",
  },
  {
    q: "Where can I run Delta Lake?",
    a: "Delta Lake runs on Apache Spark, Apache Flink, Trino, Presto, DuckDB, ClickHouse, Polars, and Rust via Delta-rs — on Amazon S3, Azure Data Lake Storage, Google Cloud Storage, and HDFS. It is the default table format on Databricks and Microsoft Fabric.",
  },
];

const projectLinks = [
  { label: "delta.io (official site)", href: "https://delta.io" },
  { label: "Delta Lake on GitHub", href: "https://github.com/delta-io/delta" },
  { label: "Delta Lake protocol spec", href: "https://github.com/delta-io/delta/blob/master/PROTOCOL.md" },
  { label: "Delta Kernel (Rust)", href: "https://github.com/delta-io/delta-kernel-rs" },
  { label: "Linux Foundation project page", href: "https://www.linuxfoundation.org/projects/delta-lake" },
];

// ---------- JSON-LD ----------

const techArticleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: `${TITLE} — ${TAGLINE}`,
  description: DESCRIPTION,
  url: canonicalUrl("/technologies/delta-lake"),
  about: {
    "@type": "SoftwareApplication",
    name: "Delta Lake",
    applicationCategory: "DataManagement",
    operatingSystem: "Cross-platform",
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    creator: {
      "@type": "Organization",
      name: "Databricks",
      url: "https://www.databricks.com",
    },
    publisher: {
      "@type": "Organization",
      name: "The Linux Foundation",
      url: "https://www.linuxfoundation.org",
    },
    dateCreated: "2019-04",
    sameAs: [
      "https://delta.io",
      "https://github.com/delta-io/delta",
      "https://en.wikipedia.org/wiki/Delta_Lake",
    ],
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
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
    { "@type": "ListItem", position: 2, name: "Technologies", item: canonicalUrl("/technologies") },
    { "@type": "ListItem", position: 3, name: "Delta Lake", item: canonicalUrl("/technologies/delta-lake") },
  ],
};

// ---------- Page ----------

const DeltaLakePillar = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title={`${TITLE} — ${TAGLINE}`}
      description={DESCRIPTION}
      path="/technologies/delta-lake"
      type="article"
      jsonLd={[techArticleLd, faqLd, breadcrumbLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-20 md:py-28">
          <Link to="/technologies" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Technologies
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Lakehouse Format</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">{TITLE}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-3xl">{TAGLINE}</p>
        </div>
      </section>

      <article className="container py-16 md:py-24 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:tracking-tight">
        <p className="lead text-lg">
          <strong>Delta Lake</strong> is an open-source storage framework that brings ACID transactions,
          time travel, schema enforcement, and scalable metadata to data lakes built on object storage.
          It was originally developed at <a href="https://www.databricks.com" target="_blank" rel="noreferrer">Databricks</a>,
          open-sourced in April 2019 under the Apache 2.0 license, and donated to the
          <a href="https://www.linuxfoundation.org/projects/delta-lake" target="_blank" rel="noreferrer"> Linux Foundation</a>
          where it is now governed as a graduated open project.
        </p>

        <h2 id="what-is-delta-lake">What is Delta Lake?</h2>
        <p>
          Delta Lake stores tabular data as Parquet files on object storage (Amazon S3, Azure Data Lake
          Storage, Google Cloud Storage, HDFS) and tracks every change in an ordered transaction log
          called <code>_delta_log</code>. That log is what gives Delta its three defining properties:
        </p>
        <ul>
          <li><strong>ACID transactions</strong> across concurrent readers and writers.</li>
          <li><strong>Time travel</strong> — query any historical version of a table by version or timestamp.</li>
          <li><strong>Schema enforcement and evolution</strong> — reject incompatible writes; promote safe column changes atomically.</li>
        </ul>
        <p>
          Together these turn an object-store data lake into a <em>lakehouse</em>: a single substrate
          that serves both BI/SQL analytics and AI/ML training without copying data into a warehouse.
        </p>

        <h2 id="how-it-works">How does Delta Lake work?</h2>
        <p>
          Every write to a Delta table produces a new JSON commit in <code>_delta_log</code>. Commits
          describe added and removed Parquet files, schema changes, and table properties. Readers
          reconstruct the current state by replaying the log forward from the most recent checkpoint.
          Optimistic concurrency control resolves competing writers — the loser retries against the new
          version. Starting with Delta 4.1, this coordination can be delegated from the filesystem to a
          catalog (see <Link to="/blog/delta-lake/delta-catalog-managed-tables">catalog-managed tables</Link>).
        </p>

        <h2 id="vs-iceberg-hudi">Delta Lake vs Apache Iceberg vs Apache Hudi</h2>
        <p>
          The three major open table formats target the same problem — ACID semantics on object
          storage — with different design choices. Recent interoperability work (Delta UniForm,
          Apache X-Table) means choosing one no longer locks you out of the others.
        </p>
        <div className="overflow-x-auto not-prose my-6">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-secondary">
              <tr>{comparison.headers.map((h) => <th key={h} className="text-left p-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className={`p-3 align-top ${j === 0 ? "font-medium text-muted-foreground" : ""}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="when-to-use">When to use Delta Lake</h2>
        <p>Delta Lake is the right default when any of these are true:</p>
        <ul>
          <li>Your compute is Spark-centric — Delta is the native format of Apache Spark Structured Streaming and SQL.</li>
          <li>You need first-class streaming writes alongside batch.</li>
          <li>You want <strong>Unity Catalog</strong> features like fine-grained access control, atomic CTAS, and catalog-managed tables.</li>
          <li>You're standardizing on Databricks or Microsoft Fabric, where Delta is the default table format.</li>
          <li>You need an Iceberg-readable view of your Delta tables — UniForm publishes Iceberg metadata for free.</li>
        </ul>

        <h2 id="history">History &amp; provenance</h2>
        <p>
          Delta Lake was incubated inside <strong>Databricks</strong> — the company founded by the
          original creators of Apache Spark — to solve correctness problems they observed across
          customer data lakes. It was open-sourced in 2019 and progressively expanded to be a fully
          neutral, community-governed project under the Linux Foundation.
        </p>
        <ol className="not-prose space-y-3">
          {timeline.map((t) => (
            <li key={t.date} className="flex gap-4 border-l-2 border-primary/40 pl-4">
              <span className="font-mono text-xs text-muted-foreground whitespace-nowrap pt-1">{t.date}</span>
              <span>
                {t.label}{" "}
                {t.href && (
                  t.href.startsWith("/") ? (
                    <Link to={t.href} className="text-primary hover:underline">→</Link>
                  ) : (
                    <a href={t.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">↗</a>
                  )
                )}
              </span>
            </li>
          ))}
        </ol>

        <h2 id="faq">Frequently asked questions</h2>
        <dl className="not-prose space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>

        <h2 id="learn-more">Primary sources</h2>
        <ul className="not-prose space-y-2">
          {projectLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
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

export default DeltaLakePillar;
