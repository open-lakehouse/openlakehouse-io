import { useParams, Link, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { postsByCategory, categories, authors, formatCategory } from "@/content/content";

const BlogCategory = () => {
  const { category } = useParams();
  if (!category || !categories.includes(category)) return <Navigate to="/blog" replace />;

  const list = postsByCategory(category);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-16 md:py-24">
        <Link to="/blog" className="text-sm text-primary hover:underline">← All posts</Link>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">{formatCategory(category)}</h1>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {list.map((p) => {
            const a = authors[p.authorSlug];
            return (
              <Link
                key={p.slug}
                to={`/blog/${p.category}/${p.slug}`}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all"
              >
                <h2 className="text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                {p.excerpt && <p className="mt-2 text-muted-foreground">{p.excerpt}</p>}
                <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                  {a?.avatar && <img src={a.avatar} alt={a.name} className="h-7 w-7 rounded-full" />}
                  <span>{a?.name ?? "Unknown"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogCategory;
