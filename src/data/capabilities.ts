import { ShieldCheck, KeyRound, ServerCog, ShieldHalf, type LucideIcon } from "lucide-react";

export type CapabilityApproach = {
  slug: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  status: "live" | "coming-soon";
};

export type Capability = {
  slug: string;
  title: string;
  icon: LucideIcon;
  blurb: string;
  status: "live" | "coming-soon";
  approaches: CapabilityApproach[];
};

export const capabilities: Capability[] = [
  {
    slug: "governance",
    title: "Governance",
    icon: ShieldCheck,
    blurb:
      "Who can read and write data — and how engines reach storage without holding standing secrets. Three patterns power it today.",
    status: "live",
    approaches: [
      {
        slug: "credential-vending",
        title: "Credential Vending",
        icon: KeyRound,
        summary:
          "The catalog holds the storage credential and hands clients short-lived, down-scoped tokens — so no one keeps standing access to storage.",
        status: "live",
      },
      {
        slug: "server-side-planning",
        title: "Server-Side Planning / Scan APIs",
        icon: ServerCog,
        summary:
          "The client asks the catalog to plan a query; it returns the exact files to read plus a credential for them — enabling file-, column-, and row-level control.",
        status: "live",
      },
      {
        slug: "trusted-compute",
        title: "Trusted Compute",
        icon: ShieldHalf,
        summary:
          "The engine is trusted to apply catalog policies and keep raw data and credentials out of the user's reach — enabling row-level security and column masking.",
        status: "coming-soon",
      },
    ],
  },
];

export const getCapability = (slug: string): Capability | undefined =>
  capabilities.find((c) => c.slug === slug);
