import { lazy, Suspense, useState } from "react";
import { Github, ArrowUpRight, ChevronDown } from "lucide-react";
import { VideoSlot } from "./VideoSlot";

const OpenLineageFlowDiagram = lazy(() => import("./OpenLineageFlowDiagram"));

type Props = { videoId?: string };

export const OpenLineageFlow = ({ videoId }: Props = {}) => {
  const [open, setOpen] = useState(false);

  return (
    <section id="open-lineage" className="container py-20 border-t border-border scroll-mt-24">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
        <div>
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Deep dive</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            OpenLineage on Spark
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            How a Spark driver and executor plugin emit OpenLineage RunEvents — visiting analyzed query plans,
            aggregating task metrics, and batching protobuf events over Connect RPC to a Go ingestion service backed by Delta Lake.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="open-lineage-diagram"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {open ? "Hide architecture diagram" : "Explore the architecture diagram"}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <a
              href="https://openlineage.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              openlineage.io
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://github.com/open-lakehouse/open-lineage-connect"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              open-lakehouse/open-lineage-connect
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <VideoSlot videoId={videoId} title="OpenLineage on Spark" />
      </div>

      {open && (
        <div id="open-lineage-diagram" className="mt-10">
          <Suspense
            fallback={<div className="h-48 rounded-2xl border border-border bg-card/40 animate-pulse" />}
          >
            <OpenLineageFlowDiagram />
          </Suspense>
        </div>
      )}
    </section>
  );
};

