import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { canonicalUrl } from "@/lib/seo";
import { getConcept } from "@/data/concepts";

const LineageFlow = lazy(() => import("@/components/concepts/LineageFlow"));
const EngineInternalsFlow = lazy(() => import("@/components/concepts/EngineInternalsFlow"));

const TITLE = "Lineage & ABAC";
const TAGLINE = "From provenance to policy";
const DESCRIPTION =
  "How an open lakehouse tracks where data came from, discovers what's sensitive, and propagates that knowledge into attribute-based access decisions — all on OpenLineage. Engines emit lineage, analysis services raise findings, the backend propagates classifications, and the catalog turns them into ABAC policy.";

const concept = getConcept("lineage")!;

// Each narrative chapter is a sequence of beats, one per diagram step. As the
// reader scrolls, each beat materializes as a bullet and the diagram locks to
// that step.
type Beat = { step: number; text: string };

const beatsBySlug: Record<string, Beat[]> = {
  "event-emission": [
    {
      step: 1,
      text: "Instrumented at planning time, the engine emits OpenLineage run events — table- and column-level lineage for every query — and the lineage service appends them to the event log. Lineage never blocks the query, and any OpenLineage producer speaks the same wire format.",
    },
  ],
  "data-discovery": [
    {
      step: 2,
      text: "A separate analysis service reads the same data, profiling and classifying columns to discover what's sensitive — decoupled from the engine.",
    },
    {
      step: 3,
      text: "On a hit it raises a finding as an ordinary OpenLineage event tagging the field — appended to the very same log, with no bespoke API. The scanner asserts facts; it never enforces.",
    },
  ],
  propagation: [
    {
      step: 4,
      text: "Backend processing reads the append-only log — the rebuildable source of truth for everything downstream.",
    },
    {
      step: 5,
      text: "It folds events into the lineage graph, building column-level edges and propagating tags like PII to every field they reach. Propagation is a graph traversal, and the tag name is just a convention.",
    },
  ],
  "abac-policy": [
    {
      step: 6,
      text: "A catalog asks the graph where a tag lands downstream — which fields, in which datasets, inherit the sensitivity.",
    },
    {
      step: 7,
      text: "It turns those attributes into an attribute-based access decision — mask, deny, or allow — before the query runs. Lineage is the data plane; the catalog owns the control plane.",
    },
  ],
};

// Each chapter maps to the diagram step(s) it explains.
const chapterSteps: Record<string, number[]> = {
  "event-emission": [1],
  "data-discovery": [2, 3],
  propagation: [4, 5],
  "abac-policy": [6, 7],
};

const stepToSlug: Record<number, string> = {
  1: "event-emission",
  2: "data-discovery",
  3: "data-discovery",
  4: "propagation",
  5: "propagation",
  6: "abac-policy",
  7: "abac-policy",
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
};

const techArticleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: `${TITLE} — ${TAGLINE}`,
  description: DESCRIPTION,
  url: canonicalUrl("/concepts/lineage"),
  about: concept.approaches.map((a) => ({ "@type": "Thing", name: a.title })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "Concepts", item: canonicalUrl("/concepts") },
    { "@type": "ListItem", position: 3, name: "Lineage & ABAC", item: canonicalUrl("/concepts/lineage") },
  ],
};

