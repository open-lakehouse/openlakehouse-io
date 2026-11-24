import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Mic, Rss, Youtube } from "lucide-react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { getAuthor } from "@/content/content";
import { SHOW, episodes, episodePath, formatEpisodeDate, humanDuration, seriesJsonLd, episodeTitle, writeupFor, youtubeFor } from "@/content/podcast";
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
    <li>
      <a href={SHOW.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 font-medium hover:border-primary/40 hover:bg-muted">
        <Youtube aria-hidden="true" className="h-3.5 w-3.5" /> YouTube
      </a>
    </li>
  </ul>
);

const PodcastIndex = () => {
  const hosts = SHOW.hostSlugs.map(getAuthor).filter(Boolean);
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return episodes;
    return episodes.filter((e) => {
      const text = [episodeTitle(e), writeupFor(e)?.excerpt, e.summary, e.notesHtml].join(" ").toLowerCase();
      return terms.every((t) => text.includes(t));
    });
  }, [query]);
  const latest = episodes[0];
  const latestVideo = latest && youtubeFor(latest);
  const firstEpisode = episodes[episodes.length - 1];
  const since = firstEpisode
    ? new Date(firstEpisode.date).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    : undefined;
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

            {latest && (
              <section aria-labelledby="latest-heading" className="mb-16">
                <h2 id="latest-heading" className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-primary">
                  Latest episode
                </h2>
                <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  {latestVideo && <YouTubeEmbed videoId={latestVideo.id} title={episodeTitle(latest)} />}
                  <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                    <time dateTime={latest.date}>{formatEpisodeDate(latest.date)}</time>
                    {latest.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock aria-hidden="true" className="h-3 w-3" /> {humanDuration(latest.duration)}
                      </span>
                    )}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-snug tracking-tight">
                    <Link to={episodePath(latest)} className="hover:text-primary">{episodeTitle(latest)}</Link>
                  </h3>
                  <p className="mt-3 text-muted-foreground">{writeupFor(latest)?.excerpt ?? latest.summary}</p>
                  <Link to={episodePath(latest)} className="mt-4 inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                    Write-up, show notes and transcript <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </article>
              </section>
            )}

            <section aria-labelledby="about-heading" className="mb-16 grid gap-10 md:grid-cols-[3fr_2fr]">
              <div>
                <h2 id="about-heading" className="mb-4 text-2xl font-semibold tracking-tight">About the show</h2>
                <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
                  <p>
                    Every week Scott and I go through what changed in the open lakehouse: releases, votes and
                    proposals on the Apache dev lists, spec changes in Iceberg, Delta, Parquet and Arrow, and
                    the engines, catalogs and orchestrators built on top of them. We say when something is
                    still a proposal, and we fix it in writing when we got it wrong on air.
                  </p>
                  {since && <p>Weekly since {since}, with the occasional special when a week's news is mostly about AI.</p>}
                </div>
              </div>
              <div>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight">Every episode has</h2>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
                  <li>The video on YouTube and the audio wherever you listen</li>
                  <li>A write-up with links to the primary sources</li>
                  <li>Show notes</li>
                  <li>A full transcript</li>
                </ul>
              </div>
            </section>

            {hosts.length > 0 && (
              <section aria-labelledby="hosts-heading" className="mb-16">
                <h2 id="hosts-heading" className="mb-6 text-2xl font-semibold tracking-tight">Hosts</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {hosts.map((h) => (
                    <li key={h.slug} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                      {h.avatar ? (
                        <img src={h.avatar} alt="" className="h-14 w-14 rounded-full object-cover" loading="lazy" />
                      ) : (
                        <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-muted font-semibold">
                          {h.name.split(" ").map((w) => w[0]).join("")}
                        </span>
                      )}
                      <div>
                        <Link to={`/authors/${h.slug}`} className="font-semibold hover:text-primary">{h.name}</Link>
                        {h.role && <p className="text-sm text-muted-foreground">{h.role}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">All episodes</h2>
              <label className="w-full sm:w-72">
                <span className="sr-only">Search episodes</span>
                <input
                  type="search"
                  value={query}
                  onChange={(ev) => setQuery(ev.target.value)}
                  placeholder="Search episodes"
                  className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary/60"
                />
              </label>
            </div>
            {shown.length === 0 && <p className="text-muted-foreground">No episode mentions that yet.</p>}
            <ol className="flex flex-col gap-4">
              {shown.map((e) => (
                <li key={e.guid}>
                  <article className="rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/40">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                      <time dateTime={e.date}>{formatEpisodeDate(e.date)}</time>
                      {e.duration && (
                        <span className="inline-flex items-center gap-1">
                          <Clock aria-hidden="true" className="h-3 w-3" /> {humanDuration(e.duration)}
                        </span>
                      )}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight">
                      <Link to={episodePath(e)} className="hover:text-primary">
                        {episodeTitle(e)}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-muted-foreground">{writeupFor(e)?.excerpt ?? e.summary}</p>
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
