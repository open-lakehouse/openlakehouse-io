import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { TrestleView } from "@/components/mdx/TrestleView";
import { LikeC4View } from "@/components/mdx/LikeC4View";

describe("diagram components from docs-factory posts", () => {
  it("TrestleView renders <trestle-view> with its snapshot and alt", () => {
    const html = renderToString(
      createElement(TrestleView, { src: "/trestle/p/env/diagram.trestle-graph.json", alt: "A stack." })
    );
    expect(html).toContain('<trestle-view src="/trestle/p/env/diagram.trestle-graph.json"');
    expect(html).toContain('label="A stack."');
    expect(html).toContain('color-mode="light"');
    expect(html).toContain('<figcaption class="sr-only">A stack.</figcaption>');
  });

  it("LikeC4View renders <likec4-view> for its view", () => {
    const html = renderToString(createElement(LikeC4View, { viewId: "flow", alt: "A flow." }));
    expect(html).toContain('view-id="flow"');
    expect(html).toContain('dynamic-variant="sequence"');
    expect(html).toContain("A flow.");
  });
});
