import { useEffect, useId, useState } from "react";

/**
 * A Mermaid diagram from a ```mermaid fence (see scripts/remark-mermaid.mjs).
 * Prerendered HTML and no-JS readers get the diagram source; the browser swaps
 * in the rendered SVG. mermaid is loaded on demand, only on pages that use it,
 * and re-rendered when the site theme changes.
 */
export const Mermaid = ({ chart }: { chart: string }) => {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        const dark = document.documentElement.classList.contains("dark");
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: dark ? "dark" : "default" });
        const { svg } = await mermaid.render(`${id}-${dark ? "d" : "l"}`, chart);
        if (!cancelled) setSvg(svg);
      } catch (err) {
        console.error("Mermaid render failed", err);
        if (!cancelled) setFailed(true);
      }
    };
    render();
    const observer = new MutationObserver(render);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [chart, id]);

  if (svg && !failed) {
    return (
      <figure
        className="my-8 flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full"
        role="img"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }
  return (
    <pre className="my-8 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm">
      <code>{chart}</code>
    </pre>
  );
};
