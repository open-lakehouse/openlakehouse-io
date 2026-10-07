import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { blogPath, type Post } from "@/content/content";

type Props = {
  post: Post;
  className?: string;
  children: ReactNode;
};

/**
 * Link to a blog post from a listing. Link-out entries (`externalUrl`) open the
 * original site in a new tab; everything else routes to the local post page.
 */
export const PostCardLink = ({ post, className, children }: Props) =>
  post.externalUrl ? (
    <a href={post.externalUrl} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  ) : (
    <Link to={blogPath(post)} className={className}>
      {children}
    </Link>
  );
