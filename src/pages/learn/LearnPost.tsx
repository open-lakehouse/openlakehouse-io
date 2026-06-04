import { useParams, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { PostLayout } from "@/components/PostLayout";
import { getPost, getAuthor, formatCategory } from "@/content/content";
import { canonicalUrl } from "@/lib/seo";

const LearnPost = () => {
  const { category, slug } = useParams();
  const post = category && slug ? getPost(category, slug) : null;
  if (!post || !post.include.includes("learn")) {
    return <Navigate to="/learn/getting-started" replace />;
  }

  const authorsList = post.authorSlugs.map(getAuthor).filter(Boolean) as ReturnType<typeof getAuthor>[];
  const path = `/learn/${post.category}/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: canonicalUrl(path),
    image: post.thumbnail,
    learningResourceType: post.kind,
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
    author: authorsList.map((a) => ({
      "@type": "Person",
      name: a!.name,
      url: canonicalUrl(`/authors/${a!.slug}`),
    })),
    about: post.tags,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Learn", item: canonicalUrl("/learn") },
      { "@type": "ListItem", position: 2, name: formatCategory(post.category), item: canonicalUrl(`/learn/${post.category}`) },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl(path) },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={post.title}
        description={post.excerpt ?? `${post.title} — Open Lakehouse learn`}
        path={path}
        type="article"
        image={post.thumbnail}
        jsonLd={[articleLd, breadcrumbLd]}
        noindex={post.status === "preview"}
      />
      <SiteHeader />
      <main className="flex-1">
        <PostLayout post={post} surface="learn" />
      </main>
      <SiteFooter />
    </div>
  );
};

export default LearnPost;
