import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Link } from "react-router-dom";
import { Play, Pause, Pin, Cloud, Building2, AlertTriangle, ArrowUpRight, ArrowRight } from "lucide-react";

const TICK_MS = 2400;

type IconCmp = React.ComponentType<{ className?: string }>;
export type FrameVariant = "platform" | "cloud";

export type FlowNodeMeta = {
  label: string;
  sub?: string;
  badge?: string;
  hint: string;
  icon: IconCmp;
  dashed?: boolean;
  /** Optional "dig deeper" link to a technology category. */
  explore?: { label: string; to: string };
};

export type FlowFrame = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  variant: FrameVariant;
};

export type FlowStep = {
  n: number;
  title: string;
  desc: string;
  nodes: string[];
};

export type FlowEdgeSpec = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  step: number;
  label?: string;
};

export type FlowSpec = {
  nodeMeta: Record<string, FlowNodeMeta>;
  /** Absolute for ungrouped nodes; relative to the parent frame for grouped ones. */
  positions: Record<string, { x: number; y: number }>;
  frames: FlowFrame[];
  /** Maps a node id to the frame id it belongs to. */
  parentOf: Record<string, string>;
  steps: FlowStep[];
  edges: FlowEdgeSpec[];
  intro: string;
  /** Optional caveat rendered as a callout below the canvas. */
  callout?: string;
};

const handleStyle = { opacity: 0, width: 1, height: 1, border: "none", minWidth: 0, minHeight: 0 } as const;

// Centered handles per side, plus upper/lower variants on the left/right sides
// (suffix -hi / -lo) so two opposing edges can run as separate, non-overlapping lines.
const sideHandles: { pos: Position; src: string; tgt: string; offset?: string }[] = [
  { pos: Position.Top, src: "ts", tgt: "tt" },
  { pos: Position.Bottom, src: "bs", tgt: "bt" },
  { pos: Position.Right, src: "rs", tgt: "rt" },
  { pos: Position.Right, src: "rs-hi", tgt: "rt-hi", offset: "33.333%" },
  { pos: Position.Right, src: "rs-lo", tgt: "rt-lo", offset: "66.667%" },
  { pos: Position.Left, src: "ls", tgt: "lt" },
  { pos: Position.Left, src: "ls-hi", tgt: "lt-hi", offset: "33.333%" },
  { pos: Position.Left, src: "ls-lo", tgt: "lt-lo", offset: "66.667%" },
];

type StepNodeData = FlowNodeMeta & { active: boolean };

const StepNode = ({ data }: NodeProps) => {
  const d = data as unknown as StepNodeData;
  const Icon = d.icon;
  return (
    <div
      title={d.hint}
      className={`w-[184px] rounded-lg px-3 py-2.5 text-left transition-all duration-300 ${
        d.dashed ? "border border-dashed" : "border"
      } ${
        d.active
          ? "border-primary bg-primary/10 shadow-glow scale-[1.03]"
          : "border-border bg-card/80 hover:border-primary/40"
      }`}
    >
      {sideHandles.map((h) => {
        const style = h.offset ? { ...handleStyle, top: h.offset } : handleStyle;
        return (
          <span key={h.src}>
            <Handle type="source" position={h.pos} id={h.src} style={style} isConnectable={false} />
            <Handle type="target" position={h.pos} id={h.tgt} style={style} isConnectable={false} />
          </span>
        );
      })}
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 transition-colors ${d.active ? "text-primary" : "text-muted-foreground"}`} />
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-tight truncate">{d.label}</div>
          {d.sub && <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{d.sub}</div>}
          {d.badge && <div className="text-[10px] font-medium uppercase tracking-wider text-primary/80 truncate">{d.badge}</div>}
        </div>
      </div>
      {d.explore && (
        <Link
          to={d.explore.to}
          onClick={(e) => e.stopPropagation()}
          className={`nodrag nopan mt-2 flex items-center gap-1 border-t pt-1.5 text-[10px] font-medium transition-colors hover:text-primary ${
            d.active ? "border-primary/30 text-primary" : "border-border/60 text-primary/70"
          }`}
        >
          <ArrowUpRight className="h-3 w-3 shrink-0" />
          <span className="truncate">Explore {d.explore.label}</span>
        </Link>
      )}
    </div>
  );
};

const frameVariants: Record<FrameVariant, { border: string; bg: string; text: string; legendBorder: string; legendBg: string; label: string; icon: IconCmp }> = {
  platform: {
    border: "border-primary/40",
    bg: "bg-primary/[0.04]",
    text: "text-primary/80",
    legendBorder: "border-primary/60",
    legendBg: "bg-primary/10",
    label: "Your platform",
    icon: Building2,
  },
  cloud: {
    border: "border-sky-500/40",
    bg: "bg-sky-500/[0.05]",
    text: "text-sky-500/90",
    legendBorder: "border-sky-500/60",
    legendBg: "bg-sky-500/10",
    label: "Cloud provider",
    icon: Cloud,
  },
};

const FrameNode = ({ data }: NodeProps) => {
  const { label, variant } = data as { label: string; variant: FrameVariant };
  const v = frameVariants[variant];
  const Icon = v.icon;
  return (
    <div className={`pointer-events-none relative h-full w-full rounded-2xl border border-dashed ${v.border} ${v.bg}`}>
      <span className={`absolute -top-2.5 left-4 inline-flex items-center gap-1.5 bg-card px-2 text-[10px] font-medium uppercase tracking-widest ${v.text}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    </div>
  );
};

