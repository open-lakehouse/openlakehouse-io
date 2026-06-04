import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { CodeBlock } from "./CodeBlock";
import { Figure } from "./mdx/Figure";
import { Callout } from "./mdx/Callout";
import { Steps, Step } from "./mdx/Steps";
import { FlowDiagram } from "./mdx/FlowDiagram";
import { PromptBlock } from "./mdx/PromptBlock";

const components = {
  // Available in every .mdx file — no import needed.
  YouTubeEmbed,
  Figure,
  Callout,
  Steps,
  Step,
  FlowDiagram,
  PromptBlock,
  pre: CodeBlock,
};

export const MdxProvider = ({ children }: { children: ReactNode }) => (
  <MDXProvider components={components}>{children}</MDXProvider>
);
