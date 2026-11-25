import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { componentTagger } from "lovable-tagger";
import { postMarkdownPlugin } from "./scripts/vite-post-markdown";
import remarkMermaid from "./scripts/remark-mermaid.mjs";
import { wikiPlugin } from "./scripts/wiki-index";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    { enforce: "pre", ...mdx({
      jsxRuntime: "automatic",
      development: mode === "development",
      providerImportSource: "@mdx-js/react",
      exclude: /src\/content\/wiki\//,
      remarkPlugins: [remarkGfm, remarkFrontmatter, [remarkMdxFrontmatter, { name: "frontmatter" }], remarkMermaid],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        [rehypePrettyCode, { theme: "github-dark-dimmed", keepBackground: true }],
      ],
    }) } as any,
    // Wiki pages: MediaWiki look, so light code blocks (dark ones in dark mode)
    // and plain headings without self-links.
    { enforce: "pre", ...mdx({
      jsxRuntime: "automatic",
      development: mode === "development",
      providerImportSource: "@mdx-js/react",
      include: /src\/content\/wiki\/.*\.mdx$/,
      remarkPlugins: [remarkGfm, remarkFrontmatter, [remarkMdxFrontmatter, { name: "frontmatter" }]],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false }],
      ],
    }) } as any,
    react(),
    postMarkdownPlugin(),
    wikiPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
