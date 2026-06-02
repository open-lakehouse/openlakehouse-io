import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";

import { LogoMarquee } from "@/components/LogoMarquee";
import { Technologies } from "@/components/Technologies";
import { VideosCarousel } from "@/components/VideosCarousel";
import { FAQ } from "@/components/FAQ";
import { Seo } from "@/components/Seo";
import { organizationJsonLd, websiteJsonLd, SITE_DESCRIPTION } from "@/lib/seo";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Open Lakehouse — Open formats, open engines, your storage"
      description={SITE_DESCRIPTION}
      path="/"
      suffix={false}
      jsonLd={[organizationJsonLd, websiteJsonLd]}
    />
    <SiteHeader />
    <main className="flex-1">
      <Hero />
      <LogoMarquee />
      <Technologies />
      <VideosCarousel />
      <FAQ />

    </main>
    <SiteFooter />
  </div>
);

export default Index;
