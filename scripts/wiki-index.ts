// The Open Lakehouse Wiki's page index, built from src/content/wiki/**.mdx.
//
// Used three ways:
//   - wikiPlugin() serves it to the app as `virtual:wiki-index`, so the
//     browser knows every page's title, categories and summary without
//     downloading page bodies (those load per page).
//   - wikiPlugin() also publishes each page's source at /wiki/<Title>.md,
//     for agents and anyone who wants the text without the layout.
//   - scripts/generate-seo.ts reads it for sitemap.xml and llms*.txt.
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export const WIKI_DIR = path.resolve(process.cwd(), "src/content/wiki");

export type WikiKind = "article" | "category" | "project";

export type WikiPageMeta = {
  /** URL path, e.g. /wiki/Apache_Spark or /wiki/Category:Table_formats */
  path: string;
  /** The part after /wiki/, e.g. Apache_Spark */
  key: string;
  kind: WikiKind;
  /** Source file relative to src/content/wiki, e.g. articles/Apache_Spark.mdx */
  file: string;
  title: string;
  displayTitle?: string;
  categories: string[];
  status?: string;
  verified?: string;
  /** Lead paragraph as plain text. */
  lead: string;
  /** First sentence of the lead, plain text. */
  summary: string;
  /** Wiki paths this page links to. */
  links: string[];
};

export type WikiIndex = { pages: WikiPageMeta[] };

const NS: Record<string, { kind: WikiKind; prefix: string }> = {
  articles: { kind: "article", prefix: "" },
  categories: { kind: "category", prefix: "Category:" },
  project: { kind: "project", prefix: "Open_Lakehouse_Wiki:" },
};

/** Categories the <Status> component puts a page in, as {{Status}} did. */
export const STATUS_CATEGORY: Record<string, string> = {
  deprecated: "Deprecated",
  proposed: "Deprecation proposed",
  removed: "Removed",
  archived: "Archived",
  maintenance: "Maintenance mode",
  experimental: "Experimental",
};

const frontmatter = (raw: string): { fm: Record<string, unknown>; body: string } => {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: raw };
  const fm: Record<string, unknown> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (!kv) continue;
    try {
      fm[kv[1]] = JSON.parse(kv[2]);
    } catch {
      fm[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
    }
  }
  return { fm, body: raw.slice(m[0].length) };
};

/** Markdown inline text to plain text. */
export const plain = (md: string) =>
  md
    .replace(/\[\^[^\]]+\]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/\\([\\{}*[\]`<>|])/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** The first prose paragraph: not a heading, JSX block, table, list or footnote. */
const leadOf = (body: string) => {
  for (const para of body.split(/\n\s*\n/)) {
    const p = para.trim();
    if (!p || /^(#|<|\||- |\d+\. |\[\^|```)/.test(p)) continue;
    return p;
  }
  return "";
};

const firstSentence = (text: string) => {
  // End at the first ". " that is not inside parentheses and not after a
  // short abbreviation such as "e.g." or a version number.
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === "." && depth === 0 && (i === text.length - 1 || text[i + 1] === " ")) {
      const before = text.slice(Math.max(0, i - 5), i);
      if (/\b(e\.g|i\.e|vs|etc)$/i.test(before)) continue;
      return text.slice(0, i + 1);
    }
  }
  return text;
};

export const keyToTitle = (key: string) => key.replace(/_/g, " ");
export const titleToKey = (title: string) => title.trim().replace(/ /g, "_");

