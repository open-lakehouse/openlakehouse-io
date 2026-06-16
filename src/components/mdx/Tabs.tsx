import { Children, isValidElement, useState, type ReactNode, type ReactElement } from "react";
import { cn } from "@/lib/utils";

type TabProps = { label: string; children: ReactNode };

export const Tab = ({ children }: TabProps) => <>{children}</>;

export const Tabs = ({ children }: { children: ReactNode }) => {
  const tabs = Children.toArray(children).filter(
    (c): c is ReactElement<TabProps> => isValidElement(c) && typeof (c.props as TabProps).label === "string"
  );
  const [active, setActive] = useState(0);

  if (tabs.length === 0) return null;

  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-card">
      <div role="tablist" className="flex gap-1 border-b border-border px-2 pt-2 overflow-x-auto">
        {tabs.map((t, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={cn(
                "relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.props.label}
            </button>
          );
        })}
      </div>
      <div className="px-5 py-4 prose prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {tabs[active]}
      </div>
    </div>
  );
};
