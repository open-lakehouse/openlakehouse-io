import type { ComponentType } from "react";
import thumbIceberg from "@/assets/blog-iceberg.jpg";
import thumbDelta from "@/assets/blog-delta.jpg";
import thumbAgentic from "@/assets/blog-agentic.jpg";

const categoryThumbnails: Record<string, string> = {
  iceberg: thumbIceberg,
  "delta-lake": thumbDelta,
  agentic: thumbAgentic,
};

type MdxModule = {
  default: ComponentType<any>;
  frontmatter?: Record<string, any>;
};

const postMods = import.meta.glob("./posts/**/*.mdx", { eager: true }) as Record<string, MdxModule>;
const authorMods = import.meta.glob("./authors/*.mdx", { eager: true }) as Record<string, MdxModule>;
const thumbMods = import.meta.glob("./posts/**/thumbnail.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type Surface = "blog" | "learn";
export type Status = "published" | "preview" | "draft";
export type Kind = "post" | "getting-started" | "deep-dive" | "concept" | "tutorial";

export type Author = {
  slug: string;
  name: string;
  avatar?: string;
  role?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  Component: ComponentType<any>;
};

export type Post = {
  slug: string;
  category: string;
  title: string;
  date: string;
  authorSlug: string;
  authorSlugs: string[];
  excerpt?: string;
  tags: string[];
  thumbnail?: string;
  /** Where this content should appear. */
  include: Surface[];
  status: Status;
  kind: Kind;
  readingTime?: number;
  /** Optional explainer YouTube id rendered above the article. */
  video?: string;
  /** Original source metadata for republished content. */
  originalUrl?: string;
  originalPublisher?: string;
  /** Registry key for an optional flow diagram component (see FlowDiagram.tsx). */
  flowDiagram?: string;
  /** Raw MDX source (frontmatter included) for "view as Markdown" + LLM export. */
  raw: string;
  Component: ComponentType<any>;
};

function parseAuthors(): Record<string, Author> {
  const out: Record<string, Author> = {};
  for (const path of Object.keys(authorMods)) {
    const slug = path.split("/").pop()!.replace(/\.mdx$/, "");
    const data = authorMods[path].frontmatter ?? {};
    out[slug] = {
      slug,
      name: data.name ?? slug,
      avatar: data.avatar,
      role: data.role,
      twitter: data.twitter,
      github: data.github,
      linkedin: data.linkedin,
      Component: authorMods[path].default,
    };
  }
  return out;
}

function parsePosts(): Post[] {
  const posts: Post[] = [];
  for (const path of Object.keys(postMods)) {
    const parts = path.replace(/^\.\/posts\//, "").split("/");
    const category = parts[0];
    const file = parts[parts.length - 1].replace(/\.mdx$/, "");
    const slug = file === "index" && parts.length >= 3 ? parts[parts.length - 2] : file;
    const data = postMods[path].frontmatter ?? {};
    const dir = path.substring(0, path.lastIndexOf("/"));
    const colocatedThumb = Object.keys(thumbMods).find((p) => p.startsWith(dir + "/"));
    const authorList: string[] = Array.isArray(data.authors)
      ? data.authors
      : data.author
        ? [data.author]
        : [];
    const include: Surface[] = Array.isArray(data.include) && data.include.length
      ? (data.include as Surface[])
      : ["blog"]; // default: legacy posts go to blog
    const status: Status = (data.status as Status) ?? "published";
    if (status === "draft") continue;
    posts.push({
      slug,
      category,
      title: data.title ?? slug,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      authorSlug: authorList[0] ?? "",
      authorSlugs: authorList,
      excerpt: data.excerpt,
      tags: data.tags ?? [],
      thumbnail: data.thumbnail ?? (colocatedThumb ? thumbMods[colocatedThumb] : categoryThumbnails[category]),
      include,
      status,
      kind: (data.kind as Kind) ?? "post",
      readingTime: typeof data.readingTime === "number" ? data.readingTime : undefined,
      video: data.video ? String(data.video) : undefined,
      originalUrl: data.originalUrl ? String(data.originalUrl) : undefined,
      originalPublisher: data.originalPublisher ? String(data.originalPublisher) : undefined,
      flowDiagram: data.flowDiagram ? String(data.flowDiagram) : undefined,
      raw: "",
      Component: postMods[path].default,
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const authors = parseAuthors();
export const allPosts = parsePosts();

const onSurface = (p: Post, s: Surface) => p.include.includes(s) && p.status === "published";

/** Backward-compatible default export: blog-listed published posts. */
export const posts = allPosts.filter((p) => onSurface(p, "blog"));
export const learnPosts = allPosts.filter((p) => onSurface(p, "learn"));

export const categories = Array.from(new Set(posts.map((p) => p.category))).sort();
export const learnCategories = Array.from(new Set(learnPosts.map((p) => p.category))).sort();

/** Look up by category + slug. Returns preview content too (direct-link only). */
export const getPost = (category: string, slug: string) =>
  allPosts.find((p) => p.category === category && p.slug === slug);

export const getAuthor = (slug: string) => authors[slug];

export const postsByAuthor = (slug: string) =>
  posts.filter((p) => p.authorSlugs.includes(slug));

export const postsByCategory = (category: string) =>
  posts.filter((p) => p.category === category);

export const learnPostsByCategory = (category: string) =>
  learnPosts.filter((p) => p.category === category);

const titleCaseMap: Record<string, string> = {
  mlflow: "MLflow",
  ai: "AI",
};

export const formatCategory = (c: string) =>
  c
    .split("-")
    .map((w) => titleCaseMap[w.toLowerCase()] ?? w[0].toUpperCase() + w.slice(1))
    .join(" ");

/** Strip frontmatter from raw MDX for LLM/markdown export. */
export const stripFrontmatter = (raw: unknown) =>
  typeof raw === "string" ? raw.replace(/^---\n[\s\S]*?\n---\n?/, "").trim() : "";
