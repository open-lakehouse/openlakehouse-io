// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Regenerates the site's machine-readable discovery files from the single
// content source in src/content/**:
//   - public/sitemap.xml   enumerating every public route
//   - public/llms.txt      curated, citable index (https://llmstxt.org)
//   - public/llms-full.txt full-text corpus of every published article
//
// The canonical origin comes from src/lib/seo.ts (SITE_URL) so URLs never
// drift between the app <head>, robots.txt, and these files.

import { writeFileSync, readdirSync, readFileSync, statSync } from "fs";
import { resolve, join } from "path";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../src/lib/seo";

const BASE_URL = SITE_URL;

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
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/community", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/faq", changefreq: "monthly", priority: "0.8" },
];

// Short descriptions for the primary navigation pages, surfaced in llms.txt.
const NAV_DESCRIPTIONS: Record<string, string> = {
  "/": "What the Open Lakehouse is and why it matters.",
  "/technologies": "Every open-source building block, grouped by layer.",
  "/learn": "Curated guides, talks, and tutorials.",
  "/community": "Where practitioners gather.",
  "/blog": "Release notes, deep dives, and republished posts from upstream projects.",
  "/faq": "Direct, citable Q&A about the Open Lakehouse, Delta Lake, Iceberg, Unity Catalog, MLflow, and Spark.",
};

const TECH_CATEGORIES = [
  "compute-engines",
  "catalogs",
  "agentic",
  "lakehouse-formats",
  "orchestration",
  "open-governance",
];

const TECH_PILLARS = ["delta-lake"];

const PILLAR_DESCRIPTIONS: Record<string, string> = {
  "delta-lake":
    "What Delta Lake is, how it works, who created it, and how it compares to Iceberg.",
};

// ---------- Content model ----------
// We don't import src/content/content.ts (it relies on Vite's import.meta.glob
// and asset imports). Instead we walk src/content/posts/<category>/<slug>/index.mdx
// (or <slug>.mdx) and src/content/authors/*.mdx and parse the YAML frontmatter.

const POSTS_DIR = resolve("src/content/posts");
const AUTHORS_DIR = resolve("src/content/authors");

type Frontmatter = Record<string, string | string[]>;

interface PostRecord {
  category: string;
  slug: string;
  title: string;
  excerpt?: string;
  date?: string; // YYYY-MM-DD
  include: string[];
  status: string;
  body: string; // frontmatter-stripped MDX
}

