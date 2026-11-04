import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { CodeBlock } from "./CodeBlock";
import { Figure } from "./mdx/Figure";
import { Callout } from "./mdx/Callout";
import { Steps, Step } from "./mdx/Steps";
import { FlowDiagram } from "./mdx/FlowDiagram";
import { PromptBlock } from "./mdx/PromptBlock";
import { Tabs, Tab } from "./mdx/Tabs";
import { LikeC4View } from "./mdx/LikeC4View";
import { TrestleView } from "./mdx/TrestleView";

const components = {
  // Available in every .mdx file — no import needed.
  YouTubeEmbed,
  Figure,
  Callout,
  Steps,
  Step,
  FlowDiagram,
  PromptBlock,
  Tabs,
  Tab,
  // Diagrams from docs-factory posts; their bundles live under public/.
  LikeC4View,
  TrestleView,
  pre: CodeBlock,
};

export const MdxProvider = ({ children }: { children: ReactNode }) => (
  <MDXProvider components={components}>{children}</MDXProvider>
);
