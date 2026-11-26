// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Regenerates the site's machine-readable discovery files from the single
// content source in src/content/**:
//   - public/sitemap.xml   enumerating every public route
//   - public/llms.txt      curated, citable index (https://llmstxt.org)
//   - public/llms-full.txt full-text corpus of every published article
//
// The canonical origin comes from src/lib/seo.ts (SITE_URL) so URLs never
// drift between the app <head>, robots.txt, and these files.

import { writeFileSync, readdirSync, readFileSync, statSync, mkdirSync, rmSync } from "fs";
import { resolve, join } from "path";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../src/lib/seo";
import {
  DEFINITION as GUIDE_DEFINITION,
  FAQS as GUIDE_FAQS,
  PRINCIPLES as GUIDE_PRINCIPLES,
  PROJECTS as GUIDE_PROJECTS,
  SLUG as GUIDE_SLUG,
  STACK as GUIDE_STACK,
  TITLE as GUIDE_TITLE,
} from "../src/content/open-source-data-engineering";
import { GUIDES, guideMarkdown } from "../src/content/agentic";
import * as masterclass from "../src/content/spark-masterclass";
import * as matrix from "../src/content/spark-matrix";
import {
  HUB_DEFINITION as RA_DEFINITION,
  HUB_DESCRIPTION as RA_DESCRIPTION,
  HUB_FAQS as RA_FAQS,
  HUB_PATH as RA_PATH,
  HUB_TITLE as RA_TITLE,
  HUB_UPDATED as RA_UPDATED,
  INDUSTRIES as RA_INDUSTRIES,
  PATTERNS as RA_PATTERNS,
  RESOURCE_GROUPS as RA_RESOURCES,
  dataset as raDataset,
  industryMarkdown,
  industryPath,
  patternMarkdown,
  patternPath,
} from "../src/content/reference-architectures";
import { buildWikiIndex, pageMarkdown } from "./wiki-index";
import { WIKI_NAME, WIKI_TAGLINE, WIKI_DESCRIPTION } from "../src/content/wiki-meta";

const BASE_URL = SITE_URL;

// The wiki (src/content/wiki), same index the app uses.
const wiki = buildWikiIndex().pages;
const wikiArticles = wiki.filter((p) => p.kind === "article").sort((a, b) => a.title.localeCompare(b.title));

// Podcast episodes, written by scripts/fetch-podcast.ts (runs first in prebuild).
type PodcastEpisode = { slug: string; title: string; date: string; episodeNumber?: number; duration?: string; summary: string; notesHtml: string; hasTranscript: boolean };
const PODCAST_TITLE = "This Week in Open Lakehouse";
const podcastEpisodes: PodcastEpisode[] = JSON.parse(readFileSync(resolve("src/content/podcast/episodes.json"), "utf8"));
// Same rule as episodeTitle() in src/content/podcast.ts.
const episodeTitle = (e: PodcastEpisode) =>
  `TWIOL #${e.episodeNumber ?? podcastEpisodes.length - podcastEpisodes.indexOf(e)}: ${e.title}`;
