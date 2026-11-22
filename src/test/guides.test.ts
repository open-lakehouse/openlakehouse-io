import { describe, expect, it } from "vitest";
import { GUIDES, GUIDE_NAV, guideMarkdown } from "@/content/agentic";
import { patternBySlug } from "@/content/reference-architectures";

describe("agentic guides", () => {
  it("link only to reference architectures that exist", () => {
    for (const g of GUIDES) for (const a of g.architectures) expect(patternBySlug(a.slug), `${g.slug} -> ${a.slug}`).toBeDefined();
  });
  it("cross-reference every guide in the shared nav", () => {
    const hrefs = GUIDE_NAV.map((n) => n.href);
    for (const g of GUIDES) expect(hrefs).toContain(g.slug);
    expect(hrefs).toContain("/open-source-data-engineering");
    expect(hrefs).toContain("/reference-architectures");
  });
  it("keeps prose free of em dashes and renders Markdown", () => {
    for (const g of GUIDES) {
      expect(JSON.stringify(g).includes(String.fromCharCode(0x2014))).toBe(false);
      expect(guideMarkdown(g)).toContain(g.definition);
    }
  });
});
