// Server entry used only at build time to prerender static HTML for every
// route (search and AI crawlers, link unfurlers). See scripts/prerender.mjs.
// The client still mounts with createRoot, which replaces this markup, so
// there is no hydration contract to keep in sync.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRoutes, prerenderRoutes } from "./AppRoutes";
import { SparkMatrix, SparkMatrixFaq, SparkMatrixMethod, SparkMatrixTable } from "./lazyPages";

// Lazy pages render their Suspense fallback unless loaded first.
// scripts/prerender.mjs awaits this before rendering anything.
export const ready = Promise.all([
  SparkMatrix.preload(),
  SparkMatrixTable.preload(),
  SparkMatrixMethod.preload(),
  SparkMatrixFaq.preload(),
]);

export const routes = prerenderRoutes();

/** A path no route matches, rendered once into dist/404.html. */
export const NOT_FOUND_PATH = "/__not-found__";

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <ThemeProvider>
        <TooltipProvider>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>,
  );
  const h = helmetContext.helmet;
  const head = h ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()].join("\n") : "";
  return { html, head };
}
