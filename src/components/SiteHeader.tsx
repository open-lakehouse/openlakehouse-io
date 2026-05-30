import logo from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const linkClass =
    "hidden md:inline-block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Open Lakehouse + AI"
            className="h-9 w-auto transition-transform group-hover:scale-105"
          />
          <span className="hidden sm:inline text-sm font-semibold tracking-wide text-foreground">
            openlakehouse.io
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {isHome ? (
            <a href="#technologies" className={linkClass}>Technologies</a>
          ) : (
            <Link to="/technologies" className={linkClass}>Technologies</Link>
          )}
          <Link to="/blog" className={linkClass}>Blog</Link>
          {isHome ? (
            <a href="#learn" className={linkClass}>Learn</a>
          ) : (
            <Link to="/learn" className={linkClass}>Learn</Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};
