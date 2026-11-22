import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Github,
  Link2,
  Printer,
  RotateCcw,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BOARD_LAYERS,
  INDUSTRIES,
  PATTERNS,
  SECTORS,
  applySwaps,
  componentById,
  industryBySlug,
  industryPath,
  layerById,
  nodeName,
  nodesByLayer,
  patternBySlug,
  patternPath,
  patternsForComponent,
  toAiPrompt,
  toJson,
  toMermaid,
  toYaml,
  type Industry,
  type Node,
  type Pattern,
} from "@/content/reference-architectures";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------- URL state ----------
// ?pattern=<slug>&industry=<slug>&view=detailed&swap=3:minio,5:polaris

function parseSwaps(v: string | null): Record<number, string> {
  const out: Record<number, string> = {};
  if (!v) return out;
  for (const part of v.split(",")) {
    const [i, id] = part.split(":");
    const n = Number(i);
    if (Number.isInteger(n) && id) out[n] = id;
  }
  return out;
}
const serializeSwaps = (s: Record<number, string>) =>
  Object.entries(s)
    .map(([i, id]) => `${i}:${id}`)
    .join(",");

type Props = {
  /** Fixed pattern (pattern pages). When omitted, a pattern picker is shown. */
  pattern?: Pattern;
  /** Fixed industry (industry pages). */
  industry?: Industry;
  /** Pattern to show when the URL does not name one. */
  defaultPattern?: string;
  className?: string;
};

