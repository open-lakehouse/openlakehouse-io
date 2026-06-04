import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Calendar, Github, MessageCircle, Users, ExternalLink } from "lucide-react";
import { Seo } from "@/components/Seo";
import meetup1 from "@/assets/meetups/meetup-1.jpg.asset.json";
import meetup2 from "@/assets/meetups/meetup-2.jpg.asset.json";
import meetup3 from "@/assets/meetups/meetup-3.jpg.asset.json";
import meetup4 from "@/assets/meetups/meetup-4.jpg.asset.json";
import meetup5 from "@/assets/meetups/meetup-5.jpg.asset.json";
import meetup6 from "@/assets/meetups/meetup-6.jpg.asset.json";
import meetup7 from "@/assets/meetups/meetup-7.jpg.asset.json";
import meetup8 from "@/assets/meetups/meetup-8.jpg.asset.json";
import meetup9 from "@/assets/meetups/meetup-9.jpg.asset.json";
import meetup10 from "@/assets/meetups/meetup-10.jpg.asset.json";
import meetup11 from "@/assets/meetups/meetup-11.jpg.asset.json";
import meetup12 from "@/assets/meetups/meetup-12.jpg.asset.json";
import meetup13 from "@/assets/meetups/meetup-13.jpg.asset.json";
import meetup14 from "@/assets/meetups/meetup-14.jpg.asset.json";



// Hand-tuned order: alternate audience, atmosphere, portraits, detail shots
const gallery = [
  { src: meetup3.url, alt: "Open Lakehouse + AI Amsterdam — speakers with mascots" },
  { src: meetup8.url, alt: "Packed audience watching a Spark talk" },
  { src: meetup14.url, alt: "Open Lakehouse Mini Summit attendees smiling for a group photo" },
  { src: meetup9.url, alt: "Open Lakehouse Meetup stickers — Iceberg, Delta Lake, and more" },
  { src: meetup10.url, alt: "Evening dinner under string lights at an Open Lakehouse meetup" },
  { src: meetup1.url, alt: "Packed room at an Open Lakehouse meetup" },
  { src: meetup13.url, alt: "Daft talk: Your Lakehouse Has Everything You Need" },
  { src: meetup11.url, alt: "Speaker presenting Delta Lake kernel architecture" },
  { src: meetup4.url, alt: "Attendees during a session at Open Lakehouse Amsterdam" },
  { src: meetup12.url, alt: "Outdoor reception tent at night during an Open Lakehouse meetup" },
  { src: meetup2.url, alt: "Speaker presenting at an Open Lakehouse meetup" },
  { src: meetup5.url, alt: "Open Lakehouse meetup moment" },
  { src: meetup7.url, alt: "Open Lakehouse meetup moment" },
  { src: meetup6.url, alt: "Open Lakehouse meetup moment" },
];

const channels = [
  {
    icon: Calendar,
    title: "Events on Luma",
    desc: "Meetups, workshops, and livestreams from the Open Lakehouse community.",
    href: "https://luma.com/openlakehouseai",
    cta: "View upcoming events",
  },
  {
    icon: Github,
    title: "GitHub",
    desc: "Explore the open source projects that power the Open Lakehouse.",
    href: "https://github.com/",
    cta: "Browse repos",
  },
  {
    icon: MessageCircle,
    title: "Discussion",
    desc: "Join the conversation on Slack, Discord, and project mailing lists.",
    href: "https://delta-users.slack.com/",
    cta: "Join the chat",
  },
  {
    icon: Users,
    title: "Contributors",
    desc: "Maintainers, authors, and practitioners shaping open data standards.",
    href: "/authors/jane-doe",
    cta: "Meet the people",
  },
];

const PRELOAD_BATCH = 5;

const Community = () => {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [loadedCount, setLoadedCount] = useState(PRELOAD_BATCH);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const idx = api.selectedScrollSnap();
      // Reveal the next batch when the user reaches within 2 slides of the last loaded image
      const needed = Math.ceil((idx + 3) / PRELOAD_BATCH) * PRELOAD_BATCH;
      setLoadedCount((c) => Math.min(gallery.length, Math.max(c, needed)));
    };
    api.on("select", onSelect);
    api.on("scroll", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("scroll", onSelect);
    };
  }, [api]);

  return (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Open Lakehouse Community — Meetups, Slack, GitHub"
      description="Meetups, Slack channels, GitHub orgs, and gatherings of practitioners building the open lakehouse: Delta Lake, Iceberg, Unity Catalog, MLflow, and Apache Spark."
      path="/community"
    />
    <SiteHeader />
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="container py-24 md:py-32 text-center max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Community</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            Build the Open Lakehouse, together.
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            Connect with practitioners, maintainers, and contributors across the open data
            ecosystem. Attend an event, jump into a discussion, or ship your first PR.
          </p>
        </div>
      </section>

      {/* Channels grid */}
      <section className="container py-20 md:py-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden shadow-card border border-border">
          {channels.map(({ icon: Icon, title, desc, href, cta }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group bg-card hover:bg-secondary/60 transition-colors p-8 flex flex-col min-h-[220px]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-glow">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">{desc}</p>
              <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                {cta} <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Past meetups gallery */}
      <section className="container pb-20 md:pb-28">
        <div className="max-w-3xl mb-10 md:mb-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Past meetups</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
            Moments from the community.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Snapshots from Open Lakehouse meetups around the world — talks, hallway tracks, and the
            people building open data and AI in the open.
          </p>
        </div>
        {/* Mobile: swipeable carousel for lazy-load friendliness */}
        <div className="sm:hidden -mx-4 px-4">
          <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent>
              {gallery.map((img, i) => {
                const shouldLoad = i < loadedCount;
                return (
                  <CarouselItem key={i} className="basis-[85%]">
                    <button
                      type="button"
                      onClick={() => setLightbox(img)}
                      className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl bg-secondary shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Open photo: ${img.alt}`}
                    >
                      {shouldLoad ? (
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading={i < PRELOAD_BATCH ? "eager" : "lazy"}
                          decoding={i < PRELOAD_BATCH ? "sync" : "async"}
                          fetchPriority={i < PRELOAD_BATCH ? "high" : "auto"}
                          className="block w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary animate-pulse" aria-hidden />
                      )}
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Tablet+ : masonry grid */}
        <div className="hidden sm:block columns-2 lg:columns-3 gap-4 md:gap-5 [column-fill:_balance]">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(img)}
              className="group relative mb-4 md:mb-5 block w-full overflow-hidden rounded-xl bg-secondary shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary break-inside-avoid"
              aria-label={`Open photo: ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container pb-24">
        <div className="rounded-2xl bg-brand-gradient p-10 md:p-14 text-center shadow-glow">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Next up: an Open Lakehouse meetup near you.
          </h2>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">
            Subscribe on Luma to get notified about every upcoming event, workshop, and
            livestream.
          </p>
          <a
            href="https://luma.com/openlakehouseai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm md:text-base font-bold text-[hsl(var(--brand-grape))] hover:text-[hsl(var(--brand-blueberry))] shadow-lg hover:scale-105 transition-all"
          >
            <Calendar className="h-4 w-4" />
            Grab your spot →
          </a>
        </div>
      </section>
    </main>
    <SiteFooter />

    <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
      <DialogContent className="max-w-5xl p-0 bg-transparent border-0 shadow-none">
        {lightbox && (
          <img src={lightbox.src} alt={lightbox.alt} className="w-full h-auto rounded-lg" />
        )}
      </DialogContent>
    </Dialog>
  </div>
  );
};

export default Community;
