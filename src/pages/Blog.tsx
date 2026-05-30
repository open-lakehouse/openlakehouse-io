import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { posts, categories, authors, formatCategory } from "@/content/content";

const Blog = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main className="flex-1 container py-16 md:py-24">
      <header className="mb-12">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Notes from the open lakehouse community — formats, engines, governance, and AI.
        </p>
      </header>

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
              className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                {formatCategory(p.category)}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                {p.title}
              </h2>
              {p.excerpt && <p className="mt-2 text-muted-foreground">{p.excerpt}</p>}
              <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                {a?.avatar && <img src={a.avatar} alt={a.name} className="h-7 w-7 rounded-full" />}
                <span>{a?.name ?? "Unknown"}</span>
                <span>·</span>
                <time dateTime={p.date}>
                  {new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </time>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
    <SiteFooter />
  </div>
);

export default Blog;
