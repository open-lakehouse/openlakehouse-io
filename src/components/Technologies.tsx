import { ArrowRight, BookOpen, Bot, Cpu, Layers, ShieldCheck, Waves, Workflow, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PodcastSidebar } from "@/components/PodcastSidebar";
import { cn } from "@/lib/utils";

type Category = {
  slug: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  items: string[];
};

type Floor = Category & { tone: string };

const roof: Category = {
  slug: "agentic",
  title: "Agentic",
  tagline: "AI agents and ML lifecycles running on open, governed data.",
  icon: Bot,
  items: ["MLflow", "Omnigent"],
};

// Top to bottom. Each tone picks up where the one above ends, so the accent
// bars read as one continuous Green → Blue ramp down into the lake.
const floors: Floor[] = [
  {
    slug: "compute-engines",
    title: "Compute Engines",
    tagline: "Distributed engines that read open tables from any storage.",
    icon: Cpu,
    items: ["Apache Spark", "Apache Flink", "DataFusion"],
    tone: "from-green-600 to-green-500",
  },
  {
    slug: "catalogs",
    title: "Catalogs",
    tagline: "Shared metadata, discovery, and access for every engine.",
    icon: BookOpen,
    items: ["Unity Catalog", "Apache Polaris", "Lakekeeper"],
    tone: "from-green-500 to-blue-500",
  },
  {
    slug: "lakehouse-formats",
    title: "Lakehouse Formats",
    tagline: "ACID tables, time travel, and schema evolution on object storage.",
    icon: Layers,
    items: ["Apache Iceberg", "Delta Lake", "Apache Hudi"],
    tone: "from-blue-500 to-blue-600",
  },
];

const pillars: Category[] = [
  {
    slug: "orchestration",
    title: "Orchestration",
    tagline: "Schedules and coordinates pipelines across the stack.",
    icon: Workflow,
    items: ["Apache Airflow", "Temporal"],
  },
  {
    slug: "open-governance",
    title: "Open Governance",
    tagline: "Lineage and policy that travel with the data.",
    icon: ShieldCheck,
    items: ["OpenLineage", "Policies", "ABAC"],
  },
];

// Streaks sit in the foundation's vertical padding so they never underline text.
const LAKE_STREAKS = [
  { left: "4%", edge: "top", width: "2.5rem", delay: "0s" },
  { left: "15%", edge: "bottom", width: "1.5rem", delay: "-2.1s" },
  { left: "31%", edge: "top", width: "3rem", delay: "-4.3s" },
  { left: "47%", edge: "bottom", width: "2rem", delay: "-1.2s" },
  { left: "62%", edge: "top", width: "1.75rem", delay: "-5.6s" },
  { left: "76%", edge: "bottom", width: "3rem", delay: "-3.4s" },
  { left: "90%", edge: "top", width: "1.5rem", delay: "-0.7s" },
] as const;

// Shared by every clickable piece of the house. Hovering or focusing one piece
// dims the rest so the active layer stands out.
const tileLink =
  "group relative flex w-full overflow-hidden rounded-xl border border-border bg-card shadow-card transition-[transform,box-shadow,border-color,opacity] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const spotlight =
  "group-has-[a:hover]/house:opacity-70 group-has-[a:focus-visible]/house:opacity-70 hover:!opacity-100 focus-visible:!opacity-100";

// Content stays visible unless it starts below the fold, so crawlers, no-JS
// renders, and deep links to #technologies never see an empty section.
const useInView = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setInView(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, inView] as const;
};

const Reveal = ({
  show,
  delay,
  from = "below",
  className,
  children,
}: {
  show: boolean;
  delay: number;
  from?: "above" | "below";
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "flex",
      show
        ? "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out lg:[transition-delay:var(--reveal-delay)]"
        : cn("motion-safe:opacity-0", from === "above" ? "motion-safe:-translate-y-4" : "motion-safe:translate-y-4"),
      className,
    )}
    style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
  >
    {children}
  </div>
);

const ProjectList = ({ items, className, chipClassName }: { items: string[]; className?: string; chipClassName?: string }) => (
  <ul className={cn("flex flex-wrap gap-1.5", className)}>
    {items.map((item) => (
      <li
        key={item}
        className={cn(
          "whitespace-nowrap rounded-full border border-border bg-background/70 px-2.5 py-0.5 text-xs font-medium text-foreground/80",
          chipClassName,
        )}
      >
        {item}
      </li>
    ))}
  </ul>
);

const HoverArrow = ({ className }: { className?: string }) => (
  <ArrowRight
    aria-hidden="true"
    className={cn(
      "absolute right-4 top-4 h-4 w-4 text-primary opacity-0 -translate-x-1 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
      className,
    )}
  />
);

const RoofTile = ({ slug, title, tagline, icon: Icon, items }: Category) => (
  <Link
    to={`/technologies/${slug}`}
    className={cn(
      "group relative block w-full rounded-xl [--roof-inset:7%] sm:[--roof-inset:12%] transition-[transform,opacity] duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      spotlight,
    )}
  >
    <span
      aria-hidden="true"
      className="clip-roof absolute inset-0 bg-gradient-to-r from-green-800 via-green-700 to-blue-800 transition-[filter] duration-300 group-hover:brightness-110"
    />
    <div className="relative mx-auto flex max-w-lg flex-col items-center px-10 pb-6 pt-7 text-center text-white sm:px-16">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 inline-flex items-center gap-1.5 font-semibold tracking-tight text-white">
        {title}
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 opacity-0 -translate-x-1 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        />
      </h3>
      <p className="mt-1 text-sm text-white/85">{tagline}</p>
      <ProjectList items={items} className="mt-3 justify-center" chipClassName="border-white/30 bg-white/10 text-white" />
    </div>
  </Link>
);

