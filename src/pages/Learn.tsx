import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VideosCarousel } from "@/components/VideosCarousel";
import { Link } from "react-router-dom";
import { BookOpen, Play, Newspaper } from "lucide-react";
import learnHeroBgUrl from "@/assets/bundled/learn-hero-bg.png";


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
    <SiteHeader />
    <main className="flex-1">
      <section
        className="relative border-b border-border overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${learnHeroBgUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background/80" aria-hidden />
        <div className="container relative py-20 md:py-28">
          <p className="text-sm font-medium text-white/90 uppercase tracking-widest drop-shadow">Learn</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            Learn the Open Lakehouse
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85 drop-shadow">
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
