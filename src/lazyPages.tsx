import { Suspense, lazy, type ComponentType } from "react";
import { loadWriteup } from "@/content/podcast";

// Pages that carry large build-time data (the Spark Matrix JSON) load as their
// own chunk so the rest of the site does not download it. main.tsx calls
// preload() for the current URL before mounting, so a direct visit renders the
// page at once instead of replacing the prerendered HTML with a blank fallback.
function lazyWithPreload(factory: () => Promise<{ default: ComponentType }>) {
  let Loaded: ComponentType | null = null;
  const preload = () =>
    factory().then((m) => {
      Loaded = m.default;
      return m;
    });
  const Lazy = lazy(preload);
  const Page = () =>
    Loaded ? (
      <Loaded />
    ) : (
      <Suspense fallback={<div className="min-h-screen" />}>
        <Lazy />
      </Suspense>
    );
  return Object.assign(Page, { preload });
}

export const SparkMatrix = lazyWithPreload(() => import("./pages/projects/SparkMatrix.tsx"));
export const Wiki = lazyWithPreload(() => import("./pages/wiki/WikiPage.tsx"));

/** Load the chunk for a path before the first render. */
export function preloadFor(pathname: string): Promise<unknown> {
  if (/^\/spark-matrix\/?$/.test(pathname)) return SparkMatrix.preload();
  // Episode write-ups are per-episode chunks; load before mount so the
  // prerendered article isn't replaced by an empty one on a direct visit.
  const episode = pathname.match(/^\/podcast\/([a-z0-9-]+)\/?$/);
  if (episode) return loadWriteup(episode[1]);
  // Wiki pages: the wiki chunk plus the page's own body.
  const wiki = pathname.match(/^\/wiki\/(.+?)\/?$/);
  if (wiki) {
    return Promise.all([Wiki.preload(), import("@/content/wiki").then((m) => m.loadWikiBodyFor(wiki[1]))]);
  }
  return Promise.resolve();
}
