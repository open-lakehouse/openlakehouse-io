import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeftRight, ArrowRight, Bot, Check, ChevronDown, Download, ExternalLink, Github, Link2, Printer, RotateCcw, Share2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CORE_SLOTS,
  INDUSTRIES,
  PATTERNS,
  PLATFORM_BANDS,
  PLATFORM_GROUPS,
  SECTORS,
  TEAMS,
  applySwaps,
  componentById,
  groupById,
  industryBySlug,
  industryPath,
  nodeName,
  nodesBySlot,
  patternBySlug,
  patternPath,
  slotById,
  slotsInGroup,
  teamsForNodes,
  toAiPrompt,
  toJson,
  toMermaid,
  toYaml,
  type Industry,
  type Node,
  type Pattern,
  type Slot,
  type Team,
} from "@/content/reference-architectures";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

type Selection = { kind: "slot"; id: string } | { kind: "team"; id: string } | null;

type Props = {
  pattern?: Pattern;
  industry?: Industry;
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
  const [selected, setSelected] = useState<Selection>(null);
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

  const bySlot = nodesBySlot(nodes, detailed);
  const usedAll = new Set(nodes.map((n) => n.slot));
  const teams = teamsForNodes(nodes);
  const swapCount = Object.keys(swaps).length;
  const fileBase = `${pattern.slug}${industry ? `-${industry.slug}` : ""}`;
  const visible = (sl: Slot) => detailed || bySlot.has(sl.id) || CORE_SLOTS.includes(sl.id);
  const openSlot = (id: string) => setSelected({ kind: "slot", id });
  // A side zone with nothing lit still shows its first capability, dimmed, so
  // the board never has an empty column.
  const zoneSlots = (group: string) => {
    const all = slotsInGroup(group);
    const shown = all.filter(visible);
    return shown.length ? shown : all.slice(0, 1);
  };

  const tile = (sl: Slot) => (
    <SlotTile key={sl.id} slot={sl} nodes={bySlot.get(sl.id) ?? []} swapped={(bySlot.get(sl.id) ?? []).some((n) => swaps[nodes.indexOf(n)] !== undefined)} active={selected?.kind === "slot" && selected.id === sl.id} onClick={() => openSlot(sl.id)} />
  );

  const sourcesCol = (
    <Zone title="Sources">
      {industry
        ? (detailed ? industry.sources : industry.sources.slice(0, 4)).map((s) => (
            <div key={s.name} className="rounded-lg border border-blue-500/40 bg-blue-100/50 p-2 dark:bg-blue-900/30" title={s.delivery}>
              <p className="text-xs font-semibold leading-snug">{s.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">{s.delivery}</p>
            </div>
          ))
        : tile(slotById("sources"))}
    </Zone>
  );

  return (
    <div className={cn("refarch-board not-prose", className)}>
      {/* ---------- Toolbar ---------- */}
      <div className="refarch-noprint mb-4 flex flex-wrap items-center gap-2">
        {!fixedPattern && (
          <label className="relative">
            <span className="sr-only">Architecture</span>
            <select value={pattern.slug} onChange={(e) => update({ pattern: e.target.value, swap: null })} className="h-10 appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring">
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
            <select value={industry?.slug ?? ""} onChange={(e) => update({ industry: e.target.value || null })} className="h-10 appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
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
            { v: true, label: "Full platform" },
          ].map((o) => (
            <button key={o.label} type="button" aria-pressed={detailed === o.v} onClick={() => update({ view: o.v ? "detailed" : null })} className={cn("rounded-md px-3 transition-colors", detailed === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {o.label}
            </button>
          ))}
        </div>
        {swapCount > 0 && (
          <button type="button" onClick={() => update({ swap: null })} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-yellow-500/60 bg-yellow-100/60 px-3 text-sm text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">
            <RotateCcw className="h-3.5 w-3.5" /> Reset {swapCount} swap{swapCount > 1 ? "s" : ""}
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {flash && (
            <span className="inline-flex items-center gap-1 text-sm text-primary" role="status">
              <Check className="h-4 w-4" /> {flash}
            </span>
          )}
          <button type="button" onClick={() => copy(window.location.href, "Link copied")} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm hover:border-primary">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Download className="h-4 w-4" /> Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Export what's on screen</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => download(`${fileBase}.yaml`, toYaml(pattern, nodes, industry), "text/yaml")}>YAML descriptor</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => download(`${fileBase}.mmd`, toMermaid(pattern, nodes), "text/plain")}>Mermaid diagram</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => download(`${fileBase}.json`, JSON.stringify(toJson(pattern, nodes, industry), null, 2), "application/json")}>JSON</DropdownMenuItem>
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
            <Link to={industryPath(industry.slug)} className="rounded-full border border-blue-500/40 bg-blue-100/60 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              {industry.name} lens
            </Link>
          )}
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_14px_minmax(0,3.6fr)_14px_minmax(0,1fr)_14px_minmax(0,1fr)]">
          {sourcesCol}
          <Flow />
          <Zone title="Ingestion">{zoneSlots("ingest").map(tile)}</Zone>
          <Flow />

          {/* Platform */}
          <section aria-label="Open lakehouse platform" className="rounded-xl border border-primary/40 bg-background/70 p-3">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-primary">Open lakehouse platform</p>
            <div className="space-y-3">
              {PLATFORM_GROUPS.map((gid) => {
                const slots = slotsInGroup(gid).filter(visible);
                if (!slots.length) return null;
                const g = groupById(gid);
                return (
                  <div key={gid} className="grid gap-2 md:grid-cols-[110px_minmax(0,1fr)]">
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground">{g.name}</p>
                      <p className="hidden text-[10px] leading-snug text-muted-foreground md:block">{g.intro}</p>
                    </div>
                    <div className={cn("grid gap-2", slots.length >= 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>{slots.map(tile)}</div>
                  </div>
                );
              })}
              <div className="grid gap-3">
                {PLATFORM_BANDS.map((gid) => {
                  const slots = slotsInGroup(gid).filter(visible);
                  if (!slots.length) return null;
                  return (
                    <div key={gid} className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-2">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-primary">{groupById(gid).name}</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{slots.map(tile)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <Flow />
          <Zone title="Serving">{zoneSlots("serving").map(tile)}</Zone>
          <Flow />
          <Zone title="Teams">
            {teams.map((t) => (
              <button key={t.id} type="button" onClick={() => setSelected({ kind: "team", id: t.id })} className={cn("w-full rounded-lg border bg-background p-2 text-left shadow-sm transition-all hover:border-primary", selected?.kind === "team" && selected.id === t.id ? "border-primary ring-2 ring-primary/40" : "border-border", t.id === "agents" && "border-green-500/60 bg-green-100/40 dark:bg-green-900/20")}>
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  {t.id === "agents" ? <Bot className="h-3.5 w-3.5 text-primary" /> : <Users className="h-3.5 w-3.5 text-muted-foreground" />}
                  {t.name}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[10px] leading-snug text-muted-foreground">{t.cares}</span>
              </button>
            ))}
          </Zone>
        </div>

        <p className="refarch-noprint mt-3 px-1 text-xs text-muted-foreground">
          Lit boxes are part of this architecture, with the versions its reference repo pins. {detailed ? "Dimmed boxes show the typical open source choice for the rest of the platform." : "Switch to Full platform to see every capability."} Select any box or team for details. <ArrowLeftRight className="mx-0.5 inline h-3 w-3" /> marks a swappable choice.
        </p>
      </div>

      {/* ---------- Industry use cases ---------- */}
      {industry && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">
            {industry.name} use cases<span className="font-normal text-muted-foreground"> (highlighted ones run on this architecture)</span>
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {industry.useCases.map((u) => {
              const here = u.pattern === pattern.slug;
              return (
                <li key={u.title} className={cn("rounded-lg border p-3 text-sm", here ? "border-primary bg-primary/5" : "border-border opacity-80")}>
                  <p className="font-medium">{u.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{u.problem}</p>
                  {!here && (
                    <Link to={fixedPattern ? `${patternPath(u.pattern)}?industry=${industry.slug}` : `?pattern=${u.pattern}&industry=${industry.slug}`} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
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
      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected?.kind === "slot" && (
            <SlotDetail slot={slotById(selected.id)} pattern={pattern} nodes={nodes} swaps={swaps} onSwap={setSwap} used={usedAll.has(selected.id)} onTeam={(id) => setSelected({ kind: "team", id })} />
          )}
          {selected?.kind === "team" && <TeamDetail team={TEAMS.find((t) => t.id === selected.id)!} nodes={nodes} onSlot={openSlot} />}
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ---------- Pieces ----------

const Zone = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section aria-label={title} className="flex min-w-0 flex-col">
    <h4 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:flex-col">{children}</div>
  </section>
);

const Flow = () => (
  <div aria-hidden className="flex items-center justify-center py-2 xl:py-0">
    <span className="refarch-flow-y block h-5 w-[2px] xl:hidden" />
    <span className="refarch-flow-x hidden h-[2px] w-full xl:block" />
  </div>
);

const SlotTile = ({ slot, nodes, active, swapped, onClick }: { slot: Slot; nodes: Node[]; active: boolean; swapped: boolean; onClick: () => void }) => {
  const used = nodes.length > 0;
  const fallback = componentById(slot.defaults[0]);
  const swappable = nodes.some((n) => n.swaps?.length);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border p-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        used ? "bg-background shadow-sm hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_0_18px_hsl(var(--primary)/0.25)]" : "border-dashed bg-transparent opacity-60 hover:opacity-100",
        used && (active ? "border-primary ring-2 ring-primary/40" : "border-border"),
        !used && "border-border",
        swapped && "border-yellow-500 bg-yellow-100/40 dark:bg-yellow-900/20",
      )}
    >
      <span className="flex items-start justify-between gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{slot.short}</span>
        {swappable ? <ArrowLeftRight className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary" aria-label="swappable" /> : null}
      </span>
      {used ? (
        <>
          {nodes.slice(0, 2).map((n) => (
            <span key={nodeName(n) + n.role} className="mt-0.5 block break-words text-xs font-semibold leading-snug">
              {nodeName(n)}
            </span>
          ))}
          {nodes.length > 2 && <span className="block text-[10px] text-muted-foreground">+{nodes.length - 2} more</span>}
          {nodes[0].version && <span className="mt-0.5 block truncate font-mono text-[10px] text-primary">{nodes[0].version}</span>}
        </>
      ) : (
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{fallback ? `Typical: ${fallback.name}` : slot.name}</span>
      )}
    </button>
  );
};

const ComponentLinks = ({ id }: { id?: string }) => {
  const c = componentById(id);
  if (!c) return null;
  return (
    <span className="mt-2 flex flex-wrap gap-2">
      <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-primary">
        Website <ExternalLink className="h-3 w-3" />
      </a>
      {c.repo && (
        <a href={c.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-primary">
          <Github className="h-3 w-3" /> Source
        </a>
      )}
      {c.sitePath && (
        <Link to={c.sitePath} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-primary">
          <Link2 className="h-3 w-3" /> Read more here
        </Link>
      )}
    </span>
  );
};

const SlotDetail = ({
  slot,
  pattern,
  nodes,
  swaps,
  onSwap,
  used,
  onTeam,
}: {
  slot: Slot;
  pattern: Pattern;
  nodes: Node[];
  swaps: Record<number, string>;
  onSwap: (i: number, id: string | null) => void;
  used: boolean;
  onTeam: (id: string) => void;
}) => {
  const inSlot = nodes.map((n, i) => ({ n, i })).filter(({ n }) => n.slot === slot.id);
  const teams = TEAMS.filter((t) => t.slots.includes(slot.id));
  const elsewhere = PATTERNS.filter((p) => p.slug !== pattern.slug && p.nodes.some((n) => n.slot === slot.id));
  return (
    <div className="space-y-6">
      <SheetHeader className="text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{groupById(slot.group).name}</p>
        <SheetTitle className="text-2xl">{slot.name}</SheetTitle>
        <SheetDescription>{slot.what}</SheetDescription>
      </SheetHeader>

      {used ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold">In this architecture</p>
          {inSlot.map(({ n, i }) => {
            const c = componentById(n.component);
            const original = pattern.nodes[i];
            const alternatives = [original.component, ...(original.swaps ?? [])].filter((id): id is string => !!id && id !== n.component);
            return (
              <div key={i} className={cn("rounded-xl border p-4", swaps[i] !== undefined ? "border-yellow-500" : "border-border")}>
                <p className="font-semibold">{nodeName(n)}</p>
                <p className="mt-1 text-sm">{n.role}</p>
                {c && <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>}
                <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  {n.version && <span className="font-mono text-primary">{n.version}</span>}
                  {c?.license && <span>{c.license}</span>}
                  {c?.steward && <span>{c.steward}</span>}
                </p>
                {swaps[i] !== undefined && <p className="mt-2 text-xs">Swapped in. The reference repo uses {componentById(original.component)?.name}; versions and caveats on this page describe that choice.</p>}
                <ComponentLinks id={n.component} />
                {alternatives.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-semibold">Swap for</p>
                    <div className="flex flex-wrap gap-1.5">
                      {alternatives.map((id) => {
                        const alt = componentById(id)!;
                        const back = id === original.component;
                        return (
                          <button key={id} type="button" onClick={() => onSwap(i, back ? null : id)} title={alt.blurb} className="rounded-md border border-border px-2 py-1 text-xs hover:border-primary hover:bg-primary/5">
                            {back ? `Back to ${alt.name}` : alt.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">A swap shows a project that speaks the same interface. It is not a tested configuration; check the project's docs for feature parity.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="rounded-lg bg-muted p-3 text-sm">Not part of this reference architecture. The typical open source choices:</p>
          {slot.defaults.map((id) => {
            const c = componentById(id);
            if (!c) return null;
            return (
              <div key={id} className="rounded-xl border border-border p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
                <p className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  {c.license && <span>{c.license}</span>}
                  {c.steward && <span>{c.steward}</span>}
                </p>
                <ComponentLinks id={id} />
              </div>
            );
          })}
        </div>
      )}

      <div>
        <p className="mb-1 text-sm font-semibold">The question it answers</p>
        <p className="text-sm text-muted-foreground">{slot.question}</p>
      </div>

      {teams.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Who works here</p>
          <div className="flex flex-wrap gap-1.5">
            {teams.map((t) => (
              <button key={t.id} type="button" onClick={() => onTeam(t.id)} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary">
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {elsewhere.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Architectures that use it</p>
          <ul className="space-y-1">
            {elsewhere.slice(0, 6).map((p) => (
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

const TeamDetail = ({ team, nodes, onSlot }: { team: Team; nodes: Node[]; onSlot: (id: string) => void }) => {
  const used = new Set(nodes.map((n) => n.slot));
  const here = team.slots.filter((s) => used.has(s));
  return (
    <div className="space-y-6">
      <SheetHeader className="text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Team</p>
        <SheetTitle className="text-2xl">{team.name}</SheetTitle>
        <SheetDescription>{team.cares}</SheetDescription>
      </SheetHeader>
      <div>
        <p className="mb-2 text-sm font-semibold">What they work with in this architecture</p>
        <div className="flex flex-wrap gap-1.5">
          {here.map((id) => {
            const names = nodes.filter((n) => n.slot === id).map(nodeName);
            return (
              <button key={id} type="button" onClick={() => onSlot(id)} className="rounded-lg border border-border px-2.5 py-1.5 text-left text-xs hover:border-primary">
                <span className="block font-semibold">{slotById(id).name}</span>
                <span className="text-muted-foreground">{Array.from(new Set(names)).join(", ")}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Learning path</p>
        <ul className="space-y-1.5">
          {team.learn.map((l) => (
            <li key={l.href}>
              {/^https?:/.test(l.href) ? (
                <a href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  {l.label} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Link to={l.href} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  {l.label} <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

