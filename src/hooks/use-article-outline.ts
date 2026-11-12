import { useEffect, useState, type RefObject } from "react";

export type TocItem = { id: string; label: string };

const WORDS_PER_MINUTE = 230;

/**
 * Reads the rendered article: its `h2[id]` headings (ids come from
 * rehype-slug) for the table of contents, and a word count for reading time.
 * Runs after render, so it is a no-op during server rendering.
 */
export const useArticleOutline = (ref: RefObject<HTMLElement>, key: string) => {
  const [outline, setOutline] = useState<{ items: TocItem[]; minutes?: number }>({ items: [] });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLHeadingElement>("h2[id]"))
      .map((h) => ({ id: h.id, label: h.textContent?.trim() ?? "" }))
      .filter((item) => item.label);
    const words = (el.textContent ?? "").split(/\s+/).filter(Boolean).length;
    setOutline({ items, minutes: words ? Math.max(1, Math.round(words / WORDS_PER_MINUTE)) : undefined });
  }, [ref, key]);

  return outline;
};
