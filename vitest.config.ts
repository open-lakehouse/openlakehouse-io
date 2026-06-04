import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import path from "path";

export default defineConfig({
  plugins: [
    // Compile MDX with `development: false` so tests catch the prod-only
    // `jsxDEV is not a function` regression (MDX must emit `jsx`, not `jsxDEV`).
    { enforce: "pre", ...mdx({
      jsxRuntime: "automatic",
      development: false,
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [remarkGfm, remarkFrontmatter, [remarkMdxFrontmatter, { name: "frontmatter" }]],
    }) } as any,
    react(),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
