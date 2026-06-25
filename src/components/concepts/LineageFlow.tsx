import { Cpu, ScanSearch, Workflow, Cog, ShieldCheck, Database, ScrollText, Share2 } from "lucide-react";
import { FlowCanvas, type FlowSpec } from "./FlowCanvas";

// A flat pipeline (no platform frames): producers on the left touch a dataset
// and emit OpenLineage events; the lineage service appends them to a raw event
// log; a processing pipeline projects + propagates that log into the lineage
// graph; the catalog queries the graph to make an ABAC decision. Datasets and
// artifacts (the dataset, the event log, the lineage graph) render as artifact
// nodes; everything else is a service.
const spec: FlowSpec = {
  nodeMeta: {
    engine: {
      label: "Query engine",
      sub: "DataFusion · Spark",
      icon: Cpu,
      hint: "Plans and runs queries over a dataset. With OpenLineage instrumentation it emits run events at planning time — table- and column-level lineage for every query.",
      explore: { label: "Compute Engines", to: "/technologies/compute-engines" },
    },
    dataset: {
      label: "Dataset",
      sub: "the data",
      badge: "Dataset",
      icon: Database,
      kind: "dataset",
      hint: "Just a dataset the engine queries and the analysis service inspects. It doesn't have to live on object storage — a table, a stream, a file all work the same way.",
    },
    scanner: {
      label: "Analysis service",
      sub: "PII · classification",
      icon: ScanSearch,
      hint: "Inspects the actual data — profiling, pattern-matching, classifying. On a hit it raises a finding rather than enforcing anything itself.",
    },
    lineage: {
      label: "Lineage service",
      sub: "OpenLineage ingest",
      icon: Workflow,
      hint: "Accepts OpenLineage events from any producer. Engine runs and scanner findings arrive as the same event types and are appended to the event log.",
      explore: { label: "Open Governance", to: "/technologies/open-governance" },
    },
    eventlog: {
      label: "Event log",
      sub: "raw events",
      badge: "Dataset",
      icon: ScrollText,
      kind: "dataset",
      hint: "The append-only record of every OpenLineage event — the source of truth. Engine runs and discovery findings land here verbatim, in order.",
    },
    processor: {
      label: "Processing",
      sub: "facets · propagation",
      icon: Cog,
      hint: "Reads the event log and folds it into the lineage graph — building column-lineage edges and propagating tags like PII to every field they reach downstream.",
    },
    graph: {
      label: "Lineage graph",
      sub: "edges + tags",
      badge: "Dataset",
      icon: Share2,
      kind: "dataset",
      hint: "The projected, queryable lineage — column-level edges plus tag assignments. Ask it where a sensitive tag lands downstream and it answers from the graph.",
    },
    catalog: {
      label: "Catalog",
      sub: "metadata + policy",
      icon: ShieldCheck,
      hint: "Queries the lineage graph for the attributes it needs — where does a tag land downstream? — and turns the answer into an attribute-based access decision.",
      explore: { label: "Catalogs", to: "/technologies/catalogs" },
    },
  },
  frames: [],
  parentOf: {},
  positions: {
    engine: { x: 40, y: 70 },
    dataset: { x: 40, y: 250 },
    scanner: { x: 40, y: 430 },
    lineage: { x: 330, y: 250 },
    eventlog: { x: 330, y: 430 },
    graph: { x: 620, y: 250 },
    processor: { x: 620, y: 430 },
    catalog: { x: 475, y: 70 },
  },
  steps: [
    {
      n: 1,
      title: "Plan-time",
      desc: "Instrumented at plan time, the engine analyzes the query against the dataset — resolving the exact tables and columns it touches.",
      nodes: ["engine", "dataset"],
    },
    {
      n: 2,
      title: "Emit",
      desc: "It emits OpenLineage run events to the lineage service: table- and column-level lineage for the query.",
      nodes: ["engine", "lineage"],
    },
    {
      n: 3,
      title: "Append to log",
      desc: "The lineage service appends every event to the append-only log — the raw landing zone and source of truth.",
      nodes: ["lineage", "eventlog"],
    },
    {
      n: 4,
      title: "Process facets",
      desc: "A processor reads the log and extracts well-known and custom facets — schema, column lineage, tags — building the lineage graph.",
      nodes: ["eventlog", "processor", "graph"],
    },
    {
      n: 5,
      title: "Analyze",
      desc: "An analysis service reads the same dataset — smart classifiers detecting PII, or values curated by hand.",
      nodes: ["scanner", "dataset"],
      tone: "finding",
    },
    {
      n: 6,
      title: "Finding",
      desc: "A detection becomes a finding: an OpenLineage event from the analysis service, appended to the very same log.",
      nodes: ["scanner", "lineage", "eventlog"],
      tone: "finding",
    },
    {
      n: 7,
      title: "Propagate",
      desc: "Processing propagates the finding through the graph for resolved results — and rechecks as new lineage arrives.",
      nodes: ["eventlog", "processor", "graph"],
      tone: "finding",
    },
    {
      n: 8,
      title: "Query tags",
      desc: "The catalog asks the lineage graph where a tag lands downstream — which fields, in which datasets, inherit the sensitivity.",
      nodes: ["catalog", "graph"],
    },
    {
      n: 9,
      title: "Decide (ABAC)",
      desc: "Armed with those attributes, the catalog makes an attribute-based access decision and informs the engine — mask, deny, or allow.",
      nodes: ["catalog", "engine"],
    },
  ],
  edges: [
    { id: "query", source: "engine", target: "dataset", sourceHandle: "bs", targetHandle: "tt", step: 1, label: "query" },
    { id: "emit", source: "engine", target: "lineage", sourceHandle: "rs", targetHandle: "lt-hi", step: 2, label: "events" },
    { id: "append", source: "lineage", target: "eventlog", sourceHandle: "bs", targetHandle: "tt", step: [3, 6], label: "append" },
    { id: "read", source: "eventlog", target: "processor", sourceHandle: "rs", targetHandle: "lt", step: [4, 7], label: "read" },
    { id: "build", source: "processor", target: "graph", sourceHandle: "ts", targetHandle: "bt", step: [4, 7], label: "facets" },
    { id: "analyze", source: "scanner", target: "dataset", sourceHandle: "ts", targetHandle: "bt", step: 5, label: "analyze" },
    { id: "finding", source: "scanner", target: "lineage", sourceHandle: "rs", targetHandle: "lt-lo", step: 6, label: "finding" },
    { id: "lookup", source: "catalog", target: "graph", sourceHandle: "bs", targetHandle: "tt", step: 8, label: "query" },
    { id: "decide", source: "catalog", target: "engine", sourceHandle: "ls", targetHandle: "rt", step: 9, label: "mask / deny" },
  ],
  intro:
    "Engines emit OpenLineage events while analysis services discover sensitive data and raise findings as the same events. The lineage service appends both to a raw event log; a processor extracts facets and propagates classifications into a queryable lineage graph; and the catalog queries the graph to make attribute-based access decisions.",
};

const LineageFlow = ({
  activeSteps,
  onStepSelect,
}: {
  activeSteps?: number[];
  onStepSelect?: (n: number) => void;
}) => <FlowCanvas spec={spec} activeSteps={activeSteps} onStepSelect={onStepSelect} />;

export default LineageFlow;
