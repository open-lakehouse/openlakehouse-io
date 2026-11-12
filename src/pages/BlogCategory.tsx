import { useParams, Navigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { postsByCategory, categories, formatCategory } from "@/content/content";

const BlogCategory = () => {
  const { category } = useParams();
  if (!category || !categories.includes(category)) return <Navigate to="/blog" replace />;

  const list = postsByCategory(category);
  const label = formatCategory(category);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${label} — Open Lakehouse Blog`}
        description={`Posts about ${label} from the Open Lakehouse: ${list.length} article${list.length === 1 ? "" : "s"} covering releases, tutorials, and deep dives.`}
        path={`/blog/category/${category}`}
      />
      <SiteHeader />
      <main className="flex-1">
        {/* Keyed so search and paging reset when switching categories. */}
        <BlogIndex key={category} category={category} />
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogCategory;