export function buildWikiIndex(dir = WIKI_DIR): WikiIndex {
  const pages: WikiPageMeta[] = [];
  for (const [sub, ns] of Object.entries(NS)) {
    const d = path.join(dir, sub);
    if (!fs.existsSync(d)) continue;
    for (const name of fs.readdirSync(d).sort()) {
      if (!name.endsWith(".mdx")) continue;
      const raw = fs.readFileSync(path.join(d, name), "utf8");
      const { fm, body } = frontmatter(raw);
      const base = name.replace(/\.mdx$/, "");
      const key = ns.prefix + base;
      // Example markup in code (the style guide) must not count as the page's own.
      const prose = body.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
      const status = prose.match(/<Status level="([a-z]+)"/)?.[1];
      const categories = [...((fm.categories as string[]) ?? [])];
      if (status && STATUS_CATEGORY[status] && !categories.includes(STATUS_CATEGORY[status]))
        categories.push(STATUS_CATEGORY[status]);
      const lead = plain(leadOf(body));
      const links = [...new Set([...prose.matchAll(/\]\((\/wiki\/[^)#\s]+)/g)].map((m) => m[1]))];
      pages.push({
        path: `/wiki/${key}`,
        key,
        kind: ns.kind,
        file: `${sub}/${name}`,
        title: (fm.title as string) ?? keyToTitle(base),
        ...(fm.displayTitle ? { displayTitle: fm.displayTitle as string } : {}),
        categories,
        ...(status ? { status } : {}),
        ...(prose.match(/<Verified date="([\d-]+)"/) ? { verified: prose.match(/<Verified date="([\d-]+)"/)![1] } : {}),
        lead,
        summary: firstSentence(lead),
        links,
      });
    }
  }
  // A category that pages use but that has no description page still gets a page.
  const have = new Set(pages.filter((p) => p.kind === "category").map((p) => p.title));
  for (const c of new Set(pages.flatMap((p) => p.categories))) {
    if (have.has(c)) continue;
    const key = `Category:${titleToKey(c)}`;
    pages.push({ path: `/wiki/${key}`, key, kind: "category", file: "", title: c, categories: [], lead: "", summary: "", links: [] });
  }
  return { pages };
}

/** The page source as Markdown: frontmatter turned into a heading and a category line. */
export function pageMarkdown(p: WikiPageMeta, dir = WIKI_DIR): string {
  const raw = p.file ? fs.readFileSync(path.join(dir, p.file), "utf8") : "";
  const { body } = frontmatter(raw);
  const cats = p.categories.length ? `\n\nCategories: ${p.categories.join(", ")}` : "";
  // Absolute links, so the text still works when it is read on its own.
  const text = body.trim().replace(/\]\(\/wiki\//g, "](https://openlakehouse.io/wiki/");
  return `# ${p.displayTitle ?? p.title}\n\nSource: https://openlakehouse.io${p.path}\n\n${text}${cats}\n`;
}

const VIRTUAL = "virtual:wiki-index";
// Just the URLs, so the route table can list them without pulling the
// whole index into the main bundle.
const ROUTES = "virtual:wiki-routes";

export function wikiPlugin(): Plugin {
  let outDir = "dist";
  let isSsr = false;
  let isBuild = false;
  return {
    name: "open-lakehouse-wiki",
    configResolved(c) {
      outDir = path.resolve(c.root, c.build.outDir);
      isSsr = !!c.build.ssr;
      // Vitest also runs build hooks; only a real `vite build` writes files.
      isBuild = c.command === "build" && !process.env.VITEST;
    },
    resolveId(id) {
      if (id === VIRTUAL || id === ROUTES) return "\0" + id;
    },
    load(id) {
      if (id === "\0" + VIRTUAL) {
        this.addWatchFile(WIKI_DIR);
        return `export default ${JSON.stringify(buildWikiIndex())};`;
      }
      if (id === "\0" + ROUTES) {
        this.addWatchFile(WIKI_DIR);
        return `export default ${JSON.stringify(["/wiki/Main_Page", ...buildWikiIndex().pages.map((p) => p.path)])};`;
      }
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(WIKI_DIR)) {
        for (const id of [VIRTUAL, ROUTES]) {
          const mod = server.moduleGraph.getModuleById("\0" + id);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/wiki\/(.+)\.md$/);
        if (!m) return next();
        const key = decodeURIComponent(m[1]);
        const page = buildWikiIndex().pages.find((p) => p.key === key);
        if (!page) return next();
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.end(pageMarkdown(page));
      });
    },
    closeBundle() {
      if (isSsr || !isBuild) return;
      for (const p of buildWikiIndex().pages) {
        const out = path.join(outDir, "wiki", `${p.key}.md`);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, pageMarkdown(p));
      }
    },
  };
}
