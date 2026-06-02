import { Play } from "lucide-react";
import { YouTubeEmbed } from "./YouTubeEmbed";

type Props = {
  videoId?: string;
  title?: string;
  placeholderLabel?: string;
  poster?: string;
};

/**
 * Slot for a YouTube walkthrough video. Renders a YouTubeEmbed when `videoId`
 * is provided, otherwise shows a styled placeholder of the same dimensions.
 */
export const VideoSlot = ({ videoId, title, placeholderLabel = "Walkthrough video coming soon", poster }: Props) => {
  if (videoId) {
    return (
      <div className="w-full">
        <YouTubeEmbed videoId={videoId} title={title} poster={poster} />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-xl border border-border bg-card/60 shadow-card overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.25), transparent 60%), radial-gradient(circle at 70% 70%, hsl(var(--accent) / 0.2), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="h-14 w-14 rounded-full bg-primary/15 border border-primary/30 inline-flex items-center justify-center backdrop-blur-sm">
          <Play className="h-6 w-6 text-primary" fill="currentColor" />
        </div>
        <div className="text-sm font-medium">{placeholderLabel}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">YouTube embed</div>
      </div>
    </div>
  );
};
