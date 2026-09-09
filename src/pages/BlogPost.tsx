import { useParams, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PostLayout } from "@/components/PostLayout";
import { Seo } from "@/components/Seo";
import { getPost, getAuthor, formatCategory } from "@/content/content";
import { canonicalUrl } from "@/lib/seo";

const BlogPost = () => {
  const { category, slug } = useParams();
  const post = category && slug ? getPost(category, slug) : null;
  if (!post || !post.include.includes("blog")) return <Navigate to="/blog" replace />;

  const authorsList = post.authorSlugs.map(getAuthor).filter(Boolean) as ReturnType<typeof getAuthor>[];
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
    ...(post.originalUrl
      ? {
          isBasedOn: {
            "@type": "Article",
            "@id": post.originalUrl,
            url: post.originalUrl,
            ...(post.originalPublisher
              ? {
                  publisher: {
                    "@type": "Organization",
                    name: post.originalPublisher,
                  },
                }
              : {}),
          },
        }
      : {}),
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
        canonical={post.originalUrl}
        type="article"
        image={post.thumbnail}
        jsonLd={[articleLd, breadcrumbLd]}
        noindex={post.status === "preview"}
      />
      <SiteHeader />
      <main className="flex-1">
        <PostLayout post={post} surface="blog" />
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogPost;
