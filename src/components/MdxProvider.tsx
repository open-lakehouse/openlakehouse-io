import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { YouTubeEmbed } from "./YouTubeEmbed";

const components = {
  // Available in every .mdx file — no import needed.
  YouTubeEmbed,
};

export const MdxProvider = ({ children }: { children: ReactNode }) => (
  <MDXProvider components={components}>{children}</MDXProvider>
);
