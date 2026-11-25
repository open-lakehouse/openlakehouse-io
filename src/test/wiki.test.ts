import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWikiIndex, WIKI_DIR } from "../../scripts/wiki-index";
import { NAVBOX } from "@/content/wiki-navbox";

const { pages } = buildWikiIndex();
const byPath = new Set(pages.map((p) => p.path));
const source = (file: string) => fs.readFileSync(path.join(WIKI_DIR, file), "utf8");

describe("Open Lakehouse Wiki", () => {
  it("has articles, categories and project pages", () => {
    for (const kind of ["article", "category", "project"]) expect(pages.some((p) => p.kind === kind)).toBe(true);
  });

  it("gives every article a lead whose first sentence works as a summary", () => {
    for (const p of pages.filter((p) => p.kind === "article")) {
      expect(p.summary, p.file).toMatch(/\.$/);
      expect(p.summary.length, p.file).toBeGreaterThan(30);
    }
  });

  it("defines every footnote it cites", () => {
    for (const p of pages.filter((p) => p.file)) {
      // Example markup in code (the style guide) is not a citation.
      const text = source(p.file).replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
      const defined = new Set([...text.matchAll(/^\[\^([^\]]+)\]:/gm)].map((m) => m[1]));
      const used = new Set([...text.matchAll(/\[\^([^\]]+)\](?!:)/g)].map((m) => m[1]));
      for (const label of used) expect(defined.has(label), `${p.file}: [^${label}]`).toBe(true);
    }
  });

  it("puts pages with a non-active status in the matching category", () => {
    const graphx = pages.find((p) => p.key === "GraphX");
    expect(graphx?.status).toBe("proposed");
    expect(graphx?.categories).toContain("Deprecation proposed");
  });

  it("links every navigation box entry to a page that exists", () => {
    for (const g of NAVBOX)
      for (const [target] of g.links) expect(byPath.has(`/wiki/${target.replace(/ /g, "_")}`), target).toBe(true);
  });

  it("uses no em dashes", () => {
    for (const p of pages.filter((p) => p.file)) expect(source(p.file).includes("—"), p.file).toBe(false);
  });
});

describe("wiki index", () => {
  it("ignores example markup in code", () => {
    const guide = pages.find((p) => p.key === "Open_Lakehouse_Wiki:Style_guide");
    expect(guide?.status).toBeUndefined();
    expect(guide?.categories).not.toContain("Deprecated");
  });
});

describe("wiki references", () => {
  it("gives every article with citations a References heading", () => {
    for (const p of pages.filter((p) => p.kind === "article")) {
      const text = source(p.file);
      if (/^\[\^[^\]]+\]:/m.test(text)) expect(text, p.file).toMatch(/^## References$/m);
    }
  });
});
