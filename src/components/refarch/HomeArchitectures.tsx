import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PATTERNS, PATTERN_GROUPS, groupById, nodeName, patternBySlug, patternPath, slotById } from "@/content/reference-architectures";

/** Homepage feature: the reference architectures, led by batch and streaming. */
export const HomeArchitectures = () => {
  const preview = patternBySlug("agentic-lakehouse")!;
  const order = ["ai", "access", "execution", "data", "governance", "operations"];
  const cols = order
    .map((g) => ({ l: g, n: preview.nodes.filter((x) => slotById(x.slot).group === g && !x.detail) }))
    .filter((c) => c.n.length);
  return (
    <section id="reference-architectures" aria-labelledby="home-refarch-heading" className="relative overflow-hidden border-y border-border/40 bg-hero-gradient text-white">
      <div aria-hidden className="refarch-grid-bg pointer-events-none absolute inset-0 opacity-20" />
      <div className="container relative py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-green-300">Reference architectures</p>
            <h2 id="home-refarch-heading" className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Data engineering reference architectures you can run.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Interactive, open source blueprints for the agentic lakehouse, batch and streaming pipelines, each backed by a public repo with pinned versions. Swap any box, pick your industry, export the result.
            </p>
          </div>
          <Link to="/reference-architectures" className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-3 font-semibold text-navy-900 hover:bg-green-400">
            Explore the architectures <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Static preview of one board */}
        <Link to={patternPath(preview.slug)} className="mt-10 block rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur transition-colors hover:border-green-400/60">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-300">{preview.title}</p>
          <ol className="flex gap-2 overflow-x-auto pb-1">
            {cols.map(({ l, n }, i) => (
              <li key={l} className="flex min-w-[120px] flex-1 items-stretch gap-2">
                <div className="flex-1">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">{groupById(l).name}</p>
                  {n.map((x) => (
                    <p key={nodeName(x) + x.slot} className="mb-1.5 rounded-md border border-white/15 bg-navy-900/60 px-2 py-1.5 text-xs font-medium">
                      <span className="block text-[9px] uppercase tracking-wider text-white/50">{slotById(x.slot).short}</span>
                      {nodeName(x)}
                    </p>
                  ))}
                </div>
                {i < cols.length - 1 && <span aria-hidden className="refarch-flow-x mt-8 h-[2px] w-3 shrink-0" />}
              </li>
            ))}
          </ol>
        </Link>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PATTERN_GROUPS.slice(0, 3).map((g) => (
            <div key={g.category}>
              <h3 className="font-semibold text-white">{g.category}</h3>
              <p className="mt-1 text-sm text-white/65">{g.blurb}</p>
              <ul className="mt-3 space-y-1.5">
                {PATTERNS.filter((p) => p.category === g.category).map((p) => (
                  <li key={p.slug}>
                    <Link to={patternPath(p.slug)} className="inline-flex items-center gap-1 text-sm font-medium text-green-300 hover:text-green-200">
                      {p.title} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
