import { useEffect, useState } from "react";
import { Play } from "lucide-react";

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
  const [idx, setIdx] = useState(0);
  const visible = useVisibleCount();

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % videos.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Reset index if it would push past the available range
  useEffect(() => {
    setIdx((i) => i % videos.length);
  }, [visible]);

  const cardWidth = `calc((100% - ${(visible - 1) * 1.5}rem) / ${visible})`;

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

        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-700 ease-out"
            style={{ transform: `translateX(calc(-${idx} * (${cardWidth} + 1.5rem)))` }}
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
                  <button className="relative z-10 h-16 w-16 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
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

      </div>
    </section>
  );
};
