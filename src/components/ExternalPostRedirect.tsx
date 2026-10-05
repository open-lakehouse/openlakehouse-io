import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { blogPath, externalLabel, type Post } from "@/content/content";

/**
 * Local route for a link-out entry: there is no local copy, so send the reader
 * to the original. The page canonicalizes to the original and stays out of the
 * index in case a crawler renders it before the redirect.
 */
export const ExternalPostRedirect = ({ post }: { post: Post }) => {
  const target = post.externalUrl!;

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={post.title}
        description={post.excerpt ?? `${post.title} on ${externalLabel(post)}`}
        path={blogPath(post)}
        canonical={target}
        type="article"
        image={post.thumbnail}
        noindex
      />
      <SiteHeader />
      <main className="flex-1 container py-24 text-center">
        <p className="text-muted-foreground">
          This post lives on {externalLabel(post)}.{" "}
          <a href={target} className="text-primary hover:underline">
            Continue to “{post.title}” ↗
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
};
