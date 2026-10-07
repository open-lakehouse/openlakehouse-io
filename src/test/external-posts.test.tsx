/**
 * Link-out entries (frontmatter `externalUrl`, no body) are listed on the blog
 * but live on another site: cards must open the original in a new tab, and the
 * local route must point at it instead of rendering an empty article.
 */
import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { createElement } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";

import { allPosts, posts } from "@/content/content";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";

const external = allPosts.filter((p) => p.externalUrl);
const sample = external[0];

function renderAt(path: string, routePath: string, element: JSX.Element) {
  return createElement(
    HelmetProvider,
    null,
    createElement(
      ThemeProvider,
      null,
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(Routes, null, createElement(Route, { path: routePath, element })),
      ),
    ),
  );
}

describe("link-out blog entries", () => {
  it("has at least one fixture entry", () => {
    expect(sample, "expected a post with externalUrl").toBeTruthy();
  });

  it("lists link-out entries on the blog index", () => {
    expect(posts.some((p) => p.externalUrl)).toBe(true);
  });

  it("cards open the original in a new tab", () => {
    const html = renderToString(renderAt("/blog", "/blog", createElement(Blog)));
    const href = sample.externalUrl!.replace(/&/g, "&amp;");
    expect(html).toContain(`href="${href}"`);
    expect(html).toMatch(new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}"[^>]*target="_blank"`));
    expect(html).not.toContain(`href="/blog/${sample.category}/${sample.slug}"`);
  });

  it("the local route redirects to the original", () => {
    const replace = vi.fn();
    vi.stubGlobal("location", { ...window.location, replace });
    const { container } = render(
      renderAt(`/blog/${sample.category}/${sample.slug}`, "/blog/:category/:slug", createElement(BlogPost)),
    );
    expect(replace).toHaveBeenCalledWith(sample.externalUrl);
    expect(container.querySelector(`a[href="${sample.externalUrl}"]`)).not.toBeNull();
    vi.unstubAllGlobals();
  });
});
