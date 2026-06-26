import { FileCode2, ListTree, Cpu, Cog, Scale, Workflow, Activity } from "lucide-react";
import { FlowCanvas, type FlowSpec } from "./FlowCanvas";

// A look inside the query engine, kept deliberately simple. The lifecycle runs
// left-to-right inside the engine frame (query -> plan -> execute). The plan is
// the governance seam: an extension point analyzes it, then reads lineage,
// pulls a policy decision, and sends telemetry to the services above the engine
// before execution.
const spec: FlowSpec = {
  nodeMeta: {
    query: {
      label: "Query",
      sub: "user SQL",
      icon: FileCode2,
      hint: "The SQL a user submits — the starting point of the lifecycle.",
    },
    plan: {
      label: "Plan",
      sub: "operations + context",
      icon: ListTree,
      hint: "The query, resolved into a plan — the operations to run plus the exact tables, columns, and filters involved. The richest representation to reason about.",
    },
    execute: {
      label: "Execute",
      sub: "run on storage",
      icon: Cpu,
      hint: "The governed plan runs against storage and returns results.",
    },
    analyze: {
      label: "Analyze",
      sub: "extension point",
      icon: Cog,
      dashed: true,
      hint: "A hook on the plan. Because it holds the resolved tables, columns, and predicates, it's the richest point to govern — it reads lineage, pulls a policy decision, and emits telemetry.",
      explore: { label: "Trusted Compute", to: "/concepts/data-access#trusted-compute" },
    },
    policy: {
      label: "Policy engine",
      sub: "ABAC decisions",
      icon: Scale,
      hint: "The engine queries it with the plan's attributes and gets back a decision — allow, deny, mask, or filter — before the query runs.",
      explore: { label: "Open Governance", to: "/technologies/open-governance" },
    },
    lineage: {
      label: "Lineage service",
      sub: "OpenLineage",
      icon: Workflow,
      hint: "The engine reads lineage here — how the data the query touches is classified upstream (PII and other tags) — to inform the decision. Queries also emit lineage; see the flow above.",
    },
    telemetry: {
      label: "Telemetry",
      sub: "OpenTelemetry",
      icon: Activity,
      hint: "The engine sends spans and metrics — an audit trail, essential in regulated contexts where every access must be accountable.",
    },
  },
  frames: [{ id: "engine", x: 40, y: 200, w: 1080, h: 270, label: "Engine", variant: "platform" }],
  parentOf: {
    query: "engine",
    plan: "engine",
    execute: "engine",
    analyze: "engine",
  },
  positions: {
    query: { x: 50, y: 150 },
    plan: { x: 458, y: 150 },
    execute: { x: 866, y: 150 },
    analyze: { x: 458, y: 20 },
    policy: { x: 120, y: 40 },
    lineage: { x: 498, y: 40 },
    telemetry: { x: 876, y: 40 },
  },
  steps: [
    {
      n: 1,
      title: "Plan",
      desc: "The user's SQL is turned into a plan — the operations to run, with the exact tables, columns, and filters resolved.",
      nodes: ["query", "plan"],
    },
    {
      n: 2,
      title: "Analyze",
      desc: "The plan is the richest point to govern: it holds the full, resolved context of what the query actually touches.",
      nodes: ["plan", "analyze"],
    },
    {
      n: 3,
      title: "Govern",
      desc: "From that context the engine queries the policy engine for a decision, reads lineage to see how the data is classified, and sends telemetry for the audit trail.",
      nodes: ["analyze", "policy", "lineage", "telemetry"],
    },
    {
      n: 4,
      title: "Execute",
      desc: "With the decision applied, the governed plan runs against storage and returns results.",
      nodes: ["plan", "execute"],
    },
  ],
  edges: [
    { id: "plan", source: "query", target: "plan", sourceHandle: "rs", targetHandle: "lt", step: 1, label: "plan" },
    { id: "inspect", source: "plan", target: "analyze", sourceHandle: "ts", targetHandle: "bt", step: 2, label: "analyze" },
    { id: "decision", source: "policy", target: "analyze", sourceHandle: "bs", targetHandle: "lt", step: 3, label: "decision" },
    { id: "read", source: "lineage", target: "analyze", sourceHandle: "bs", targetHandle: "tt", step: 3, label: "read" },
    { id: "telemetry", source: "analyze", target: "telemetry", sourceHandle: "rs", targetHandle: "bt", step: 3, label: "telemetry" },
    { id: "execute", source: "plan", target: "execute", sourceHandle: "rs", targetHandle: "lt", step: 4, label: "execute" },
  ],
  intro:
    "Inside the engine a query becomes a plan before it runs. The plan is where governance attaches: an extension point analyzes it, then pulls a policy decision, reads lineage to see how the data is classified, and sends telemetry — all in a trusted compute context — before the governed plan executes.",
};

const EngineInternalsFlow = () => <FlowCanvas spec={spec} />;

export default EngineInternalsFlow;
