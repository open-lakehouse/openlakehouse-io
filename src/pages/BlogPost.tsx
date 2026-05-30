import { useParams, Link, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MdxProvider } from "@/components/MdxProvider";
import { getPost, getAuthor, formatCategory } from "@/content/content";

const BlogPost = () => {
  const { category, slug } = useParams();
  const post = category && slug ? getPost(category, slug) : null;
  if (!post) return <Navigate to="/blog" replace />;

  const author = getAuthor(post.authorSlug);
  const Body = post.Component;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-16 md:py-24 max-w-3xl">
        <Link to={`/blog/category/${post.category}`} className="text-sm text-primary hover:underline">
          ← {formatCategory(post.category)}
        </Link>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">{post.title}</h1>
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          {author && (
            <Link to={`/authors/${author.slug}`} className="flex items-center gap-2 hover:text-foreground">
              {author.avatar && <img src={author.avatar} alt={author.name} className="h-8 w-8 rounded-full" />}
              <span>{author.name}</span>
            </Link>
          )}
          <span>·</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </time>
        </div>

        <article className="prose prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:tracking-tight prose-pre:rounded-xl prose-pre:border prose-pre:border-border">
          <MdxProvider>
            <Body />
          </MdxProvider>
        </article>

        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogPost;
