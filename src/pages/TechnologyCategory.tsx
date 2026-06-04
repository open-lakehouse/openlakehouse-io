import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { PolicastFlow } from "@/components/PolicastFlow";
import { OpenLineageFlow } from "@/components/OpenLineageFlow";

const data: Record<string, { title: string; blurb: string; items: { name: string; desc: string; url: string }[] }> = {
  "compute-engines": {
    title: "Compute Engines",
    blurb: "The execution layer of the open lakehouse — distributed query engines that read open formats from any storage.",
    items: [
      { name: "Apache Spark", desc: "The de-facto distributed analytics engine.", url: "https://spark.apache.org" },
      { name: "Apache Flink", desc: "Streaming-first stateful compute.", url: "https://flink.apache.org" },
      { name: "DataFusion", desc: "An embeddable, blazing-fast Rust query engine.", url: "https://datafusion.apache.org" },
    ],
  },
  "catalogs": {
    title: "Catalogs",
    blurb: "Open table catalogs that broker metadata, identity, and governance across engines.",
    items: [
      { name: "Unity Catalog", desc: "Open-source unified governance for data and AI.", url: "https://unitycatalog.io" },
      { name: "Apache Polaris", desc: "An open Iceberg REST catalog implementation.", url: "https://polaris.apache.org" },
      { name: "Lakekeeper", desc: "Lightweight Rust-based Iceberg REST catalog.", url: "https://docs.lakekeeper.io/" },
    ],
  },
  "agentic": {
    title: "Agentic",
    blurb: "Tools that make the lakehouse a substrate for AI agents and ML workflows.",
    items: [
      { name: "MLflow", desc: "Open lifecycle for ML and agentic systems.", url: "https://mlflow.org" },
    ],
  },
  "lakehouse-formats": {
    title: "Lakehouse Formats",
    blurb: "Open table formats that bring ACID, time travel, and schema evolution to object storage.",
    items: [
      { name: "Apache Iceberg", desc: "A high-performance open table format.", url: "https://iceberg.apache.org" },
      { name: "Delta Lake", desc: "The first lakehouse storage format, now fully open.", url: "https://delta.io" },
      { name: "Apache Hudi", desc: "Streaming-first lakehouse format with upserts and incremental processing.", url: "https://hudi.apache.org" },
    ],
  },
  "orchestration": {
    title: "Orchestration",
    blurb: "Workflow engines that schedule, coordinate, and observe data and AI pipelines across the lakehouse.",
    items: [
      { name: "Apache Airflow", desc: "The most widely adopted open-source workflow orchestrator.", url: "https://airflow.apache.org" },
      { name: "Temporal", desc: "Durable execution platform for reliable, long-running workflows.", url: "https://temporal.io" },
    ],
  },
  "open-governance": {
    title: "Open Governance",
    blurb: "Vendor-neutral standards for lineage, policy, and access control across the stack.",
    items: [
      { name: "OpenLineage", desc: "Open standard for data lineage collection.", url: "#open-lineage" },
      { name: "Policies", desc: "Declarative, portable data policies.", url: "#open-policies" },
      { name: "ABAC", desc: "Attribute-based access control for fine-grained governance.", url: "#" },
    ],
  },
};

const TechnologyCategory = () => {
  const { slug } = useParams();
  const cat = slug ? data[slug] : null;

  if (!cat) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-32 text-center">
          <h1 className="text-3xl font-bold">Category not found</h1>
          <Link to="/" className="mt-6 inline-block text-primary">Back home</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${cat.title} — Open Lakehouse Technologies`}
        description={cat.blurb}
        path={`/technologies/${slug}`}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-brand-gradient text-primary-foreground">
          <div className="container py-20 md:py-28">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{cat.title}</h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl">{cat.blurb}</p>
          </div>
        </section>

        <section className="container py-20">
          <div className="grid sm:grid-cols-2 gap-6">
            {cat.items.map((it) => {
              const isAnchor = it.url.startsWith("#");
              const handleClick = isAnchor
                ? (e: React.MouseEvent) => {
                    e.preventDefault();
                    document
                      .querySelector(it.url)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                : undefined;
              return (
                <a
                  key={it.name}
                  href={it.url}
                  onClick={handleClick}
                  target={isAnchor ? undefined : "_blank"}
                  rel={isAnchor ? undefined : "noopener noreferrer"}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all"
                >
                  <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">{it.name}</h3>
                  <p className="mt-2 text-muted-foreground">{it.desc}</p>
                </a>
              );
            })}
          </div>
        </section>

        {slug === "open-governance" && (
          <>
            <OpenLineageFlow />
            <PolicastFlow videoId="WMhaqR5pgYU" />
          </>
        )}

      </main>
      <SiteFooter />
    </div>
  );
};

export default TechnologyCategory;
