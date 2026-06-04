import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";

/**
 * Emits raw .md files (frontmatter stripped) for every post:
 *   /blog/<category>/<slug>.md   when frontmatter `include` contains "blog"
 *   /learn/<category>/<slug>.md  when frontmatter `include` contains "learn"
 *
 * In dev: served via middleware.
 * In build: written into Vite's outDir.
 */
export function postMarkdownPlugin(): Plugin {
  const contentRoot = path.resolve(process.cwd(), "src/content/posts");

  const parse = (raw: string) => {
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
    let include: string[] = ["blog"];
    let status = "published";
    if (m) {
      const fm = m[1];
      const inc = fm.match(/^include:\s*(.+)$/m);
      if (inc) {
        const v = inc[1].trim();
        if (v.startsWith("[")) {
          include = v
            .replace(/^\[|\]$/g, "")
            .split(",")
            .map((s) => s.trim().replace(/['"]/g, ""))
            .filter(Boolean);
        }
      }
      const st = fm.match(/^status:\s*(.+)$/m);
      if (st) status = st[1].trim().replace(/['"]/g, "");
    }
    const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
    return { include, status, body };
  };

  const findPost = (category: string, slug: string) => {
    const dirCandidate = path.join(contentRoot, category, slug, "index.mdx");
    const flatCandidate = path.join(contentRoot, category, `${slug}.mdx`);
    if (fs.existsSync(dirCandidate)) return dirCandidate;
    if (fs.existsSync(flatCandidate)) return flatCandidate;
    return null;
  };

  return {
    name: "post-markdown-emitter",
    apply: () => true,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const m = url.match(/^\/(blog|learn)\/([^/]+)\/([^/]+)\.md$/);
        if (!m) return next();
        const [, surface, category, slug] = m;
        const file = findPost(category, slug);
        if (!file) return next();
        const raw = fs.readFileSync(file, "utf8");
        const { include, status, body } = parse(raw);
        if (status === "draft" || !include.includes(surface)) return next();
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.end(body);
      });
    },
    async closeBundle() {
      // Emit static .md files into Vite outDir for production hosting.
      const outDir = path.resolve(process.cwd(), "dist");
      if (!fs.existsSync(outDir)) return;
      const files = await fg("**/*.mdx", { cwd: contentRoot, absolute: true });
      for (const file of files) {
        const rel = path.relative(contentRoot, file);
        const parts = rel.split(path.sep);
        const category = parts[0];
        const last = parts[parts.length - 1].replace(/\.mdx$/, "");
        const slug = last === "index" && parts.length >= 3 ? parts[parts.length - 2] : last;
        const raw = fs.readFileSync(file, "utf8");
        const { include, status, body } = parse(raw);
        if (status === "draft") continue;
        for (const surface of include) {
          if (surface !== "blog" && surface !== "learn") continue;
          const target = path.join(outDir, surface, category, `${slug}.md`);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, body);
        }
      }
    },
  };
}
