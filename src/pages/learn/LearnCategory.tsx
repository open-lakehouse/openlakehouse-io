import { Link, useParams, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { Clock, ArrowRight } from "lucide-react";
import { learnPostsByCategory, learnCategories, formatCategory } from "@/content/content";

const LearnCategory = () => {
  const { category } = useParams();
  if (!category || !learnCategories.includes(category)) {
    return <Navigate to="/learn/getting-started" replace />;
  }
  const list = learnPostsByCategory(category);
  const label = formatCategory(category);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${label} — Open Lakehouse Learn`}
        description={`${label} guides from the Open Lakehouse: ${list.length} piece${list.length === 1 ? "" : "s"} of educational content.`}
        path={`/learn/${category}`}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-brand-gradient">
          <div className="container py-20 md:py-24 max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
            <Link to="/learn" className="text-sm text-white/80 hover:text-white">← Learn</Link>
            <p className="mt-4 text-sm font-medium uppercase tracking-widest text-white/80">Learn</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
              {label}
            </h1>
          </div>
        </section>
        <section className="container py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {list.map((p) => (
              <Link
                key={p.slug}
                to={`/learn/${p.category}/${p.slug}`}
                className="group rounded-2xl border border-border bg-card p-7 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
                  <Clock className="h-3.5 w-3.5" /> {p.readingTime ?? 5} min read
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{p.title}</h2>
                {p.excerpt && <p className="mt-2 text-muted-foreground leading-relaxed">{p.excerpt}</p>}
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                  Start learning <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LearnCategory;
