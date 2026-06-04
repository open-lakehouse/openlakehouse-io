import type { ComponentType } from "react";
import { OpenLineageFlow } from "@/components/OpenLineageFlow";
import { PolicastFlow } from "@/components/PolicastFlow";

/**
 * Registry mapping a string key (used in MDX frontmatter or `<FlowDiagram name="..." />`)
 * to a React component. Add new diagrams here.
 */
const registry: Record<string, ComponentType> = {
  "open-lineage": OpenLineageFlow,
  policast: PolicastFlow,
};

export const FlowDiagram = ({ name }: { name: string }) => {
  const Cmp = registry[name];
  if (!Cmp) {
    if (import.meta.env.DEV) {
      console.warn(`[FlowDiagram] No diagram registered for "${name}".`);
    }
    return null;
  }
  return (
    <div className="not-prose my-10">
      <Cmp />
    </div>
  );
};

export const flowDiagramRegistry = registry;
