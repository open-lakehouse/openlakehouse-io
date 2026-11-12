import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Search, Users } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { buttonVariants } from "@/components/ui/button";
import { authors, categories, formatCategory, posts, postsByCategory, type Post } from "@/content/content";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 8;
const SIDE_COUNT = 5;

const categoryCounts = Object.fromEntries(categories.map((c) => [c, postsByCategory(c).length]));

const searchText = (p: Post) =>
  [p.title, p.subtitle, p.excerpt, formatCategory(p.category), ...p.tags, ...p.authorSlugs.map((a) => authors[a]?.name)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const chipClass = (active: boolean) =>
  cn(
    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
    active
      ? "border-primary/40 bg-secondary text-secondary-foreground"
      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
  );

/**
 * The blog index (`/blog`) and category pages (`/blog/category/:category`).
 * All posts: a featured lead with a side stack, then the rest as a paged list.
 * A category or a search shows every match in the list instead. Paged-out rows
 * stay in the DOM, hidden, so every post link remains crawlable.
 */
export const BlogIndex = ({ category }: { category?: string }) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const latestRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const base = category ? postsByCategory(category) : posts;
  const q = query.trim().toLowerCase();
  const showFeatured = !category && !q;
  const [lead, ...others] = posts;
  const side = others.slice(0, SIDE_COUNT);
  const list = showFeatured ? others.slice(SIDE_COUNT) : q ? base.filter((p) => searchText(p).includes(q)) : base;

  const totalPages = Math.max(1, Math.ceil(list.length / POSTS_PER_PAGE));
  const current = Math.min(page, totalPages);
  const firstOnPage = (current - 1) * POSTS_PER_PAGE;

  const goToPage = (n: number) => {
    setPage(n);
    latestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const label = category ? formatCategory(category) : undefined;

  return (
    <section className="relative isolate overflow-hidden pb-24 pt-14 md:pt-20">
      <div aria-hidden="true" className="bg-aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]" />
      <div className="container">
        <header className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div className="flex max-w-2xl flex-col gap-5">
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <span className="text-primary">Blog</span>
              <span aria-hidden="true" className="h-px w-8 bg-border" />
              <span>{label ?? "Open Lakehouse"}</span>
            </p>
            <h1 className="text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              {label ?? "Notes from the Open Lakehouse"}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {label
                ? `Releases, tutorials, and deep dives on ${label} from maintainers and practitioners across the open data ecosystem.`
                : "Long-form posts on formats, engines, governance, and agentic AI — written by practitioners and maintainers across the open data ecosystem."}
            </p>
          </div>
          <label className="relative block">
            <span className="sr-only">Search the blog</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={label ? `Search ${label} posts…` : "Search the blog…"}
              className="h-11 w-full rounded-lg border border-input bg-card/80 pl-10 pr-14 font-mono text-sm shadow-sm backdrop-blur placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground sm:block">
              ⌘K
            </kbd>
          </label>
        </header>

        <nav aria-label="Categories" className="mb-12 flex flex-wrap gap-2 border-b border-border pb-6">
          <Link to="/blog" className={chipClass(!category)} aria-current={!category ? "page" : undefined}>
            All <span className="font-mono text-xs opacity-70">{posts.length}</span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              to={`/blog/category/${c}`}
              className={chipClass(category === c)}
              aria-current={category === c ? "page" : undefined}
            >
              {formatCategory(c)} <span className="font-mono text-xs opacity-70">{categoryCounts[c]}</span>
            </Link>
          ))}
        </nav>

        {showFeatured && lead && (
          <>
            <section aria-label="Featured posts" className="mb-14 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch">
              <BlogCard post={lead} variant="featured" />
              {side.length > 0 && (
                <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                  {side.map((p) => (
                    <BlogCard key={`${p.category}/${p.slug}`} post={p} variant="side" />
                  ))}
                </div>
              )}
            </section>

            <aside className="bg-cta-glow mb-16 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border p-8">
              <div className="max-w-xl">
                <h2 className="mb-2 text-2xl font-semibold tracking-tight">Stay in the loop</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Meet the people building the open lakehouse at livestreams, meetups, and community events, and
                  find every release note and deep dive here first.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://luma.com/openlakehouseai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <Calendar /> Upcoming events
                </a>
                <Link to="/community" className={buttonVariants()}>
                  <Users /> Join the community
                </Link>
              </div>
            </aside>
          </>
        )}

        <section ref={latestRef} aria-labelledby="latest-heading" className="scroll-mt-24">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h2 id="latest-heading" className="text-2xl font-semibold tracking-tight">
              {q ? "Results" : label ? `All ${label} posts` : "Latest"}
            </h2>
            <p className="font-mono text-[0.8125rem] text-muted-foreground">
              {list.length} {list.length === 1 ? "post" : "posts"}
            </p>
          </div>

          <div>
            {list.map((p, i) => (
              <BlogCard
                key={`${p.category}/${p.slug}`}
                post={p}
                variant="row"
                hidden={i < firstOnPage || i >= firstOnPage + POSTS_PER_PAGE}
              />
            ))}
          </div>

          {list.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              {q ? `No posts match “${query.trim()}”.` : "No posts here yet."}
            </p>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(current - 1)}
                disabled={current === 1}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                aria-label="Previous page"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === current ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: n === current ? "secondary" : "outline", size: "sm" }),
                    "min-w-9 font-mono",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(current + 1)}
                disabled={current === totalPages}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                aria-label="Next page"
              >
                →
              </button>
            </nav>
          )}
        </section>
      </div>
    </section>
  );
};
