/**
 * Post thumbnails must be committed next to the post as `thumbnail.<ext>`, not
 * hotlinked from the source site. Upstream renames and rebuilds (including
 * content-hashed `/_astro/` asset names) silently 404 and leave blank blog
 * cards — which is how several systems/null link-out cards broke.
 */
import { describe, it, expect } from "vitest";
import { allPosts, posts } from "@/content/content";
import { absoluteUrl } from "@/lib/seo";

describe("post thumbnails", () => {
  it("are local assets, never remote URLs", () => {
    const remote = allPosts
      .filter((p) => p.thumbnail && /^https?:\/\//i.test(p.thumbnail))
      .map((p) => `${p.category}/${p.slug}: ${p.thumbnail}`);
    expect(remote, "download these to a colocated thumbnail.<ext> instead").toEqual([]);
  });

  it("every link-out card on the blog has one", () => {
    const missing = posts
      .filter((p) => p.externalUrl && !p.thumbnail)
      .map((p) => `${p.category}/${p.slug}`);
    expect(missing).toEqual([]);
  });
});

describe("absoluteUrl", () => {
  it("prefixes local asset paths with the site origin", () => {
    expect(absoluteUrl("/assets/thumbnail-abc.jpg")).toBe("https://openlakehouse.io/assets/thumbnail-abc.jpg");
  });

  it("leaves absolute and data URLs unchanged", () => {
    expect(absoluteUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(absoluteUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
  });

  it("passes through a missing image", () => {
    expect(absoluteUrl(undefined)).toBeUndefined();
  });
});
