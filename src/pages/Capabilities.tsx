import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Capabilities as CapabilitiesSection } from "@/components/Capabilities";
import { Seo } from "@/components/Seo";

const CapabilitiesPage = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Lakehouse Capabilities — Governance, and the patterns behind it"
      description="The properties an open lakehouse must deliver, framed by the architectural patterns that make them real — starting with governance: credential vending, server-side planning, and trusted compute."
      path="/capabilities"
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="container py-24 md:py-32 text-center max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">The capabilities</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            Lakehouse Capabilities
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            What an open lakehouse must deliver — and the architectural patterns that make each property real. We start
            with governance.
          </p>
        </div>
      </section>

      <CapabilitiesSection />
    </main>
    <SiteFooter />
  </div>
);

export default CapabilitiesPage;