const nodeTypes = { step: StepNode, frame: FrameNode };

export const FlowCanvas = ({ spec }: { spec: FlowSpec }) => {
  const { nodeMeta, positions, frames, parentOf, steps, edges: edgeSpecs, intro, callout } = spec;

  // Auto-advancing step, overridden by manual focus (hover/pin) on steps or nodes.
  const [autoStep, setAutoStep] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [pinnedStep, setPinnedStep] = useState<number | null>(null);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);

  const paused =
    !playing || pinnedStep != null || pinnedNode != null || hoverStep != null || hoverNode != null;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setAutoStep((s) => (s % steps.length) + 1), TICK_MS);
    return () => clearInterval(id);
  }, [paused, steps.length]);

  // A focused node (hover or pin) takes over from the step sequence.
  const focusNode = hoverNode ?? pinnedNode;
  const focusStep = focusNode ? null : hoverStep ?? pinnedStep ?? autoStep;
  const effectiveStep = hoverStep ?? pinnedStep ?? autoStep;

  // Steps the focused node participates in — surfaced softly on the pills.
  const relatedSteps = focusNode ? steps.filter((s) => s.nodes.includes(focusNode)).map((s) => s.n) : [];

  const selectNode = (id: string) => {
    setPinnedStep(null);
    setPinnedNode((cur) => (cur === id ? null : id));
  };
  const selectStep = (n: number) => {
    setPinnedNode(null);
    setPinnedStep((cur) => (cur === n ? null : n));
  };
  const clearPins = () => {
    setPinnedStep(null);
    setPinnedNode(null);
  };

  // Which nodes to highlight for a given focus state.
  const litNodes = (step: number | null, node: string | null) => {
    const set = new Set<string>();
    if (node) set.add(node);
    if (step != null) for (const id of steps.find((s) => s.n === step)?.nodes ?? []) set.add(id);
    return set;
  };

  const styleEdge = (e: FlowEdgeSpec, lit: boolean, stepActive: boolean): Edge => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: "smoothstep",
    animated: lit,
    label: e.label,
    labelShowBg: true,
    labelStyle: { fill: lit ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "hsl(var(--background))", fillOpacity: 0.9 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 6,
    style: {
      stroke: lit ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
      strokeWidth: lit ? 2 : 1.5,
      opacity: lit ? 1 : stepActive ? 0.25 : 0.6,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: lit ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" },
  });

  // Build the graph once. Node/edge identity is preserved across focus changes
  // (we mutate data/style in place), so React Flow keeps measured sizes and DOM
  // nodes stable — no flicker, and clicks aren't dropped mid-render.
  const initialNodes = useMemo<Node[]>(() => {
    const lit = litNodes(1, null);
    return [
      ...frames.map((f) => ({
        id: f.id,
        type: "frame",
        position: { x: f.x, y: f.y },
        data: { label: f.label, variant: f.variant },
        draggable: false,
        selectable: false,
        zIndex: 0,
        style: { width: f.w, height: f.h, pointerEvents: "none" as const },
      })),
      ...Object.keys(nodeMeta).map((id) => ({
        id,
        type: "step",
        position: positions[id],
        data: { ...nodeMeta[id], active: lit.has(id) },
        draggable: false,
        selectable: true,
        ...(parentOf[id] ? { parentId: parentOf[id], extent: "parent" as const } : {}),
      })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  const initialEdges = useMemo<Edge[]>(
    () => edgeSpecs.map((e) => styleEdge(e, e.step === 1, true)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spec],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Repaint highlight state in place whenever focus changes.
  useEffect(() => {
    const lit = litNodes(focusStep, focusNode);
    setNodes((nds) =>
      nds.map((n) => (n.type === "step" ? { ...n, data: { ...n.data, active: lit.has(n.id) } } : n)),
    );
    const stepActive = focusStep != null;
    setEdges((eds) =>
      eds.map((e) => {
        const es = edgeSpecs.find((s) => s.id === e.id)!;
        return styleEdge(es, stepActive && es.step === focusStep, stepActive);
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNode, focusStep]);

  const detail = focusNode
    ? { kind: "node" as const, id: focusNode, ...nodeMeta[focusNode] }
    : { kind: "step" as const, ...steps.find((s) => s.n === effectiveStep)! };

  const legendVariants = Array.from(new Set(frames.map((f) => f.variant)));

  return (
    <div className="animate-[fade-up_0.4s_ease-out]">
      {/* Step navigator — auto-advances; hover to focus, click to pin */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause sequence" : "Play sequence"}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {playing && pinnedStep == null && pinnedNode == null ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </button>
        {steps.map((s) => {
          const on = !focusNode && effectiveStep === s.n;
          const related = focusNode != null && relatedSteps.includes(s.n);
          const isPinned = pinnedStep === s.n;
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => selectStep(s.n)}
              onMouseEnter={() => setHoverStep(s.n)}
              onMouseLeave={() => setHoverStep(null)}
              className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                on
                  ? "border-primary bg-primary/10 text-primary"
                  : related
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                  on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {s.n}
              </span>
              {s.title}
              {isPinned && <Pin className="h-3 w-3 fill-current" />}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card/40 shadow-card overflow-hidden">
        <div className="h-[400px] md:h-[460px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.04 }}
            nodesDraggable={false}
            nodesConnectable={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            panOnScroll={false}
            panOnDrag={false}
            preventScrolling={false}
            onNodeMouseEnter={(_, node) => {
              if (node.id in nodeMeta) setHoverNode(node.id);
            }}
            onNodeMouseLeave={() => setHoverNode(null)}
            onNodeClick={(_, node) => {
              if (node.id in nodeMeta) selectNode(node.id);
            }}
            onPaneClick={clearPins}
            minZoom={0.4}
            maxZoom={2.2}
          >
            <Background gap={22} color="hsl(var(--border))" />
          </ReactFlow>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        {legendVariants.map((variant) => {
          const v = frameVariants[variant];
          return (
            <span key={variant} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm border border-dashed ${v.legendBorder} ${v.legendBg}`} />
              {v.label}
            </span>
          );
        })}
        <span className="text-muted-foreground/80">The frames show who typically operates each trusted system.</span>
      </div>

      {callout && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{callout}</span>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-5 min-h-[112px] transition-all">
        {detail.kind === "node" ? (
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
              <detail.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {pinnedNode === detail.id ? "Pinned" : "Inspecting"}
              </p>
              <h4 className="mt-0.5 font-semibold tracking-tight">
                {detail.label}
                {detail.badge && <span className="ml-2 text-xs uppercase tracking-wider text-primary/80">{detail.badge}</span>}
              </h4>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{detail.hint}</p>
              {detail.explore && (
                <Link
                  to={detail.explore.to}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                >
                  Explore {detail.explore.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-sm font-semibold">
              {detail.n}
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {pinnedStep === detail.n ? "Pinned" : !paused ? "Playing" : "Step"}
              </p>
              <h4 className="mt-0.5 font-semibold tracking-tight">{detail.title}</h4>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{detail.desc}</p>
            </div>
          </div>
        )}
      </div>
      {/* intro is shown via the step panel default (auto-play starts immediately); kept for a11y */}
      <span className="sr-only">{intro}</span>
    </div>
  );
};

export default FlowCanvas;
