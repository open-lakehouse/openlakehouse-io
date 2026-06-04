import type { ReactNode } from "react";
import { Info, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "tip" | "warn" | "success";

const meta: Record<CalloutType, { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: "border-primary/30 bg-primary/5 text-foreground" },
  tip: { icon: Lightbulb, classes: "border-amber-500/30 bg-amber-500/5 text-foreground" },
  warn: { icon: AlertTriangle, classes: "border-destructive/40 bg-destructive/5 text-foreground" },
  success: { icon: CheckCircle2, classes: "border-emerald-500/30 bg-emerald-500/5 text-foreground" },
};

export const Callout = ({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) => {
  const { icon: Icon, classes } = meta[type];
  return (
    <aside className={cn("not-prose my-6 flex gap-3 rounded-xl border p-4", classes)}>
      <Icon className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
      <div className="flex-1 text-sm leading-relaxed [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {title && <div className="font-semibold mb-1">{title}</div>}
        {children}
      </div>
    </aside>
  );
};
