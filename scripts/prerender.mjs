// Post-build: write static HTML for every route the SSR entry knows about, so
// crawlers that do not execute JavaScript (GPTBot, ClaudeBot, PerplexityBot,
// most link unfurlers) receive the full page content, title, canonical and
// JSON-LD instead of an empty <div id="root">.
//
//   vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dist = resolve("dist");
const ssrEntry = resolve("dist-ssr/entry-server.js");
const { render, routes, NOT_FOUND_PATH, ready } = await import(pathToFileURL(ssrEntry).href);
await ready;
// The untouched SPA shell, kept as dist/app-shell.html. Every route is
// prerendered now, so nothing is rewritten to it; unknown paths get
// dist/404.html with a real 404 status from Vercel.
const shellPath = join(dist, "app-shell.html");
const template = existsSync(shellPath) ? readFileSync(shellPath, "utf8") : readFileSync(join(dist, "index.html"), "utf8");
writeFileSync(shellPath, template);

// renderToString warns about useLayoutEffect; harmless here because the client
// mounts with createRoot instead of hydrating.
const origError = console.error;
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("useLayoutEffect does nothing on the server")) return;
  origError(...args);
};

// Remove the sitewide defaults that each page's Helmet output replaces.
const stripDefaults = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>\s*/, "")
    .replace(/<meta name="description"[^>]*>\s*/, "")
    .replace(/<meta property="og:(title|description|type)"[^>]*>\s*/g, "");

const renderPage = (url) => {
  const { html, head } = render(url);
  // Helmet marks its tags with data-rh; keep them so the client-side Helmet
  // takes them over instead of duplicating them.
  const page = stripDefaults(template)
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  return { html, head, page };
};

const problems = [];
let count = 0;
for (const url of routes) {
  const { html, head, page } = renderPage(url);
  // A route that renders the 404 page or a redirect (empty markup) would ship
  // as a 200 "soft 404"; fail the build instead.
  if (head.includes("Page not found") || html.length < 500) problems.push(`${url}: renders no content`);
  // Write <route>.html (served at /<route> with cleanUrls on Vercel and by
  // vite preview) and <route>/index.html (served at /<route>/).
  const rel = url.replace(/^\//, "");
  const outs = rel ? [join(dist, `${rel}.html`), join(dist, rel, "index.html")] : [join(dist, "index.html")];
  for (const out of outs) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page);
  }
  count++;
}
writeFileSync(join(dist, "404.html"), renderPage(NOT_FOUND_PATH).page);

// Every URL in the sitemap must have a prerendered page, or crawlers get a 404.
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const prerendered = new Set(routes);
for (const [, loc] of sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)) {
  const path = loc.replace(/\/$/, "") || "/";
  if (!prerendered.has(path)) problems.push(`${path}: in sitemap.xml but not prerendered`);
}
if (problems.length) {
  console.error(`[prerender] ${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
rmSync(resolve("dist-ssr"), { recursive: true, force: true });
console.log(`[prerender] wrote ${count} static pages and 404.html; sitemap fully covered`);
