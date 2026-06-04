import { useRef, useState, type ReactNode } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * A prompt or recipe block with copy-to-clipboard AND
 * "open in Claude / ChatGPT / Codex" actions.
 */
export const PromptBlock = ({
  children,
  label = "Prompt",
}: {
  children: ReactNode;
  label?: string;
}) => {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const text = () => ref.current?.innerText.trim() ?? "";

  const copy = async (extra?: string) => {
    const body = extra ? `${extra}\n\n${text()}` : text();
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const openIn = (url: string) => {
    void copy();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => copy()}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs",
              "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
              copied && "text-foreground"
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" /> Send to…
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openIn("https://claude.ai/new")}>
                Open in Claude
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openIn("https://chat.openai.com/")}>
                Open in ChatGPT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openIn("https://chatgpt.com/codex")}>
                Open in Codex
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openIn("https://gemini.google.com/app")}>
                Open in Gemini
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <pre
        ref={ref}
        className="overflow-x-auto rounded-b-xl bg-secondary/40 p-4 text-sm leading-relaxed"
      >
        {children}
      </pre>
    </div>
  );
};
