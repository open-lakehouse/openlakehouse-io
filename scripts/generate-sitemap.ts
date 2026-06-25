// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml enumerating every public route, including all
// blog posts and author profiles loaded from src/content/**.

import { writeFileSync, readdirSync, readFileSync, statSync } from "fs";
import { resolve, join } from "path";

const BASE_URL = "https://openlakehouse-guide-hub.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// ---------- Static routes (must match src/App.tsx) ----------

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/technologies", changefreq: "weekly", priority: "0.9" },
  { path: "/capabilities", changefreq: "weekly", priority: "0.9" },
  { path: "/capabilities/governance", changefreq: "monthly", priority: "0.8" },
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/community", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/faq", changefreq: "monthly", priority: "0.8" },
];

const TECH_CATEGORIES = [
  "compute-engines",
  "catalogs",
  "agentic",
  "lakehouse-formats",
  "orchestration",
  "open-governance",
];

const TECH_PILLARS = [
  "delta-lake",
];

// ---------- Dynamic blog/author entries ----------
// We don't import the loader (it expects Vite's import.meta.glob). Instead
// we walk src/content/posts/<category>/<slug>/index.mdx + src/content/authors/*.mdx
// and parse minimal YAML frontmatter.

const POSTS_DIR = resolve("src/content/posts");
const AUTHORS_DIR = resolve("src/content/authors");

function parseFrontmatter(file: string): Record<string, string> {
  const text = readFileSync(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function collectPosts(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const categorySet = new Set<string>();
  for (const category of readdirSync(POSTS_DIR)) {
    const catPath = join(POSTS_DIR, category);
    if (!statSync(catPath).isDirectory()) continue;
    categorySet.add(category);
    for (const slug of readdirSync(catPath)) {
      const slugPath = join(catPath, slug);
      let mdxFile: string | null = null;
      let postSlug = slug;
      if (statSync(slugPath).isDirectory()) {
        const idx = join(slugPath, "index.mdx");
        try { statSync(idx); mdxFile = idx; } catch { /* ignore */ }
      } else if (slug.endsWith(".mdx")) {
        mdxFile = slugPath;
        postSlug = slug.replace(/\.mdx$/, "");
      }
      if (!mdxFile) continue;
      const fm = parseFrontmatter(mdxFile);
      const lastmod = fm.date ? new Date(fm.date).toISOString().slice(0, 10) : undefined;
      entries.push({
        path: `/blog/${category}/${postSlug}`,
        lastmod,
        changefreq: "monthly",
        priority: "0.7",
      });
    }
  }
  for (const category of categorySet) {
    entries.push({ path: `/blog/category/${category}`, changefreq: "weekly", priority: "0.6" });
  }
  return entries;
}

function collectAuthors(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const file of readdirSync(AUTHORS_DIR)) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    entries.push({ path: `/authors/${slug}`, changefreq: "monthly", priority: "0.4" });
  }
  return entries;
}

// ---------- Render ----------

function render(entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const entries: SitemapEntry[] = [
  ...staticEntries,
  ...TECH_CATEGORIES.map<SitemapEntry>((slug) => ({
    path: `/technologies/${slug}`,
    changefreq: "monthly",
    priority: "0.7",
  })),
  ...TECH_PILLARS.map<SitemapEntry>((slug) => ({
    path: `/technologies/${slug}`,
    changefreq: "monthly",
    priority: "0.9",
  })),
  ...collectPosts(),
  ...collectAuthors(),
];

writeFileSync(resolve("public/sitemap.xml"), render(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
