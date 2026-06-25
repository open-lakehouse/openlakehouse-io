import { Cpu, ShieldCheck, Fingerprint, Puzzle, HardDrive } from "lucide-react";
import { FlowCanvas, type FlowSpec } from "./FlowCanvas";

// Top row: client · trusted catalog · auxiliary systems.
// Bottom row: storage (under client) · identity provider (under catalog).
const spec: FlowSpec = {
  nodeMeta: {
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
  },
  frames: [
    { id: "platform", x: 483, y: 80, w: 624, h: 150, label: "Your platform", variant: "platform" },
    { id: "cloud", x: 95, y: 310, w: 622, h: 150, label: "Cloud provider", variant: "cloud" },
  ],
  parentOf: { aux: "platform", catalog: "platform", idp: "cloud", storage: "cloud" },
  positions: {
    client: { x: 120, y: 122 },
    catalog: { x: 25, y: 42 },
    aux: { x: 415, y: 42 },
    storage: { x: 25, y: 42 },
    idp: { x: 413, y: 42 },
  },
  steps: [
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
  ],
  edges: [
    { id: "request", source: "client", target: "catalog", sourceHandle: "rs-lo", targetHandle: "lt-lo", step: 1, label: "1" },
    { id: "token", source: "client", target: "idp", sourceHandle: "rs-lo", targetHandle: "lt", step: 1, label: "token" },
    { id: "verify", source: "catalog", target: "idp", sourceHandle: "bs", targetHandle: "tt", step: 2, label: "2" },
    { id: "consult", source: "catalog", target: "aux", sourceHandle: "rs", targetHandle: "lt", step: 2, label: "attrs" },
    { id: "vend", source: "catalog", target: "client", sourceHandle: "ls-hi", targetHandle: "rt-hi", step: 3, label: "3" },
    { id: "read", source: "client", target: "storage", sourceHandle: "bs", targetHandle: "tt", step: 4, label: "4" },
  ],
  intro:
    "The catalog vends credentials after establishing trust with the client: the client authenticates, the catalog authorizes and mints a down-scoped credential, and the client reads storage directly — no standing keys.",
};

const CredentialVendingFlow = () => <FlowCanvas spec={spec} />;

export default CredentialVendingFlow;
