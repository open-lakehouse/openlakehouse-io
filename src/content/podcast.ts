import episodesJson from "./podcast/episodes.json";
import youtubeJson from "./podcast/youtube.json";
import writeupsJson from "./podcast/writeups.json";
import type { ComponentType } from "react";
import { SITE_URL } from "@/lib/seo";

// Data comes from scripts/fetch-podcast.ts (Riverside RSS), refreshed on every build.
export type Episode = {
  guid: string;
  slug: string;
  title: string;
  date: string;
  episodeNumber?: number;
  duration?: string;
  summary: string;
  notesHtml: string;
  audioUrl: string;
  audioType: string;
  image?: string;
  transcriptUrl?: string;
  hasTranscript: boolean;
};

export const SHOW = {
  title: "This Week in Open Lakehouse",
  tagline:
    "A weekly data engineering podcast on the latest open source news: query engines, data catalogs, open table formats, orchestrators, and streaming.",
  description:
    "A weekly data engineering podcast on the latest open source news: query engines, data catalogs, open table formats, orchestrators, and streaming. Hosted by Lisa Cao and Scott Haines.",
  hostSlugs: ["lisa-cao", "scott-haines"],
  hostNames: ["Lisa Cao", "Scott Haines"],
  spotifyId: "4k97PCeKwCIyrWLYXVijSZ",
  spotifyUrl: "https://open.spotify.com/show/4k97PCeKwCIyrWLYXVijSZ",
  appleUrl: "https://podcasts.apple.com/us/podcast/this-week-in-open-lakehouse/id6817521501",
  rssUrl: "https://api.riverside.com/hosting/aeXB70YD.rss",
  path: "/podcast",
};

export const episodes = episodesJson as Episode[];

/** Episode number; the feed leaves it off the AI special, so fall back to its place in the run (oldest is 1). */
export const episodeNumber = (e: Episode) => e.episodeNumber ?? episodes.length - episodes.indexOf(e);
/** Display title everywhere on the site: "TWIOL #N: <episode title>". */
export const episodeTitle = (e: Episode) => `TWIOL #${episodeNumber(e)}: ${e.title}`;

/** YouTube upload of each episode on the Open Lakehouse + AI channel, keyed by episode slug. */
const youtube = youtubeJson as Record<string, { id: string; uploadDate: string }>;
export const youtubeFor = (e: Episode) => youtube[e.slug];

/**
 * The written article for an episode (src/content/podcast/writeups/<slug>.mdx).
 * It is the main body of the episode page. Titles come from writeups.json
 * (written by scripts/fetch-podcast.ts) so list pages don't bundle the MDX.
 */
export type WriteupMeta = { title: string; excerpt?: string; authors: string[]; tags: string[] };
const writeupMeta = writeupsJson as Record<string, WriteupMeta>;
export const writeupFor = (e: Episode): WriteupMeta | undefined => writeupMeta[e.slug];

type MdxModule = { default: ComponentType };
const writeupLoaders = import.meta.glob("./podcast/writeups/*.mdx") as Record<string, () => Promise<MdxModule>>;
const writeupsEager: Record<string, MdxModule> = import.meta.env.SSR
  ? (import.meta.glob("./podcast/writeups/*.mdx", { eager: true }) as Record<string, MdxModule>)
  : {};
const writeupCache: Record<string, ComponentType> = {};
const writeupKey = (slug: string) => `./podcast/writeups/${slug}.mdx`;

/** The write-up component if it is already loaded (always true during the prerender). */
export const writeupSync = (slug: string): ComponentType | undefined =>
  writeupCache[slug] ?? writeupsEager[writeupKey(slug)]?.default;

/** Load an episode's write-up; main.tsx calls this before mounting an episode URL. */
export const loadWriteup = (slug: string): Promise<ComponentType | undefined> => {
  const load = writeupLoaders[writeupKey(slug)];
  if (!load) return Promise.resolve(undefined);
  return load().then((m) => (writeupCache[slug] = m.default));
};

