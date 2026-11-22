import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import {
  COMPONENTS,
  INDUSTRIES,
  PATTERNS,
  applySwaps,
  componentById,
  dataset,
  patternMarkdown,
  search,
  toMermaid,
  toYaml,
} from "@/content/reference-architectures";
import { ArchitectureBoard } from "@/components/refarch/ArchitectureBoard";

describe("reference architecture data", () => {
  it("has unique slugs and component ids", () => {
    const slugs = PATTERNS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const ids = COMPONENTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const ind = INDUSTRIES.map((i) => i.slug);
    expect(new Set(ind).size).toBe(ind.length);
  });

  it("references only known components, and swaps stay in the same layer", () => {
    for (const p of PATTERNS) {
      for (const n of p.nodes) {
        if (n.component) expect(componentById(n.component), `${p.slug}: ${n.component}`).toBeDefined();
        else expect(n.label, `${p.slug}: node needs a component or a label`).toBeTruthy();
        for (const s of n.swaps ?? []) {
          const c = componentById(s);
          expect(c, `${p.slug}: swap ${s}`).toBeDefined();
        }
      }
    }
  });

  it("maps every industry use case onto an existing pattern", () => {
    for (const ind of INDUSTRIES) {
      for (const u of ind.useCases) {
        expect(PATTERNS.some((p) => p.slug === u.pattern), `${ind.slug}: ${u.pattern}`).toBe(true);
      }
    }
  });

  it("grounds every pattern in at least one https repository and one source", () => {
    for (const p of PATTERNS) {
      expect(p.repos.length, p.slug).toBeGreaterThan(0);
      for (const r of p.repos) expect(r.url).toMatch(/^https:\/\/github\.com\//);
      expect(p.sources.length, p.slug).toBeGreaterThan(0);
      expect(p.faqs.length, p.slug).toBeGreaterThan(0);
    }
  });

  it("keeps prose free of em dashes", () => {
    const text = JSON.stringify(dataset());
    expect(text.includes(String.fromCharCode(0x2014))).toBe(false);
  });

  it("exports YAML, Mermaid and Markdown for every pattern", () => {
    for (const p of PATTERNS) {
      const nodes = applySwaps(p, {});
      expect(toYaml(p, nodes)).toContain(`name: ${p.slug}`);
      expect(toMermaid(p, nodes)).toMatch(/^flowchart LR/);
      expect(patternMarkdown(p)).toContain(p.title);
    }
  });

  it("ignores swaps that the slot does not allow", () => {
    const p = PATTERNS[0];
    const i = p.nodes.findIndex((n) => n.swaps?.length);
    const allowed = p.nodes[i].swaps![0];
    expect(applySwaps(p, { [i]: allowed })[i].component).toBe(allowed);
    expect(applySwaps(p, { [i]: "not-a-component" })[i].component).toBe(p.nodes[i].component);
  });
});

describe("search", () => {
  it("finds architectures by component, industries by format, and use cases by keyword", () => {
    expect(search("kafka").some((h) => h.kind === "Architecture")).toBe(true);
    expect(search("FHIR").some((h) => h.kind === "Industry" && h.title === "Healthcare providers")).toBe(true);
    expect(search("fraud").some((h) => h.kind === "Use case")).toBe(true);
    expect(search("")).toEqual([]);
  });
});

describe("ArchitectureBoard", () => {
  const renderAt = (url: string) =>
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="*" element={<ArchitectureBoard />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

  it("renders the pattern from the URL with its industry lens", () => {
    renderAt("/reference-architectures?pattern=real-time-streaming&industry=banking");
    expect(screen.getAllByText("Spark Real-Time Mode").length).toBeGreaterThan(0);
    expect(screen.getByText("Core banking system")).toBeInTheDocument();
    expect(screen.getByText("Banking lens")).toBeInTheDocument();
  });

  it("hides detail-only boxes until the detailed view is chosen", () => {
    renderAt("/reference-architectures?pattern=laptop-open-lakehouse");
    expect(screen.queryByText("PostgreSQL")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Detailed" }));
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("applies a swap from the URL", () => {
    const p = PATTERNS.find((x) => x.slug === "laptop-open-lakehouse")!;
    const i = p.nodes.findIndex((n) => n.component === "seaweedfs");
    renderAt(`/reference-architectures?pattern=laptop-open-lakehouse&swap=${i}:minio`);
    expect(screen.getByText("MinIO")).toBeInTheDocument();
    expect(screen.getByText(/Reset 1 swap/)).toBeInTheDocument();
  });
});
