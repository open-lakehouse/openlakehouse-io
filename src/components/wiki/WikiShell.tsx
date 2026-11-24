import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WIKI_HOME, WIKI_NAME, wikiPages } from "@/content/wiki";

export const WikiSearch = ({ className = "" }: { className?: string }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const titles = useMemo(() => wikiPages.filter((p) => p.kind !== "category").map((p) => p.displayTitle ?? p.title), []);
  const go = (e: FormEvent) => {
    e.preventDefault();
    const needle = q.trim().toLowerCase();
    if (!needle) return;
    const pages = wikiPages.filter((p) => p.kind !== "category");
    const hit =
      pages.find((p) => (p.displayTitle ?? p.title).toLowerCase() === needle) ??
      pages.find((p) => (p.displayTitle ?? p.title).toLowerCase().startsWith(needle)) ??
      pages.find((p) => (p.displayTitle ?? p.title).toLowerCase().includes(needle)) ??
      pages.find((p) => p.lead.toLowerCase().includes(needle));
    if (hit) navigate(hit.path);
  };
  return (
    <form role="search" onSubmit={go} className={`wiki-search ${className}`}>
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        list="wiki-titles"
        placeholder="Search the wiki"
        aria-label="Search the wiki"
      />
      <datalist id="wiki-titles">
        {titles.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </form>
  );
};

export const WikiShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <SiteHeader />
    <main className="flex-1">
      <div className="wiki-bar">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to={WIKI_HOME} className="font-semibold tracking-tight">
            {WIKI_NAME}
          </Link>
          <WikiSearch className="w-full sm:w-72" />
        </div>
      </div>
      {children}
    </main>
    <SiteFooter />
  </div>
);

