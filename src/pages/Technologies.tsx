import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Technologies as TechnologiesSection } from "@/components/Technologies";

const TechnologiesPage = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main className="flex-1">
      <section className="border-b border-border bg-secondary/30">
        <div className="container py-20 md:py-28">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">The stack</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight">Technologies</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
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
