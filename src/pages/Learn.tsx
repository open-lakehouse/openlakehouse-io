import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VideosCarousel } from "@/components/VideosCarousel";
import { Link } from "react-router-dom";
import { BookOpen, Play, Newspaper } from "lucide-react";
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
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            Learn the Open Lakehouse
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            Curated talks, articles, and references to help you go from curious to confident on
            open formats, engines, and agentic data platforms.
          </p>
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
