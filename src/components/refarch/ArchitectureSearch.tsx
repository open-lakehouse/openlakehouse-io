import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { search } from "@/content/reference-architectures";

const SUGGESTIONS = ["Kafka", "CDC", "FHIR", "Iceberg REST", "fraud", "Airflow", "agents", "Delta Sharing"];

export const ArchitectureSearch = ({ dark = false }: { dark?: boolean }) => {
  const [q, setQ] = useState("");
  const hits = useMemo(() => search(q), [q]);
  return (
    <div className="relative w-full max-w-2xl">
      <label className="relative block">
        <span className="sr-only">Search architectures, components, industries and formats</span>
        <Search className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${dark ? "text-white/60" : "text-muted-foreground"}`} />
        <input
          type="text"
          inputMode="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: Kafka, CDC, FHIR, fraud, Iceberg REST..."
          className={
            dark
              ? "h-14 w-full rounded-xl border border-white/25 bg-white/10 pl-12 pr-4 text-base text-white placeholder:text-white/55 backdrop-blur focus:outline-none focus:ring-2 focus:ring-green-400"
              : "h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          }
        />
      </label>
      {!q && (
        <p className={`mt-3 flex flex-wrap gap-2 text-xs ${dark ? "text-white/70" : "text-muted-foreground"}`}>
          Try
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQ(s)}
              className={`rounded-full border px-2.5 py-0.5 ${dark ? "border-white/30 hover:bg-white/10" : "border-border hover:border-primary"}`}
            >
              {s}
            </button>
          ))}
        </p>
      )}
      {q && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl">
          {hits.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No matches for "{q}".</p>
          ) : (
            <ul role="listbox" aria-label="Search results">
              {hits.map((h) => {
                const inner = (
                  <>
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium">{h.title}</span>
                      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {h.kind}
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{h.sub}</span>
                  </>
                );
                const cls = "block border-b border-border px-4 py-3 text-left last:border-0 hover:bg-primary/5";
                return (
                  <li key={`${h.kind}-${h.title}-${h.href}`}>
                    {h.external ? (
                      <a href={h.href} target="_blank" rel="noreferrer" className={cls}>
                        {inner}
                        <ArrowUpRight className="sr-only" />
                      </a>
                    ) : (
                      <Link to={h.href} className={cls}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