const podcastTranscript = (slug: string) => {
  try {
    return readFileSync(resolve(`src/content/podcast/transcripts/${slug}.txt`), "utf8");
  } catch {
    return undefined;
  }
};
const notesToMarkdown = (html: string) =>
  html
    .replace(/<li>/g, "\n- ")
    .replace(/<\/p>|<br \/>|<\/ul>|<\/ol>/g, "\n")
    .replace(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, "[$2]($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
const podcastWriteups: Record<string, { title: string; excerpt?: string }> = JSON.parse(
  readFileSync(resolve("src/content/podcast/writeups.json"), "utf8"),
);
const writeupBody = (slug: string) => {
  try {
    return readFileSync(resolve(`src/content/podcast/writeups/${slug}.mdx`), "utf8").replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  } catch {
    return undefined;
  }
};
const episodeMarkdown = (e: PodcastEpisode) => {
  const w = podcastWriteups[e.slug];
  const body = writeupBody(e.slug);
  const lines = [
    `# ${episodeTitle(e)}`,
    "",
    `${PODCAST_TITLE}${e.episodeNumber ? `, episode ${e.episodeNumber}` : ""}. Published ${e.date.slice(0, 10)}${e.duration ? `, ${e.duration} long` : ""}. Hosts: Lisa Cao and Scott Haines.`,
    "",
    `Canonical page: ${SITE_URL}/podcast/${e.slug}`,
    "",
    ...(body ? ["By Lisa Cao.", "", body, ""] : []),
    "## Show notes",
    "",
    notesToMarkdown(e.notesHtml),
  ];
  const t = podcastTranscript(e.slug);
  if (t) lines.push("", "## Transcript (machine-generated)", "", t.trim());
  return lines.join("\n") + "\n";
};

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
  { path: "/open-source-data-engineering", changefreq: "monthly", priority: "0.9" },
  { path: "/agentic-lakehouse", changefreq: "monthly", priority: "0.9" },
  { path: "/agentic-data-engineering", changefreq: "monthly", priority: "0.9" },
  { path: masterclass.SLUG, changefreq: "monthly", priority: "0.8" },
  { path: matrix.SLUG, changefreq: "monthly", priority: "0.8" },
  { path: "/reference-architectures", changefreq: "weekly", priority: "0.9" },
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/community", changefreq: "monthly", priority: "0.6" },
  { path: "/authors", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/faq", changefreq: "monthly", priority: "0.8" },
  { path: "/podcast", changefreq: "weekly", priority: "0.9", lastmod: podcastEpisodes[0]?.date.slice(0, 10) },
];

// Short descriptions for the primary navigation pages, surfaced in llms.txt.
const NAV_DESCRIPTIONS: Record<string, string> = {
  "/": "What the Open Lakehouse is and why it matters.",
  "/technologies": "Every open-source building block, grouped by layer.",
  "/open-source-data-engineering":
    "What open source data engineering is, the reference stack, and the projects that make it up.",
  "/agentic-lakehouse":
    "What an agentic lakehouse is: open tables, a catalog agents can read, MCP tools, declarative pipelines, policies and tracing.",
  "/agentic-data-engineering":
    "How AI agents write, test and run data pipelines while the platform enforces scope, dry runs and policies.",
  [masterclass.SLUG]: masterclass.META_DESCRIPTION,
  [matrix.SLUG]: matrix.META_DESCRIPTION,
  "/reference-architectures":
    "Interactive open source data engineering reference architectures, each backed by a runnable repo, with industry lenses.",
  "/learn": "Curated guides, talks, and tutorials.",
  "/community": "Where practitioners gather.",
  "/authors": "Maintainers, authors, and practitioners in the Open Lakehouse community.",
  "/blog": "Release notes, deep dives, and republished posts from upstream projects.",
  "/podcast": `${PODCAST_TITLE}: a weekly podcast on open source data engineering news, with show notes and transcripts.`,
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
  originalUrl?: string;
  originalPublisher?: string;
  externalUrl?: string; // link-out entry: lives only at this URL
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
        originalUrl: asString(fm.originalUrl),
        originalPublisher: asString(fm.originalPublisher),
        externalUrl: asString(fm.externalUrl),
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
    if (p.originalUrl || p.externalUrl) continue;
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
    if (p.originalUrl || p.externalUrl) continue;
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

  for (const p of RA_PATTERNS) {
    entries.push({ path: patternPath(p.slug), lastmod: p.updated, changefreq: "monthly", priority: "0.8" });
  }
  for (const i of RA_INDUSTRIES) {
    entries.push({ path: industryPath(i.slug), lastmod: RA_UPDATED, changefreq: "monthly", priority: "0.7" });
  }

  for (const e of podcastEpisodes) {
    entries.push({ path: `/podcast/${e.slug}`, lastmod: e.date.slice(0, 10), changefreq: "monthly", priority: "0.7" });
  }

  entries.push({ path: "/wiki/Main_Page", changefreq: "weekly", priority: "0.9" });
  for (const p of wiki) {
    entries.push({
      path: p.path,
      ...(p.verified ? { lastmod: p.verified } : {}),
      changefreq: p.kind === "article" ? "monthly" : "weekly",
      priority: p.kind === "article" ? "0.8" : "0.5",
    });
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

const url = (path: string) => /^https?:\/\//.test(path) ? path : `${BASE_URL}${path}`;
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

  lines.push("## Guides");
  for (const g of GUIDES) {
    lines.push(withDesc(g.title, g.slug, `${g.metaDescription} Markdown: ${url(g.slug)}.md`));
  }
  lines.push("");

  lines.push(`## ${matrix.TITLE}`);
  lines.push(withDesc(`${matrix.TITLE}: the matrix`, matrix.SLUG, `${matrix.META_DESCRIPTION} Data build ${matrix.DATA_GENERATED}. Cite this page.`));
  lines.push(withDesc(`${matrix.TITLE} explorer`, matrix.EXPLORER_PATH, "Interactive explorer for the same data: every runtime of each service, the per-release Apache Spark inventory, release notes and runtime freshness."));
  lines.push("");

  lines.push(`## ${WIKI_NAME}`);
  lines.push(withDesc(WIKI_NAME, "/wiki/Main_Page", `${WIKI_TAGLINE}. ${WIKI_DESCRIPTION} Each article is also served as Markdown at its URL plus .md.`));
  for (const p of wikiArticles) {
    lines.push(withDesc(p.displayTitle ?? p.title, p.path, p.summary || p.title));
  }
  lines.push("");

  lines.push(`## ${RA_TITLE}`);
  lines.push(withDesc(RA_TITLE, RA_PATH, RA_DESCRIPTION));
  lines.push(withDesc("Machine-readable catalog (JSON)", "/reference-architectures.json", "Every architecture, component and industry lens as JSON."));
  for (const p of RA_PATTERNS) {
    lines.push(withDesc(`${p.title}: ${p.stackLine}`, patternPath(p.slug), `${p.tagline} Markdown: ${url(patternPath(p.slug))}.md`));
  }
  lines.push("");
  lines.push("## Open source data engineering resources");
  for (const g of RA_RESOURCES) {
    for (const r of g.items) lines.push(withDesc(`${r.name} (${g.title})`, r.url, r.what));
  }
  lines.push("");
  lines.push("## Data engineering architectures by industry");
  for (const i of RA_INDUSTRIES) {
    lines.push(withDesc(`Open source data architecture for ${i.name}`, industryPath(i.slug), i.summary));
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
      lines.push(withDesc(p.title, p.externalUrl ?? p.originalUrl ?? `/blog/${p.category}/${p.slug}`, p.excerpt));
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

  if (podcastEpisodes.length) {
    lines.push(`## Podcast: ${PODCAST_TITLE}`);
    for (const e of podcastEpisodes) {
      const w = podcastWriteups[e.slug];
      lines.push(withDesc(episodeTitle(e), `/podcast/${e.slug}`, `${w?.excerpt ?? e.summary} Write-up, show notes and transcript in Markdown: ${url(`/podcast/${e.slug}`)}.md`));
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
    "open-source projects. When citing a specific post, use the canonical URL",
  );
  lines.push(
    "listed above; republished posts may point to their upstream source. When",
  );
  lines.push("citing the underlying project, prefer the project's own site.");
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
    if (p.externalUrl) continue; // no local text; listed in llms.txt instead
    seen.add(key);
    const surface = p.include.includes("blog") ? "blog" : "learn";
    out.push("---");
    out.push("");
    out.push(`# ${p.title}`);
    out.push("");
    out.push(`URL: ${url(p.originalUrl ?? `/${surface}/${p.category}/${p.slug}`)}`);
    if (p.originalUrl) {
      out.push(`Republished at: ${url(`/${surface}/${p.category}/${p.slug}`)}`);
      if (p.originalPublisher) out.push(`Original publisher: ${p.originalPublisher}`);
    }
    if (p.date) out.push(`Date: ${p.date}`);
    out.push(`Category: ${formatCategory(p.category)}`);
    out.push("");
    out.push(p.body);
    out.push("");
  }

  // Hand-written pillar guide. It is a React route rather than an MDX post, so
  // mirror its text here explicitly to keep the full-text corpus complete.
  out.push("---");
  out.push("");
  out.push(`# ${GUIDE_TITLE}`);
  out.push("");
  out.push(`URL: ${url(GUIDE_SLUG)}`);
  out.push("");
  out.push(GUIDE_DEFINITION);
  out.push("");
  out.push("## The open source data engineering stack");
  out.push("");
  out.push("| Layer | What it does | Common projects |");
  out.push("| --- | --- | --- |");
  for (const row of GUIDE_STACK) {
    out.push(`| ${row.layer} | ${row.purpose} | ${row.projects.join(", ")} |`);
  }
  out.push("");
  out.push("## Projects in the stack");
  out.push("");
  for (const project of GUIDE_PROJECTS) {
    out.push(`- **${project.name}** - ${project.blurb} (${project.href})`);
  }
  out.push("");
  out.push("## Why teams choose open source data engineering");
  out.push("");
  for (const principle of GUIDE_PRINCIPLES) {
    out.push(`- **${principle.title}.** ${principle.body}`);
  }
  out.push("");
  out.push("## Frequently asked questions");
  out.push("");
  for (const faq of GUIDE_FAQS) {
    out.push(`### ${faq.q}`);
    out.push("");
    out.push(faq.a);
    out.push("");
  }

  for (const g of GUIDES) {
    out.push("---", "", `URL: ${url(g.slug)}`, "", guideMarkdown(g));
  }

  // Open Lakehouse project pages (React routes): definition, contents, FAQ.
  out.push("---", "", `# ${masterclass.TITLE}`, "", `URL: ${url(masterclass.SLUG)}`, `Book: ${masterclass.BOOK_URL}`, `Repository: ${masterclass.REPO_URL}`, "");
  out.push(masterclass.DEFINITION, "", "## Contents", "");
  for (const p of masterclass.PARTS) {
    out.push(`### Part ${p.numeral}: ${p.title}`, "");
    for (const c of p.chapters) out.push(`${c.n}. [${c.title}](${masterclass.chapterUrl(c)})`);
    out.push("");
  }
  for (const f of masterclass.FAQS) out.push(`### ${f.q}`, "", f.a, "");

  out.push("---", "", `# ${matrix.TITLE}`, "", `URL: ${url(matrix.SLUG)}`, "", matrix.DEFINITION, "", "## Support levels", "");
  for (const l of matrix.SUPPORT_LEVELS) out.push(`- **${l.label}.** ${l.meaning}`);
  out.push("", `## Platforms covered (data build ${matrix.DATA_GENERATED})`, "");
  for (const v of matrix.PLATFORMS_BY_VENDOR) out.push(`- **${v.vendor}:** ${v.platforms.join("; ")}`);
  out.push("");
  out.push(matrix.matrixMarkdown(BASE_URL), "");
  for (const f of matrix.FAQS) out.push(`### ${f.q}`, "", f.a, "");

  // The wiki: every article as Markdown (the same text served at <path>.md).
  out.push("---", "", `# ${WIKI_NAME}`, "", `URL: ${url("/wiki/Main_Page")}`, "", `${WIKI_TAGLINE}. ${WIKI_DESCRIPTION}`, "");
  for (const p of wikiArticles) {
    out.push("---", "", pageMarkdown(p));
  }

  // Open Reference Architectures: hub definition, then every pattern and
  // industry page as Markdown (the same text served at <path>.md).
  out.push("---");
  out.push("");
  out.push(`# ${RA_TITLE}`);
  out.push("");
  out.push(`URL: ${url(RA_PATH)}`);
  out.push("");
  out.push(RA_DEFINITION);
  out.push("");
  for (const faq of RA_FAQS) {
    out.push(`### ${faq.q}`, "", faq.a, "");
  }
  for (const p of RA_PATTERNS) {
    out.push("---", "", `URL: ${url(patternPath(p.slug))}`, "", patternMarkdown(p));
  }
  for (const i of RA_INDUSTRIES) {
    out.push("---", "", `URL: ${url(industryPath(i.slug))}`, "", industryMarkdown(i));
  }
  return out.join("\n");
}

// ---------- Write ----------

const sitemapEntries = buildSitemapEntries();
writeFileSync(resolve("public/sitemap.xml"), renderSitemap(sitemapEntries));
writeFileSync(resolve("public/llms.txt"), renderLlms());
writeFileSync(resolve("public/llms-full.txt"), renderLlmsFull());

// Guides: Markdown twins.
for (const g of GUIDES) writeFileSync(resolve(`public${g.slug}.md`), guideMarkdown(g));

// Reference architectures: JSON dataset and Markdown twins of each page.
writeFileSync(resolve("public/reference-architectures.json"), JSON.stringify(raDataset(), null, 2) + "\n");
rmSync(resolve("public/reference-architectures"), { recursive: true, force: true });
mkdirSync(resolve("public/reference-architectures/industries"), { recursive: true });
for (const p of RA_PATTERNS) writeFileSync(resolve(`public${patternPath(p.slug)}.md`), patternMarkdown(p));
for (const i of RA_INDUSTRIES) writeFileSync(resolve(`public${industryPath(i.slug)}.md`), industryMarkdown(i));

// Podcast: Markdown twin of each episode (show notes plus transcript).
rmSync(resolve("public/podcast"), { recursive: true, force: true });
mkdirSync(resolve("public/podcast"), { recursive: true });
for (const e of podcastEpisodes) writeFileSync(resolve(`public/podcast/${e.slug}.md`), episodeMarkdown(e));

console.log(
  `SEO artifacts written: sitemap.xml (${sitemapEntries.length} urls), ` +
    `llms.txt (${blogPosts.length + learnPosts.length} articles), llms-full.txt`,
);
