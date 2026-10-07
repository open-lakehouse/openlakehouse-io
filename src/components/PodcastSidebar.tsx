import { ExternalLink, Mic } from "lucide-react";

const SHOW_TITLE = "This Week in Open Lakehouse";
const SHOW_ID = "4k97PCeKwCIyrWLYXVijSZ";
const SHOW_URL = `https://open.spotify.com/show/${SHOW_ID}`;
const EMBED_URL = `https://open.spotify.com/embed/show/${SHOW_ID}`;

export const PodcastSidebar = ({ className = "" }: { className?: string }) => (
  <aside
    aria-labelledby="podcast-heading"
    className={`flex flex-col rounded-2xl border border-border bg-card shadow-card p-5 ${className}`}
  >
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-glow">
        <Mic className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Podcast</p>
        <h3 id="podcast-heading" className="font-semibold tracking-tight">
          {SHOW_TITLE}
        </h3>
      </div>
    </div>
    <p className="mt-3 text-sm text-muted-foreground">
      Weekly open source news on query engines, catalogs, table formats, orchestrators, and
      streaming, with Lisa Cao and Scott Haines.
    </p>
    {/* Spotify's show player renders at a fixed 352px; a taller iframe only adds blank space. */}
    <iframe
      src={EMBED_URL}
      title={`${SHOW_TITLE} on Spotify`}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      className="mt-5 w-full h-[352px] shrink-0 rounded-xl border-0"
    />
    <a
      href={SHOW_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto pt-4 self-start inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
    >
      Listen on Spotify <ExternalLink className="h-3.5 w-3.5" />
    </a>
  </aside>
);
