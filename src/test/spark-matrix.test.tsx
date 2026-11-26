import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MatrixTable } from "@/components/spark-matrix/MatrixTable";
import SparkMatrix from "@/pages/projects/SparkMatrix";
import { APACHE_MINORS, LEVEL_BY_CODE, SHOWN_PLATFORMS, defaultRuntime, features, matrix, platforms } from "@/lib/spark-matrix";
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
  it("prerenders every feature row with the Apache columns and no service columns by default", () => {
    const html = renderToString(<MatrixTable />);
    for (const f of features) expect(html).toContain(f.title.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
    // The matrix is additive: managed-service columns appear only once the reader adds them.
    for (const p of SHOWN_PLATFORMS) expect(html).not.toContain(`title="${p.name.replace(/&/g, "&amp;")}"`);
    // The Apache Spark release columns are always shown, and the add control is present.
    expect(html).toContain(APACHE_MINORS[0]);
    expect(html).toContain("Add a platform");
  });

  it("opens the source for a cell", () => {
    const { container } = render(<MatrixTable />);
    const p = SHOWN_PLATFORMS[0];

    // Additive default: add the first service through the picker, then compare it.
    fireEvent.click(screen.getByRole("button", { name: /add a platform/i }));
    const picker = screen.getByRole("dialog");
    fireEvent.click(within(picker).getByRole("checkbox", { name: p.name }));
    fireEvent.click(within(picker).getByRole("button", { name: /^done$/i }));

    // Click that service's cell in the Spark Connect server row (the last button in the row).
    const row = container.querySelector('th[data-feat="spark-connect"]')!.closest("tr") as HTMLElement;
    const cells = within(row).getAllByRole("button");
    fireEvent.click(cells[cells.length - 1]);

    const dialog = screen.getByRole("dialog");
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
