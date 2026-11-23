import { Link } from "react-router-dom";
import { Clock, Mic, Rss } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { getAuthor } from "@/content/content";
import { SHOW, episodes, episodePath, formatEpisodeDate, humanDuration, seriesJsonLd } from "@/content/podcast";
import { SITE_URL } from "@/lib/seo";

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Podcast", item: `${SITE_URL}${SHOW.path}` },
  ],
};

export const ListenLinks = ({ className = "" }: { className?: string }) => (
  <ul className={`flex flex-wrap gap-3 text-sm ${className}`}>
    <li>
      <a href={SHOW.spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 font-medium hover:border-primary/40 hover:bg-muted">
        Spotify
      </a>
    </li>
    <li>
      <a href={SHOW.appleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 font-medium hover:border-primary/40 hover:bg-muted">
        Apple Podcasts
      </a>
    </li>
    <li>
      <a href={SHOW.rssUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 font-medium hover:border-primary/40 hover:bg-muted">
        <Rss aria-hidden="true" className="h-3.5 w-3.5" /> RSS
      </a>
    </li>
  </ul>
);

const PodcastIndex = () => {
  const hosts = SHOW.hostSlugs.map(getAuthor).filter(Boolean);
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${SHOW.title}: a weekly open source data engineering podcast`}
        description={SHOW.description}
        path={SHOW.path}
        image={episodes[0]?.image}
        jsonLd={[seriesJsonLd, breadcrumbJsonLd]}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden pb-24 pt-14 md:pt-20">
          <div aria-hidden="true" className="bg-aurora pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]" />
          <div className="container max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span className="mx-2">/</span>
              <span aria-current="page">Podcast</span>
            </nav>
            <header className="mb-12 flex flex-col gap-5">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-primary">
                <Mic aria-hidden="true" className="h-4 w-4" /> Podcast
              </p>
              <h1 className="text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                {SHOW.title}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{SHOW.tagline}</p>
              {hosts.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Hosted by{" "}
                  {hosts.map((h, i) => (
                    <span key={h.slug}>
                      {i > 0 && " and "}
                      <Link to={`/authors/${h.slug}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                        {h.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
              <ListenLinks />
            </header>

            <h2 className="mb-6 text-2xl font-semibold tracking-tight">All episodes</h2>
            <ol className="flex flex-col gap-4">
              {episodes.map((e) => (
                <li key={e.guid}>
                  <article className="rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/40">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                      {e.episodeNumber && <span className="text-primary">Episode {e.episodeNumber}</span>}
                      <time dateTime={e.date}>{formatEpisodeDate(e.date)}</time>
                      {e.duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock aria-hidden="true" className="h-3 w-3" /> {humanDuration(e.duration)}
                        </span>
                      )}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight">
                      <Link to={episodePath(e)} className="hover:text-primary">
                        {e.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-muted-foreground">{e.summary}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PodcastIndex;
