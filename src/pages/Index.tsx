import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";

import { LogoMarquee } from "@/components/LogoMarquee";
import { Technologies } from "@/components/Technologies";
import { VideosCarousel } from "@/components/VideosCarousel";
import { FAQ } from "@/components/FAQ";
import { Seo } from "@/components/Seo";
import { organizationJsonLd, websiteJsonLd, SITE_DESCRIPTION } from "@/lib/seo";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { gettingStartedTopics } from "./learn/GettingStarted";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Open Source Data Engineering — Open Lakehouse"
      description={SITE_DESCRIPTION}
      path="/"
      suffix={false}
      jsonLd={[organizationJsonLd, websiteJsonLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <Hero />
      <LogoMarquee />
      <Technologies />

      {/* Query-language section. Gives the homepage a passage that matches how
          people actually search ("open source data engineering") and links to
          the dedicated guide for deeper citation. */}
      <section
        id="open-source-data-engineering"
        aria-labelledby="open-source-data-engineering-heading"
        className="border-t border-border/40 bg-secondary/40"
      >
        <div className="container py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Open source data engineering
            </p>
            <h2
              id="open-source-data-engineering-heading"
              className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight"
            >
              Build a data platform you control.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Open source data engineering means storing data in open formats on storage you own,
              and reading it with any engine you choose. The stack spans Apache Spark and Apache
              Flink for compute, Delta Lake, Apache Iceberg, and Apache Hudi for storage, Unity
              Catalog and Apache Polaris for governance, and Apache Airflow for orchestration. No
              proprietary table format, no proprietary catalog, no lock-in.
            </p>
            <Link
              to="/open-source-data-engineering"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
            >
              Read the open source data engineering guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <VideosCarousel />

      {/* Getting Started */}
      <section className="container py-20 md:py-24">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Getting Started</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
              Five-minute intros to the core projects.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Short, education-first guides — the mental model you need before going deeper.
            </p>
          </div>
          <Link
            to="/learn/getting-started"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gettingStartedTopics.map((t) => (
            <Link
              key={t.slug}
              to={`/learn/getting-started/${t.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all flex flex-col"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
                <Clock className="h-3.5 w-3.5" /> 5 min
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                Start <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FAQ />

    </main>
    <SiteFooter />
  </div>
);

export default Index;
