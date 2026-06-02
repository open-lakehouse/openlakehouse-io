import { useState } from "react";
import {
  Play,
  Eye,
  Tag,
  Box,
  Radio,
  Layers,
  Inbox,
  Database,
  Hourglass,
  Send,
  RefreshCcw,
  Activity,
  CheckCircle2,
  Gauge,
  Server,
  HardDrive,
  Network,
  ChevronRight,
} from "lucide-react";

type StepId =
  | "einit"
  | "etask"
  | "epayload"
  | "init"
  | "visitor"
  | "rctx"
  | "builder"
  | "sprog"
  | "agg"
  | "recv"
  | "queue"
  | "drain"
  | "post"
  | "retry"
  | "ingest"
  | "delta"
  | "storage";

type Step = {
  id: StepId;
  label: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  detail: string;
};

const steps: Record<StepId, Step> = {
  einit: { id: "einit", label: "LineageExecutorPlugin", sub: "init(ctx, extraConf)", icon: Play, detail: "Bootstraps the executor-side plugin, wiring task listeners and the RPC sender that ships metrics back to the driver." },
  etask: { id: "etask", label: "Task lifecycle", sub: "onTaskSucceeded / onTaskFailed", icon: CheckCircle2, detail: "Hooks into Spark's task end callbacks to capture per-task success, failure, and accumulator state." },
  epayload: { id: "epayload", label: "ExecutorTaskMetrics", sub: "records, bytes, CPU, GC, host", icon: Gauge, detail: "Compact payload of records and bytes read/written, CPU, GC, memory, executionId, and host — sent over Spark RPC to the driver." },

  init: { id: "init", label: "LineageDriverPlugin", sub: "init(sc, ctx)", icon: Play, detail: "Driver-side bootstrap: registers query and streaming listeners, the metrics aggregator, and the RPC receiver." },
  visitor: { id: "visitor", label: "QueryPlanVisitor", sub: "qe.analyzed → DatasetRefs", icon: Eye, detail: "Walks the analyzed logical plan to derive input/output DatasetRefs that anchor each lineage RunEvent." },
  rctx: { id: "rctx", label: "RunContext", sub: "runId, JobRef, status, facets", icon: Tag, detail: "Assembles the run identity (runId, JobRef), status, and facet payloads consumed by the event builder." },
  builder: { id: "builder", label: "RunEventBuilder", sub: "→ Lineage.RunEvent (proto)", icon: Box, detail: "Materializes the protobuf RunEvent that downstream consumers persist as the canonical lineage record." },
  sprog: { id: "sprog", label: "Streaming listener", sub: "onQueryStarted / Progress / Terminated", icon: Radio, detail: "Structured Streaming progress events flow through the same RunEvent pipeline so streaming jobs emit consistent lineage." },
  agg: { id: "agg", label: "TaskMetricsAggregator", sub: "merged into terminal RunEvent facets", icon: Layers, detail: "Folds executor task metrics into facets attached to the terminal RunEvent for the query." },
  recv: { id: "recv", label: "Driver RPC receiver", sub: "receive(ExecutorTaskMetrics)", icon: Inbox, detail: "Endpoint that accepts metrics RPCs from executor plugins and forwards them into the aggregator." },

  queue: { id: "queue", label: "Bounded queue", sub: "ArrayBlockingQueue[RunEvent], size 1024", icon: Database, detail: "Backpressure-friendly buffer between event producers and the network sink — drops the oldest if full." },
  drain: { id: "drain", label: "Batch drain", sub: "every batchFlushMs (250ms)", icon: Hourglass, detail: "Worker thread drains the queue on a fixed cadence and assembles a batch for transport." },
  post: { id: "post", label: "POST IngestBatch", sub: "/lineage.v1.LineageService/IngestBatch", icon: Send, detail: "OkHttp POST with Content-Type application/proto to the Go ingestion service over Connect RPC." },
  retry: { id: "retry", label: "Retry policy", sub: "408 / 429 / 5xx, exponential backoff", icon: RefreshCcw, detail: "Transient failures are retried with exponential backoff; permanent failures are surfaced to metrics." },

  ingest: { id: "ingest", label: "open-lineage-service", sub: "gRPC/Connect IngestBatch", icon: Server, detail: "Go service that validates and de-dupes incoming RunEvents before persisting them." },
  delta: { id: "delta", label: "Delta Lake writer", sub: "via Rust sidecar", icon: HardDrive, detail: "Writes RunEvents to Delta tables through a Rust sidecar for low-latency, transactional ingestion." },
  storage: { id: "storage", label: "Storage graph", sub: "queryable lineage", icon: Network, detail: "The materialized lineage graph — joins, columns, runs, and facets — ready for query and visualization." },
};

const edges: { from: StepId; to: StepId }[] = [
  { from: "einit", to: "etask" },
  { from: "etask", to: "epayload" },
  { from: "epayload", to: "recv" },

  { from: "init", to: "visitor" },
  { from: "init", to: "sprog" },
  { from: "init", to: "agg" },
  { from: "init", to: "recv" },
  { from: "visitor", to: "rctx" },
  { from: "rctx", to: "builder" },
  { from: "recv", to: "agg" },
  { from: "builder", to: "queue" },
  { from: "sprog", to: "queue" },
  { from: "agg", to: "queue" },

  { from: "queue", to: "drain" },
  { from: "drain", to: "post" },
  { from: "post", to: "retry" },
  { from: "retry", to: "ingest" },

  { from: "ingest", to: "delta" },
  { from: "delta", to: "storage" },
];

