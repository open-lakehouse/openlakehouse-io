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
export const SparkMatrixTable = lazyWithPreload(() => import("./pages/projects/SparkMatrixTable.tsx"));
export const SparkMatrixMethod = lazyWithPreload(() => import("./pages/projects/SparkMatrixMethod.tsx"));
export const SparkMatrixFaq = lazyWithPreload(() => import("./pages/projects/SparkMatrixFaq.tsx"));

/** Load the chunk for a path before the first render. */
export function preloadFor(pathname: string): Promise<unknown> {
  if (/^\/spark-matrix\/table\/?$/.test(pathname)) return SparkMatrixTable.preload();
  if (/^\/spark-matrix\/method\/?$/.test(pathname)) return SparkMatrixMethod.preload();
  if (/^\/spark-matrix\/faq\/?$/.test(pathname)) return SparkMatrixFaq.preload();
  if (/^\/spark-matrix\/?$/.test(pathname)) return SparkMatrix.preload();
  // Episode write-ups are per-episode chunks; load before mount so the
  // prerendered article isn't replaced by an empty one on a direct visit.
  const episode = pathname.match(/^\/podcast\/([a-z0-9-]+)\/?$/);
  if (episode) return loadWriteup(episode[1]);
  return Promise.resolve();
}
