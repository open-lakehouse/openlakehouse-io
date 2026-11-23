import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Github } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  BOOK_URL,
  CHAPTER_CONTENTS,
  CHAPTER_COUNT,
  DEFINITION,
  DESCRIPTION,
  FAQS,
  META_DESCRIPTION,
  PARTS,
  PYSPARK_PIN,
  QUICKSTART,
  REPO_URL,
  REQUIREMENTS,
  SLUG,
  SPARK_VERSION,
  TAGLINE,
  TITLE,
  chapterUrl,
} from "@/content/spark-masterclass";

// ---------- JSON-LD ----------

const openLakehouseOrg = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

const bookLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  "@id": BOOK_URL,
  name: TITLE,
  description: DESCRIPTION,
  url: BOOK_URL,
  sameAs: [canonicalUrl(SLUG), REPO_URL],
  bookFormat: "https://schema.org/EBook",
  inLanguage: "en",
  isAccessibleForFree: true,
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  publisher: openLakehouseOrg,
  about: {
    "@type": "SoftwareApplication",
    name: "Apache Spark",
    softwareVersion: SPARK_VERSION,
    url: "https://spark.apache.org",
    applicationCategory: "DataManagement",
  },
  keywords:
    "Apache Spark 4.3, Spark book, PySpark, Spark SQL, Spark Connect, Structured Streaming, Spark Declarative Pipelines, Spark performance tuning, Spark internals",
  hasPart: PARTS.map((p) => ({
    "@type": "CreativeWork",
    name: `Part ${p.numeral}: ${p.title}`,
    hasPart: p.chapters.map((c) => ({
      "@type": "Chapter",
      position: c.n,
      name: c.title,
      url: chapterUrl(c),
    })),
  })),
  workExample: {
    "@type": "SoftwareSourceCode",
    name: `${TITLE} examples`,
    codeRepository: REPO_URL,
    programmingLanguage: ["Python", "SQL", "Scala", "Java"],
    runtimePlatform: `Apache Spark ${SPARK_VERSION}`,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
  },
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
    { "@type": "ListItem", position: 2, name: "Learn", item: canonicalUrl("/learn") },
    { "@type": "ListItem", position: 3, name: TITLE, item: canonicalUrl(SLUG) },
  ],
};

// ---------- Page ----------

const SparkMasterclass = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title={`${TITLE}: an open online book on Apache Spark ${SPARK_VERSION}`}
      description={META_DESCRIPTION}
      path={SLUG}
      jsonLd={[bookLd, faqLd, breadcrumbLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-20 md:py-28">
          <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Learn
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Open Lakehouse project</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">{TITLE}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-3xl">{TAGLINE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={BOOK_URL}
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/90"
            >
              <BookOpen className="h-4 w-4" /> Read the book
            </a>
            <a
              href={REPO_URL}
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Github className="h-4 w-4" /> Code on GitHub
            </a>
          </div>
        </div>
      </section>

      <article className="container py-16 md:py-24 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:tracking-tight">
        <p className="lead text-lg">{DEFINITION}</p>

        <h2 id="what-every-chapter-has">What every chapter has</h2>
        <p>
          Most Spark material stops at the API. Spark Masterclass follows each call through planning, execution,
          storage and failure, and it shows the evidence for each step.
        </p>
        <ul>
          {CHAPTER_CONTENTS.map((c) => (
            <li key={c.title}>
              <strong>{c.title}.</strong> {c.body}
            </li>
          ))}
        </ul>

        <h2 id="contents">What the book covers</h2>
        <p>
          The book has {CHAPTER_COUNT} chapters in {PARTS.length} parts. Read it from the start, or go directly to the
          part about the mechanism you need to understand. Each chapter title links to the chapter in the online book.
        </p>
        <div className="not-prose space-y-8 my-8">
          {PARTS.map((p) => (
            <section key={p.numeral} aria-labelledby={`part-${p.numeral}`}>
              <h3 id={`part-${p.numeral}`} className="text-lg font-semibold tracking-tight">
                Part {p.numeral}: {p.title}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  Chapters {p.chapters[0].n} to {p.chapters[p.chapters.length - 1].n}
                </span>
              </h3>
              <ol className="mt-3 space-y-1.5 text-sm">
                {p.chapters.map((c) => (
                  <li key={c.n} className="flex gap-2">
                    <span className="w-7 shrink-0 text-right tabular-nums text-muted-foreground">{c.n}.</span>
                    <a href={chapterUrl(c)} className="text-primary hover:underline">
                      {c.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <h2 id="run-the-code">How to run the examples</h2>
        <p>
          Every example is designed to run on a laptop. The chapter environment pins <code>{PYSPARK_PIN}</code>, and
          the data is one month of public New York City taxi trip records, which the setup script downloads (the
          repository does not redistribute it).
        </p>
        <p>Requirements:</p>
        <ul>
          {REQUIREMENTS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <pre>
          <code>{QUICKSTART}</code>
        </pre>
        <p>
          Some chapters need more: Docker for catalogs, Kafka or Kubernetes with kind, extra Maven packages, or an
          NVIDIA GPU. Each chapter states its requirements at the start.
        </p>

        <h2 id="how-it-is-verified">How the book is verified</h2>
        <p>
          Each technical result in the text comes from a script in the repository's <code>code/</code> directory, and the
          output of that script is saved next to it. When the book quotes a query plan, a row count or a Spark UI
          metric, the saved output is the source. The prose is written in ASD-STE100 Simplified Technical English, a
          controlled language for technical text, and the repository includes a checker for it.
        </p>

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
            <Link to="/spark-matrix" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              Spark Matrix: Apache Spark features across managed Spark platforms <ArrowRight className="h-3.5 w-3.5" />
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

        <h2 id="links">Links</h2>
        <ul className="not-prose space-y-2">
          {[
            { label: "Spark Masterclass online book", href: BOOK_URL },
            { label: "Source and examples on GitHub (open-lakehouse/spark-masterclass)", href: REPO_URL },
            { label: "Apache Spark", href: "https://spark.apache.org" },
          ].map((l) => (
            <li key={l.href}>
              <a href={l.href} className="inline-flex items-center gap-1.5 text-primary hover:underline">
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

export default SparkMasterclass;
