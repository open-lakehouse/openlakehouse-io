import { PostCardLink } from "@/components/PostCardLink";
import {
  authors,
  externalLabel,
  formatCategory,
  formatPostDate,
  type Post,
  type Surface,
} from "@/content/content";
import { cn } from "@/lib/utils";

export type BlogCardVariant = "featured" | "side" | "row" | "card";

/** featured = large lead · side = compact stack beside it · row = latest list · card = grid tile */
const styles: Record<
  BlogCardVariant,
  { root: string; media: string; body: string; title: string; desc?: string }
> = {
  featured: {
    root: "h-full flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40",
    media: "aspect-[16/10]",
    body: "flex-1 gap-3 p-6 md:p-7",
    title: "text-[clamp(1.5rem,2.4vw,2rem)] leading-tight",
    desc: "text-base line-clamp-3",
  },
  side: {
    root: "flex-1 items-center gap-3.5 px-4 py-3 hover:bg-muted/60",
    media: "h-[4.5rem] w-[4.5rem] rounded-lg",
    body: "gap-1",
    title: "text-[0.9375rem] leading-snug line-clamp-2",
  },
  row: {
    root: "flex-col gap-4 border-b border-border py-6 first:border-t sm:flex-row sm:gap-6",
    media: "aspect-video w-full rounded-xl sm:aspect-[16/10] sm:w-44",
    body: "justify-center gap-2.5",
    title: "text-xl leading-snug",
    desc: "text-[0.9375rem] line-clamp-2",
  },
  card: {
    root: "h-full flex-col overflow-hidden rounded-2xl border border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card",
    media: "aspect-[16/10]",
    body: "flex-1 gap-2.5 p-5 pb-6",
    title: "text-lg leading-snug",
    desc: "text-[0.9375rem] line-clamp-2",
  },
};

export const BlogCard = ({
  post,
  variant = "card",
  surface = "blog",
  hidden = false,
  className,
}: {
  post: Post;
  variant?: BlogCardVariant;
  surface?: Surface;
  /** Keep the card in the DOM (links stay crawlable) but don't display it. */
  hidden?: boolean;
  className?: string;
}) => {
  const s = styles[variant];
  const names = post.authorSlugs
    .map((slug) => authors[slug]?.name)
    .filter(Boolean)
    .join(", ");
  const publisher = externalLabel(post);

  return (
    <PostCardLink
      post={post}
      surface={surface}
      className={cn(
        hidden ? "hidden" : "flex",
        "group text-inherit no-underline transition-all duration-200",
        s.root,
        className,
      )}
    >
      {post.thumbnail && (
        <div className={cn("shrink-0 overflow-hidden bg-secondary", s.media)}>
          <img
            src={post.thumbnail}
            alt={`Cover image for blog post: ${post.title}`}
            loading={variant === "featured" ? "eager" : "lazy"}
            decoding="async"
            width={1280}
            height={720}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className={cn("flex min-w-0 flex-col", s.body)}>
        <div
          className={cn(
            "font-mono uppercase tracking-[0.04em] text-primary",
            variant === "side" ? "text-[0.6875rem]" : "text-xs",
          )}
        >
          {formatCategory(post.category)}
        </div>
        <h3 className={cn("font-semibold tracking-tight transition-colors group-hover:text-primary", s.title)}>
          {post.title}
        </h3>
        {s.desc && post.excerpt && (
          <p className={cn("leading-relaxed text-muted-foreground", s.desc)}>{post.excerpt}</p>
        )}
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground",
            variant === "side" ? "text-xs" : "mt-auto pt-2 text-[0.8125rem]",
          )}
        >
          {names && (
            <>
              <span>{names}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
            </>
          )}
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {publisher && (
            <>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span>{publisher} ↗</span>
            </>
          )}
        </div>
      </div>
    </PostCardLink>
  );
};
