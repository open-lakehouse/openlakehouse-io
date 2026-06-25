import { Cpu, ShieldCheck, Fingerprint, Puzzle, HardDrive, Filter } from "lucide-react";
import { FlowCanvas, type FlowSpec } from "./FlowCanvas";

// Top row (platform): trusted catalog · trusted engine · auxiliary systems. Client sits outside, left.
// Bottom row (cloud): identity provider (under catalog) · storage + staging (under engine).
const spec: FlowSpec = {
  nodeMeta: {
    client: {
      label: "Client",
      sub: "compute engine",
      icon: Cpu,
      hint: "Holds no standing keys and never plans the query itself. It asks the catalog for a scan, then reads only the staged files it is handed.",
    },
    catalog: {
      label: "Trusted catalog",
      badge: "PEP + PDP + PIP",
      icon: ShieldCheck,
      hint: "The trust anchor. It verifies identity, applies row- and column-level policy, and invokes a trusted engine to produce a clean result — then vends a credential scoped to just those files.",
      dashed: true,
    },
    engine: {
      label: "Trusted engine",
      sub: "query · masking",
      icon: Filter,
      hint: "A trusted query service the catalog invokes. It applies row filters and column masks, writing the pruned, masked result files into a staging area.",
      dashed: true,
    },
    aux: {
      label: "Auxiliary systems",
      sub: "policy · attributes",
      icon: Puzzle,
      hint: "External policy or attribute sources the catalog may consult to reach an authorization decision.",
      dashed: true,
    },
    idp: {
      label: "Identity Provider",
      sub: "OIDC",
      icon: Fingerprint,
      hint: "Issues the client a verifiable token. The catalog checks the requesting identity before planning the scan.",
    },
    storage: {
      label: "Storage",
      sub: "staging area",
      icon: HardDrive,
      hint: "Holds table data and a staging area. The engine writes pre-filtered files here; the client reads them with a down-scoped credential — never touching rows or columns it can't see.",
    },
  },
  frames: [
    { id: "platform", x: 420, y: 70, w: 666, h: 150, label: "Your platform", variant: "platform" },
    { id: "cloud", x: 420, y: 300, w: 462, h: 150, label: "Cloud provider", variant: "cloud" },
  ],
  parentOf: { catalog: "platform", engine: "platform", aux: "platform", idp: "cloud", storage: "cloud" },
  positions: {
    client: { x: 110, y: 120 },
    catalog: { x: 25, y: 42 },
    engine: { x: 235, y: 42 },
    aux: { x: 447, y: 42 },
    idp: { x: 25, y: 42 },
    storage: { x: 235, y: 42 },
  },
  steps: [
    {
      n: 1,
      title: "Request",
      desc: "The client acquires a token from the IdP, then asks the catalog to plan a scan of a table.",
      nodes: ["client", "idp", "catalog"],
    },
    {
      n: 2,
      title: "Authorize & plan",
      desc: "The catalog verifies identity and applies row- and column-level policy — consulting auxiliary systems as needed — then invokes a trusted engine to run the planned query.",
      nodes: ["catalog", "idp", "aux", "engine"],
    },
    {
      n: 3,
      title: "Filter & stage",
      desc: "The trusted engine writes the pruned, masked result files to a staging area — fine-grained filters, column masks, and row rules already applied.",
      nodes: ["engine", "storage"],
    },
    {
      n: 4,
      title: "Vend credential",
      desc: "The catalog returns a down-scoped credential, valid only for the staged result files.",
      nodes: ["catalog", "client"],
    },
    {
      n: 5,
      title: "Read",
      desc: "The client reads the pre-filtered files from the staging area — it only ever sees data it is allowed to.",
      nodes: ["client", "storage"],
    },
  ],
  edges: [
    { id: "request", source: "client", target: "catalog", sourceHandle: "rs", targetHandle: "lt", step: 1, label: "1" },
    { id: "token", source: "client", target: "idp", sourceHandle: "rs", targetHandle: "lt", step: 1, label: "token" },
    { id: "verify", source: "catalog", target: "idp", sourceHandle: "bs", targetHandle: "tt", step: 2, label: "2" },
    { id: "consult", source: "catalog", target: "aux", sourceHandle: "ts", targetHandle: "tt", step: 2, label: "policy" },
    { id: "invoke", source: "catalog", target: "engine", sourceHandle: "rs", targetHandle: "lt", step: 2, label: "plan" },
    { id: "stage", source: "engine", target: "storage", sourceHandle: "bs", targetHandle: "tt", step: 3, label: "3 · write" },
    { id: "vend", source: "catalog", target: "client", sourceHandle: "ls", targetHandle: "rt", step: 4, label: "4" },
    { id: "read", source: "client", target: "storage", sourceHandle: "bs", targetHandle: "bt", step: 5, label: "5 · read" },
  ],
  intro:
    "Instead of handing the client raw table access, the catalog plans the query: a trusted engine applies row and column policy, writes clean files to a staging area, and the catalog vends a credential scoped to just those files.",
  callout:
    "Fine-grained access control comes at a cost — a trusted filtering fleet to operate, plus extra data movement to stage masked files.",
};

const ScanApiFlow = () => <FlowCanvas spec={spec} />;

export default ScanApiFlow;
