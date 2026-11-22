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
const { render, routes } = await import(pathToFileURL(ssrEntry).href);
// The untouched SPA shell. "/" is prerendered into dist/index.html, so the
// shell is kept as dist/app-shell.html and vercel.json rewrites every other
// client-side route to it. Without this, every unprerendered route would ship
// the homepage's content and canonical URL.
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

let count = 0;
for (const url of routes) {
  const { html, head } = render(url);
  // Helmet marks its tags with data-rh; keep them so the client-side Helmet
  // takes them over instead of duplicating them.
  const page = stripDefaults(template)
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const out = join(dist, url.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page);
  count++;
}
rmSync(resolve("dist-ssr"), { recursive: true, force: true });
console.log(`[prerender] wrote ${count} static pages`);
