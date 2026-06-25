import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Cpu, ShieldCheck, Fingerprint, Puzzle, HardDrive, Play, Pause, Pin, Cloud, Building2 } from "lucide-react";

const TICK_MS = 2200;

type NodeId = "idp" | "client" | "catalog" | "aux" | "storage";

type NodeMeta = {
  label: string;
  sub?: string;
  badge?: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  dashed?: boolean;
};

const nodeMeta: Record<NodeId, NodeMeta> = {
  idp: {
    label: "Identity Provider",
    sub: "OIDC",
    icon: Fingerprint,
    hint: "Issues the client a verifiable token. The catalog checks the requesting identity against the IdP before authorizing.",
  },
  client: {
    label: "Client",
    sub: "compute engine",
    icon: Cpu,
    hint: "Holds no standing storage keys. It authenticates with the IdP, then asks the catalog for access to a table.",
  },
  catalog: {
    label: "Trusted catalog",
    badge: "PEP + PDP + PIP",
    icon: ShieldCheck,
    hint: "The single trust anchor. It enforces, decides, and informs policy — verifying identity, authorizing the request, and minting the credential.",
    dashed: true,
  },
  aux: {
    label: "Auxiliary systems",
    sub: "policy · attributes",
    icon: Puzzle,
    hint: "External policy or attribute sources the catalog may consult to reach an authorization decision.",
    dashed: true,
  },
  storage: {
    label: "Storage",
    sub: "object store",
    icon: HardDrive,
    hint: "Accepts the down-scoped credential and serves only the files belonging to the authorized table.",
  },
};

// All four are trusted systems, but typically operated by different parties:
// "Your platform" runs the catalog + auxiliary systems; a "Cloud provider"
// usually supplies the identity provider + storage.
type FrameId = "platform" | "cloud";
type FrameVariant = "platform" | "cloud";

// Top row: client · trusted catalog · auxiliary systems.
// Bottom row: storage (under client) · identity provider (under catalog).
const FRAMES: Record<FrameId, { id: FrameId; x: number; y: number; w: number; h: number; label: string; variant: FrameVariant }> = {
  platform: { id: "platform", x: 483, y: 80, w: 624, h: 150, label: "Your platform", variant: "platform" },
  cloud: { id: "cloud", x: 95, y: 310, w: 622, h: 150, label: "Cloud provider", variant: "cloud" },
};

const PARENT: Partial<Record<NodeId, FrameId>> = {
  aux: "platform",
  catalog: "platform",
  idp: "cloud",
  storage: "cloud",
};

// Positions: client is absolute; grouped nodes are relative to their frame.
const positions: Record<NodeId, { x: number; y: number }> = {
  client: { x: 120, y: 125 },
  catalog: { x: 25, y: 42 },
  aux: { x: 415, y: 42 },
  storage: { x: 25, y: 42 },
  idp: { x: 413, y: 42 },
};

type FlowStep = {
  n: number;
  title: string;
  desc: string;
  nodes: NodeId[];
};

const flowSteps: FlowStep[] = [
  {
    n: 1,
    title: "Request",
    desc: "The client acquires a token from the IdP, then requests a table read from the catalog.",
    nodes: ["client", "idp", "catalog"],
  },
  {
    n: 2,
    title: "Authorize",
    desc: "The catalog verifies the user's identity and applies internal policies — consulting auxiliary systems as needed — to authorize the request.",
    nodes: ["catalog", "idp", "aux"],
  },
  {
    n: 3,
    title: "Vend credential",
    desc: "The catalog returns a down-scoped, short-lived credential, valid only for the files in that table.",
    nodes: ["catalog", "client"],
  },
  {
    n: 4,
    title: "Read",
    desc: "Armed with the credential, the client reads the data files directly from storage.",
    nodes: ["client", "storage"],
  },
];

type FlowEdge = {
  id: string;
  source: NodeId;
  target: NodeId;
  sourceHandle: string;
  targetHandle: string;
  step: number;
  label?: string;
};

const flowEdges: FlowEdge[] = [
  { id: "request", source: "client", target: "catalog", sourceHandle: "rs", targetHandle: "lt", step: 1, label: "1" },
  { id: "token", source: "client", target: "idp", sourceHandle: "rs", targetHandle: "lt", step: 1, label: "token" },
  { id: "verify", source: "catalog", target: "idp", sourceHandle: "bs", targetHandle: "tt", step: 2, label: "2" },
  { id: "consult", source: "catalog", target: "aux", sourceHandle: "rs", targetHandle: "lt", step: 2, label: "attrs" },
  { id: "vend", source: "catalog", target: "client", sourceHandle: "ls", targetHandle: "rt", step: 3, label: "3" },
  { id: "read", source: "client", target: "storage", sourceHandle: "bs", targetHandle: "tt", step: 4, label: "4" },
];

const handleStyle = { opacity: 0, width: 1, height: 1, border: "none", minWidth: 0, minHeight: 0 } as const;

const sideHandles: { pos: Position; src: string; tgt: string }[] = [
  { pos: Position.Top, src: "ts", tgt: "tt" },
  { pos: Position.Right, src: "rs", tgt: "rt" },
  { pos: Position.Bottom, src: "bs", tgt: "bt" },
  { pos: Position.Left, src: "ls", tgt: "lt" },
];

