import { useParams, Link, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MdxProvider } from "@/components/MdxProvider";
import { Seo } from "@/components/Seo";
import { getPost, getAuthor, formatCategory } from "@/content/content";
import { canonicalUrl } from "@/lib/seo";

const BlogPost = () => {
  const { category, slug } = useParams();
  const post = category && slug ? getPost(category, slug) : null;
  if (!post) return <Navigate to="/blog" replace />;

  const authorsList = post.authorSlugs.map(getAuthor).filter(Boolean) as ReturnType<typeof getAuthor>[];
  const Body = post.Component;

  const path = `/blog/${post.category}/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: canonicalUrl(path),
    image: post.thumbnail,
    author: authorsList.map((a) => ({
      "@type": "Person",
      name: a!.name,
      url: canonicalUrl(`/authors/${a!.slug}`),
    })),
    about: post.tags,
    publisher: {
      "@type": "Organization",
      name: "Open Lakehouse",
      url: canonicalUrl("/"),
    },
    articleSection: formatCategory(post.category),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: canonicalUrl("/blog") },
      { "@type": "ListItem", position: 2, name: formatCategory(post.category), item: canonicalUrl(`/blog/category/${post.category}`) },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl(path) },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={post.title}
        description={post.excerpt ?? `${post.title} — Open Lakehouse blog post`}
        path={path}
        type="article"
        image={post.thumbnail}
        jsonLd={[articleLd, breadcrumbLd]}
      />
      <SiteHeader />
      <main className="flex-1 container py-16 md:py-24 max-w-3xl">
        <Link to={`/blog/category/${post.category}`} className="text-sm text-primary hover:underline">
          ← {formatCategory(post.category)}
        </Link>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">{post.title}</h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          {authorsList.map((a, i) => (
            <span key={a!.slug} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground/60">·</span>}
              <Link to={`/authors/${a!.slug}`} className="flex items-center gap-2 hover:text-foreground">
                {a!.avatar && <img src={a!.avatar} alt="" aria-hidden="true" className="h-8 w-8 rounded-full" />}
                <span>{a!.name}</span>
              </Link>
            </span>
          ))}
          {authorsList.length > 0 && <span>·</span>}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </time>
        </div>

        {post.thumbnail && (
          <div className="mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-secondary">
            <img
              src={post.thumbnail}
              alt={`Cover image for blog post: ${post.title}`}
              width={1280}
              height={720}
              className="h-full w-full object-cover"
            />
          </div>
        )}

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
