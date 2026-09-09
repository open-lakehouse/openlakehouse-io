import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { videos, type Video } from "@/content/videos";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";


const ytUrl = (id: string, playlist?: string) =>
  playlist ? `https://www.youtube.com/watch?v=${id}&list=${playlist}` : `https://www.youtube.com/watch?v=${id}`;

const FILTERS = ["All", "Open Lakehouse + AI", "Apache Spark", "Delta Lake", "Apache Iceberg", "MLflow"] as const;
type Filter = typeof FILTERS[number];
const PAGE_SIZE = 6;

const VideoCardInner = ({ v }: { v: Video }) => (
  <>
    <div
      className="relative aspect-video flex items-center justify-center overflow-hidden"
      style={{
        background: v.videoId ? undefined : `linear-gradient(135deg, hsl(${v.hue} 60% 25%), hsl(${v.hue + 20} 80% 55%))`,
      }}
    >
      {v.videoId && (
        <img
          src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}
          alt={`YouTube video thumbnail: ${v.title} — Open Lakehouse talk`}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 30%, white, transparent 50%)" }} />
      <span className="relative z-10 h-16 w-16 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
        <Play className="h-7 w-7 ml-1" fill="currentColor" />
      </span>
      <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">{v.duration}</span>
    </div>
    <div className="p-5">
      <p className="text-xs font-medium text-primary uppercase tracking-wider">{v.channel}</p>
      <h3 className="mt-2 font-semibold leading-snug line-clamp-2">{v.title}</h3>
    </div>
  </>
);

export const VideosCarousel = () => {
  const isHome = useLocation().pathname === "/";
  const [filter, setFilter] = useState<Filter>("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [active, setActive] = useState<Video | null>(null);
  const filteredVideos = filter === "All" ? videos : videos.filter((v) => v.channel === filter);
  const pageCount = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  const pageVideos = filteredVideos.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const windowSize = 7;
  let pageWindowStart = Math.max(0, currentPage - Math.floor(windowSize / 2));
  const pageWindowEnd = Math.min(pageCount, pageWindowStart + windowSize);
  pageWindowStart = Math.max(0, pageWindowEnd - windowSize);
  const pages = Array.from(
    { length: pageWindowEnd - pageWindowStart },
    (_, index) => pageWindowStart + index,
  );

  const selectFilter = (nextFilter: Filter) => {
    setFilter(nextFilter);
    setCurrentPage(0);
  };

  const goPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(pageCount - 1, page)));
  };

  return (
    <section id="learn" className="py-20 md:py-28 bg-secondary/40 border-y border-border">
      <div className="container">
        <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">From the community</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Watch & Learn</h2>
            <p className="mt-4 text-muted-foreground text-lg">Fresh talks from Delta Lake, Apache Iceberg, Apache Spark, and Open Lakehouse + AI.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => selectFilter(f)}
              aria-pressed={filter === f}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageVideos.map((v) => (
            <button
              key={v.videoId ?? v.title}
              type="button"
              onClick={() => { if (v.videoId) setActive(v); }}
              className="group text-left rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-glow transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <VideoCardInner v={v} />
            </button>
          ))}
        </div>

        {pageCount > 1 && (
          <nav className="mt-10 flex flex-col items-center gap-3" aria-label={`${filter} videos pagination`}>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous page"
                onClick={() => goPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageWindowStart > 0 && (
                <>
                  <button
                    aria-label="Go to page 1"
                    onClick={() => goPage(0)}
                    className="h-8 min-w-8 px-2 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    1
                  </button>
                  <span className="text-muted-foreground text-xs px-0.5" aria-hidden="true">…</span>
                </>
              )}
              {pages.map((page) => (
                <button
                  key={page}
                  aria-label={`Go to page ${page + 1}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  onClick={() => goPage(page)}
                  className={`h-8 min-w-8 px-2 rounded-full text-xs font-medium border transition-colors ${
                    page === currentPage
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {page + 1}
                </button>
              ))}
              {pageWindowEnd < pageCount && (
                <>
                  <span className="text-muted-foreground text-xs px-0.5" aria-hidden="true">…</span>
                  <button
                    aria-label={`Go to page ${pageCount}`}
                    onClick={() => goPage(pageCount - 1)}
                    className="h-8 min-w-8 px-2 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    {pageCount}
                  </button>
                </>
              )}
              <button
                aria-label="Next page"
                onClick={() => goPage(currentPage + 1)}
                disabled={currentPage === pageCount - 1}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
              Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filteredVideos.length)} of {filteredVideos.length}
            </p>
          </nav>
        )}


        {isHome && (
          <div className="mt-10 flex justify-center">
            <Link
              to="/learn"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
            >
              Explore the Learn hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

      </div>

      <Dialog open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border">
          {active && (
            <div className="flex flex-col">
              <div className="relative aspect-video bg-black">
                <iframe
                  key={active.videoId}
                  src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1&rel=0${active.playlist ? `&list=${active.playlist}` : ""}`}
                  title={active.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-6 md:p-8">
                <p className="text-xs font-medium text-primary uppercase tracking-wider">{active.channel}</p>
                <DialogTitle className="mt-2 text-xl md:text-2xl font-bold leading-snug">{active.title}</DialogTitle>
                <DialogDescription className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {active.duration && <span>Duration: {active.duration}</span>}
                  {active.publishedAt && <span>Published: {new Date(active.publishedAt).toLocaleDateString()}</span>}
                </DialogDescription>
                <div className="mt-6">
                  <a
                    href={ytUrl(active.videoId!, active.playlist)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                  >
                    Watch on YouTube <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