const FloorTile = ({ slug, title, tagline, icon: Icon, items, tone, wide }: Floor & { wide: boolean }) => (
  <Link to={`/technologies/${slug}`} className={cn(tileLink, spotlight, "items-start gap-4 p-4 pl-5 sm:p-5 sm:pl-6")}>
    <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", tone)} />
    <span
      aria-hidden="true"
      className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", tone)}
    >
      <Icon className="h-5 w-5" />
    </span>
    <div className={cn("min-w-0 flex-1 pr-6", wide && "xl:flex xl:items-center xl:justify-between xl:gap-6")}>
      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      </div>
      <ProjectList items={items} className={cn("mt-3", wide && "xl:mt-0 xl:shrink-0 xl:justify-end")} />
    </div>
    <HoverArrow />
  </Link>
);

const PillarTile = ({ slug, title, tagline, icon: Icon, items }: Category) => (
  <Link to={`/technologies/${slug}`} className={cn(tileLink, spotlight, "flex-col p-4 pl-5")}>
    <span aria-hidden="true" className="bg-hatch absolute inset-0 opacity-60" />
    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-green-600 via-blue-500 to-blue-600" />
    <span
      aria-hidden="true"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy-700 text-white dark:bg-navy-600"
    >
      <Icon className="h-5 w-5" />
    </span>
    <p className="relative mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Every layer</p>
    <h3 className="relative mt-1 text-sm font-semibold leading-snug tracking-tight">{title}</h3>
    <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">{tagline}</p>
    <ProjectList items={items} className="relative mt-3" chipClassName="bg-background" />
    <HoverArrow />
  </Link>
);

const Foundation = () => (
  <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-blue-600 to-blue-800 px-5 py-5 text-white shadow-card">
    {LAKE_STREAKS.map((streak) => (
      <span
        key={streak.left}
        aria-hidden="true"
        className="absolute h-0.5 bg-blue-300/40 motion-safe:animate-[lake-streak_7s_ease-in-out_infinite]"
        style={{ left: streak.left, [streak.edge]: "0.5rem", width: streak.width, animationDelay: streak.delay }}
      />
    ))}
    <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25"
        >
          <Waves className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">The foundation</p>
          <p className="font-semibold tracking-tight">Storage you control</p>
        </div>
      </div>
      <p className="text-sm text-white/80">Open files on S3, ADLS, GCS, or on-prem</p>
    </div>
  </div>
);

export const Technologies = () => {
  const isHome = useLocation().pathname === "/";
  const [houseRef, inView] = useInView<HTMLDivElement>();

  return (
    <section id="technologies" className="container py-20 md:py-28">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-medium text-primary uppercase tracking-widest">The stack</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Open Lakehouse Technologies</h2>
        <p className="mt-4 text-muted-foreground text-lg">The interoperable building blocks of a vendor-neutral data platform.</p>
      </div>

      <div className={isHome ? "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8" : undefined}>
        {isHome && <PodcastSidebar className="lg:order-last" />}

        {/* Foundation first, then each floor upward, the walls, and finally the roof. */}
        <div
          ref={houseRef}
          className="group/house grid grid-cols-2 gap-3 lg:grid-cols-[9rem_minmax(0,1fr)_9rem] xl:grid-cols-[10rem_minmax(0,1fr)_10rem]"
        >
          <Reveal show={inView} delay={480} from="above" className="col-span-2 -mx-2 sm:-mx-3 lg:col-span-3">
            <RoofTile {...roof} />
          </Reveal>

          <div className="col-span-2 flex flex-col gap-3 lg:col-span-1 lg:col-start-2 lg:row-start-2">
            {floors.map((floor, i) => (
              <Reveal
                key={floor.slug}
                show={inView}
                delay={(floors.length - i) * 90}
                className="group/floor relative flex-1 lg:before:absolute lg:before:right-full lg:before:top-1/2 lg:before:h-0.5 lg:before:w-3 lg:before:bg-border lg:after:absolute lg:after:left-full lg:after:top-1/2 lg:after:h-0.5 lg:after:w-3 lg:after:bg-border lg:before:transition-colors lg:after:transition-colors lg:group-hover/floor:before:bg-primary lg:group-hover/floor:after:bg-primary"
              >
                <FloorTile {...floor} wide={!isHome} />
              </Reveal>
            ))}
          </div>

          <Reveal show={inView} delay={0} className="col-span-2 lg:col-span-3 lg:row-start-3">
            <Foundation />
          </Reveal>

          {pillars.map((pillar, i) => (
            <Reveal
              key={pillar.slug}
              show={inView}
              delay={360}
              className={i === 0 ? "lg:col-start-1 lg:row-start-2" : "lg:col-start-3 lg:row-start-2"}
            >
              <PillarTile {...pillar} />
            </Reveal>
          ))}
        </div>
      </div>

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
