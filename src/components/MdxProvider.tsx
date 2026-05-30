import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";

const components = {
  // shadcn-friendly defaults — extend here when you want custom MDX components
};

export const MdxProvider = ({ children }: { children: ReactNode }) => (
  <MDXProvider components={components}>{children}</MDXProvider>
);
