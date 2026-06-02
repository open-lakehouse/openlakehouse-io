import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs, faqJsonLd } from "@/components/FAQ";
import { SITE_URL } from "@/lib/seo";

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
  ],
};

const FaqPage = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="FAQ — Open Lakehouse, Delta Lake, Iceberg, Unity Catalog, MLflow, Spark"
      description="Direct, citable answers about the Open Lakehouse architecture and its core open-source projects: Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark."
      path="/faq"
      jsonLd={[faqJsonLd, breadcrumbJsonLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <section
        className="py-16 md:py-24"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <div className="container max-w-4xl">
          <header className="mb-10 md:mb-14">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
              <a href="/" className="hover:text-foreground">Home</a>
              <span className="mx-2">/</span>
              <span aria-current="page">FAQ</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-display tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Direct answers about the Open Lakehouse, Delta Lake, Apache Iceberg, Unity Catalog,
              MLflow, and Apache Spark. Written to be cited verbatim by humans and AI assistants.
            </p>
          </header>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm px-5 data-[state=open]:bg-card/70 data-[state=open]:border-border transition-colors"
              >
                <AccordionTrigger
                  className="text-left text-base md:text-lg font-medium hover:no-underline py-5"
                  itemProp="name"
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                  className="pb-6"
                >
                  <div
                    itemProp="text"
                    className="text-muted-foreground leading-relaxed space-y-4 text-[0.95rem] md:text-base"
                  >
                    {f.a}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default FaqPage;
