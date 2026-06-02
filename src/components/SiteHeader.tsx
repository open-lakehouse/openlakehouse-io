import { useEffect, useState } from "react";
import logoUrl from "@/assets/bundled/olai-logo-white.png";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const desktopLinkClass =
    "px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
  const mobileLinkClass =
    "block w-full px-4 py-4 text-lg font-medium text-foreground/90 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors";

  const TechLink = ({ className, mobile }: { className: string; mobile?: boolean }) =>
    isHome ? (
      <a href="#technologies" className={className} onClick={() => mobile && setOpen(false)}>
        Technologies
      </a>
    ) : (
      <Link to="/technologies" className={className}>Technologies</Link>
    );

  const LearnLink = ({ className, mobile }: { className: string; mobile?: boolean }) =>
    isHome ? (
      <a href="#learn" className={className} onClick={() => mobile && setOpen(false)}>
        Learn
      </a>
    ) : (
      <Link to="/learn" className={className}>Learn</Link>
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img
            src={logoUrl}
            alt="Open Lakehouse Guide Hub — open data and AI architecture on Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark"
            className="h-8 md:h-9 w-auto transition-transform group-hover:scale-105 invert dark:invert-0"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <TechLink className={desktopLinkClass} />
          <Link to="/blog" className={desktopLinkClass}>Blog</Link>
          <LearnLink className={desktopLinkClass} />
          <Link to="/community" className={desktopLinkClass}>Community</Link>
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <Menu
              className={cn(
                "absolute h-5 w-5 transition-all duration-300",
                open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100",
              )}
            />
            <X
              className={cn(
                "absolute h-5 w-5 transition-all duration-300",
                open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75",
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={cn(
          "md:hidden overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="container flex flex-col gap-1 py-4">
          <TechLink className={mobileLinkClass} mobile />
          <Link to="/blog" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Blog
          </Link>
          <LearnLink className={mobileLinkClass} mobile />
          <Link to="/community" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Community
          </Link>
        </nav>
      </div>
    </header>
  );
};