const Lineage = () => {
  const isDesktop = useIsDesktop();
  const [activeStep, setActiveStep] = useState(1);
  const stepRefs = useRef<Record<number, HTMLElement | null>>({});

  // Desktop scrollytelling: a thin band at the viewport center detects which
  // per-step sentinel we're on and advances the active step; the diagram and
  // the sticky chapter cards follow it. On smaller screens the diagram simply
  // auto-cycles and the cards read top-to-bottom.
  useEffect(() => {
    if (!isDesktop) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            const n = Number((e.target as HTMLElement).dataset.step);
            if (n) setActiveStep(n);
          }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    Object.values(stepRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isDesktop]);

  const activeSlug = stepToSlug[activeStep];
  const activeSteps = useMemo(() => (isDesktop ? [activeStep] : undefined), [isDesktop, activeStep]);
  const scrollToStep = (n: number) =>
    stepRefs.current[n]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
  <div className="min-h-screen flex flex-col">
    <Seo
      title={`${TITLE} — ${TAGLINE}`}
      description={DESCRIPTION}
      path="/concepts/lineage"
      type="article"
      jsonLd={[techArticleLd, breadcrumbLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-brand-gradient text-primary-foreground">
        <div className="container py-20 md:py-28">
          <Link to="/concepts" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Concepts
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Concept</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">{TITLE}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-3xl">
            Lineage is more than a diagram of pipelines — it is the substrate for governance. Track where data comes
            from, discover what's sensitive, propagate that knowledge through every transformation, and let the catalog
            turn it into access decisions.
          </p>
        </div>
      </section>

      {/* On-page nav across the narrative chapters */}
      <nav className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex gap-1 overflow-x-auto py-3 text-sm">
          {concept.approaches.map((a) => (
            <a
              key={a.slug}
              href={`#${a.slug}`}
              className="whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {a.title}
            </a>
          ))}
          <a
            href="#inside-the-engine"
            className="whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            Inside the Engine
          </a>
        </div>
      </nav>

      {/* The end-to-end interactive flow, linked to the narrative chapters */}
      <section className="container py-16 md:py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">The end-to-end flow</p>
        <h2 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight">One event bus, from query to policy</h2>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Engine runs and analysis findings arrive at the lineage service as the same OpenLineage events. The backend
          folds them into a graph, propagates classifications downstream, and the catalog reads those attributes to make
          an access decision. Scroll the chapters — the diagram follows along — or hover any step or node to explore.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start">
          {/* The diagram tracks the chapter currently in view */}
          <div className="lg:sticky lg:top-28">
            <Suspense
              fallback={<div className="h-[420px] rounded-2xl border border-border bg-card/40 animate-pulse" />}
            >
              <LineageFlow activeSteps={activeSteps} onStepSelect={scrollToStep} />
            </Suspense>
          </div>

          {/* Narrative chapters: sticky cards whose steps materialize on scroll */}
          <div className="flex flex-col gap-6 lg:gap-0">
            {concept.approaches.map((a) => {
              const Icon = a.icon;
              const beats = beatsBySlug[a.slug] ?? [];
              const stepNums = chapterSteps[a.slug] ?? [];
              const isActive = activeSlug === a.slug;
              return (
                <section key={a.slug} id={a.slug} className="relative scroll-mt-32">
                  <div
                    className={`rounded-2xl border p-6 transition-all duration-500 lg:sticky lg:top-28 ${
                      isDesktop
                        ? isActive
                          ? "border-primary/50 bg-primary/[0.04] shadow-card"
                          : "border-border bg-card/40 opacity-50"
                        : "border-border bg-card/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-widest text-primary">
                          {stepNums.length > 1
                            ? `Steps ${stepNums[0]}\u2013${stepNums[stepNums.length - 1]}`
                            : `Step ${stepNums[0]}`}
                        </p>
                        <h3 className="text-xl font-bold tracking-tight">{a.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{a.summary}</p>

                    <ul className="mt-5 space-y-4">
                      {beats.map((b) => {
                        const state = !isDesktop
                          ? "done"
                          : b.step < activeStep
                            ? "done"
                            : b.step === activeStep
                              ? "active"
                              : "upcoming";
                        return (
                          <li
                            key={b.step}
                            className={`flex gap-3 text-[15px] leading-relaxed transition-all duration-500 ${
                              state === "upcoming" ? "lg:opacity-30 lg:blur-[1px]" : "opacity-100 blur-0"
                            }`}
                          >
                            <span
                              className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                                state === "active"
                                  ? "bg-primary text-primary-foreground scale-110"
                                  : state === "done"
                                    ? "bg-primary/70 text-primary-foreground"
                                    : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {b.step}
                            </span>
                            <span className={state === "active" ? "text-foreground" : "text-muted-foreground"}>
                              {b.text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Scroll sentinels (desktop): dwell space that drives the active step. */}
                  <div aria-hidden className="hidden lg:block">
                    {beats.map((b) => (
                      <div
                        key={b.step}
                        data-step={b.step}
                        ref={(el) => {
                          stepRefs.current[b.step] = el;
                        }}
                        className="h-[65vh]"
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      {/* Inside the engine: where governance attaches to the optimized plan */}
      <section id="inside-the-engine" className="container scroll-mt-32 border-t border-border py-16 md:py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Inside the engine</p>
        <h2 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight">Where it happens: the query plan</h2>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Zoom into the query engine from the diagram above. Before a query runs, the engine turns it into a plan — and
          the plan is the moment of truth for governance. It carries the exact context of what the query touches: the
          tables, columns, and filters needed to authorize the operation, emit lineage, and record telemetry. In
          practice this is the <em className="not-italic font-medium text-foreground">optimized</em> logical plan, with
          predicates pushed down so it reflects the minimal set of work the query will actually perform.
        </p>

        <div className="mt-10">
          <Suspense
            fallback={<div className="h-[420px] rounded-2xl border border-border bg-card/40 animate-pulse" />}
          >
            <EngineInternalsFlow />
          </Suspense>
        </div>

        <ul className="mt-10 max-w-3xl space-y-3">
          <li className="flex gap-3 text-[15px] leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>
              Evaluating ABAC policies needs rich context on the operation — which is exactly what analyzing the query
              plan inside the engine provides.
            </span>
          </li>
          <li className="flex gap-3 text-[15px] leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>
              This is a{" "}
              <Link to="/concepts/data-access#trusted-compute" className="font-medium text-primary hover:underline">
                trusted compute
              </Link>{" "}
              context: the platform ensures queries execute through properly integrated and configured clients.
            </span>
          </li>
          <li className="flex gap-3 text-[15px] leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>
              Emitting proper lineage and telemetry from this seam creates the audit trail required in regulated
              contexts.
            </span>
          </li>
        </ul>

        <Link
          to="/concepts/data-access#trusted-compute"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
        >
          Explore Trusted Compute <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
    <SiteFooter />
  </div>
  );
};

export default Lineage;
