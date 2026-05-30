import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const videos = [
  { channel: "Delta Lake", title: "Delta Lake 4.0: What's New", duration: "12:34", hue: 270 },
  { channel: "Open Lakehouse + AI", title: "Building an Open Lakehouse from Scratch", duration: "24:01", hue: 285 },
  { channel: "Apache Iceberg", title: "Iceberg Table Format Deep Dive", duration: "18:22", hue: 260 },
  { channel: "Apache Spark", title: "Spark 4 + Iceberg + Unity Catalog", duration: "31:09", hue: 250 },
  { channel: "Delta Lake", title: "Liquid Clustering Explained", duration: "9:45", hue: 275 },
  { channel: "Open Lakehouse + AI", title: "MLflow + Iceberg for Agentic Pipelines", duration: "16:30", hue: 290 },
  { channel: "Apache Iceberg", title: "REST Catalog with Polaris", duration: "22:18", hue: 265 },
  { channel: "Apache Spark", title: "DataFusion vs Spark: Benchmarks", duration: "14:50", hue: 255 },
];

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
  const [idx, setIdx] = useState(0);
  const visible = useVisibleCount();
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx((i) => (i + 1) % videos.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Reset index if it would push past the available range
  useEffect(() => {
    setIdx((i) => i % videos.length);
  }, [visible]);

  const cardWidth = `calc((100% - ${(visible - 1) * 1.5}rem) / ${visible})`;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX.current = e.clientX;
    setIsDragging(true);
    pausedRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    setDragPx(e.clientX - dragStartX.current);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const track = trackRef.current;
    const slideWidth = track ? (track.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? 0 : 0;
    const step = slideWidth + 24; // gap-6 = 1.5rem = 24px
    const dx = e.clientX - dragStartX.current;
    const threshold = Math.max(40, step * 0.2);
    let next = idx;
    if (dx <= -threshold) next = Math.min(idx + Math.max(1, Math.round(-dx / step)), videos.length - 1);
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
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">From the community</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Watch & Learn</h2>
            <p className="mt-4 text-muted-foreground text-lg">Fresh talks from Delta Lake, Apache Iceberg, Apache Spark, and Open Lakehouse + AI.</p>
          </div>
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
            {[...videos, ...videos.slice(0, visible)].map((v, i) => (
              <article
                key={i}
                className="group flex-shrink-0 rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-glow transition-shadow"
                style={{ width: cardWidth }}
              >
                <div
                  className="relative aspect-video flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, hsl(${v.hue} 60% 25%), hsl(${v.hue + 20} 80% 55%))`,
                  }}
                >
                  <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 30%, white, transparent 50%)" }} />
                  <button className="relative z-10 h-16 w-16 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform" draggable={false}>
                    <Play className="h-7 w-7 ml-1" fill="currentColor" />
                  </button>
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">{v.duration}</span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider">{v.channel}</p>
                  <h3 className="mt-2 font-semibold leading-snug line-clamp-2">{v.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>


        <div className="flex justify-center gap-2 mt-8">
          {videos.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to video ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"}`}
            />
          ))}
        </div>

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
    </section>
  );
};
