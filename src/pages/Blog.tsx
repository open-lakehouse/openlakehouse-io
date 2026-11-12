import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { BlogIndex } from "@/components/blog/BlogIndex";

const Blog = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Open Lakehouse Blog — Delta Lake, Iceberg, Unity Catalog, MLflow"
      description="Release notes, tutorials, and deep dives on Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark — written by maintainers and practitioners across the open data ecosystem."
      path="/blog"
    />
    <SiteHeader />
    <main className="flex-1">
      <BlogIndex />
    </main>
    <SiteFooter />
  </div>
);

export default Blog;
