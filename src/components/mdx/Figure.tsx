import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FigureProps = ImgHTMLAttributes<HTMLImageElement> & {
  caption?: string;
  src: string;
  alt: string;
};

export const Figure = ({ caption, className, src, alt, ...props }: FigureProps) => (
  <figure className="not-prose my-8">
    <div className="overflow-hidden rounded-xl border border-border bg-secondary">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("h-auto w-full object-cover", className)}
        {...props}
      />
    </div>
    {caption && (
      <figcaption className="mt-3 text-sm text-muted-foreground text-center italic">
        {caption}
      </figcaption>
    )}
  </figure>
);
