// Pull "This Week in Open Lakehouse" from its Riverside RSS feed into
// src/content/podcast/, so every episode gets a prerendered page on this site.
//
//   bunx tsx scripts/fetch-podcast.ts
//
// Runs in predev/prebuild. The output is committed: if the feed is
// unreachable the build keeps the last good copy instead of failing.
// Episode slugs are pinned by GUID, so editing an episode title in Riverside
// never changes a published URL.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export const FEED_URL = "https://api.riverside.com/hosting/aeXB70YD.rss";

const OUT_DIR = resolve("src/content/podcast");
const EPISODES_JSON = resolve(OUT_DIR, "episodes.json");
const TRANSCRIPT_DIR = resolve(OUT_DIR, "transcripts");
const WRITEUP_DIR = resolve(OUT_DIR, "writeups");
const WRITEUPS_JSON = resolve(OUT_DIR, "writeups.json");

export type Episode = {
  guid: string;
  slug: string;
  title: string;
  /** ISO 8601 publish time. */
  date: string;
  episodeNumber?: number;
  /** HH:MM:SS as published in the feed. */
  duration?: string;
  /** Plain-text summary (first paragraph of the show notes). */
  summary: string;
  /** Show notes as sanitized HTML (p, ul, ol, li, a, br, strong, em only). */
  notesHtml: string;
  audioUrl: string;
  audioType: string;
  image?: string;
  transcriptUrl?: string;
  /** True when src/content/podcast/transcripts/<slug>.txt exists. */
  hasTranscript: boolean;
};

const decodeEntities = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");

/** Text of the first <tag>…</tag>, with CDATA unwrapped. */
const tag = (xml: string, name: string): string | undefined => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  if (!m) return undefined;
  const cdata = m[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return cdata ? cdata[1] : decodeEntities(m[1]);
};

const attr = (xml: string, name: string, attribute: string): string | undefined => {
  const m = xml.match(new RegExp(`<${name}\\s[^>]*${attribute}="([^"]*)"`));
  return m ? decodeEntities(m[1]) : undefined;
};

const ALLOWED = new Set(["p", "ul", "ol", "li", "a", "br", "strong", "em", "b", "i"]);

/** Keep a small allowlist of tags; links keep only an http(s) href. */
export const sanitizeHtml = (html: string) =>
  html
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, name: string, rest: string) => {
      const t = name.toLowerCase();
      if (!ALLOWED.has(t)) return "";
      if (full.startsWith("</")) return `</${t}>`;
      if (t === "a") {
        const href = rest.match(/href="(https?:\/\/[^"]+)"/i)?.[1];
        return href ? `<a href="${href}" rel="noopener noreferrer" target="_blank">` : "<a>";
      }
      return t === "br" ? "<br />" : `<${t}>`;
    })
    .replace(/(<br \/>\s*)+$/g, "")
    .trim();

const toText = (html: string) =>
  decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** First paragraph of the notes: everything before the first list or <p> break. */
const summarize = (html: string) => {
  const first = html.split(/<ul|<ol|<\/p>/i)[0];
  return toText(first);
};

export const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    // Cap at about 70 characters, stopping at the first word that would overflow.
    .reduce(
      (acc, word) =>
        acc.done ? acc : acc.s && `${acc.s}-${word}`.length > 70 ? { ...acc, done: true } : { s: acc.s ? `${acc.s}-${word}` : word, done: false },
      { s: "", done: false },
    )
    .s.replace(/-(and|or|the|w|of|a)$/, "");

const CORRECTIONS: [RegExp, string][] = (
  JSON.parse(readFileSync(resolve(OUT_DIR, "transcript-corrections.json"), "utf8")).corrections as [string, string][]
).map(([re, to]) => [new RegExp(`\\b(?:${re})\\b`, "gi"), to]);

/**
 * Fix what the transcription service mishears: the show's own name ("Open
 * Lake House") plus the project and people names in transcript-corrections.json.
 * Idempotent, so it runs over every transcript on every fetch.
 */
export const cleanTranscript = (t: string) => {
  let out = t.replace(/\r\n/g, "\n").replace(/\blake ?house(s?)\b/gi, (m, s) => (m[0] === "L" ? `Lakehouse${s}` : `lakehouse${s}`));
  for (const [re, to] of CORRECTIONS) out = out.replace(re, to);
  return out.trim() + "\n";
};

