import { lazy, Suspense, useState } from "react";
import { Github, ArrowUpRight, ChevronDown } from "lucide-react";
import { VideoSlot } from "./VideoSlot";
import policastThumbnail from "@/assets/policast-thumbnail.png.asset.json";

const PolicastFlowDiagram = lazy(() => import("./PolicastFlowDiagram"));

type Props = { videoId?: string };

export const PolicastFlow = ({ videoId }: Props = {}) => {
  const [open, setOpen] = useState(false);

  return (
    <section id="open-policies" className="container py-20 border-t border-border scroll-mt-24">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
        <div>
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Deep dive</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            Open Policies on Unity Catalog
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A reference flow for compiling Cedar policies, persisting them as versioned Delta tables in Unity Catalog,
            and enforcing them at query time across DataFusion and Spark.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="policast-flow-diagram"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {open ? "Hide interactive flow" : "Explore the interactive flow"}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <a
              href="https://github.com/open-lakehouse/policast"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              open-lakehouse/policast
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://cedarpolicy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
            >
              cedarpolicy.com
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://cel.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
            >
              cel.dev
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <VideoSlot videoId={videoId} title="Open Policies on Unity Catalog" poster={policastThumbnail.url} />
      </div>

      {open && (
        <div id="policast-flow-diagram" className="mt-10">
          <Suspense
            fallback={
              <div className="h-48 rounded-2xl border border-border bg-card/40 animate-pulse" />
            }
          >
            <PolicastFlowDiagram />
          </Suspense>
        </div>
      )}
    </section>
  );
};