export const episodePath = (e: Episode) => `${SHOW.path}/${e.slug}`;
export const getEpisode = (slug: string) => episodes.find((e) => e.slug === slug);

// Transcripts are large, so the browser loads them on demand; the build-time
// prerender reads them eagerly so they are in the static HTML for crawlers.
const transcriptLoaders = import.meta.glob("./podcast/transcripts/*.txt", { query: "?raw", import: "default" }) as Record<
  string,
  () => Promise<string>
>;
const transcriptsEager: Record<string, string> = import.meta.env.SSR
  ? (import.meta.glob("./podcast/transcripts/*.txt", { query: "?raw", import: "default", eager: true }) as Record<string, string>)
  : {};

const transcriptKey = (slug: string) => `./podcast/transcripts/${slug}.txt`;
export const transcriptSync = (slug: string): string | undefined => transcriptsEager[transcriptKey(slug)];
export const loadTranscript = (slug: string): Promise<string | undefined> =>
  transcriptLoaders[transcriptKey(slug)]?.() ?? Promise.resolve(undefined);

/** "01:05:39" -> ISO 8601 "PT1H5M39S" for schema.org `timeRequired`/`duration`. */
export const isoDuration = (d?: string) => {
  if (!d) return undefined;
  const parts = d.split(":").map(Number);
  while (parts.length < 3) parts.unshift(0);
  const [h, m, s] = parts;
  const body = `${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
  return `PT${body || "0S"}`;
};

/** "01:05:39" -> "1 hr 5 min". */
export const humanDuration = (d?: string) => {
  if (!d) return undefined;
  const parts = d.split(":").map(Number);
  while (parts.length < 3) parts.unshift(0);
  const [h, m] = parts;
  return h ? `${h} hr ${m} min` : `${m} min`;
};

export const formatEpisodeDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export const seriesJsonLd = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  "@id": `${SITE_URL}${SHOW.path}#series`,
  name: SHOW.title,
  description: SHOW.description,
  url: `${SITE_URL}${SHOW.path}`,
  image: episodes[0]?.image,
  inLanguage: "en",
  webFeed: SHOW.rssUrl,
  author: SHOW.hostNames.map((name, i) => ({ "@type": "Person", name, url: `${SITE_URL}/authors/${SHOW.hostSlugs[i]}` })),
  sameAs: [SHOW.spotifyUrl, SHOW.appleUrl],
};

export const episodeJsonLd = (e: Episode) => ({
  "@context": "https://schema.org",
  "@type": "PodcastEpisode",
  name: e.title,
  description: e.summary,
  url: `${SITE_URL}${episodePath(e)}`,
  datePublished: e.date,
  ...(e.episodeNumber ? { episodeNumber: e.episodeNumber } : {}),
  ...(e.duration ? { timeRequired: isoDuration(e.duration) } : {}),
  ...(e.image ? { image: e.image } : {}),
  associatedMedia: {
    "@type": "MediaObject",
    contentUrl: e.audioUrl,
    encodingFormat: e.audioType,
    ...(e.duration ? { duration: isoDuration(e.duration) } : {}),
  },
  ...(youtubeFor(e)
    ? {
        video: {
          "@type": "VideoObject",
          name: e.title,
          description: e.summary,
          thumbnailUrl: `https://i.ytimg.com/vi/${youtubeFor(e).id}/hqdefault.jpg`,
          uploadDate: youtubeFor(e).uploadDate,
          embedUrl: `https://www.youtube.com/embed/${youtubeFor(e).id}`,
          contentUrl: `https://www.youtube.com/watch?v=${youtubeFor(e).id}`,
          ...(e.duration ? { duration: isoDuration(e.duration) } : {}),
        },
      }
    : {}),
  partOfSeries: { "@type": "PodcastSeries", "@id": seriesJsonLd["@id"], name: SHOW.title, url: seriesJsonLd.url },
  author: seriesJsonLd.author,
});
