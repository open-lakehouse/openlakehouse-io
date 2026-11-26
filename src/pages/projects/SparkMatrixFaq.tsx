import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Table2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl } from "@/lib/seo";
import {
  EXPLORER_PATH,
  FAQS,
  FAQ_META_DESCRIPTION,
  FAQ_PATH,
  FAQ_TITLE,
  METHOD_PATH,
  SLUG,
  TITLE,
} from "@/content/spark-matrix";

// FAQ structured data lives here now that the FAQ moved to its own page.
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
    { "@type": "ListItem", position: 2, name: TITLE, item: canonicalUrl(SLUG) },
    { "@type": "ListItem", position: 3, name: "FAQ", item: canonicalUrl(FAQ_PATH) },
  ],
};

const SparkMatrixFaq = () => (
  <div className="min-h-screen flex flex-col">
    <Seo title={FAQ_TITLE} description={FAQ_META_DESCRIPTION} path={FAQ_PATH} jsonLd={[faqLd, breadcrumbLd]} />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-10 md:py-14">
          <Link to={SLUG} className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> {TITLE}
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Open Lakehouse project</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">Spark Matrix: frequently asked questions</h1>
          <p className="mt-3 text-lg md:text-xl text-white/85 max-w-3xl">
            What Spark Matrix is, where to see it, which platforms it covers, how support is decided, and how the data
            stays current.
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
            <Link to={METHOD_PATH} className="inline-flex items-center gap-1.5 text-primary hover:underline">
              How Spark Matrix is built: the evidence model and sources <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
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

export default SparkMatrixFaq;
