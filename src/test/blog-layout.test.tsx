/**
 * The blog index (featured lead, side stack, paged "Latest" list, search,
 * category filtering) and the post layout's table of contents + related posts.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createElement, type ReactElement } from "react";

import { allPosts, posts, postsByCategory, relatedPosts, type Post } from "@/content/content";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { PostLayout } from "@/components/PostLayout";

beforeAll(() => {
  // jsdom has no layout; paging scrolls the list into view.
  Element.prototype.scrollIntoView = () => {};
});

const renderIn = (el: ReactElement) => render(createElement(MemoryRouter, null, el));
const hrefOf = (p: Post) => p.externalUrl ?? `/blog/${p.category}/${p.slug}`;
const hrefs = (root: ParentNode) => Array.from(root.querySelectorAll("a")).map((a) => a.getAttribute("href"));
const latestRows = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLAnchorElement>('section[aria-labelledby="latest-heading"] > div > a'));
const visible = (rows: HTMLElement[]) => rows.filter((r) => !r.classList.contains("hidden"));

describe("blog index", () => {
  it("links every published post, including paged-out rows", () => {
    const { container } = renderIn(createElement(BlogIndex));
    const links = hrefs(container);
    for (const p of posts) expect(links, p.slug).toContain(hrefOf(p));
  });

  it("features the newest post and pages the rest at 8 per page", () => {
    const { container } = renderIn(createElement(BlogIndex));
    const featured = screen.getByRole("region", { name: "Featured posts" });
    expect(hrefs(featured)[0]).toBe(hrefOf(posts[0]));

    const rows = latestRows(container);
    expect(visible(rows)).toHaveLength(Math.min(8, rows.length));
    if (rows.length > 8) {
      fireEvent.click(screen.getByRole("button", { name: "2" }));
      expect(visible(latestRows(container))[0].getAttribute("href")).toBe(rows[8].getAttribute("href"));
    }
  });

  it("search hides the featured posts and lists only matches", () => {
    const target = posts[posts.length - 1];
    const { container } = renderIn(createElement(BlogIndex));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: target.title } });

    expect(screen.queryByRole("region", { name: "Featured posts" })).toBeNull();
    expect(visible(latestRows(container)).map((r) => r.getAttribute("href"))).toContain(hrefOf(target));

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz-no-such-post" } });
    expect(latestRows(container)).toHaveLength(0);
    expect(screen.getByText(/No posts match/)).toBeInTheDocument();
  });

  it("a category page lists only that category, with no featured section", () => {
    const category = posts[0].category;
    const { container } = renderIn(createElement(BlogIndex, { category }));
    expect(screen.queryByRole("region", { name: "Featured posts" })).toBeNull();
    expect(latestRows(container).map((r) => r.getAttribute("href")).sort()).toEqual(
      postsByCategory(category).map(hrefOf).sort(),
    );
  });
});

describe("post layout", () => {
  const post = allPosts.find((p) => p.category === "delta-lake" && p.slug === "delta-catalog-managed-tables")!;

  it("builds the table of contents from the article's h2 headings", () => {
    const { container } = renderIn(createElement(PostLayout, { post, surface: "blog" }));
    const headings = Array.from(container.querySelectorAll(".post-article h2[id]"));
    expect(headings.length).toBeGreaterThan(0);

    const toc = screen.getByRole("navigation", { name: "On this page" });
    expect(hrefs(toc)).toEqual(headings.map((h) => `#${h.id}`));
  });

  it("recommends up to 3 other posts, same category first", () => {
    const related = relatedPosts(post, posts);
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related).not.toContain(post);
    const sameCategory = posts.filter((p) => p !== post && p.category === post.category).length;
    expect(related.slice(0, Math.min(3, sameCategory)).every((p) => p.category === post.category)).toBe(true);
  });
});
