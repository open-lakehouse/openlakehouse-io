import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { concepts, type Concept } from "@/data/concepts";

const ConceptCard = ({ slug, title, icon: Icon, blurb, status, approaches }: Concept) => {
  const isLive = status === "live";
  const body = (
    <>
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
        {!isLive && (
          <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Soon
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{blurb}</p>
      <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
        {approaches.map((a) => (
          <li key={a.slug} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            {a.title}
          </li>
        ))}
      </ul>
      {isLive && (
        <div className="mt-auto pt-6 overflow-hidden h-7">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
            Explore <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )}
    </>
  );

  const className =
    "group relative bg-card transition-colors p-6 flex flex-col min-h-[260px]";

  if (!isLive) {
    return <div className={`${className} opacity-70`}>{body}</div>;
  }

  return (
    <Link to={`/concepts/${slug}`} className={`${className} hover:bg-secondary/60`}>
      {body}
    </Link>
  );
};

export const Concepts = () => {
  const isHome = useLocation().pathname === "/";

  return (
    <section id="concepts" className="container py-20 md:py-28">
      <div className="max-w-2xl mb-12">
        <p className="text-sm font-medium text-primary uppercase tracking-widest">The concepts</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Lakehouse Concepts</h2>
        <p className="mt-4 text-muted-foreground text-lg">
          The core concepts of an open lakehouse — and the architectural patterns that make each one real.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-card border border-border">
        {concepts.map((cap) => (
          <ConceptCard key={cap.slug} {...cap} />
        ))}
      </div>

      {isHome && (
        <div className="mt-10 flex justify-center">
          <Link
            to="/concepts"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            Explore all concepts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
};
