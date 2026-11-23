import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MatrixTable } from "@/components/spark-matrix/MatrixTable";
import SparkMatrix from "@/pages/projects/SparkMatrix";
import { LEVEL_BY_CODE, SHOWN_PLATFORMS, defaultRuntime, features, matrix, platforms } from "@/lib/spark-matrix";
import { matrixMarkdown } from "@/content/spark-matrix";

describe("vendored Spark Matrix data", () => {
  it("has a level for every feature in every runtime row, and every claim index resolves", () => {
    expect(matrix.features).toEqual(features.map((f) => f.id));
    for (const [pid, runtimes] of Object.entries(matrix.rows)) {
      const p = platforms.find((x) => x.id === pid);
      expect(p, pid).toBeDefined();
      for (const [rid, row] of Object.entries(runtimes)) {
        expect(p!.runtimes.some((r) => r.id === rid), `${pid}/${rid}`).toBe(true);
        expect(row.levels.length, `${pid}/${rid}`).toBe(features.length);
        for (const ch of row.levels) expect(LEVEL_BY_CODE[ch], `${pid}/${rid}: ${ch}`).toBeDefined();
        for (const idx of [...Object.values(row.claims).flat(), ...row.other]) {
          expect(p!.claims[idx], `${pid}/${rid}: claim ${idx}`).toBeDefined();
        }
      }
    }
  });
});

describe("MatrixTable", () => {
  it("prerenders every feature row and a column per shown service", () => {
    const html = renderToString(<MatrixTable />);
    for (const f of features) expect(html).toContain(f.title.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
    for (const p of SHOWN_PLATFORMS) expect(html).toContain(`title="${p.name.replace(/&/g, "&amp;")}"`);
    expect(html).not.toContain("<select class=\"mt-1"); // runtime pickers are client-only
  });

  it("opens the source for a cell", () => {
    render(<MatrixTable />);
    const row = screen.getByRole("rowheader", { name: /Spark Connect server/ }).closest("tr")!;
    const cells = within(row).getAllByRole("button");
    // The first service column comes after the Apache columns.
    fireEvent.click(cells[cells.length - SHOWN_PLATFORMS.length]);
    const dialog = screen.getByRole("dialog");
    const p = SHOWN_PLATFORMS[0];
    expect(dialog.textContent).toContain(p.name);
    expect(within(dialog).getByRole("heading", { name: "Spark Connect server" })).toBeInTheDocument();
    expect(defaultRuntime(p)).toBeDefined();
  });
});

describe("Spark Matrix page", () => {
  it("puts the matrix before the explainer and links the explorer", () => {
    const html = renderToString(
      <HelmetProvider>
        <ThemeProvider>
          <MemoryRouter>
            <SparkMatrix />
          </MemoryRouter>
        </ThemeProvider>
      </HelmetProvider>,
    );
    expect(html.indexOf('id="matrix"')).toBeGreaterThan(-1);
    expect(html.indexOf('id="matrix"')).toBeLessThan(html.indexOf('id="why"'));
    expect(html).toContain('href="/spark-matrix/explorer/"');
    expect(html).not.toMatch(/not public yet/);
  });

  it("summarises the matrix for llms-full.txt from the data", () => {
    const md = matrixMarkdown("https://example.org");
    for (const p of SHOWN_PLATFORMS) expect(md).toContain(`| ${p.name} |`);
    expect(md).not.toContain(String.fromCharCode(0x2014)); // no em dashes
  });
});
