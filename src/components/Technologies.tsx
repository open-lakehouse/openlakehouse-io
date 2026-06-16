import { ArrowRight, ChevronLeft, ChevronRight, Cpu, BookOpen, Bot, Layers, ShieldCheck, Workflow } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useState, useEffect } from "react";

const categories = [
  { slug: "compute-engines", title: "Compute Engines", icon: Cpu, items: ["Apache Spark", "Apache Flink", "DataFusion"] },
  { slug: "catalogs", title: "Catalogs", icon: BookOpen, items: ["Unity Catalog", "Apache Polaris", "Lakekeeper"] },
  { slug: "agentic", title: "Agentic", icon: Bot, items: ["MLflow", "Omnigent"] },
  { slug: "lakehouse-formats", title: "Lakehouse Formats", icon: Layers, items: ["Apache Iceberg", "Delta Lake", "Apache Hudi"] },
  { slug: "orchestration", title: "Orchestration", icon: Workflow, items: ["Apache Airflow", "Temporal"] },
  { slug: "open-governance", title: "Open Governance", icon: ShieldCheck, items: ["OpenLineage", "Policies", "ABAC"] },
];

type Category = (typeof categories)[number];

const CategoryCard = ({ slug, title, icon: Icon, items }: Category) => (
  <Link
    to={`/technologies/${slug}`}
    className="group relative bg-card hover:bg-secondary/60 transition-colors p-6 flex flex-col min-h-[220px]"
  >
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground shadow-glow"
        style={{
          background:
            "linear-gradient(180deg, hsl(296 60% 32%) 0%, hsl(296 72% 60%) 33%, hsl(330 85% 70%) 66%, hsl(330 70% 42%) 100%)",
        }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-semibold tracking-tight">{title}</h3>
    </div>
    <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
      {items.map((i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary/60" />
          {i}
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-6 overflow-hidden h-7">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
        Read more <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </div>
  </Link>
);

export const Technologies = () => {
  const isHome = useLocation().pathname === "/";
  const isMobile = useIsMobile();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !isMobile) return;
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? card.getBoundingClientRect().width + 16 : 1;
      setActiveIdx(Math.round(el.scrollLeft / step));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  return (
    <section id="technologies" className="container py-20 md:py-28">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-medium text-primary uppercase tracking-widest">The stack</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Open Lakehouse Technologies</h2>
        <p className="mt-4 text-muted-foreground text-lg">The interoperable building blocks of a vendor-neutral data platform.</p>
      </div>

      {isMobile ? (
        <div>
          <div
            ref={scrollerRef}
            className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Technology categories carousel"
          >
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="snap-start shrink-0 w-[85%] rounded-2xl border border-border bg-card shadow-card overflow-hidden"
              >
                <CategoryCard {...cat} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByCard(-1)}
              disabled={activeIdx === 0}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {categories.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === activeIdx ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByCard(1)}
              disabled={activeIdx >= categories.length - 1}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-card border border-border">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} {...cat} />
          ))}
        </div>
      )}

      {isHome && (
        <div className="mt-10 flex justify-center">
          <Link
            to="/technologies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            Explore all technologies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
};
