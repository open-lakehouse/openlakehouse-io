import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { postPath, type Post, type Surface } from "@/content/content";

type Props = {
  post: Post;
  /** Which surface's local route to link to. Default "blog". */
  surface?: Surface;
  className?: string;
  children: ReactNode;
};

/**
 * Link to a post from a listing. Link-out entries (`externalUrl`) open the
 * original site in a new tab; everything else routes to the local post page.
 */
export const PostCardLink = ({ post, surface = "blog", className, children }: Props) =>
  post.externalUrl ? (
    <a href={post.externalUrl} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  ) : (
    <Link to={postPath(post, surface)} className={className}>
      {children}
    </Link>
  );
