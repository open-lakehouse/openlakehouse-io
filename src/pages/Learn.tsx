import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VideosCarousel } from "@/components/VideosCarousel";
import { Link } from "react-router-dom";
import { BookOpen, Play, Newspaper, Clock, ArrowRight } from "lucide-react";
import { gettingStartedTopics } from "./learn/GettingStarted";
import { Seo } from "@/components/Seo";



const resources = [
  {
    icon: Play,
    title: "Talks & Videos",
    desc: "Conference talks, deep dives, and tutorials from across the open lakehouse community.",
    to: "#learn",
  },
  {
    icon: Newspaper,
    title: "Blog",
    desc: "Long-form posts on formats, engines, governance, and agentic AI on the lakehouse.",
    to: "/blog",
  },
  {
    icon: BookOpen,
    title: "Technologies",
    desc: "Browse the open-source projects that power the modern lakehouse stack.",
    to: "/technologies",
  },
];

const Learn = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Learn the Open Lakehouse — Talks, tutorials, and deep dives"
      description="Curated talks, tutorials, and resources for learning Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark — from maintainers and practitioners."
      path="/learn"
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="container py-24 md:py-32 text-center max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Learn</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            Learn the Open Lakehouse
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            Curated talks, articles, and references to help you go from curious to confident on
            open formats, engines, and agentic data platforms.
          </p>
        </div>
      </section>


      {/* Getting Started */}
      <section className="container pt-20 md:pt-24">
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

      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {resources.map(({ icon: Icon, title, desc, to }) => {
            const inner = (
              <>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-glow">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-muted-foreground">{desc}</p>
              </>
            );
            return to.startsWith("#") ? (
              <a key={title} href={to} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all">
                {inner}
              </a>
            ) : (
              <Link key={title} to={to} className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all">
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      <VideosCarousel />
    </main>
    <SiteFooter />
  </div>
);

export default Learn;
