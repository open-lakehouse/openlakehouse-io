import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { Technologies } from "@/components/Technologies";
import { VideosCarousel } from "@/components/VideosCarousel";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main className="flex-1">
      <Hero />
      <Technologies />
      <VideosCarousel />
    </main>
    <SiteFooter />
  </div>
);

export default Index;
