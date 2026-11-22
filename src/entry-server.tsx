// Server entry used only at build time to prerender static HTML for routes
// that should be readable without JavaScript (search and AI crawlers).
// See scripts/prerender.mjs. The client still mounts with createRoot, which
// replaces this markup, so there is no hydration contract to keep in sync.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Route, Routes } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import ReferenceArchitectures from "./pages/refarch/ReferenceArchitectures";
import ArchitecturePage from "./pages/refarch/ArchitecturePage";
import IndustryPage from "./pages/refarch/IndustryPage";
import { INDUSTRIES, PATTERNS, HUB_PATH, industryPath, patternPath } from "./content/reference-architectures";

export const routes = ["/", HUB_PATH, ...PATTERNS.map((p) => patternPath(p.slug)), ...INDUSTRIES.map((i) => industryPath(i.slug))];

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ThemeProvider>
        <TooltipProvider>
          <StaticRouter location={url}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reference-architectures" element={<ReferenceArchitectures />} />
              <Route path="/reference-architectures/industries/:slug" element={<IndustryPage />} />
              <Route path="/reference-architectures/:slug" element={<ArchitecturePage />} />
            </Routes>
          </StaticRouter>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>,
  );
  const h = helmetContext.helmet;
  const head = h ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()].join("\n") : "";
  return { html, head };
}
