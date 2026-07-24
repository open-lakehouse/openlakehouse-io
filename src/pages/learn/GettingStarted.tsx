import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { Clock, ArrowRight } from "lucide-react";
import { learnPosts, learnCategories, formatCategory } from "@/content/content";

const categoryLabels: Record<string, { eyebrow: string; tagline: string }> = {
  "getting-started": {
    eyebrow: "Getting Started",
    tagline: "Five-minute, education-first intros to the core open lakehouse projects.",
  },
  "deep-dives": {
    eyebrow: "Deep Dives",
    tagline: "Long-form explorations of how the open lakehouse works under the hood.",
  },
  concepts: {
    eyebrow: "Concepts",
    tagline: "Mental models and core ideas behind the open data ecosystem.",
  },
  tutorials: {
    eyebrow: "Tutorials",
    tagline: "Step-by-step walkthroughs you can run on your own laptop.",
  },
};

const GettingStarted = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Educational Content — Open Lakehouse"
      description="Getting-started guides, deep dives, and concept walkthroughs for Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark."
      path="/learn/getting-started"
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="container py-24 md:py-28 text-center max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Learn</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            Educational content for the Open Lakehouse
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-white/85 leading-relaxed">
            Short intros, deep dives, and concept walkthroughs — built so you can read, copy,
            or hand to your favorite LLM.
          </p>
        </div>
      </section>

      {learnCategories.map((cat) => {
        const list = learnPosts.filter((p) => p.category === cat);
        if (!list.length) return null;
        const meta = categoryLabels[cat] ?? { eyebrow: formatCategory(cat), tagline: "" };
        return (
          <section key={cat} className="container py-16 md:py-20">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-widest text-primary">
                  {meta.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
                  {meta.tagline || formatCategory(cat)}
                </h2>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <Link
                  key={p.slug}
                  to={`/learn/${p.category}/${p.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
                    <Clock className="h-3.5 w-3.5" /> {p.readingTime ?? 5} min read
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{p.title}</h3>
                  {p.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.excerpt}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
    <SiteFooter />
  </div>
);

export default GettingStarted;

// Kept for backwards compatibility with the homepage carousel.
export const gettingStartedTopics = learnPosts
  .filter((p) => p.category === "getting-started")
  .map((p) => ({ slug: p.slug, title: p.title, desc: p.excerpt ?? "" }));
