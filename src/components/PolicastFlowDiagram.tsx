import { useState } from "react";
import { FileCode, Cog, GitMerge, Upload, Database, Layers, FileText, Archive, Server, Cpu, Flame, KeyRound, ChevronDown } from "lucide-react";

type StepId =
  | "cedar"
  | "compile"
  | "merge-policies"
  | "merge-manifest"
  | "put-blobs"
  | "policies"
  | "bindings"
  | "manifest"
  | "blobs"
  | "applied"
  | "resolve"
  | "datafusion"
  | "spark";

type Step = {
  id: StepId;
  label: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  detail: string;
};

const steps: Record<StepId, Step> = {
  cedar: { id: "cedar", label: "Cedar source", sub: ".cedar", icon: FileCode, detail: "Policy authors write fine-grained access rules in Cedar — an open, analyzable policy language designed for ABAC and ReBAC." },
  compile: { id: "compile", label: "policast-core", sub: "compile", icon: Cog, detail: "policast-core compiles Cedar source into a deterministic, versioned policy artifact plus a binding manifest ready to merge into the catalog." },
  "merge-policies": { id: "merge-policies", label: "MERGE", icon: GitMerge, detail: "Compiled policies are MERGE'd into the versioned policies Delta table, giving every change an auditable, time-travelable version." },
  "merge-manifest": { id: "merge-manifest", label: "MERGE", icon: GitMerge, detail: "Bindings and the manifest are MERGE'd into Delta CDF tables so downstream resolvers can stream policy changes incrementally." },
  "put-blobs": { id: "put-blobs", label: "put", icon: Upload, detail: "Raw Cedar blobs are uploaded into a governed Unity Catalog volume — the source of truth for the compiled artifacts above." },
  policies: { id: "policies", label: "governance.policast.policies", sub: "Delta — versioned", icon: Database, detail: "Versioned Delta table holding every compiled policy revision. Enables rollback, audit, and reproducible enforcement." },
  bindings: { id: "bindings", label: "governance.policast.bindings", sub: "Delta", icon: Layers, detail: "Binds policies to securables (catalogs, schemas, tables) and to principals — the join table that drives resolution." },
  manifest: { id: "manifest", label: "governance.policast.manifest", sub: "Delta CDF", icon: FileText, detail: "Change Data Feed manifest that lets engines and the resolver subscribe to only the diffs since their last sync." },
  blobs: { id: "blobs", label: "volume policast.raw", sub: "cedar blobs", icon: Archive, detail: "UC volume storing original .cedar source for review, lineage, and re-compilation." },
  applied: { id: "applied", label: "Table properties", sub: "policast.applied_policies", icon: KeyRound, detail: "Each governed table records which policy version is currently applied — a lightweight pointer engines can read at plan time." },
  resolve: { id: "resolve", label: "/policies/resolve", sub: "endpoint", icon: Server, detail: "Stateless endpoint: given (principal, table_uuid), it returns a signed manifest of effective policies plus short-lived storage credentials." },
  datafusion: { id: "datafusion", label: "DataFusion", sub: "GovernedTable", icon: Cpu, detail: "DataFusion's GovernedTable provider calls /policies/resolve at scan time and rewrites the plan to enforce row/column filters locally." },
  spark: { id: "spark", label: "Spark", sub: "PolicastPlugin", icon: Flame, detail: "Spark plugin intercepts catalog lookups, fetches signed policy manifests, and applies predicate / projection pushdown for enforcement." },
};

const edges: { from: StepId; to: StepId }[] = [
  { from: "cedar", to: "compile" },
  { from: "compile", to: "merge-policies" },
  { from: "compile", to: "merge-manifest" },
  { from: "compile", to: "put-blobs" },
  { from: "merge-policies", to: "policies" },
  { from: "merge-manifest", to: "bindings" },
  { from: "merge-manifest", to: "manifest" },
  { from: "put-blobs", to: "blobs" },
  { from: "policies", to: "resolve" },
  { from: "bindings", to: "resolve" },
  { from: "manifest", to: "resolve" },
  { from: "applied", to: "resolve" },
  { from: "datafusion", to: "resolve" },
  { from: "spark", to: "resolve" },
  { from: "resolve", to: "datafusion" },
  { from: "resolve", to: "spark" },
];

const Node = ({ step, active, hovered, onEnter, onLeave, onClick }: { step: Step; active: boolean; hovered: boolean; onEnter: () => void; onLeave: () => void; onClick: () => void; }) => {
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
        active ? "border-primary bg-primary/10 shadow-glow scale-[1.02]"
        : hovered ? "border-primary/40 bg-card"
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
      <linearGradient id="flow-grad" x1="0" x2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
      </linearGradient>
    </defs>
    <line x1="0" y1="3" x2="22" y2="3" stroke="url(#flow-grad)" strokeWidth="1.5" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="6" to="0" dur="0.8s" repeatCount="indefinite" />
    </line>
    <polygon points="22,0 28,3 22,6" fill="currentColor" />
  </svg>
);

