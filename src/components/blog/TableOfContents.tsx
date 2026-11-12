import { useEffect, useState } from "react";
import type { TocItem } from "@/hooks/use-article-outline";
import { cn } from "@/lib/utils";

/** Index of the last heading scrolled past the top quarter of the window. */
const useActiveHeading = (items: TocItem[]) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const onScroll = () => {
      let index = 0;
      items.forEach((item, i) => {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top;
        if (top !== undefined && top < window.innerHeight / 4) index = i;
      });
      setActive(index);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return active;
};

export const TableOfContents = ({ items }: { items: TocItem[] }) => {
  const active = useActiveHeading(items);
  return (
    <nav aria-label="On this page">
      <h2 className="mb-3.5 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        On this page
      </h2>
      <ul className="flex flex-col gap-0.5">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={i === active ? "location" : undefined}
              className={cn(
                "block rounded-md border-l-2 px-2.5 py-1.5 text-[0.8125rem] leading-snug transition-colors",
                i === active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
