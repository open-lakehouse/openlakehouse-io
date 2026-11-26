// The wiki's own chrome, laid out like MediaWiki's Vector 2022 skin (which the
// wiki used before it moved into the site): header with logo and search, a
// title with page tabs, a contents sidebar, and a plain footer.
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WIKI_HOME, WIKI_LICENSE, WIKI_NAME, wikiPages, type WikiPageMeta } from "@/content/wiki";

// The wiki's logo, the same icon MediaWiki used.
const Logo = () => <img src="/wiki-assets/icon.png" alt="" width={50} height={50} className="olw-logo-mark" />;

export const WikiSearch = ({ autoFocus = false }: { autoFocus?: boolean }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const pages = useMemo(() => wikiPages.filter((p) => p.kind !== "category"), []);
  const go = (e: FormEvent) => {
    e.preventDefault();
    const needle = q.trim().toLowerCase();
    if (!needle) return;
    const name = (p: WikiPageMeta) => (p.displayTitle ?? p.title).toLowerCase();
    const hit =
      pages.find((p) => name(p) === needle) ??
      pages.find((p) => name(p).startsWith(needle)) ??
      pages.find((p) => name(p).includes(needle)) ??
      pages.find((p) => p.lead.toLowerCase().includes(needle));
    if (hit) navigate(hit.path);
  };
  return (
    <form role="search" onSubmit={go} className="olw-search">
      <label className="olw-search-field">
        <Search className="olw-search-icon" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          list="olw-titles"
          placeholder="Search the wiki"
          aria-label={`Search ${WIKI_NAME}`}
          autoFocus={autoFocus}
        />
      </label>
      <datalist id="olw-titles">
        {pages.map((p) => (
          <option key={p.key} value={p.displayTitle ?? p.title} />
        ))}
      </datalist>
      <button type="submit">Search</button>
    </form>
  );
};

const MAIN_MENU: [string, string][] = [
  ["Main page", WIKI_HOME],
  ["All articles", "/wiki/Main_Page#all-articles"],
  ["Categories", "/wiki/Main_Page#categories"],
  ["Glossary", "/wiki/Project:Glossary"],
  ["About the wiki", "/wiki/Project:About"],
  ["Style guide", "/wiki/Project:Style_guide"],
];

const MainMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  return (
    <div className="olw-menu" ref={ref}>
      <button type="button" aria-label="Main menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Menu aria-hidden />
      </button>
      {open && (
        <nav className="olw-menu-panel" aria-label="Main menu">
          <div className="olw-menu-heading">Navigation</div>
          <ul>
            {MAIN_MENU.map(([label, to]) => (
              <li key={label}>
                <Link to={to} onClick={() => setOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="olw-menu-heading">Open Lakehouse</div>
          <ul>
            <li><Link to="/">openlakehouse.io</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/learn">Learn</Link></li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export type Tab = { label: string; href?: string; to?: string; current?: boolean };

/** Title, the page/read tabs and the body area with an optional contents list. */
export const WikiShell = ({
  title,
  tabsLeft = [],
  tabsRight = [],
  contents,
  footer,
  children,
}: {
  title?: ReactNode;
  tabsLeft?: Tab[];
  tabsRight?: Tab[];
  contents?: { depth: number; text: string; id: string }[];
  footer?: ReactNode;
  children: ReactNode;
}) => (
  <div className="olw">
    <header className="olw-header">
      <MainMenu />
      <Link to={WIKI_HOME} className="olw-logo">
        <Logo />
        <span>{WIKI_NAME}</span>
      </Link>
      <WikiSearch />
      <div className="olw-header-right">
        <Link to="/">openlakehouse.io</Link>
        <ThemeToggle />
      </div>
    </header>
    <div className={`olw-page ${contents && contents.length ? "has-toc" : ""}`}>
      {contents && contents.length > 0 && (
        <nav className="olw-toc" aria-label="Contents">
          <div className="olw-toc-title">Contents</div>
          <ul>
            <li>
              <a href="#top" className="olw-toc-top">
                Beginning
              </a>
            </li>
            {contents.map((h) => (
              <li key={h.id} className={h.depth === 3 ? "olw-toc-sub" : undefined}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <main className="olw-main" id="top">
        {title && (
          <>
            <h1 className="olw-title">{title}</h1>
            <div className="olw-tabs">
              <ul>
                {tabsLeft.map((t) => (
                  <TabItem key={t.label} t={t} />
                ))}
              </ul>
              <ul>
                {tabsRight.map((t) => (
                  <TabItem key={t.label} t={t} />
                ))}
              </ul>
            </div>
          </>
        )}
        {children}
        <footer className="olw-footer">
          {footer}
          <p>
            Content is available under <a href={WIKI_LICENSE.url}>Creative Commons Attribution-ShareAlike 4.0</a> unless
            otherwise noted.
          </p>
          <p className="olw-footer-links">
            <Link to="/wiki/Project:About">About the {WIKI_NAME}</Link>
            <Link to="/wiki/Project:Style_guide">Style guide</Link>
            <Link to="/">openlakehouse.io</Link>
          </p>
        </footer>
      </main>
    </div>
  </div>
);

const TabItem = ({ t }: { t: Tab }) => (
  <li className={t.current ? "is-current" : undefined}>
    {t.to ? <Link to={t.to}>{t.label}</Link> : t.href ? <a href={t.href}>{t.label}</a> : <span>{t.label}</span>}
  </li>
);
