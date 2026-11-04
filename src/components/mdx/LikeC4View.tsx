import { createElement, useEffect } from "react";
import { loadModuleScript } from "@/lib/moduleScript";

const BUNDLE = "/likec4/likec4-webcomponent.mjs";

/**
 * A LikeC4 architecture view from a docs-factory post: the `<likec4-view>` web
 * component, whose bundle (public/likec4/likec4-webcomponent.mjs) the emitter
 * generates with the views the posts use. Blog views are sequence diagrams.
 * `alt`, the view's text equivalent, is a visually hidden caption.
 */
export const LikeC4View = ({ viewId, alt }: { viewId: string; alt?: string }) => {
  useEffect(() => loadModuleScript(BUNDLE), []);
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-border">
      {createElement("likec4-view", {
        "view-id": viewId,
        "dynamic-variant": "sequence",
        style: { display: "block", minHeight: "26rem" },
      })}
      {alt && <figcaption className="sr-only">{alt}</figcaption>}
    </figure>
  );
};
