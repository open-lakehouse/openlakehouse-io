import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BOARD_LAYERS,
  HUB_PATH,
  HUB_TITLE,
  componentById,
  nodeName,
  patternPath,
  type Faq,
  type LinkRef,
  type Pattern,
} from "@/content/reference-architectures";

export const Crumbs = ({ items }: { items: { name: string; to?: string }[] }) => (
  <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/75">
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((it, i) => (
        <li key={it.name} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
          {it.to ? (
            <Link to={it.to} className="hover:text-white">
              {it.name}
            </Link>
          ) : (
            <span aria-current="page" className="text-white">
              {it.name}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);


export const Hero = ({
  eyebrow,
  title,
  sub,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  crumbs?: { name: string; to?: string }[];
  children?: React.ReactNode;
}) => (
  <section className="relative z-10 bg-hero-gradient text-white">
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="refarch-grid-bg absolute inset-0 opacity-20" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-green-500/30 blur-3xl animate-blob-1" />
      <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl animate-blob-2" />
    </div>
    <div className="container relative py-16 md:py-24">
      {crumbs && <Crumbs items={crumbs} />}
      <p className="text-sm font-semibold uppercase tracking-widest text-green-300">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">{title}</h1>
      {sub && <p className="mt-5 max-w-3xl text-lg text-white/85 md:text-xl">{sub}</p>}
      {children}
    </div>
  </section>
);

export const SectionHeading = ({ id, eyebrow, title, children }: { id: string; eyebrow?: string; title: string; children?: React.ReactNode }) => (
  <div className="mb-8 max-w-3xl">
    {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}
    <h2 id={id} className="mt-2 scroll-mt-24 text-2xl font-bold tracking-tight md:text-4xl">
      {title}
    </h2>
    {children && <div className="mt-3 text-muted-foreground">{children}</div>}
  </div>
);

/** A thin strip of the layers a pattern uses, for cards. */
export const StackStrip = ({ pattern, className }: { pattern: Pattern; className?: string }) => {
  const primary = BOARD_LAYERS.map((l) => pattern.nodes.find((n) => n.layer === l && !n.detail && n.component)).filter(Boolean);
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {primary.slice(0, 6).map((n) => (
        <span key={nodeName(n!)} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {nodeName(n!)}
        </span>
      ))}
    </div>
  );
};

export const PatternCard = ({ pattern, note }: { pattern: Pattern; note?: string }) => (
  <Link
    to={patternPath(pattern.slug)}
    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.18)]"
  >
    <p className="text-xs font-semibold uppercase tracking-widest text-primary">{pattern.category}</p>
    <h3 className="mt-2 text-lg font-bold tracking-tight group-hover:text-primary">{pattern.title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{pattern.stackLine}</p>
    {note && <p className="mt-3 text-sm">{note}</p>}
    <StackStrip pattern={pattern} className="mt-4" />
    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary">
      Open the architecture <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </span>
  </Link>
);

export const FaqList = ({ faqs }: { faqs: Faq[] }) => (
  <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
    {faqs.map((f) => (
      <div key={f.q} className="p-5">
        <dt className="font-semibold">{f.q}</dt>
        <dd className="mt-2 text-muted-foreground">{f.a}</dd>
      </div>
    ))}
  </dl>
);

const isExternal = (href: string) => /^https?:/.test(href);

export const LinkList = ({ links }: { links: LinkRef[] }) => (
  <ul className="space-y-2">
    {links.map((l) => (
      <li key={l.href}>
        {isExternal(l.href) ? (
          <a href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
            {l.label} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <Link to={l.href} className="inline-flex items-center gap-1.5 text-primary hover:underline">
            {l.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </li>
    ))}
  </ul>
);

export const ComponentLink = ({ id, fallback }: { id?: string; fallback?: string }) => {
  const c = componentById(id);
  if (!c) return <span>{fallback}</span>;
  if (c.sitePath)
    return (
      <Link to={c.sitePath} className="font-medium text-primary hover:underline">
        {c.name}
      </Link>
    );
  return (
    <a href={c.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
      {c.name}
    </a>
  );
};
