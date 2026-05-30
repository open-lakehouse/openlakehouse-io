import { useParams, Link, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MdxProvider } from "@/components/MdxProvider";
import { getAuthor, postsByAuthor, formatCategory } from "@/content/content";

const AuthorPage = () => {
  const { slug } = useParams();
  const author = slug ? getAuthor(slug) : null;
  if (!author) return <Navigate to="/blog" replace />;

  const Bio = author.Component;
  const list = postsByAuthor(author.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-16 md:py-24 max-w-4xl">
        <div className="flex items-center gap-6">
          {author.avatar && (
            <img src={author.avatar} alt={author.name} className="h-24 w-24 rounded-full border border-border" />
          )}
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{author.name}</h1>
            {author.role && <p className="mt-1 text-muted-foreground">{author.role}</p>}
            <div className="mt-3 flex gap-4 text-sm">
              {author.twitter && (
                <a href={`https://x.com/${author.twitter}`} target="_blank" rel="noreferrer"
                   className="text-primary hover:underline">@{author.twitter}</a>
              )}
              {author.github && (
                <a href={`https://github.com/${author.github}`} target="_blank" rel="noreferrer"
                   className="text-primary hover:underline">github.com/{author.github}</a>
              )}
            </div>
          </div>
        </div>

        <article className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
          <MdxProvider>
            <Bio />
          </MdxProvider>
        </article>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Posts by {author.name}</h2>
          <div className="grid gap-4">
            {list.map((p) => (
              <Link key={`${p.category}/${p.slug}`} to={`/blog/${p.category}/${p.slug}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-border py-4 hover:text-primary transition-colors">
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatCategory(p.category)} · {new Date(p.date).toLocaleDateString()}
                </span>
              </Link>
            ))}
            {list.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default AuthorPage;
