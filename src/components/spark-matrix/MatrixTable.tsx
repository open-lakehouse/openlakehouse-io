// The Spark Matrix table, adapted from MatrixView.tsx in
// open-lakehouse/spark-matrix. It renders fully on the server (prerender) so
// every feature row and cell is in the static HTML; filters, the runtime
// pickers and the cell details only work once the client mounts.
//
// Cells carry data-p (platform column) / data-a (Apache column) and data-f
// (feature row) and are handled by one click listener on the table, which
// keeps the prerendered markup small.
import { Fragment, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Search } from "lucide-react";
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

const PROVIDERS: { id: string; label: string }[] = [
  { id: "aws", label: "AWS" },
  { id: "gcp", label: "Google Cloud" },
  { id: "azure", label: "Microsoft" },
  { id: "databricks", label: "Databricks" },
  { id: "other", label: "Others" },
];

const VENDOR_ROWS = vendorRows(SHOWN_PLATFORMS);

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

const runtimeLabel = (r?: Runtime) => (r ? r.label.replace(/\s*\(.*\)$/, "") : "No runtime");

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

export function MatrixTable() {
  const [providers, setProviders] = useState<Set<string>>(() => new Set(PROVIDERS.map((p) => p.id)));
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<Selection | null>(null);
  // The runtime pickers render only in the browser; the prerendered HTML names the default runtime instead.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const runtimeOf = (p: Platform) => p.runtimes.find((r) => r.id === picked[p.id]) ?? defaultRuntime(p);
  const cols = SHOWN_PLATFORMS.filter((p) => providers.has(p.provider));
  const colRuntimes = cols.map(runtimeOf);
  const nCols = 1 + APACHE_MINORS.length + cols.length;

  const rows = useMemo(() => {
    const list = features.filter(
      (f) => (category === "all" || f.category === category) && (matches(f.title, q) || matches(f.summary, q)),
    );
    return list.map((f) => ({ f, cells: cols.map((p, i) => cellFor(p, colRuntimes[i]?.id, f)) }));
    // colRuntimes is derived from cols and picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q, providers, picked]);

  const visible = onlyDiff
    ? rows.filter(({ cells }) => {
        const got = cells.map((c) => hasIt(c.level));
        return got.some(Boolean) && got.some((x) => !x);
      })
    : rows;
  const vendor = category === "all" || category === "platform" ? VENDOR_ROWS.filter((v) => matches(v.title, q)) : [];
  const sparkVisible = visible.filter((r) => !r.f.vendor_only);

  const toggleProvider = (id: string) => {
    const next = new Set(providers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setProviders(next);
  };

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

  const cellButton = (level: Level, data: Record<string, string>) => {
    const m = LEVEL_META[level];
    return (
      <button type="button" className={`smx-c smx-${level}`} {...data}>
        <span aria-hidden="true">{m.short}</span>
        <span className="sr-only">{m.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter the matrix">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => toggleProvider(p.id)}
            aria-pressed={providers.has(p.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              providers.has(p.id)
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
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
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="accent-[hsl(var(--primary))]" />
          Only rows where services differ
        </label>
      </div>
      <Legend />

      <div className="smx-scroll">
        <table className="smx" onClick={onTableClick}>
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
                </th>
              ))}
              {cols.map((p, i) => {
                const r = colRuntimes[i];
                return (
                  <th key={p.id} scope="col" className="smx-pcol text-left">
                    <span className="block text-[0.6rem] uppercase tracking-wide text-muted-foreground">{p.vendor}</span>
                    <span className="block text-xs font-semibold leading-tight text-foreground" title={p.name}>
                      {shortName(p)}
                    </span>
                    {mounted && p.runtimes.length > 1 ? (
                      <select
                        className="mt-1 w-full rounded border border-input bg-background px-0.5 text-[0.65rem]"
                        value={r?.id}
                        onChange={(e) => setPicked({ ...picked, [p.id]: e.target.value })}
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
                      <span className="mt-1 block text-[0.65rem] leading-tight text-muted-foreground">{runtimeLabel(r)}</span>
                    )}
                    <span className="mt-0.5 block font-mono text-[0.65rem] text-muted-foreground">
                      Spark {r?.spark_base ?? "?"}
                      {r?.spark_via ? "*" : ""}
                    </span>
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
                      <th scope="row" className="smx-feat">
                        <b>{f.title}</b>
                        <small>{f.vendor_only ? "Vendor capability" : `Apache ${f.since ?? "n/a"}`}</small>
                      </th>
                      {APACHE_MINORS.map((m) => (
                        <td key={m}>{f.vendor_only ? null : cellButton(apacheLevel(f, m), { "data-f": f.id, "data-a": m })}</td>
                      ))}
                      {cells.map((cell: CellInfo, i) => (
                        <td key={cols[i].id} className="smx-pcol">
                          {cellButton(cell.level, { "data-f": f.id, "data-p": String(i) })}
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
        Columns are sorted by Apache Spark base, newest first. Each service is shown at its newest generally available
        runtime; pick another in the column header. A <span className="font-mono">*</span> marks a Spark version the vendor
        states through a paired product. Select a cell for its source.
      </p>

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {sel && <CellDetails sel={sel} />}
        </SheetContent>
      </Sheet>
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