export const ArchitectureBoard = ({ pattern: fixedPattern, industry: fixedIndustry, defaultPattern, className }: Props) => {
  const [params, setParams] = useSearchParams();
  const pattern = fixedPattern ?? patternBySlug(params.get("pattern") ?? undefined) ?? patternBySlug(defaultPattern) ?? PATTERNS[0];
  const industry = fixedIndustry ?? industryBySlug(params.get("industry") ?? undefined);
  const detailed = params.get("view") === "detailed";
  const swaps = useMemo(() => parseSwaps(params.get("swap")), [params]);
  const nodes = useMemo(() => applySwaps(pattern, swaps), [pattern, swaps]);
  const [selected, setSelected] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const setSwap = (index: number, id: string | null) => {
    const next = { ...swaps };
    if (id === null || id === pattern.nodes[index].component) delete next[index];
    else next[index] = id;
    update({ swap: serializeSwaps(next) || null });
  };

  const notify = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1800);
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(msg);
    } catch {
      notify("Copy failed");
    }
  };

  const download = (name: string, text: string, type: string) => {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const byLayer = nodesByLayer(nodes, detailed);
  const columns = BOARD_LAYERS.filter((l) => byLayer.has(l) || (l === "sources" && industry));
  const governance = byLayer.get("governance") ?? [];
  const industrySources = industry ? (detailed ? industry.sources : industry.sources.slice(0, 3)) : [];
  const indexOf = (n: Node) => nodes.indexOf(n);
  const sel = selected !== null ? nodes[selected] : null;
  const swapCount = Object.keys(swaps).length;
  const fileBase = `${pattern.slug}${industry ? `-${industry.slug}` : ""}`;

  return (
    <div className={cn("refarch-board not-prose", className)}>
      {/* ---------- Toolbar ---------- */}
      <div className="refarch-noprint mb-4 flex flex-wrap items-center gap-2">
        {!fixedPattern && (
          <label className="relative">
            <span className="sr-only">Architecture</span>
            <select
              value={pattern.slug}
              onChange={(e) => update({ pattern: e.target.value, swap: null })}
              className="h-10 appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PATTERNS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          </label>
        )}
        {!fixedIndustry && (
          <label className="relative">
            <span className="sr-only">Industry lens</span>
            <select
              value={industry?.slug ?? ""}
              onChange={(e) => update({ industry: e.target.value || null })}
              className="h-10 appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No industry lens</option>
              {SECTORS.map((sector) => (
                <optgroup key={sector} label={sector}>
                  {INDUSTRIES.filter((i) => i.sector === sector).map((i) => (
                    <option key={i.slug} value={i.slug}>
                      {i.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          </label>
        )}
        <div role="group" aria-label="View" className="inline-flex h-10 rounded-lg border border-border bg-card p-1 text-sm">
          {[
            { v: false, label: "Simplified" },
            { v: true, label: "Detailed" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={detailed === o.v}
              onClick={() => update({ view: o.v ? "detailed" : null })}
              className={cn(
                "rounded-md px-3 transition-colors",
                detailed === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        {swapCount > 0 && (
          <button
            type="button"
            onClick={() => update({ swap: null })}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-yellow-500/60 bg-yellow-100/60 px-3 text-sm text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset {swapCount} swap{swapCount > 1 ? "s" : ""}
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {flash && (
            <span className="inline-flex items-center gap-1 text-sm text-primary" role="status">
              <Check className="h-4 w-4" /> {flash}
            </span>
          )}
          <button
            type="button"
            onClick={() => copy(window.location.href, "Link copied")}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm hover:border-primary"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Download className="h-4 w-4" /> Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Export what's on screen</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => download(`${fileBase}.yaml`, toYaml(pattern, nodes, industry), "text/yaml")}>
                YAML descriptor
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => download(`${fileBase}.mmd`, toMermaid(pattern, nodes), "text/plain")}>
                Mermaid diagram
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => download(`${fileBase}.json`, JSON.stringify(toJson(pattern, nodes, industry), null, 2), "application/json")}
              >
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => copy(toMermaid(pattern, nodes), "Mermaid copied")}>Copy Mermaid</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => copy(toAiPrompt(pattern, nodes, industry), "Prompt copied")}>
                <Bot className="mr-2 h-4 w-4" /> Copy as AI prompt
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print or save as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ---------- Board ---------- */}
      <div className="refarch-grid-bg relative overflow-hidden rounded-2xl border border-border bg-card/60 p-3 md:p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{pattern.category}</p>
            <h3 className="text-lg font-bold tracking-tight md:text-xl">
              {fixedPattern ? pattern.stackLine : <Link to={patternPath(pattern.slug)} className="hover:text-primary">{pattern.title}</Link>}
            </h3>
          </div>
          {industry && (
            <Link
              to={industryPath(industry.slug)}
              className="rounded-full border border-blue-500/40 bg-blue-100/60 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
            >
              {industry.name} lens
            </Link>
          )}
        </div>

        <ol className="flex flex-col gap-0 lg:flex-row lg:items-stretch">
          {columns.map((layerId, ci) => {
            const layer = layerById(layerId);
            const items = byLayer.get(layerId) ?? [];
            const showIndustry = layerId === "sources" && industry;
            return (
              <li key={layerId} className="flex flex-col lg:min-w-0 lg:flex-1 lg:flex-row">
                <section aria-label={layer.name} className="flex min-w-0 flex-1 flex-col">
                  <h4 className="mb-2 truncate px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" title={layer.question}>
                    {layer.short}
                  </h4>
                  <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col">
                    {showIndustry
                      ? industrySources.map((s) => (
                          <div
                            key={s.name}
                            className="rounded-lg border border-blue-500/40 bg-blue-100/50 p-2 text-left dark:bg-blue-900/30"
                            title={s.delivery}
                          >
                            <p className="text-xs font-semibold leading-snug">{s.name}</p>
                            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">{s.delivery}</p>
                          </div>
                        ))
                      : items.map((n) => <NodeButton key={indexOf(n)} node={n} active={selected === indexOf(n)} swapped={swaps[indexOf(n)] !== undefined} onClick={() => setSelected(indexOf(n))} />)}
                  </div>
                </section>
                {ci < columns.length - 1 && (
                  <div aria-hidden className="flex items-center justify-center py-2 lg:w-4 lg:shrink-0 lg:px-0.5 lg:py-0">
                    <span className="refarch-flow-y block h-5 w-[2px] lg:hidden" />
                    <span className="refarch-flow-x hidden h-[2px] w-full lg:block" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {governance.length > 0 && (
          <section aria-label="Governance, lineage and policy" className="mt-4 rounded-xl border border-dashed border-primary/50 bg-primary/5 p-3">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary">Governance, lineage and policy (cross-cutting)</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {governance.map((n) => (
                <NodeButton key={indexOf(n)} node={n} active={selected === indexOf(n)} swapped={swaps[indexOf(n)] !== undefined} onClick={() => setSelected(indexOf(n))} />
              ))}
            </div>
          </section>
        )}

        <p className="refarch-noprint mt-3 px-1 text-xs text-muted-foreground">
          Select any box for what it is, its version in the reference repo, and the open projects that can replace it.
          <ArrowLeftRight className="mx-1 inline h-3 w-3" /> marks a swappable slot.
        </p>
      </div>

      {/* ---------- Industry use cases on this architecture ---------- */}
      {industry && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">
            {industry.name} use cases
            <span className="font-normal text-muted-foreground"> (highlighted ones run on this architecture)</span>
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {industry.useCases.map((u) => {
              const here = u.pattern === pattern.slug;
              return (
                <li key={u.title} className={cn("rounded-lg border p-3 text-sm", here ? "border-primary bg-primary/5" : "border-border opacity-80")}>
                  <p className="font-medium">{u.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{u.problem}</p>
                  {!here && (
                    <Link
                      to={fixedPattern ? `${patternPath(u.pattern)}?industry=${industry.slug}` : `?pattern=${u.pattern}&industry=${industry.slug}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {patternBySlug(u.pattern)?.title} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ---------- Detail panel ---------- */}
      <Sheet open={sel !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {sel && selected !== null && (
            <NodeDetail
              node={sel}
              original={pattern.nodes[selected]}
              swapped={swaps[selected] !== undefined}
              onSwap={(id) => setSwap(selected, id)}
              currentSlug={pattern.slug}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const NodeButton = ({ node, active, swapped, onClick }: { node: Node; active: boolean; swapped: boolean; onClick: () => void }) => {
  const c = componentById(node.component);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border bg-background p-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_0_18px_hsl(var(--primary)/0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary ring-2 ring-primary/40" : "border-border",
        swapped && "border-yellow-500 bg-yellow-100/40 dark:bg-yellow-900/20",
        !c && "border-dashed bg-muted/40",
      )}
    >
      <span className="flex items-start justify-between gap-1">
        <span className="text-xs font-semibold leading-snug">{nodeName(node)}</span>
        {node.swaps?.length ? <ArrowLeftRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary" aria-label="swappable" /> : null}
      </span>
      {node.version && <span className="mt-1 block truncate font-mono text-[10px] text-primary">{node.version}</span>}
      <span className="mt-0.5 line-clamp-2 block text-[10px] leading-snug text-muted-foreground">{node.role}</span>
    </button>
  );
};

const NodeDetail = ({
  node,
  original,
  swapped,
  onSwap,
  currentSlug,
}: {
  node: Node;
  original: Node;
  swapped: boolean;
  onSwap: (id: string | null) => void;
  currentSlug: string;
}) => {
  const c = componentById(node.component);
  const layer = layerById(node.layer);
  const alternatives = [original.component, ...(original.swaps ?? [])].filter((id): id is string => !!id && id !== node.component);
  const elsewhere = c ? patternsForComponent(c.id).filter((p) => p.slug !== currentSlug) : [];
  return (
    <div className="space-y-6">
      <SheetHeader className="text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{layer.name}</p>
        <SheetTitle className="text-2xl">{nodeName(node)}</SheetTitle>
        <SheetDescription>{c?.blurb ?? node.role}</SheetDescription>
      </SheetHeader>

      <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Role here</dt>
        <dd className="col-span-2">{node.role}</dd>
        {node.version && (
          <>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="col-span-2 font-mono text-xs">{node.version}</dd>
          </>
        )}
        {swapped && (
          <>
            <dt className="text-muted-foreground">Swapped</dt>
            <dd className="col-span-2 text-xs">The reference repo uses {componentById(original.component)?.name}; versions and caveats on this page describe that choice.</dd>
          </>
        )}
        {c?.license && (
          <>
            <dt className="text-muted-foreground">License</dt>
            <dd className="col-span-2">{c.license}</dd>
          </>
        )}
        {c?.steward && (
          <>
            <dt className="text-muted-foreground">Governed by</dt>
            <dd className="col-span-2">{c.steward}</dd>
          </>
        )}
        <dt className="text-muted-foreground">This layer</dt>
        <dd className="col-span-2">{layer.question}</dd>
      </dl>

      {c && (
        <div className="flex flex-wrap gap-2">
          <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:border-primary">
            Website <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {c.repo && (
            <a href={c.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:border-primary">
              <Github className="h-3.5 w-3.5" /> Source
            </a>
          )}
          {c.sitePath && (
            <Link to={c.sitePath} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:border-primary">
              <Link2 className="h-3.5 w-3.5" /> Read more here
            </Link>
          )}
        </div>
      )}

      {alternatives.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Swap this box</p>
          <ul className="space-y-2">
            {alternatives.map((id) => {
              const alt = componentById(id)!;
              const isOriginal = id === original.component;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onSwap(isOriginal ? null : id)}
                    className="w-full rounded-lg border border-border p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-medium">{alt.name}</span>
                      <span className="text-xs text-muted-foreground">{isOriginal ? "Back to the reference choice" : alt.license ?? ""}</span>
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{alt.blurb}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            A swap shows a project that speaks the same interface. It is not a tested configuration; check the project's docs for feature parity.
          </p>
        </div>
      )}

      {elsewhere.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Also in these architectures</p>
          <ul className="space-y-1">
            {elsewhere.map((p) => (
              <li key={p.slug}>
                <Link to={patternPath(p.slug)} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  {p.title} <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
