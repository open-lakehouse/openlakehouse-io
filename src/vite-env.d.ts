/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  const Component: ComponentType<any>;
  export default Component;
}

declare module "virtual:wiki-index" {
  import type { WikiIndex } from "../scripts/wiki-index";
  const index: WikiIndex;
  export default index;
}

declare module "virtual:wiki-routes" {
  const routes: string[];
  export default routes;
}
