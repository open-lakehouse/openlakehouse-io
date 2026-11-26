// The Spark Matrix table, adapted from MatrixView.tsx in
// open-lakehouse/spark-matrix. It renders fully on the server (prerender) so
// every feature row and cell is in the static HTML; filters, the runtime
// pickers and the cell details only work once the client mounts.
//
// Cells carry data-p (platform column) / data-a (Apache column) and data-f
// (feature row) and are handled by one click listener on the table, which
// keeps the prerendered markup small.
import { Fragment, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Plus, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  APACHE_MINORS,
  CATEGORIES,
  LEVELS,
  LEVEL_META,
  SHOWN_PLATFORMS,
  apacheLevel,
  cellFor,
  defaultRuntime,
  features,
  hasIt,
  humanize,
  shortName,
  shortUrl,
  vendorCell,
  vendorRows,
  type CellInfo,
  type Claim,
  type Feature,
  type Level,
  type Platform,
  type Runtime,
} from "@/lib/spark-matrix";

const VENDOR_ROWS = vendorRows(SHOWN_PLATFORMS);

/** Platforms offered in the picker, grouped by vendor, each in SHOWN order. */
const PLATFORMS_BY_VENDOR: { vendor: string; items: Platform[] }[] = (() => {
  const groups: { vendor: string; items: Platform[] }[] = [];
  for (const p of SHOWN_PLATFORMS) {
    const g = groups.find((x) => x.vendor === p.vendor);
    if (g) g.items.push(p);
    else groups.push({ vendor: p.vendor, items: [p] });
  }
  return groups;
})();

interface Selection {
  title: string;
  feature?: Feature;
  platform?: Platform;
  runtime?: Runtime;
  apacheMinor?: string;
  level: Level;
  claims: Claim[];
  via?: string;
}

interface Tip {
  x: number;
  y: number;
  heading: string;
  level?: Level;
  text?: string;
  quote?: string;
  links: { label: string; href: string }[];
}

const clip = (t: string, n = 220) => (t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t);

const runtimeLabel = (r?: Runtime) => (r ? r.label.replace(/\s*\(.*\)$/, "") : "No runtime");

const verKey = (v: string | null) => (v ?? "0").split(".").map((n) => n.padStart(3, "0")).join(".");
/** Newest Apache release first, so a runtime's missing features sit at the top of each category. */
const bySinceDesc = (a: Feature, b: Feature) => verKey(b.since).localeCompare(verKey(a.since));
const minorOf = (v: string | null) => (v ? v.split(".").slice(0, 2).join(".") : "");
const LATEST_MINOR = APACHE_MINORS[0];
/** Spark features in the newest Apache release line that this runtime does not have. */
const missingFromLatest = (p: Platform, runtimeId: string | undefined) =>
  features.filter(
    (f) => !f.vendor_only && apacheLevel(f, LATEST_MINOR) === "documented" && !hasIt(cellFor(p, runtimeId, f).level),
  ).length;

