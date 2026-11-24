import { ExternalLink, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthor } from "@/content/content";

import { SHOW, episodes, episodePath } from "@/content/podcast";

const SHOW_TITLE = SHOW.title;
const SHOW_URL = SHOW.spotifyUrl;
const EMBED_URL = `https://open.spotify.com/embed/show/${SHOW.spotifyId}`;
const HOST_SLUGS = SHOW.hostSlugs;
const latest = episodes[0];

const hosts = HOST_SLUGS.map(getAuthor).filter(Boolean);

/** Homepage feature band for the podcast: show details beside the Spotify player. */
export const PodcastSection = () => (
  <section id="podcast" aria-labelledby="podcast-heading" className="relative overflow-hidden bg-hero-gradient text-white">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-green-500/15 blur-3xl"
    />

    <div className="container relative grid gap-10 py-20 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center lg:gap-16">
      <div className="max-w-xl">
        <p className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-green-300">
          <Mic aria-hidden="true" className="h-4 w-4" /> Podcast
        </p>
        <h2 id="podcast-heading" className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white">
          {SHOW_TITLE}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/80">
          Weekly open source news on query engines, catalogs, table formats, orchestrators, and
          streaming.
        </p>

        {hosts.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Hosted by</p>
            <ul className="mt-3 space-y-2">
              {hosts.map((host) => (
                <li key={host.slug} className="text-sm">
                  <Link
                    to={`/authors/${host.slug}`}
                    className="font-semibold text-white underline-offset-4 hover:underline"
                  >
                    {host.name}
                  </Link>
                  {host.role && <span className="text-white/70"> · {host.role}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {latest && (
          <p className="mt-8 text-sm text-white/80">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Latest episode</span>
            <br />
            <Link to={episodePath(latest)} className="font-semibold text-white underline-offset-4 hover:underline">
              {latest.title}
            </Link>
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to={SHOW.path}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          All episodes and transcripts
        </Link>
        <a
          href={SHOW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-green-700 shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
        >
          Listen on Spotify <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
        </div>
      </div>

      {/* Spotify's show player renders at a fixed 352px; a taller iframe only adds blank space.
          The faint panel marks the slot while the player loads or if it's blocked. */}
      <iframe
        src={EMBED_URL}
        title={`${SHOW_TITLE} on Spotify`}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className="h-[352px] w-full rounded-2xl border-0 bg-white/5 shadow-card ring-1 ring-white/10"
      />
    </div>
  </section>
);
