/**
 * Regression test: render a handful of MDX-backed routes using the
 * production React JSX runtime. Catches the "jsxDEV is not a function"
 * class of bug where MDX is compiled in dev mode but bundled for prod.
 *
 * The vitest config compiles MDX with `development: false`, mirroring
 * what `vite build` does.
 */
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { createElement } from "react";
import { HelmetProvider } from "react-helmet-async";

import { allPosts } from "@/content/content";
import { PostLayout } from "@/components/PostLayout";

// Pick representative routes across categories + surfaces.
const SAMPLE_ROUTES = [
  { surface: "blog" as const, category: "iceberg", slug: "iceberg-1-11-0-release" },
  { surface: "blog" as const, category: "delta-lake", slug: "delta-catalog-managed-tables" },
  { surface: "learn" as const, category: "getting-started", slug: "delta-lake" },
];

function renderRoute(path: string, element: JSX.Element) {
  return renderToString(
    createElement(
      HelmetProvider,
      null,
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(Routes, null, createElement(Route, { path, element }))
      )
    )
  );
}

describe("MDX routes render in production JSX runtime", () => {
  for (const r of SAMPLE_ROUTES) {
    it(`/${r.surface}/${r.category}/${r.slug} renders without crashing`, () => {
      const post = allPosts.find((p) => p.category === r.category && p.slug === r.slug);
      expect(post, `missing fixture post ${r.category}/${r.slug}`).toBeTruthy();

      const html = renderRoute(
        `/${r.surface}/${r.category}/${r.slug}`,
        createElement(PostLayout, { post: post!, surface: r.surface })
      );

      expect(html).toContain(post!.title);
    });
  }
});