function matches(text: string, q: string) {
  return !q || text.toLowerCase().includes(q.toLowerCase());
}

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Legend">
      {LEVELS.map((l) => (
        <li key={l.level} className="flex items-center gap-1.5">
          <span className={`smx-c smx-${l.level} !h-5 !w-7 !min-w-0`} aria-hidden="true">
            {l.short}
          </span>
          <span className="font-medium">{l.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Features of the newest Apache line that an older Apache line does not have. */
const apacheMissing = (m: string) =>
  features.filter((f) => !f.vendor_only && apacheLevel(f, LATEST_MINOR) === "documented" && apacheLevel(f, m) !== "documented")
    .length;

/** Above the table: how far each service, and each older Apache line, is behind the newest Apache release. */
export function GapSummary() {
  const total = features.filter((f) => !f.vendor_only && apacheLevel(f, LATEST_MINOR) === "documented").length;
  const services = SHOWN_PLATFORMS.map((p) => {
    const r = defaultRuntime(p);
    return { p, r, n: missingFromLatest(p, r?.id) };
  })
    .filter((x) => x.r?.spark_base)
    .sort((a, b) => b.n - a.n || shortName(a.p).localeCompare(shortName(b.p)));
  const minors = APACHE_MINORS.slice(1).map((m) => ({ m, n: apacheMissing(m) }));
  const bar = (n: number) => `${Math.round((n / Math.max(total, 1)) * 100)}%`;
  return (
    <section aria-labelledby="smx-gap-heading" className="mb-8 rounded-xl border border-border bg-card p-4 md:p-6">
      <h3 id="smx-gap-heading" className="text-lg font-bold tracking-tight md:text-xl">
        How far behind Apache Spark {LATEST_MINOR} is your platform?
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Spark {APACHE_MINORS.slice(1, 4).join(", ")} are not interchangeable: each minor release adds features the
        older lines do not have. Of the {total} Spark features tracked in Apache Spark {LATEST_MINOR}, this is what each
        line and each service at its newest generally available runtime is missing.
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Apache Spark lines</h4>
          <ul className="space-y-1.5 text-sm">
            {minors.map(({ m, n }) => (
              <li key={m} className="grid grid-cols-[3.5rem_minmax(0,1fr)_5.5rem] items-center gap-2">
                <span className="font-mono">{m}</span>
                <span className="h-2 rounded bg-muted"><span className="smx-gapbar" style={{ width: bar(n) }} /></span>
                <span className="text-right text-xs font-semibold text-red-700 dark:text-red-300">missing {n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Managed services</h4>
          <ul className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {services.map(({ p, r, n }) => (
              <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_4rem_4.5rem] items-center gap-2">
                <span className="truncate" title={`${p.name}, ${runtimeLabel(r)}`}>
                  <span className="text-muted-foreground">{p.vendor} </span>
                  {shortName(p)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{r?.spark_base}</span>
                <span className={`text-right text-xs font-semibold ${n ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                  {n ? `missing ${n}` : "all of " + LATEST_MINOR}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function MatrixTable() {
  // The matrix opens with the Apache Spark columns only; readers add the
  // managed platforms they want to compare. `selected` holds platform ids in
  // the order they were added, so no vendor is shown ahead of another.
  const [selected, setSelected] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<Selection | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const tipTimer = useRef<number | undefined>(undefined);
  const keepTip = () => window.clearTimeout(tipTimer.current);
  const dropTip = () => {
    keepTip();
    tipTimer.current = window.setTimeout(() => setTip(null), 180);
  };
  // The hover card is positioned in viewport coordinates, so any scroll closes it.
  useEffect(() => {
    const close = () => setTip(null);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, []);

  const runtimeOf = (p: Platform) => p.runtimes.find((r) => r.id === picked[p.id]) ?? defaultRuntime(p);
  const cols = selected
    .map((id) => SHOWN_PLATFORMS.find((p) => p.id === id))
    .filter((p): p is Platform => Boolean(p));
  const colRuntimes = cols.map(runtimeOf);
  const nCols = 1 + APACHE_MINORS.length + cols.length;

  const rows = useMemo(() => {
    const list = features.filter(
      (f) => (category === "all" || f.category === category) && (matches(f.title, q) || matches(f.summary, q)),
    );
    return [...list].sort(bySinceDesc).map((f) => ({ f, cells: cols.map((p, i) => cellFor(p, colRuntimes[i]?.id, f)) }));
    // colRuntimes is derived from cols and picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q, selected, picked]);

  // "Only rows where services differ" needs at least two service columns.
  const canDiff = cols.length >= 2;
  const visible =
    onlyDiff && canDiff
      ? rows.filter(({ cells }) => {
          const got = cells.map((c) => hasIt(c.level));
          return got.some(Boolean) && got.some((x) => !x);
        })
      : rows;
  const vendor = category === "all" || category === "platform" ? VENDOR_ROWS.filter((v) => matches(v.title, q)) : [];
  const sparkVisible = visible.filter((r) => !r.f.vendor_only);

  const addPlatform = (id: string) => setSelected((s) => (s.includes(id) ? s : [...s, id]));
  const removePlatform = (id: string) => setSelected((s) => s.filter((x) => x !== id));
  const setRuntime = (pid: string, rid: string) => setPicked((prev) => ({ ...prev, [pid]: rid }));

  const onTableClick = (e: MouseEvent<HTMLTableElement>) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-f]");
    if (!btn) return;
    const fid = btn.dataset.f!;
    const a = btn.dataset.a;
    const pi = btn.dataset.p;
    if (a) {
      const f = features.find((x) => x.id === fid)!;
      setSel({ title: f.title, feature: f, apacheMinor: a, level: apacheLevel(f, a), claims: [] });
      return;
    }
    const p = cols[Number(pi)];
    const r = colRuntimes[Number(pi)];
    if (!p) return;
    if (fid.startsWith("other:")) {
      const v = VENDOR_ROWS.find((x) => x.id === fid)!;
      const c = vendorCell(p, r?.id, fid);
      setSel({ title: v.title, platform: p, runtime: r, level: c.level, claims: c.claims, via: c.via });
      return;
    }
    const f = features.find((x) => x.id === fid)!;
    const c = cellFor(p, r?.id, f);
    setSel({ title: f.title, feature: f, platform: p, runtime: r, level: c.level, claims: c.claims, via: c.via });
  };

  const onTableOver = (e: MouseEvent<HTMLTableElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("button[data-f], th[data-feat]");
    if (!el) return dropTip();
    keepTip();
    const box = el.getBoundingClientRect();
    const at = { x: Math.min(box.left, window.innerWidth - 336), y: box.bottom + 6 };
    if (el.dataset.feat) {
      const f = features.find((x) => x.id === el.dataset.feat);
      if (!f) return;
      const links = f.docs ? [{ label: "Spark documentation", href: f.docs }] : [];
      const ev = f.evidence.find((x) => x.url);
      if (ev?.url) links.push({ label: "Apache source", href: ev.url });
      setTip({ ...at, heading: f.title, text: f.summary + (f.since ? ` In Apache Spark since ${f.since}.` : ""), links });
      return;
    }
    const fid = el.dataset.f!;
    const a = el.dataset.a;
    const f = features.find((x) => x.id === fid);
    if (a && f) {
      const level = apacheLevel(f, a);
      const ev = f.evidence.find((x) => x.url);
      setTip({
        ...at,
        heading: `${f.title} in Apache Spark ${a}`,
        level,
        text: level === "absent" ? `Added in Apache Spark ${f.since}.` : `In Apache Spark since ${f.since}.`,
        links: ev?.url ? [{ label: "Apache source", href: ev.url }] : [],
      });
      return;
    }
    const p = cols[Number(el.dataset.p)];
    const r = colRuntimes[Number(el.dataset.p)];
    if (!p) return;
    const c = fid.startsWith("other:") ? vendorCell(p, r?.id, fid) : f ? cellFor(p, r?.id, f) : null;
    if (!c) return;
    const claim = c.claims.find((x) => x.source) ?? c.claims[0];
    const links: Tip["links"] = [];
    if (claim?.source) links.push({ label: `Vendor source: ${shortUrl(claim.source).split("/")[0]}`, href: claim.source });
    let text: string | undefined;
    if (c.level === "inherited" && f) {
      text = `${shortName(p)} documents nothing either way. Its runtime is Apache Spark ${r?.spark_base}, which has this feature (since ${f.since}).`;
      const ev = f.evidence.find((x) => x.url);
      if (ev?.url) links.push({ label: "Apache source", href: ev.url });
    } else if (c.level === "absent" && f) {
      text = `Added in Apache Spark ${f.since}. ${shortName(p)} runs Apache Spark ${r?.spark_base} and documents no backport.`;
    } else if (c.via) {
      text = `From ${c.via}, which this runtime pairs with.`;
    }
    if (r?.source) links.push({ label: "Runtime version source", href: r.source });
    setTip({
      ...at,
      heading: `${f?.title ?? humanize(fid)} on ${shortName(p)}`,
      level: c.level,
      text: claim?.note ?? text,
      quote: claim?.quote ? clip(claim.quote) : undefined,
      links,
    });
  };

  const cellButton = (level: Level, data: Record<string, string>, since?: string | null) => {
    const m = LEVEL_META[level];
    const needs = level === "absent" && since ? `${minorOf(since)}+` : null;
    return (
      <button type="button" className={`smx-c smx-${level}`} {...data}>
        <span aria-hidden="true">{needs ?? m.short}</span>
        <span className="sr-only">{needs ? `${m.label}: added in Apache Spark ${since}` : m.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> Add a platform
        </button>
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Feature category"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <label className="relative">
          <span className="sr-only">Search features</span>
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search features"
            className="h-8 w-44 rounded-md border border-input bg-background pl-7 pr-2 text-xs sm:w-56"
          />
        </label>
        <label className={`flex items-center gap-1.5 text-xs ${canDiff ? "" : "opacity-50"}`}>
          <input
            type="checkbox"
            checked={onlyDiff && canDiff}
            disabled={!canDiff}
            onChange={(e) => setOnlyDiff(e.target.checked)}
            className="accent-[hsl(var(--primary))]"
          />
          Only rows where services differ
        </label>
      </div>

      {/* Selected platforms as removable chips; each names its runtime legibly. */}
      {cols.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Platforms being compared">
          {cols.map((p, i) => {
            const r = colRuntimes[i];
            return (
              <li
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 py-1 pl-3 pr-1 text-xs"
              >
                <span className="font-medium text-foreground">{shortName(p)}</span>
                <span className="text-muted-foreground">{runtimeLabel(r)}</span>
                <button
                  type="button"
                  onClick={() => removePlatform(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Showing Apache Spark releases only. Use <span className="font-medium text-foreground">Add a platform</span> to
          compare a managed Spark service and choose its runtime.
        </p>
      )}
      <Legend />

      <div className="smx-scroll">
        <table className="smx" onClick={onTableClick} onMouseOver={onTableOver} onMouseLeave={dropTip}>
          <caption className="sr-only">
            Apache Spark features (rows) across managed Spark services (columns), each at its newest generally available
            runtime, with Apache Spark releases for comparison. Each cell gives the support level; select it for the
            source.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="smx-feat smx-corner">
                <span className="text-xs font-semibold">Feature</span>{" "}
                <span className="text-xs text-muted-foreground">({visible.length + vendor.length})</span>
              </th>
              {APACHE_MINORS.map((m) => (
                <th key={m} scope="col" className="smx-acol">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-accent">Apache</span>
                  <span className="block font-mono text-xs">{m}</span>
                  {apacheMissing(m) > 0 ? <span className="smx-behind">Missing {apacheMissing(m)}</span> : null}
                </th>
              ))}
              {cols.map((p, i) => {
                const r = colRuntimes[i];
                return (
                  <th key={p.id} scope="col" className="smx-pcol text-left">
                    <div className="flex items-start justify-between gap-1">
                      <span className="block text-[0.6rem] uppercase tracking-wide text-muted-foreground">{p.vendor}</span>
                      <button
                        type="button"
                        onClick={() => removePlatform(p.id)}
                        aria-label={`Remove ${p.name}`}
                        className="-mr-0.5 -mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="block text-xs font-semibold leading-tight text-foreground" title={p.name}>
                      {shortName(p)}
                    </span>
                    <span className="mt-1 block text-[0.65rem] leading-tight text-muted-foreground">{runtimeLabel(r)}</span>
                    <span className="mt-0.5 block font-mono text-[0.65rem] text-muted-foreground">
                      Spark {r?.spark_base ?? "?"}
                      {r?.spark_via ? "*" : ""}
                    </span>
                    {p.runtimes.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="mt-0.5 block text-[0.65rem] font-medium text-primary hover:underline"
                      >
                        Change runtime
                      </button>
                    ) : null}
                    {(() => {
                      const n = missingFromLatest(p, r?.id);
                      return n > 0 ? (
                        <span className="smx-behind">
                          Missing {n} from {LATEST_MINOR}
                        </span>
                      ) : null;
                    })()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => {
              const inCat = visible.filter((r) => r.f.category === c.id);
              const extra = c.id === "platform" ? vendor : [];
              if (!inCat.length && !extra.length) return null;
              return (
                <Fragment key={c.id}>
                  <tr className="smx-cat">
                    <th colSpan={nCols} scope="colgroup" id={`smx-${c.id}`}>
                      <div>
                        {c.title}
                        <span>{c.blurb}</span>
                      </div>
                    </th>
                  </tr>
                  {inCat.map(({ f, cells }) => (
                    <tr key={f.id}>
                      <th scope="row" className="smx-feat" data-feat={f.id}>
                        <b>{f.title}</b>
                        <small>{f.vendor_only ? "Vendor capability" : `Apache ${f.since ?? "n/a"}`}</small>
                        {f.summary ? <span className="smx-feat-desc">{f.summary}</span> : null}
                      </th>
                      {APACHE_MINORS.map((m) => (
                        <td key={m}>{f.vendor_only ? null : cellButton(apacheLevel(f, m), { "data-f": f.id, "data-a": m }, f.since)}</td>
                      ))}
                      {cells.map((cell: CellInfo, i) => (
                        <td key={cols[i].id} className="smx-pcol">
                          {cellButton(cell.level, { "data-f": f.id, "data-p": String(i) }, f.since)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {extra.map((v) => (
                    <tr key={v.id}>
                      <th scope="row" className="smx-feat">
                        <b>{v.title}</b>
                        <small>{v.vendors.join(", ")} only</small>
                      </th>
                      {APACHE_MINORS.map((m) => (
                        <td key={m} />
                      ))}
                      {cols.map((p, i) => {
                        const cell = vendorCell(p, colRuntimes[i]?.id, v.id);
                        return (
                          <td key={p.id} className="smx-pcol">
                            {cell.level === "undocumented" ? null : cellButton(cell.level, { "data-f": v.id, "data-p": String(i) })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="smx-feat">
                Spark features available
                <small>of {sparkVisible.length} shown</small>
              </th>
              {APACHE_MINORS.map((m) => (
                <td key={m}>{sparkVisible.filter(({ f }) => apacheLevel(f, m) === "documented").length}</td>
              ))}
              {cols.map((p, i) => (
                <td key={p.id} className="smx-pcol">
                  {sparkVisible.filter(({ cells }) => hasIt(cells[i].level)).length}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        The Apache Spark release columns are sorted newest first. Added services follow in the order you pick them, each
        shown at its newest generally available runtime; change the runtime from the picker or the column's Change runtime
        link. A <span className="font-mono">*</span> marks a Spark version the vendor states through a paired product.
        Select a cell for its source.
      </p>

      {tip && (
        <div
          role="tooltip"
          className="fixed z-50 w-80 rounded-lg border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg"
          style={{ left: Math.max(8, tip.x), top: tip.y }}
          onMouseEnter={keepTip}
          onMouseLeave={dropTip}
        >
          <p className="font-semibold">{tip.heading}</p>
          {tip.level && (
            <p className="mt-1 flex items-center gap-1.5">
              <span className={`smx-c smx-${tip.level} !h-4 !w-6 !min-w-0`} aria-hidden="true">
                {LEVEL_META[tip.level].short.replace("4.3+", "")}
              </span>
              {LEVEL_META[tip.level].label}
            </p>
          )}
          {tip.text && <p className="mt-1 text-muted-foreground">{tip.text}</p>}
          {tip.quote && <blockquote className="mt-1.5 border-l-2 border-primary pl-2 italic">"{tip.quote}"</blockquote>}
          {tip.links.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {tip.links.map((l) => (
                <li key={l.href + l.label}>
                  <a className="text-primary underline-offset-2 hover:underline" href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[0.65rem] text-muted-foreground">Click the cell for the full evidence.</p>
        </div>
      )}

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {sel && <CellDetails sel={sel} />}
        </SheetContent>
      </Sheet>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a platform to compare</DialogTitle>
            <DialogDescription>
              Choose the managed Spark services you want next to Apache Spark, and the runtime of each. Add as many as
              you like; remove them from the chips above the matrix.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {PLATFORMS_BY_VENDOR.map((group) => (
              <div key={group.vendor}>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.vendor}
                </h4>
                <ul className="space-y-2">
                  {group.items.map((p) => {
                    const on = selected.includes(p.id);
                    const r = runtimeOf(p);
                    return (
                      <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => (on ? removePlatform(p.id) : addPlatform(p.id))}
                            className="accent-[hsl(var(--primary))]"
                          />
                          <span className="font-medium text-foreground">{p.name}</span>
                        </label>
                        {p.runtimes.length > 1 ? (
                          <select
                            className="h-8 max-w-full rounded-md border border-input bg-background px-2 text-xs"
                            value={r?.id}
                            onChange={(e) => setRuntime(p.id, e.target.value)}
                            aria-label={`${p.name} runtime`}
                          >
                            {p.runtimes.map((rt) => (
                              <option key={rt.id} value={rt.id}>
                                {runtimeLabel(rt)}
                                {rt.spark_base ? `, Spark ${rt.spark_base}` : ""}
                                {rt.status === "eol" ? " (EOL)" : ""}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {runtimeLabel(r)}
                            {r?.spark_base ? `, Spark ${r.spark_base}` : ""}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CellDetails({ sel }: { sel: Selection }) {
  const { feature: f, platform: p, runtime: r, level, claims } = sel;
  const m = LEVEL_META[level];
  const where = p ? `${p.name}, ${runtimeLabel(r)}` : `Apache Spark ${sel.apacheMinor}`;
  const link = "break-all text-primary underline underline-offset-2 hover:no-underline";
  return (
    <div className="space-y-4 text-sm">
      <SheetHeader>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{where}</p>
        <SheetTitle>{sel.title}</SheetTitle>
        <SheetDescription className="flex flex-col gap-2 sm:items-start">
          <span className={`smx-c smx-${level} !w-auto px-2`}>{m.label}</span>
          <span>{m.meaning}</span>
        </SheetDescription>
      </SheetHeader>

      {r && (
        <dl className="grid grid-cols-[7.5rem_1fr] gap-y-1">
          <dt className="text-muted-foreground">Spark</dt>
          <dd className="font-mono text-xs">
            {r.spark ?? "not stated"}
            {r.spark_base && r.spark !== r.spark_base ? ` (Apache ${r.spark_base})` : ""}
          </dd>
          {r.spark_via && (
            <>
              <dt className="text-muted-foreground">Via</dt>
              <dd>
                {r.spark_via.label}
                {r.spark_via.quote && <span className="block italic text-muted-foreground">"{r.spark_via.quote}"</span>}
                {r.spark_via.source && (
                  <a className={link} href={r.spark_via.source} target="_blank" rel="noreferrer">
                    {shortUrl(r.spark_via.source)}
                  </a>
                )}
              </dd>
            </>
          )}
          {r.status && (
            <>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{r.status}</dd>
            </>
          )}
          {r.source && (
            <>
              <dt className="text-muted-foreground">Version source</dt>
              <dd>
                <a className={link} href={r.source} target="_blank" rel="noreferrer">
                  {shortUrl(r.source)}
                </a>
              </dd>
            </>
          )}
        </dl>
      )}

      {sel.via && claims.length > 0 && (
        <p>
          Inherited from <b>{sel.via}</b>, which this runtime pairs with. A claim documented for this product itself would
          override it.
        </p>
      )}
      {claims.map((claim, i) => (
        <div
          key={i}
          className={`rounded-md border-l-4 bg-muted/50 p-3 ${i === 0 ? "border-primary" : "border-border"}`}
        >
          <p className="font-medium">
            Vendor documentation ({claim.status})
            {claims.length > 1 && i === 0 ? ", the most specific claim, sets the cell" : ""}
          </p>
          {claim.note && <p className="mt-1">{claim.note}</p>}
          {claim.quote && <blockquote className="mt-2 italic text-muted-foreground">"{claim.quote}"</blockquote>}
          {claim.source && (
            <a className={`${link} mt-2 inline-block`} href={claim.source} target="_blank" rel="noreferrer">
              {shortUrl(claim.source)}
            </a>
          )}
        </div>
      ))}

      {f && !f.vendor_only && (
        <div>
          <p className="font-medium">In Apache Spark since {f.since ?? "never"}</p>
          <p className="mt-1 text-muted-foreground">{f.summary}</p>
          <ul className="mt-2 space-y-1">
            {f.evidence.map((e, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                <span className="rounded-full border border-border px-2 text-xs">{e.kind}</span>
                <code className="break-all font-mono text-xs">{e.pattern}</code>
                <span className="text-xs text-muted-foreground">since {e.since ?? "n/a"}</span>
                {e.url && (
                  <a className={link} href={e.url} target="_blank" rel="noreferrer">
                    source
                  </a>
                )}
              </li>
            ))}
          </ul>
          {f.docs && (
            <a className={`${link} mt-2 inline-block`} href={f.docs} target="_blank" rel="noreferrer">
              Spark documentation
            </a>
          )}
        </div>
      )}
    </div>
  );
}
