import { createElement, useEffect } from "react";
import { useResolvedTheme } from "@/components/ThemeProvider";
import { loadModuleScript } from "@/lib/moduleScript";

const BUNDLE = "/trestle/trestle-webcomponent.mjs";

/**
 * A Trestle environment diagram from a docs-factory post: the `<trestle-view>`
 * web component the emitter ships with the post (the bundle at
 * public/trestle/trestle-webcomponent.mjs, the snapshot at `src` under
 * public/trestle/<slug>/). The bundle carries its own React, so the diagram
 * package's React 19 requirement doesn't reach this app.
 *
 * The element gets no React children: it replaces its own once the snapshot
 * loads. `alt`, the diagram's text equivalent, is a visually hidden caption and
 * the canvas's accessible name.
 */
export const TrestleView = ({ src, alt }: { src: string; alt?: string }) => {
  const theme = useResolvedTheme();
  useEffect(() => loadModuleScript(BUNDLE), []);
  return (
    <figure className="not-prose my-8">
      {createElement("trestle-view", { src, label: alt, "color-mode": theme })}
      {alt && <figcaption className="sr-only">{alt}</figcaption>}
    </figure>
  );
};
