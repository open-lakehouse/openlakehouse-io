import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { posts, categories, authors, formatCategory } from "@/content/content";

const Blog = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Open Lakehouse Blog — Delta Lake, Iceberg, Unity Catalog, MLflow"
      description="Release notes, tutorials, and deep dives on Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark — written by maintainers and practitioners across the open data ecosystem."
      path="/blog"
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="container py-24 md:py-32 text-center max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Blog</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            Notes from the Open Lakehouse
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            Long-form posts on formats, engines, governance, and agentic AI — written by
            practitioners and maintainers across the open data ecosystem.
          </p>
        </div>
      </section>




      <div className="container py-16 md:py-24">


      <div className="flex flex-wrap gap-2 mb-12">
        <Link
          to="/blog"
          className="px-3 py-1.5 rounded-full text-sm border border-border bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            to={`/blog/category/${c}`}
            className="px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary transition-colors"
          >
            {formatCategory(c)}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((p) => {
          const a = authors[p.authorSlug];
          return (
            <Link
              key={`${p.category}/${p.slug}`}
              to={`/blog/${p.category}/${p.slug}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all flex flex-col"
            >
              {p.thumbnail && (
                <div className="aspect-[16/9] overflow-hidden bg-secondary">
                  <img
                    src={p.thumbnail}
                    alt={`Cover image for blog post: ${p.title}`}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {formatCategory(p.category)}
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                {p.excerpt && <p className="mt-2 text-muted-foreground">{p.excerpt}</p>}
                <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                  {a?.avatar && <img src={a.avatar} alt="" aria-hidden="true" className="h-7 w-7 rounded-full" />}
                  <span>{a?.name ?? "Unknown"}</span>
                  <span>·</span>
                  <time dateTime={p.date}>
                    {new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      </div>
    </main>

    <SiteFooter />
  </div>
);

export default Blog;
