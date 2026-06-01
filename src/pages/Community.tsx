import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calendar, Github, MessageCircle, Users, ExternalLink } from "lucide-react";

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

const Community = () => (
  <div className="min-h-screen flex flex-col">
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
            Grab your spot on Luma →
          </a>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default Community;