type StepNodeData = NodeMeta & { active: boolean };

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
      {sideHandles.map((h) => (
        <span key={h.pos}>
          <Handle type="source" position={h.pos} id={h.src} style={handleStyle} isConnectable={false} />
          <Handle type="target" position={h.pos} id={h.tgt} style={handleStyle} isConnectable={false} />
        </span>
      ))}
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 transition-colors ${d.active ? "text-primary" : "text-muted-foreground"}`} />
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-tight truncate">{d.label}</div>
          {d.sub && <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{d.sub}</div>}
          {d.badge && <div className="text-[10px] font-medium uppercase tracking-wider text-primary/80 truncate">{d.badge}</div>}
        </div>
      </div>
    </div>
  );
};

const frameVariants: Record<FrameVariant, { border: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  platform: { border: "border-primary/40", bg: "bg-primary/[0.04]", text: "text-primary/80", icon: Building2 },
  cloud: { border: "border-sky-500/40", bg: "bg-sky-500/[0.05]", text: "text-sky-500/90", icon: Cloud },
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

const CredentialVendingFlow = () => {
  // Auto-advancing step, overridden by manual focus (hover/pin) and node hover.
  const [autoStep, setAutoStep] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [pinnedStep, setPinnedStep] = useState<number | null>(null);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [hoverNode, setHoverNode] = useState<NodeId | null>(null);

  // Pause the cycle whenever the user is manually engaging with the diagram.
  const paused = !playing || pinnedStep != null || hoverStep != null || hoverNode != null;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setAutoStep((s) => (s % flowSteps.length) + 1), TICK_MS);
    return () => clearInterval(id);
  }, [paused]);

  // Node focus (hover) wins over step focus; otherwise the effective step drives the highlight.
  const focusNode = hoverNode;
  const focusStep = focusNode ? null : hoverStep ?? pinnedStep ?? autoStep;
  const effectiveStep = hoverStep ?? pinnedStep ?? autoStep;

  const stepNodes = focusStep ? flowSteps.find((s) => s.n === focusStep)?.nodes ?? [] : [];
  const isNodeLit = (id: NodeId) => focusNode === id || stepNodes.includes(id);

  const nodes = useMemo<Node[]>(
    () => [
      ...Object.values(FRAMES).map((f) => ({
        id: f.id,
        type: "frame",
        position: { x: f.x, y: f.y },
        data: { label: f.label, variant: f.variant },
        draggable: false,
        selectable: false,
        zIndex: 0,
        style: { width: f.w, height: f.h, pointerEvents: "none" as const },
      })),
      ...(Object.keys(nodeMeta) as NodeId[]).map((id) => ({
        id,
        type: "step",
        position: positions[id],
        data: { ...nodeMeta[id], active: isNodeLit(id) },
        draggable: false,
        selectable: true,
        ...(PARENT[id] ? { parentId: PARENT[id], extent: "parent" as const } : {}),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusNode, focusStep],
  );

  const edges = useMemo<Edge[]>(
    () =>
      flowEdges.map((e) => {
        const lit =
          (focusStep != null && e.step === focusStep) ||
          (focusNode != null && (e.source === focusNode || e.target === focusNode));
        return {
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
            opacity: lit ? 1 : focusStep != null ? 0.25 : 0.6,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: lit ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          },
        };
      }),
    [focusNode, focusStep],
  );

  const detail = focusNode
    ? { kind: "node" as const, ...nodeMeta[focusNode] }
    : { kind: "step" as const, ...flowSteps.find((s) => s.n === effectiveStep)! };

  const togglePin = (n: number) => setPinnedStep((cur) => (cur === n ? null : n));

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
          {playing && pinnedStep == null ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        {flowSteps.map((s) => {
          const on = !focusNode && effectiveStep === s.n;
          const isPinned = pinnedStep === s.n;
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => togglePin(s.n)}
              onMouseEnter={() => setHoverStep(s.n)}
              onMouseLeave={() => setHoverStep(null)}
              className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                on
                  ? "border-primary bg-primary/10 text-primary"
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
        <div className="h-[380px] md:h-[440px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
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
              if (node.id in nodeMeta) setHoverNode(node.id as NodeId);
            }}
            onNodeMouseLeave={() => setHoverNode(null)}
            onPaneClick={() => setPinnedStep(null)}
            minZoom={0.4}
            maxZoom={2.2}
          >
            <Background gap={22} color="hsl(var(--border))" />
          </ReactFlow>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-primary/60 bg-primary/10" />
          Your platform
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-sky-500/60 bg-sky-500/10" />
          Cloud provider
        </span>
        <span className="text-muted-foreground/80">
          All four are trusted systems — the frames show who typically operates them.
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 min-h-[112px] transition-all">
        {detail.kind === "node" ? (
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
              <detail.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Inspecting</p>
              <h4 className="mt-0.5 font-semibold tracking-tight">
                {detail.label}
                {detail.badge && <span className="ml-2 text-xs uppercase tracking-wider text-primary/80">{detail.badge}</span>}
              </h4>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{detail.hint}</p>
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
    </div>
  );
};

export default CredentialVendingFlow;