export function parseFeed(xml: string, pinned: Map<string, string>): Omit<Episode, "hasTranscript">[] {
  const items = xml.split("<item>").slice(1).map((s) => s.split("</item>")[0]);
  const taken = new Set(pinned.values());
  return items.map((item) => {
    const guid = tag(item, "guid")!.trim();
    const title = tag(item, "title")!.trim();
    let slug = pinned.get(guid);
    if (!slug) {
      const base = slugify(title) || guid;
      slug = base;
      for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      taken.add(slug);
    }
    const notesHtml = sanitizeHtml(tag(item, "description") ?? "");
    const ep = tag(item, "itunes:episode");
    return {
      guid,
      slug,
      title,
      date: new Date(tag(item, "pubDate")!).toISOString(),
      episodeNumber: ep ? Number(ep) : undefined,
      duration: tag(item, "itunes:duration")?.trim(),
      summary: summarize(notesHtml),
      notesHtml,
      audioUrl: attr(item, "enclosure", "url")!,
      audioType: attr(item, "enclosure", "type") ?? "audio/mpeg",
      image: attr(item, "itunes:image", "href"),
      transcriptUrl: attr(item, "podcast:transcript", "url"),
    };
  });
}

/**
 * Index the episode write-ups (src/content/podcast/writeups/<slug>.mdx) so
 * list pages can show their titles without bundling every MDX body.
 */
function indexWriteups() {
  const out: Record<string, { title: string; excerpt?: string; authors: string[]; tags: string[] }> = {};
  if (existsSync(WRITEUP_DIR)) {
    for (const f of readdirSync(WRITEUP_DIR).filter((n) => n.endsWith(".mdx")).sort()) {
      const fm = readFileSync(resolve(WRITEUP_DIR, f), "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      const field = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.trim();
      const unquote = (v?: string) => v?.replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
      const list = (v?: string) => (v ? v.replace(/^\[|\]$/g, "").split(",").map((x) => x.trim()).filter(Boolean) : []);
      out[f.replace(/\.mdx$/, "")] = {
        title: unquote(field("title")) ?? "",
        excerpt: unquote(field("excerpt")),
        authors: list(field("authors")),
        tags: list(field("tags")),
      };
    }
  }
  writeFileSync(WRITEUPS_JSON, JSON.stringify(out, null, 2) + "\n");
}

async function main() {
  indexWriteups();
  mkdirSync(TRANSCRIPT_DIR, { recursive: true });
  const previous: Episode[] = existsSync(EPISODES_JSON) ? JSON.parse(readFileSync(EPISODES_JSON, "utf8")) : [];
  const pinned = new Map(previous.map((e) => [e.guid, e.slug]));

  let xml: string;
  try {
    const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.warn(`[podcast] feed unreachable (${(err as Error).message}); keeping ${previous.length} committed episodes`);
    return;
  }

  const parsed = parseFeed(xml, pinned);
  const episodes: Episode[] = [];
  for (const e of parsed) {
    const file = resolve(TRANSCRIPT_DIR, `${e.slug}.txt`);
    if (!existsSync(file) && e.transcriptUrl) {
      try {
        const res = await fetch(e.transcriptUrl, { signal: AbortSignal.timeout(20_000) });
        if (res.ok) writeFileSync(file, cleanTranscript(await res.text()));
        else console.warn(`[podcast] transcript HTTP ${res.status} for ${e.slug}`);
      } catch (err) {
        console.warn(`[podcast] transcript failed for ${e.slug}: ${(err as Error).message}`);
      }
    }
    if (existsSync(file)) {
      const before = readFileSync(file, "utf8");
      const after = cleanTranscript(before);
      if (after !== before) writeFileSync(file, after);
    }
    episodes.push({ ...e, hasTranscript: existsSync(file) });
  }
  episodes.sort((a, b) => b.date.localeCompare(a.date));
  writeFileSync(EPISODES_JSON, JSON.stringify(episodes, null, 2) + "\n");
  console.log(`[podcast] ${episodes.length} episodes, ${episodes.filter((e) => e.hasTranscript).length} with transcripts`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("fetch-podcast.ts")) {
  await main();
}
