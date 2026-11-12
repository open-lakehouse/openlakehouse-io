import { Link } from "react-router-dom";
import { Fragment, useRef, useState } from "react";
import { Check, Copy, FileCode } from "lucide-react";
import { MdxProvider } from "@/components/MdxProvider";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { FlowDiagram } from "@/components/mdx/FlowDiagram";
import { BlogCard } from "@/components/blog/BlogCard";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { useArticleOutline } from "@/hooks/use-article-outline";
import { PostCardLink } from "@/components/PostCardLink";
import {
  type Post,
  formatCategory,
  formatPostDate,
  getAuthor,
  learnPosts,
  posts,
  relatedPosts,
} from "@/content/content";
import { canonicalUrl } from "@/lib/seo";

export type PostLayoutSurface = "blog" | "learn";

const surfaceConfig: Record<
  PostLayoutSurface,
  { rootPath: string; rootLabel: string; categoryPath: (c: string) => string; pool: () => Post[] }
> = {
  blog: { rootPath: "/blog", rootLabel: "Blog", categoryPath: (c) => `/blog/category/${c}`, pool: () => posts },
  learn: { rootPath: "/learn", rootLabel: "Learn", categoryPath: (c) => `/learn/${c}`, pool: () => learnPosts },
};

const asideTitle = "mb-3.5 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground";
const actionButton =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors";

export const PostLayout = ({ post, surface }: { post: Post; surface: PostLayoutSurface }) => {
  const cfg = surfaceConfig[surface];
  const authorsList = post.authorSlugs.map(getAuthor).filter(Boolean) as NonNullable<ReturnType<typeof getAuthor>>[];
  const Body = post.Component;
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const outline = useArticleOutline(articleRef, `${post.category}/${post.slug}`);
  const minutes = post.readingTime ?? outline.minutes;
  const related = relatedPosts(post, cfg.pool());
  const localPath = `${cfg.rootPath}/${post.category}/${post.slug}`;

  // Static .md file emitted at build time + served by dev middleware.
  const mdHref = `${localPath}.md`;

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
    <article className="pb-8">
      <header className="border-b border-border pb-8 pt-12 md:pt-16">
        <div className="container flex max-w-4xl flex-col gap-5">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted-foreground">
            <Link to={cfg.rootPath} className="hover:text-foreground">
              {cfg.rootLabel}
            </Link>
            <span aria-hidden="true">/</span>
            <Link to={cfg.categoryPath(post.category)} className="hover:text-foreground">
              {formatCategory(post.category)}
            </Link>
          </nav>

          {post.status === "preview" && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              Preview — not listed publicly
            </div>
          )}

          <div className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
            {formatCategory(post.category)}
          </div>

          <h1 className="text-balance text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="max-w-2xl text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-relaxed text-muted-foreground">
              {post.subtitle}
            </p>
          )}

          {post.video ? (
            <div className="mt-3">
              <YouTubeEmbed videoId={post.video} title={post.title} />
            </div>
          ) : (
            post.thumbnail && (
              <div className="mt-3 aspect-video overflow-hidden rounded-2xl border border-border bg-secondary">
                <img
                  src={post.thumbnail}
                  alt={`Cover image: ${post.title}`}
                  width={1280}
                  height={720}
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>
            )
          )}

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              {authorsList.length > 0 && (
                <div className="flex items-center gap-3">
                  {authorsList.some((a) => a.avatar) && (
                    <div className="flex -space-x-2">
                      {authorsList.map(
                        (a) =>
                          a.avatar && (
                            <img
                              key={a.slug}
                              src={a.avatar}
                              alt=""
                              aria-hidden="true"
                              className="h-9 w-9 rounded-full ring-2 ring-background"
                            />
                          ),
                      )}
                    </div>
                  )}
                  <div className="text-sm font-medium">
                    {authorsList.map((a, i) => (
                      <Fragment key={a.slug}>
                        {i > 0 && (
                          <span className="text-muted-foreground">{i === authorsList.length - 1 ? " & " : ", "}</span>
                        )}
                        <Link to={`/authors/${a.slug}`} className="hover:text-primary">
                          {a.name}
                        </Link>
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.date}>{formatPostDate(post.date, "long")}</time>
                {minutes && (
                  <>
                    <span aria-hidden="true" className="opacity-50">·</span>
                    <span>{minutes} min read</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* LLM-friendly export actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={copyMarkdown} className={actionButton}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy as Markdown"}
                </button>
                <a href={mdHref} target="_blank" rel="noopener noreferrer" className={actionButton}>
                  <FileCode className="h-3.5 w-3.5" /> View as Markdown
                </a>
              </div>
              <ShareButtons url={canonicalUrl(localPath)} title={post.title} />
            </div>
          </div>
        </div>
      </header>

      <div className="container grid grid-cols-1 gap-12 pb-16 pt-12 md:pt-14 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-16">
        <div className="min-w-0">
          {post.flowDiagram && <FlowDiagram name={post.flowDiagram} />}

          <div ref={articleRef} className="prose post-article">
            <MdxProvider>
              <Body />
            </MdxProvider>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 lg:hidden">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] flex-col gap-8 overflow-y-auto lg:flex">
          {outline.items.length > 0 && (
            <div className="border-t border-border pt-5">
              <TableOfContents items={outline.items} />
            </div>
          )}

          <div className="border-t border-border pt-5">
            <h2 className={asideTitle}>Topics</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                to={cfg.categoryPath(post.category)}
                className="inline-flex items-center rounded-full border border-primary/40 px-3 py-1 text-[0.8125rem] text-foreground transition-colors hover:border-primary hover:bg-primary/10"
              >
                {formatCategory(post.category)}
              </Link>
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[0.8125rem] text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <div className="border-t border-border pt-5">
              <h2 className={asideTitle}>Recommended</h2>
              <ul className="flex flex-col gap-4">
                {related.map((r) => (
                  <li key={`${r.category}/${r.slug}`}>
                    <PostCardLink post={r} surface={surface} className="group flex flex-col gap-1">
                      <span className="text-[0.9375rem] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                        {r.title}
                        {r.externalUrl && <span className="text-muted-foreground"> ↗</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatPostDate(r.date, "long")}</span>
                    </PostCardLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="keep-reading" className="border-t border-border">
          <div className="container py-14 md:py-16">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 id="keep-reading" className="text-2xl font-semibold tracking-tight">
                Keep reading
              </h2>
              <Link to={cfg.rootPath} className="text-sm font-medium text-primary hover:underline underline-offset-4">
                All {surface === "learn" ? "guides" : "posts"} →
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={`${r.category}/${r.slug}`} post={r} surface={surface} variant="card" />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};
