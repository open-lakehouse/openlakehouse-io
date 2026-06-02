import { useState } from "react";
import { Play } from "lucide-react";

type Props = {
  videoId: string;
  playlist?: string;
  title?: string;
  /** Render as a clickable poster (lazy iframe). Default true for performance. */
  lite?: boolean;
  /** Custom poster image URL. Defaults to YouTube's hqdefault. */
  poster?: string;
};

/**
 * Drop-in YouTube embed for MDX (blog posts, learn pages, etc.).
 *
 *   <YouTubeEmbed videoId="dQw4w9WgXcQ" />
 *   <YouTubeEmbed videoId="..." playlist="PL..." title="Talk title" />
 */
export const YouTubeEmbed = ({ videoId, playlist, title, lite = true, poster }: Props) => {
  const [active, setActive] = useState(!lite);
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${
    playlist ? `&list=${playlist}` : ""
  }`;
  const posterSrc = poster ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="my-6 relative w-full aspect-video overflow-hidden rounded-xl border border-border bg-black shadow-card">
      {active ? (
        <iframe
          src={src}
          title={title ?? "YouTube video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play ${title ?? "video"}`}
          className="group absolute inset-0 h-full w-full"
        >
          <img
            src={posterSrc}
            alt={title ? `YouTube video thumbnail: ${title}` : ""}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <Play className="h-7 w-7 ml-1" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
};

export default YouTubeEmbed;
