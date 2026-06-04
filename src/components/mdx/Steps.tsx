import { Children, isValidElement, type ReactNode } from "react";

export const Steps = ({ children }: { children: ReactNode }) => {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <ol className="not-prose my-8 space-y-6 border-l-2 border-border pl-6">
      {items.map((child, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[2.05rem] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold ring-4 ring-background">
            {i + 1}
          </span>
          <div className="prose prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0">
            {child}
          </div>
        </li>
      ))}
    </ol>
  );
};

export const Step = ({ title, children }: { title?: string; children: ReactNode }) => (
  <div>
    {title && <h4 className="mt-0 mb-2 text-lg font-semibold tracking-tight">{title}</h4>}
    {children}
  </div>
);
