import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export const CodeBlock = ({ className, children, ...props }: ComponentPropsWithoutRef<"pre">) => {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="group relative my-6 not-prose">
      <pre ref={ref} className={cn(className, "overflow-x-auto rounded-xl border border-border p-4 [&>code]:!bg-transparent [&>code]:!p-0")} {...props}>
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md",
          "border border-border/60 bg-background/80 text-muted-foreground backdrop-blur",
          "opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100",
          copied && "opacity-100 text-foreground"
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};
