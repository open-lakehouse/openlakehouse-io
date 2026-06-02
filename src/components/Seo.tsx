import { Helmet } from "react-helmet-async";
import { canonicalUrl, SITE_NAME } from "@/lib/seo";

type SeoProps = {
  title: string;
  description: string;
  path: string; // route path beginning with "/"
  type?: "website" | "article" | "profile";
  image?: string;
  /** Any number of JSON-LD objects to attach to this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** When true, append " — Open Lakehouse" to <title>. Default true. */
  suffix?: boolean;
};

/**
 * Per-route <head> for SEO + GEO (LLM citations).
 *
 * Renders title, description, canonical, open graph, twitter card, and any
 * number of JSON-LD blocks. Pairs with the static sitewide head in
 * index.html — Helmet overrides per-route values for JS-executing crawlers.
 */
export const Seo = ({
  title,
  description,
  path,
  type = "website",
  image,
  jsonLd,
  suffix = true,
}: SeoProps) => {
  const url = canonicalUrl(path);
  const fullTitle = suffix && !title.includes(SITE_NAME) ? `${title} — ${SITE_NAME}` : title;
  const ldArr = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {ldArr.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};
