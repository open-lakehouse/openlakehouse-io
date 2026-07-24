import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Show the "OPEN LAKEHOUSE + AI" wordmark next to the mark. */
  withWordmark?: boolean;
  title?: string;
};

/**
 * Open Lakehouse + AI logo — monoline house mark + wordmark.
 * Uses `currentColor` throughout so it themes automatically: set the text
 * color on the wrapper (e.g. `text-primary`, `text-white`, `text-foreground`).
 */
export const Logo = ({ className, withWordmark = true, title = "Open Lakehouse + AI" }: LogoProps) => (
  <span className={cn("inline-flex items-center gap-2.5 text-current", className)} aria-label={title}>
    <LogoMark className="h-full w-auto" />
    {withWordmark && (
      <span className="font-bold leading-[0.9] tracking-tight text-current [font-size:0.62em]">
        <span className="block">OPEN</span>
        <span className="block">LAKEHOUSE</span>
        <span className="block">+ AI</span>
      </span>
    )}
  </span>
);

/** The house mark on its own (square-ish), stroked in currentColor. */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    role="img"
  >
    {/* Roof */}
    <path d="M8 30 L32 12 L56 30" />
    {/* Ridge overhang */}
    <path d="M14 26 L32 13 L50 26" strokeWidth={2.5} opacity={0.7} />
    {/* House body */}
    <path d="M14 30 V52 H50 V30" />
    {/* Doorway (open right side) */}
    <path d="M32 52 V36 H44" />
    {/* Window */}
    <rect x="20" y="36" width="7" height="7" strokeWidth={3} />
  </svg>
);

export default Logo;
