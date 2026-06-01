import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { videos, type Video } from "@/content/videos";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";


const ytUrl = (id: string, playlist?: string) =>
  playlist ? `https://www.youtube.com/watch?v=${id}&list=${playlist}` : `https://www.youtube.com/watch?v=${id}`;

const FILTERS = ["All", "Open Lakehouse + AI", "Apache Spark", "Delta Lake", "Apache Iceberg", "MLflow"] as const;
type Filter = typeof FILTERS[number];

const useVisibleCount = () => {
  const get = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };
  const [n, setN] = useState(get);
  useEffect(() => {
    const onResize = () => setN(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return n;
};

export const VideosCarousel = () => {
  const isHome = useLocation().pathname === "/";
  const [filter, setFilter] = useState<Filter>("All");
  const filteredVideos = filter === "All" ? videos : videos.filter((v) => v.channel === filter);
  const [idx, setIdx] = useState(0);
  const visible = useVisibleCount();
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const draggedRef = useRef(false); // tracks if pointerdown turned into a real drag
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current && !active && filteredVideos.length > 0)
        setIdx((i) => (i + 1) % filteredVideos.length);
    }, 5000);
    return () => clearInterval(t);
  }, [filteredVideos.length, active]);

  // Reset index when filter or visible count changes
  useEffect(() => {
    setIdx(0);
  }, [filter]);

  useEffect(() => {
    setIdx((i) => (filteredVideos.length ? i % filteredVideos.length : 0));
  }, [visible, filteredVideos.length]);

  const cardWidth = `calc((100% - ${(visible - 1) * 1.5}rem) / ${visible})`;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX.current = e.clientX;
    draggedRef.current = false;
    setIsDragging(true);
    pausedRef.current = true;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 8) {
      draggedRef.current = true;
    }
    setDragPx(dx);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const track = trackRef.current;
    const slideWidth = track ? (track.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? 0 : 0;
    const step = slideWidth + 24; // gap-6 = 1.5rem = 24px
    const dx = e.clientX - dragStartX.current;
    const threshold = Math.max(40, step * 0.2);
    let next = idx;
    if (dx <= -threshold) next = Math.min(idx + Math.max(1, Math.round(-dx / step)), Math.max(0, filteredVideos.length - 1));
    else if (dx >= threshold) next = Math.max(idx - Math.max(1, Math.round(dx / step)), 0);
    setIdx(next);
    setDragPx(0);
    setIsDragging(false);
    dragStartX.current = null;
    // resume autoplay shortly after
    setTimeout(() => { pausedRef.current = false; }, 4000);
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
              onClick={() => setFilter(f)}
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

        <div
          className="overflow-hidden touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div
            ref={trackRef}
            className={`flex gap-6 ${isDragging ? "" : "transition-transform duration-700 ease-out"}`}
            style={{ transform: `translate3d(calc(-${idx} * (${cardWidth} + 1.5rem) + ${dragPx}px), 0, 0)` }}
          >
            {[...filteredVideos, ...filteredVideos.slice(0, Math.min(visible, filteredVideos.length))].map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  if (draggedRef.current) { e.preventDefault(); return; }
                  if (v.videoId) setActive(v);
                }}
                draggable={false}
                className="group flex-shrink-0 text-left rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-glow transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ width: cardWidth }}
              >
                <div
                  className="relative aspect-video flex items-center justify-center overflow-hidden"
                  style={{
                    background: v.videoId ? undefined : `linear-gradient(135deg, hsl(${v.hue} 60% 25%), hsl(${v.hue + 20} 80% 55%))`,
                  }}
                >
                  {v.videoId && (
                    <img
                      src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}
                      alt={v.title}
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
              </button>
            ))}
          </div>
        </div>


        {filteredVideos.length > 0 && (() => {
          const total = filteredVideos.length;
          const compact = total > 20;
          const pageSize = compact ? visible : 1;
          const pageCount = Math.max(1, Math.ceil(total / pageSize));
          const currentPage = Math.min(Math.floor(idx / pageSize), pageCount - 1);
          const goPage = (p: number) => {
            const clamped = Math.max(0, Math.min(pageCount - 1, p));
            setIdx(Math.min(clamped * pageSize, Math.max(0, total - 1)));
            pausedRef.current = true;
            setTimeout(() => { pausedRef.current = false; }, 4000);
          };

          if (!compact) {
            return (
              <div className="flex justify-center gap-2 mt-8">
                {filteredVideos.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to video ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"}`}
                  />
                ))}
              </div>
            );
          }

          // Compact pager: arrows + windowed page dots + readout
          const windowSize = 7;
          let start = Math.max(0, currentPage - Math.floor(windowSize / 2));
          let end = Math.min(pageCount, start + windowSize);
          start = Math.max(0, end - windowSize);
          const pages: number[] = [];
          for (let p = start; p < end; p++) pages.push(p);

          return (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous page"
                  onClick={() => goPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {start > 0 && (
                  <>
                    <button
                      onClick={() => goPage(0)}
                      className="h-8 min-w-8 px-2 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      1
                    </button>
                    <span className="text-muted-foreground text-xs px-0.5">…</span>
                  </>
                )}
                {pages.map((p) => (
                  <button
                    key={p}
                    aria-label={`Go to page ${p + 1}`}
                    aria-current={p === currentPage ? "page" : undefined}
                    onClick={() => goPage(p)}
                    className={`h-8 min-w-8 px-2 rounded-full text-xs font-medium border transition-colors ${
                      p === currentPage
                        ? "bg-primary text-primary-foreground border-primary shadow-glow"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}
                {end < pageCount && (
                  <>
                    <span className="text-muted-foreground text-xs px-0.5">…</span>
                    <button
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
              <p className="text-xs text-muted-foreground tabular-nums">
                Video {Math.min(idx + 1, total)}–{Math.min(idx + visible, total)} of {total}
              </p>
            </div>
          );
        })()}

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
