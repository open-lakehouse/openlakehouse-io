import { ArrowRight, Cpu, BookOpen, Bot, Layers, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { slug: "compute-engines", title: "Compute Engines", icon: Cpu, items: ["Apache Spark", "Apache Flink", "DataFusion"] },
  { slug: "catalogs", title: "Catalogs", icon: BookOpen, items: ["Unity Catalog", "Apache Polaris", "Lakekeeper"] },
  { slug: "agentic", title: "Agentic", icon: Bot, items: ["MLflow"] },
  { slug: "lakehouse-formats", title: "Lakehouse Formats", icon: Layers, items: ["Apache Iceberg", "Delta Lake"] },
  { slug: "orchestration", title: "Orchestration", icon: Workflow, items: ["Apache Airflow", "Temporal"] },
  { slug: "open-governance", title: "Open Governance", icon: ShieldCheck, items: ["OpenLineage", "Policies", "ABAC"] },
];


export const Technologies = () => (
  <section id="technologies" className="container py-20 md:py-28">
    <div className="max-w-2xl mb-12">
      <p className="text-sm font-medium text-primary uppercase tracking-widest">The stack</p>
      <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Open Lakehouse Technologies</h2>
      <p className="mt-4 text-muted-foreground text-lg">The interoperable building blocks of a vendor-neutral data platform.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-card border border-border">
      {categories.map(({ slug, title, icon: Icon, items }) => (
        <Link
          key={slug}
          to={`/technologies/${slug}`}
          className="group relative bg-card hover:bg-secondary/60 transition-colors p-6 flex flex-col min-h-[220px]"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-glow">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold tracking-tight">{title}</h3>
          </div>
          <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
            {items.map((i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary/60" />
                {i}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6 overflow-hidden h-7">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
              Read more <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
);
