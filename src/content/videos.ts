import type { ComponentType } from "react";

type MdxModule = {
  default: ComponentType<unknown>;
  frontmatter?: Record<string, unknown>;
};

const mods = import.meta.glob("./videos/**/*.mdx", { eager: true }) as Record<string, MdxModule>;

export type Video = {
  channel: string;
  title: string;
  duration: string;
  hue: number;
  videoId?: string;
  playlist?: string;
  publishedAt?: string;
  /** MDX body — render in a blog post / dedicated page if you want long-form notes. */
  Component: ComponentType<unknown>;
};

function parse(): Video[] {
  const out: Video[] = [];
  for (const path of Object.keys(mods)) {
    const fm = (mods[path].frontmatter ?? {}) as Record<string, unknown>;
    if (!fm.title || !fm.channel) continue;
    out.push({
      channel: String(fm.channel),
      title: String(fm.title),
      duration: String(fm.duration ?? ""),
      hue: typeof fm.hue === "number" ? fm.hue : 270,
      videoId: fm.videoId ? String(fm.videoId) : undefined,
      playlist: fm.playlist ? String(fm.playlist) : undefined,
      publishedAt: fm.publishedAt ? String(fm.publishedAt) : undefined,
      Component: mods[path].default,
    });
  }
  // Newest first when publishedAt is present, otherwise preserve original ordering.
  return out.sort((a, b) => {
    if (a.publishedAt && b.publishedAt) return a.publishedAt < b.publishedAt ? 1 : -1;
    if (a.publishedAt) return -1;
    if (b.publishedAt) return 1;
    return 0;
  });
}

export const videos = parse();
export const videosByChannel = (channel: string) => videos.filter((v) => v.channel === channel);