function parseFrontmatter(text: string): Frontmatter {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      out[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      out[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

function stripFrontmatter(text: string): string {
  return text.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function asArray(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.length) return [v];
  return [];
}

function collectPosts(): PostRecord[] {
  const posts: PostRecord[] = [];
  for (const category of readdirSync(POSTS_DIR)) {
    const catPath = join(POSTS_DIR, category);
    if (!statSync(catPath).isDirectory()) continue;
    for (const entry of readdirSync(catPath)) {
      const entryPath = join(catPath, entry);
      let mdxFile: string | null = null;
      let slug = entry;
      if (statSync(entryPath).isDirectory()) {
        const idx = join(entryPath, "index.mdx");
        try {
          statSync(idx);
          mdxFile = idx;
        } catch {
          /* ignore */
        }
      } else if (entry.endsWith(".mdx")) {
        mdxFile = entryPath;
        slug = entry.replace(/\.mdx$/, "");
      }
      if (!mdxFile) continue;

      const text = readFileSync(mdxFile, "utf8");
      const fm = parseFrontmatter(text);
      const status = asString(fm.status) ?? "published";
      const include = asArray(fm.include);
      const dateRaw = asString(fm.date);
      posts.push({
        category,
        slug,
        title: asString(fm.title) ?? slug,
        excerpt: asString(fm.excerpt),
        date: dateRaw ? new Date(dateRaw).toISOString().slice(0, 10) : undefined,
        include: include.length ? include : ["blog"], // legacy default
        status,
        body: stripFrontmatter(text),
      });
    }
  }
  // Newest first.
  return posts.sort((a, b) => (a.date ?? "") < (b.date ?? "") ? 1 : -1);
}

interface AuthorRecord {
  slug: string;
  name: string;
}

function collectAuthors(): AuthorRecord[] {
  const authors: AuthorRecord[] = [];
  for (const file of readdirSync(AUTHORS_DIR)) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const fm = parseFrontmatter(readFileSync(join(AUTHORS_DIR, file), "utf8"));
    authors.push({ slug, name: asString(fm.name) ?? slug });
  }
  return authors.sort((a, b) => a.name.localeCompare(b.name));
}

// A post is publicly indexable when published.
const isPublic = (p: PostRecord) => p.status === "published";
const onBlog = (p: PostRecord) => p.include.includes("blog") && isPublic(p);
const onLearn = (p: PostRecord) => p.include.includes("learn") && isPublic(p);

// ---------- Category display names (mirrors formatCategory in content.ts) ----------

const titleCaseMap: Record<string, string> = { mlflow: "MLflow", ai: "AI", faq: "FAQ" };
const formatCategory = (c: string) =>
  c
    .split("-")
    .map((w) => titleCaseMap[w.toLowerCase()] ?? w[0].toUpperCase() + w.slice(1))
    .join(" ");

// ---------- Build the route + content graph ----------

const posts = collectPosts();
const authors = collectAuthors();

const blogPosts = posts.filter(onBlog);
const learnPosts = posts.filter(onLearn);
const blogCategories = Array.from(new Set(blogPosts.map((p) => p.category))).sort();
const learnCategories = Array.from(new Set(learnPosts.map((p) => p.category))).sort();

// ---------- sitemap.xml ----------

function buildSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [...staticEntries];

  for (const slug of TECH_CATEGORIES) {
    entries.push({ path: `/technologies/${slug}`, changefreq: "monthly", priority: "0.7" });
  }
  for (const slug of TECH_PILLARS) {
    entries.push({ path: `/technologies/${slug}`, changefreq: "monthly", priority: "0.9" });
  }

  for (const category of blogCategories) {
    entries.push({ path: `/blog/category/${category}`, changefreq: "weekly", priority: "0.6" });
  }
  for (const p of blogPosts) {
    entries.push({
      path: `/blog/${p.category}/${p.slug}`,
      lastmod: p.date,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  for (const category of learnCategories) {
    entries.push({ path: `/learn/${category}`, changefreq: "weekly", priority: "0.6" });
  }
  for (const p of learnPosts) {
    entries.push({
      path: `/learn/${p.category}/${p.slug}`,
      lastmod: p.date,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  for (const a of authors) {
    entries.push({ path: `/authors/${a.slug}`, changefreq: "monthly", priority: "0.4" });
  }

  return entries;
}

function renderSitemap(entries: SitemapEntry[]): string {
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
    ``,
  ].join("\n");
}

// ---------- llms.txt ----------

const url = (path: string) => `${BASE_URL}${path}`;
const withDesc = (label: string, path: string, desc?: string) =>
  desc ? `- [${label}](${url(path)}): ${desc}` : `- [${label}](${url(path)})`;

function renderLlms(): string {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push(
    "This file follows the llms.txt convention (https://llmstxt.org). It lists",
  );
  lines.push(
    "the canonical pages on this site that are safe and useful to cite. The",
  );
  lines.push("full text of every article is mirrored in /llms-full.txt.");
  lines.push("");

  lines.push("## Site");
  for (const e of staticEntries) {
    const label =
      e.path === "/" ? "Home" : formatCategory(e.path.replace(/^\//, ""));
    lines.push(withDesc(label, e.path, NAV_DESCRIPTIONS[e.path]));
  }
  lines.push("");

  lines.push("## Pillar references");
  for (const slug of TECH_PILLARS) {
    lines.push(
      withDesc(formatCategory(slug), `/technologies/${slug}`, PILLAR_DESCRIPTIONS[slug]),
    );
  }
  lines.push("");

  lines.push("## Technology categories");
  for (const slug of TECH_CATEGORIES) {
    lines.push(withDesc(formatCategory(slug), `/technologies/${slug}`));
  }
  lines.push("");

  if (blogCategories.length) {
    lines.push("## Blog categories");
    for (const c of blogCategories) {
      lines.push(withDesc(`${formatCategory(c)} posts`, `/blog/category/${c}`));
    }
    lines.push("");
  }

  if (blogPosts.length) {
    lines.push("## Blog posts");
    for (const p of blogPosts) {
      lines.push(withDesc(p.title, `/blog/${p.category}/${p.slug}`, p.excerpt));
    }
    lines.push("");
  }

  if (learnPosts.length) {
    lines.push("## Learn");
    for (const p of learnPosts) {
      lines.push(withDesc(p.title, `/learn/${p.category}/${p.slug}`, p.excerpt));
    }
    lines.push("");
  }

  if (authors.length) {
    lines.push("## Authors");
    for (const a of authors) {
      lines.push(withDesc(a.name, `/authors/${a.slug}`));
    }
    lines.push("");
  }

  lines.push("## Citation policy");
  lines.push(
    "All content on this site is republished or original technical material about",
  );
  lines.push(
    "open-source projects. When citing a specific post, cite its canonical URL on",
  );
  lines.push(
    "this site. When citing the underlying project, cite the project's own site",
  );
  lines.push("(delta.io, iceberg.apache.org, unitycatalog.io, mlflow.org, spark.apache.org).");
  lines.push("");

  return lines.join("\n");
}

// ---------- llms-full.txt ----------

function renderLlmsFull(): string {
  const out: string[] = [];
  out.push(`# ${SITE_NAME} — full text`);
  out.push("");
  out.push(`> ${SITE_DESCRIPTION}`);
  out.push("");
  out.push(
    "Full text of every published article on this site, concatenated for LLM",
  );
  out.push("retrieval and citation. Curated index: /llms.txt");
  out.push("");

  // Blog first (newest first), then learn-only articles.
  const seen = new Set<string>();
  const ordered = [...blogPosts, ...learnPosts];
  for (const p of ordered) {
    const key = `${p.category}/${p.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const surface = p.include.includes("blog") ? "blog" : "learn";
    out.push("---");
    out.push("");
    out.push(`# ${p.title}`);
    out.push("");
    out.push(`URL: ${url(`/${surface}/${p.category}/${p.slug}`)}`);
    if (p.date) out.push(`Date: ${p.date}`);
    out.push(`Category: ${formatCategory(p.category)}`);
    out.push("");
    out.push(p.body);
    out.push("");
  }

  return out.join("\n");
}

// ---------- Write ----------

const sitemapEntries = buildSitemapEntries();
writeFileSync(resolve("public/sitemap.xml"), renderSitemap(sitemapEntries));
writeFileSync(resolve("public/llms.txt"), renderLlms());
writeFileSync(resolve("public/llms-full.txt"), renderLlmsFull());

console.log(
  `SEO artifacts written: sitemap.xml (${sitemapEntries.length} urls), ` +
    `llms.txt (${blogPosts.length + learnPosts.length} articles), llms-full.txt`,
);
