import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Technologies as TechnologiesSection } from "@/components/Technologies";
import { Seo } from "@/components/Seo";

const TechnologiesPage = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Open Lakehouse Technologies — Delta Lake, Iceberg, Unity Catalog, MLflow, Spark"
      description="A guided tour of the open, interoperable building blocks of a vendor-neutral lakehouse: storage formats (Delta Lake, Apache Iceberg, Apache Hudi), catalogs (Unity Catalog, Polaris), compute engines (Apache Spark, Flink, DataFusion), orchestration, governance, and agentic AI."
      path="/technologies"
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="container py-24 md:py-32 text-center max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">The stack</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            Technologies
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            A guided tour of the open, interoperable building blocks that make up a modern,
            vendor-neutral lakehouse — from storage formats to compute, catalogs, orchestration,
            governance, and agentic AI.
          </p>
        </div>
      </section>

      <TechnologiesSection />
    </main>
    <SiteFooter />
  </div>
);

export default TechnologiesPage;