const PolicastFlowDiagram = () => {
  const [active, setActive] = useState<StepId | null>(null);
  const isActive = (id: StepId) => active === id;
  const onPath = (id: StepId) => !!active && edges.some((e) => (e.from === active && e.to === id) || (e.to === active && e.from === id));
  const detail = active ? steps[active] : null;

  return (
    <div className="animate-[fade-up_0.4s_ease-out]">
      {/* Mobile: vertical stepper */}
      <div className="md:hidden space-y-3">
        {[
          { title: "Author plane", ids: ["cedar", "compile"] as StepId[] },
          { title: "Operations", ids: ["merge-policies", "merge-manifest", "put-blobs"] as StepId[] },
          { title: "Unity Catalog control plane", ids: ["policies", "bindings", "manifest", "blobs", "applied"] as StepId[] },
          { title: "Resolve", ids: ["resolve"] as StepId[] },
          { title: "Query engines", ids: ["datafusion", "spark"] as StepId[] },
        ].map((stage, i, arr) => (
          <div key={stage.title}>
            <GroupBox title={stage.title}>
              {stage.ids.map((id) => (
                <Node key={id} step={steps[id]} active={isActive(id)} hovered={onPath(id)}
                  onEnter={() => setActive(id)} onLeave={() => {}}
                  onClick={() => setActive(active === id ? null : id)} />
              ))}
            </GroupBox>
            {i < arr.length - 1 && (
              <div className="flex justify-center py-1.5 text-primary/60">
                <ChevronDown className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: horizontal flow */}
      <div className="hidden md:block rounded-2xl border border-border bg-card/40 p-4 md:p-6 shadow-card overflow-x-auto">
        <div className="min-w-[920px] grid grid-cols-[1.1fr_0.5fr_1.4fr_0.9fr] gap-4 items-stretch">
          <div className="flex flex-col gap-4">
            <GroupBox title="Author plane">
              <Node step={steps.cedar} active={isActive("cedar")} hovered={onPath("cedar")} onEnter={() => setActive("cedar")} onLeave={() => setActive(null)} onClick={() => setActive("cedar")} />
              <Node step={steps.compile} active={isActive("compile")} hovered={onPath("compile")} onEnter={() => setActive("compile")} onLeave={() => setActive(null)} onClick={() => setActive("compile")} />
            </GroupBox>
            <GroupBox title="Query engines">
              <Node step={steps.datafusion} active={isActive("datafusion")} hovered={onPath("datafusion")} onEnter={() => setActive("datafusion")} onLeave={() => setActive(null)} onClick={() => setActive("datafusion")} />
              <Node step={steps.spark} active={isActive("spark")} hovered={onPath("spark")} onEnter={() => setActive("spark")} onLeave={() => setActive(null)} onClick={() => setActive("spark")} />
            </GroupBox>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Node step={steps["merge-policies"]} active={isActive("merge-policies")} hovered={onPath("merge-policies")} onEnter={() => setActive("merge-policies")} onLeave={() => setActive(null)} onClick={() => setActive("merge-policies")} />
            <Node step={steps["merge-manifest"]} active={isActive("merge-manifest")} hovered={onPath("merge-manifest")} onEnter={() => setActive("merge-manifest")} onLeave={() => setActive(null)} onClick={() => setActive("merge-manifest")} />
            <Node step={steps["put-blobs"]} active={isActive("put-blobs")} hovered={onPath("put-blobs")} onEnter={() => setActive("put-blobs")} onLeave={() => setActive(null)} onClick={() => setActive("put-blobs")} />
          </div>
          <GroupBox title="Unity Catalog control plane">
            <Node step={steps.policies} active={isActive("policies")} hovered={onPath("policies")} onEnter={() => setActive("policies")} onLeave={() => setActive(null)} onClick={() => setActive("policies")} />
            <Node step={steps.bindings} active={isActive("bindings")} hovered={onPath("bindings")} onEnter={() => setActive("bindings")} onLeave={() => setActive(null)} onClick={() => setActive("bindings")} />
            <Node step={steps.manifest} active={isActive("manifest")} hovered={onPath("manifest")} onEnter={() => setActive("manifest")} onLeave={() => setActive(null)} onClick={() => setActive("manifest")} />
            <Node step={steps.blobs} active={isActive("blobs")} hovered={onPath("blobs")} onEnter={() => setActive("blobs")} onLeave={() => setActive(null)} onClick={() => setActive("blobs")} />
            <Node step={steps.applied} active={isActive("applied")} hovered={onPath("applied")} onEnter={() => setActive("applied")} onLeave={() => setActive(null)} onClick={() => setActive("applied")} />
          </GroupBox>
          <div className="flex items-center">
            <Node step={steps.resolve} active={isActive("resolve")} hovered={onPath("resolve")} onEnter={() => setActive("resolve")} onLeave={() => setActive(null)} onClick={() => setActive("resolve")} />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Author</span><FlowArrow /><span>Compile</span><FlowArrow /><span>Persist in UC</span><FlowArrow /><span>Resolve</span><FlowArrow /><span>Enforce in engine</span>
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
            Hover any block to see what it does. The flow runs left → right: authors compile Cedar, artifacts are merged
            into Unity Catalog Delta tables, and engines resolve effective policies at query time via a signed endpoint.
          </p>
        )}
      </div>
    </div>
  );
};

export default PolicastFlowDiagram;
