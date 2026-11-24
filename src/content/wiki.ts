// The Open Lakehouse Wiki: pages are MDX files under ./wiki/{articles,categories,project}.
// The index (titles, categories, summaries) is built from them at build time by
// scripts/wiki-index.ts; page bodies load per page in the browser and eagerly in
// the prerender, the same way podcast write-ups do.
import type { ComponentType } from "react";
import index from "virtual:wiki-index";
import type { WikiPageMeta } from "../../scripts/wiki-index";

export type { WikiPageMeta };

export const WIKI_HOME = "/wiki/Main_Page";
export const WIKI_REPO = "https://github.com/open-lakehouse/openlakehouse-io";
export const WIKI_NAME = "Open Lakehouse Wiki";
export const WIKI_LICENSE = { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" };

export const wikiPages: WikiPageMeta[] = index.pages;
const byKey = new Map(wikiPages.map((p) => [p.key, p]));

/** Normalize a /wiki/ URL segment the way MediaWiki does: spaces to underscores, first letter upper case. */
export const normalizeKey = (raw: string) => {
  let key = decodeURIComponent(raw).replace(/ /g, "_");
  const colon = key.indexOf(":");
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (colon > 0) key = key.slice(0, colon + 1) + cap(key.slice(colon + 1));
  return cap(key);
};

export const getWikiPage = (key: string) => byKey.get(normalizeKey(key));
export const wikiPathExists = (path: string) => path === WIKI_HOME || byKey.has(normalizeKey(path.replace(/^\/wiki\//, "").split("#")[0]));

export const articles = wikiPages.filter((p) => p.kind === "article").sort((a, b) => a.title.localeCompare(b.title));
export const wikiCategories = wikiPages.filter((p) => p.kind === "category").sort((a, b) => a.title.localeCompare(b.title));

export const categoryMembers = (title: string) =>
  wikiPages.filter((p) => p.kind !== "category" && p.categories.includes(title)).sort((a, b) => a.title.localeCompare(b.title));

export const categoryPath = (title: string) => `/wiki/Category:${title.replace(/ /g, "_")}`;

/** Pages that link to this one. */
export const backlinks = (path: string) => wikiPages.filter((p) => p.links.includes(path) && p.path !== path);

/** Glossary entries: every article in Concepts or Glossary terms, with its first sentence. */
export const glossaryEntries = () =>
  articles.filter((p) => p.summary && (p.categories.includes("Concepts") || p.categories.includes("Glossary terms")));

export const editUrl = (p: WikiPageMeta) => `${WIKI_REPO}/edit/main/src/content/wiki/${p.file}`;
export const historyUrl = (p: WikiPageMeta) => `${WIKI_REPO}/commits/main/src/content/wiki/${p.file}`;
export const newPageUrl = (title: string) =>
  `${WIKI_REPO}/new/main/src/content/wiki/articles?filename=${encodeURIComponent(title.replace(/ /g, "_"))}.mdx`;

// ---------- page bodies ----------

type MdxModule = { default: ComponentType };
const loaders = import.meta.glob("./wiki/**/*.mdx") as Record<string, () => Promise<MdxModule>>;
const eager: Record<string, MdxModule> = import.meta.env.SSR
  ? (import.meta.glob("./wiki/**/*.mdx", { eager: true }) as Record<string, MdxModule>)
  : {};
const cache: Record<string, ComponentType> = {};
const modKey = (p: WikiPageMeta) => `./wiki/${p.file}`;

/** The page body if it is already loaded (always true during the prerender). */
export const wikiBodySync = (p: WikiPageMeta): ComponentType | undefined => cache[p.file] ?? eager[modKey(p)]?.default;

/** Load a page body; main.tsx calls this before mounting a /wiki/ URL. */
export const loadWikiBodyFor = (key: string) => {
  const p = getWikiPage(key);
  return p ? loadWikiBody(p) : Promise.resolve(undefined);
};

export const loadWikiBody = (p: WikiPageMeta): Promise<ComponentType | undefined> => {
  const load = p.file ? loaders[modKey(p)] : undefined;
  if (!load) return Promise.resolve(undefined);
  return load().then((m) => (cache[p.file] = m.default));
};
