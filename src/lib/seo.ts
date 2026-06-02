// Centralized SEO/GEO constants and helpers.
// Single source of truth for site identity used by <Seo> and JSON-LD.

export const SITE_URL = "https://openlakehouse-guide-hub.lovable.app";
export const SITE_NAME = "Open Lakehouse";
export const SITE_TAGLINE = "Open formats, open engines, your storage";
export const SITE_DESCRIPTION =
  "The Open Lakehouse: your data in open formats on storage you control, readable by any engine — today and ten years from now.";

export const canonicalUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// Schema.org Organization used sitewide. The `sameAs` graph encodes the
// open-source projects (and their origin orgs) that make up the lakehouse —
// machine-readable provenance for LLMs and search engines.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  sameAs: [
    "https://delta.io",
    "https://iceberg.apache.org",
    "https://unitycatalog.io",
    "https://mlflow.org",
    "https://spark.apache.org",
    "https://github.com/delta-io",
    "https://github.com/apache/iceberg",
    "https://github.com/unitycatalog/unitycatalog",
    "https://github.com/mlflow/mlflow",
    "https://github.com/apache/spark",
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};
