import { useEffect, useState } from "react";
import logoUrl from "@/assets/bundled/olai-logo-white.png";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight, Cpu, BookOpen, Bot, Layers, ShieldCheck, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { concepts } from "@/data/concepts";

type TechItem = { name: string; url: string };
type TechCategory = {
  slug: string;
  title: string;
  icon: typeof Cpu;
  items: TechItem[];
};

const techCategories: TechCategory[] = [
  {
    slug: "compute-engines",
    title: "Compute Engines",
    icon: Cpu,
    items: [
      { name: "Apache Spark", url: "https://spark.apache.org" },
      { name: "Apache Flink", url: "https://flink.apache.org" },
      { name: "DataFusion", url: "https://datafusion.apache.org" },
    ],
  },
  {
    slug: "catalogs",
    title: "Catalogs",
    icon: BookOpen,
    items: [
      { name: "Unity Catalog", url: "https://unitycatalog.io" },
      { name: "Apache Polaris", url: "https://polaris.apache.org" },
      { name: "Lakekeeper", url: "https://docs.lakekeeper.io/" },
    ],
  },
  {
    slug: "agentic",
    title: "Agentic",
    icon: Bot,
    items: [
      { name: "MLflow", url: "https://mlflow.org" },
      { name: "Omnigent", url: "https://omnigent.ai/" },
    ],
  },
  {
    slug: "lakehouse-formats",
    title: "Lakehouse Table Formats",
    icon: Layers,
    items: [
      { name: "Apache Iceberg", url: "https://iceberg.apache.org" },
      { name: "Delta Lake", url: "https://delta.io" },
      { name: "Apache Hudi", url: "https://hudi.apache.org" },
    ],
  },
  {
    slug: "orchestration",
    title: "Orchestration",
    icon: Workflow,
    items: [
      { name: "Apache Airflow", url: "https://airflow.apache.org" },
      { name: "Temporal", url: "https://temporal.io" },
    ],
  },
  {
    slug: "open-governance",
    title: "Open Governance",
    icon: ShieldCheck,
    items: [
      { name: "OpenLineage", url: "/technologies/open-governance#open-lineage" },
      { name: "Policies", url: "/technologies/open-governance#open-policies" },
      { name: "ABAC", url: "/technologies/open-governance" },
    ],
  },
];

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setExploreOpen(false);
    setMobileExploreOpen(false);
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
  const bucketHeaderClass =
    "group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary";

  const LearnLink = ({ className, mobile }: { className: string; mobile?: boolean }) => (
    <Link to="/learn" className={className} onClick={() => mobile && setOpen(false)}>
      Learn
    </Link>
  );

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/40"
      onMouseLeave={() => setExploreOpen(false)}
    >
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
          <div className="relative" onMouseEnter={() => setExploreOpen(true)}>
            <button
              type="button"
              onClick={() => setExploreOpen((v) => !v)}
              className={cn(desktopLinkClass, "inline-flex items-center gap-1")}
              aria-haspopup="true"
              aria-expanded={exploreOpen}
            >
              Explore
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", exploreOpen && "rotate-180")}
              />
            </button>
          </div>
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

      {/* Desktop mega menu — Explore (Technologies + Capabilities) */}
      <div
        className={cn(
          "hidden md:block absolute left-0 right-0 top-full overflow-hidden border-border/40 bg-background/90 backdrop-blur-xl transition-[max-height,opacity,border-color] duration-300 ease-out",
          exploreOpen
            ? "max-h-[600px] opacity-100 border-t border-b"
            : "max-h-0 opacity-0 border-t-0 border-b-0 pointer-events-none",
        )}
        onMouseEnter={() => setExploreOpen(true)}
      >
        <div className="container py-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
            {/* Technologies bucket */}
            <div>
              <Link to="/technologies" onClick={() => setExploreOpen(false)} className={bucketHeaderClass}>
                Technologies
                <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1">
                {techCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/technologies/${cat.slug}`}
                    onClick={() => setExploreOpen(false)}
                    className="inline-flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-all hover:text-primary hover:bg-primary/10"
                  >
                    <cat.icon className="h-4 w-4 text-primary/80" />
                    {cat.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Capabilities bucket */}
            <div className="md:border-l md:border-border/60 md:pl-10">
              <Link to="/concepts" onClick={() => setExploreOpen(false)} className={bucketHeaderClass}>
                Concepts
                <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
              <div className="mt-4 space-y-4">
                {concepts.map((cap) => (
                  <div key={cap.slug}>
                    <Link
                      to={`/concepts/${cap.slug}`}
                      onClick={() => setExploreOpen(false)}
                      className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold tracking-tight text-foreground transition-all hover:text-primary hover:bg-primary/10"
                    >
                      <cap.icon className="h-4 w-4 text-primary" />
                      {cap.title}
                    </Link>
                    <ul className="mt-1.5 space-y-0.5 pl-2">
                      {cap.approaches.map((a) => (
                        <li key={a.slug}>
                          <Link
                            to={`/concepts/${cap.slug}#${a.slug}`}
                            onClick={() => setExploreOpen(false)}
                            className="block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/40"
                          >
                            {a.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={cn(
          "md:hidden overflow-y-auto border-t border-border/40 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="container flex flex-col gap-1 py-4">
          {/* Explore (Technologies + Capabilities) */}
          <div>
            <button
              type="button"
              aria-label={mobileExploreOpen ? "Collapse explore" : "Expand explore"}
              aria-expanded={mobileExploreOpen}
              onClick={() => setMobileExploreOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-4 py-4 text-lg font-medium text-foreground/90 hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              Explore
              <ChevronDown
                className={cn("h-5 w-5 transition-transform", mobileExploreOpen && "rotate-180")}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                mobileExploreOpen ? "max-h-[1600px] opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <div className="space-y-4 pb-2 pl-3 pr-1">
                {/* Technologies bucket */}
                <div>
                  <Link
                    to="/technologies"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Technologies
                  </Link>
                  <div className="space-y-1">
                    {techCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/technologies/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground/90 hover:text-foreground hover:bg-accent/40 rounded-md"
                      >
                        <cat.icon className="h-4 w-4 text-primary" />
                        {cat.title}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Capabilities bucket */}
                <div>
                  <Link
                    to="/concepts"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Concepts
                  </Link>
                  <div className="space-y-1">
                    {concepts.map((cap) => (
                      <Link
                        key={cap.slug}
                        to={`/concepts/${cap.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground/90 hover:text-foreground hover:bg-accent/40 rounded-md"
                      >
                        <cap.icon className="h-4 w-4 text-primary" />
                        {cap.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