const Node = ({
  step,
  active,
  hovered,
  onEnter,
  onLeave,
  onClick,
}: {
  step: Step;
  active: boolean;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) => {
  const Icon = step.icon;
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
      className={`relative w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-300 ${
        active
          ? "border-primary bg-primary/10 shadow-glow scale-[1.02]"
          : hovered
          ? "border-primary/40 bg-card"
          : "border-border bg-card/60 hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-tight truncate">{step.label}</div>
          {step.sub && <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{step.sub}</div>}
        </div>
      </div>
    </button>
  );
};

const GroupBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-dashed border-border/70 p-3">
    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">{title}</div>
    <div className="space-y-2">{children}</div>
  </div>
);

const FlowArrow = () => (
  <svg width="28" height="6" viewBox="0 0 28 6" className="text-primary/70">
    <defs>
      <linearGradient id="ol-flow-grad" x1="0" x2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
      </linearGradient>
    </defs>
    <line x1="0" y1="3" x2="22" y2="3" stroke="url(#ol-flow-grad)" strokeWidth="1.5" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="6" to="0" dur="0.8s" repeatCount="indefinite" />
    </line>
    <polygon points="22,0 28,3 22,6" fill="currentColor" />
  </svg>
);

const OpenLineageFlowDiagram = () => {
  const [active, setActive] = useState<StepId | null>(null);
  const isActive = (id: StepId) => active === id;
  const onPath = (id: StepId) =>
    !!active && edges.some((e) => (e.from === active && e.to === id) || (e.to === active && e.from === id));
  const detail = active ? steps[active] : null;

  const nodeProps = (id: StepId) => ({
    step: steps[id],
    active: isActive(id),
    hovered: onPath(id),
    onEnter: () => setActive(id),
    onLeave: () => {},
    onClick: () => setActive(active === id ? null : id),
  });

  const mobileStages: { title: string; ids: StepId[] }[] = [
    { title: "Spark executor JVM", ids: ["einit", "etask", "epayload"] },
    { title: "Driver: bootstrap & listeners", ids: ["init", "visitor", "rctx", "builder", "sprog", "agg", "recv"] },
    { title: "ConnectRpcEventSink", ids: ["queue", "drain", "post", "retry"] },
    { title: "open-lineage-service (Go)", ids: ["ingest", "delta"] },
    { title: "Storage", ids: ["storage"] },
  ];

  return (
    <div className="animate-[fade-up_0.4s_ease-out]">
      {/* Mobile: vertical stepper */}
      <div className="md:hidden space-y-3">
        {mobileStages.map((stage, i, arr) => (
          <div key={stage.title}>
            <GroupBox title={stage.title}>
              {stage.ids.map((id) => (
                <Node key={id} {...nodeProps(id)} />
              ))}
            </GroupBox>
            {i < arr.length - 1 && (
              <div className="flex justify-center py-1.5 text-primary/60">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: horizontal flow */}
      <div className="hidden md:block rounded-2xl border border-border bg-card/40 p-4 md:p-6 shadow-card overflow-x-auto">
        <div className="min-w-[1100px] grid grid-cols-[0.9fr_1.3fr_1fr_0.9fr_0.7fr] gap-4 items-stretch">
          {/* Col 1 — Executor */}
          <GroupBox title="Spark executor JVM">
            <Node {...nodeProps("einit")} />
            <Node {...nodeProps("etask")} />
            <Node {...nodeProps("epayload")} />
          </GroupBox>

          {/* Col 2 — Driver listeners */}
          <GroupBox title="Spark driver JVM">
            <Node {...nodeProps("init")} />
            <div className="rounded-lg border border-dashed border-border/60 p-2 space-y-2">
              <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground px-1">Query listener</div>
              <Node {...nodeProps("visitor")} />
              <Node {...nodeProps("rctx")} />
              <Node {...nodeProps("builder")} />
            </div>
            <Node {...nodeProps("sprog")} />
            <Node {...nodeProps("recv")} />
            <Node {...nodeProps("agg")} />
          </GroupBox>

          {/* Col 3 — Sink */}
          <GroupBox title="ConnectRpcEventSink">
            <Node {...nodeProps("queue")} />
            <Node {...nodeProps("drain")} />
            <Node {...nodeProps("post")} />
            <Node {...nodeProps("retry")} />
          </GroupBox>

          {/* Col 4 — Go service */}
          <GroupBox title="open-lineage-service (Go)">
            <Node {...nodeProps("ingest")} />
            <Node {...nodeProps("delta")} />
          </GroupBox>

          {/* Col 5 — Lineage graph */}
          <GroupBox title="Lineage graph">
            <Node {...nodeProps("storage")} />
          </GroupBox>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Executor</span>
          <FlowArrow />
          <span>Driver</span>
          <FlowArrow />
          <span>Batch &amp; ship</span>
          <FlowArrow />
          <span>Ingest</span>
          <FlowArrow />
          <span>Storage graph</span>
        </div>
      </div>

      {/* Detail card */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5 min-h-[110px] transition-all">
        {detail ? (
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
              <detail.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold tracking-tight">
                {detail.label}
                {detail.sub && <span className="ml-2 text-xs uppercase tracking-wider text-muted-foreground">{detail.sub}</span>}
              </h4>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{detail.detail}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Hover any block to trace its connections. The flow runs executor → driver → bounded queue → Connect RPC → Go ingest service → Delta-backed lineage graph.
          </p>
        )}
      </div>
    </div>
  );
};

export default OpenLineageFlowDiagram;
