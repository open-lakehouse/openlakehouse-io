import type { ComponentType } from "react";

type MdxModule = {
  default: ComponentType<any>;
  frontmatter?: Record<string, any>;
};

const postMods = import.meta.glob("./posts/**/*.mdx", { eager: true }) as Record<string, MdxModule>;
const authorMods = import.meta.glob("./authors/*.mdx", { eager: true }) as Record<string, MdxModule>;

export type Author = {
  slug: string;
  name: string;
  avatar?: string;
  role?: string;
  twitter?: string;
  github?: string;
  Component: ComponentType<any>;
};

export type Post = {
  slug: string;
  category: string;
  title: string;
  date: string;
  authorSlug: string;
  excerpt?: string;
  tags: string[];
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
    const slug = parts[parts.length - 1].replace(/\.mdx$/, "");
    const data = postMods[path].frontmatter ?? {};
    posts.push({
      slug,
      category,
      title: data.title ?? slug,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      authorSlug: data.author ?? "",
      excerpt: data.excerpt,
      tags: data.tags ?? [],
      Component: postMods[path].default,
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const authors = parseAuthors();
export const posts = parsePosts();

export const categories = Array.from(new Set(posts.map((p) => p.category))).sort();

export const getPost = (category: string, slug: string) =>
  posts.find((p) => p.category === category && p.slug === slug);

export const getAuthor = (slug: string) => authors[slug];

export const postsByAuthor = (slug: string) => posts.filter((p) => p.authorSlug === slug);

export const postsByCategory = (category: string) => posts.filter((p) => p.category === category);

export const formatCategory = (c: string) =>
  c.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
