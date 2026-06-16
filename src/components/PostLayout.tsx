import { Link } from "react-router-dom";
import { useState } from "react";
import { Clock, Copy, FileCode, Check } from "lucide-react";
import { MdxProvider } from "@/components/MdxProvider";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { FlowDiagram } from "@/components/mdx/FlowDiagram";
import {
  type Post,
  getAuthor,
  formatCategory,
} from "@/content/content";

export type PostLayoutSurface = "blog" | "learn";

const surfaceConfig: Record<PostLayoutSurface, { rootPath: string; categoryPath: (c: string) => string; eyebrow: string }> = {
  blog: { rootPath: "/blog", categoryPath: (c) => `/blog/category/${c}`, eyebrow: "Blog" },
  learn: { rootPath: "/learn", categoryPath: (c) => `/learn/${c}`, eyebrow: "Learn" },
};

export const PostLayout = ({ post, surface }: { post: Post; surface: PostLayoutSurface }) => {
  const cfg = surfaceConfig[surface];
  const authorsList = post.authorSlugs.map(getAuthor).filter(Boolean) as ReturnType<typeof getAuthor>[];
  const Body = post.Component;
  const [copied, setCopied] = useState(false);

  // Static .md file emitted at build time + served by dev middleware.
  const mdHref = `${cfg.rootPath}/${post.category}/${post.slug}.md`;

  const copyMarkdown = async () => {
    try {
      const res = await fetch(mdHref);
      if (!res.ok) throw new Error("fetch failed");
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <article className="container py-16 md:py-24 max-w-3xl">
      <Link
        to={cfg.categoryPath(post.category)}
        className="text-sm text-primary hover:underline"
      >
        ← {formatCategory(post.category)}
      </Link>

      {post.status === "preview" && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
          Preview — not listed publicly
        </div>
      )}

      <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">{post.title}</h1>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {authorsList.map((a, i) => (
          <span key={a!.slug} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground/60">·</span>}
            <Link to={`/authors/${a!.slug}`} className="flex items-center gap-2 hover:text-foreground">
              {a!.avatar && <img src={a!.avatar} alt="" aria-hidden="true" className="h-8 w-8 rounded-full" />}
              <span>{a!.name}</span>
            </Link>
          </span>
        ))}
        {authorsList.length > 0 && <span>·</span>}
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
        </time>
        {post.readingTime && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readingTime} min read
            </span>
          </>
        )}
      </div>

      {/* LLM-friendly export actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyMarkdown}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy as Markdown"}
        </button>
        <a
          href={mdHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <FileCode className="h-3.5 w-3.5" /> View as Markdown
        </a>
      </div>

      {post.video && (
        <div className="mt-10">
          <YouTubeEmbed videoId={post.video} title={post.title} />
        </div>
      )}

      {!post.video && post.thumbnail && (
        <div className="mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-secondary">
          <img
            src={post.thumbnail}
            alt={`Cover image: ${post.title}`}
            width={1280}
            height={720}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {post.flowDiagram && <FlowDiagram name={post.flowDiagram} />}

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:tracking-tight prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4">
        <MdxProvider>
          <Body />
        </MdxProvider>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};
