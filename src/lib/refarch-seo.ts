// JSON-LD builders for the Open Reference Architectures section.
import { canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  HUB_DEFINITION,
  HUB_DESCRIPTION,
  HUB_FAQS,
  HUB_PATH,
  HUB_TITLE,
  HUB_UPDATED,
  INDUSTRIES,
  PATTERNS,
  RESOURCE_GROUPS,
  componentById,
  industryFaqs,
  industryPath,
  nodeName,
  patternBySlug,
  patternPath,
  type Faq,
  type Industry,
  type Pattern,
} from "@/content/reference-architectures";

const publisher = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

const faqLd = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

const breadcrumb = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: canonicalUrl(it.path) })),
});

export function hubJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: HUB_TITLE,
      description: HUB_DESCRIPTION,
      url: canonicalUrl(HUB_PATH),
      dateModified: HUB_UPDATED,
      publisher,
      about: [
        { "@type": "Thing", name: "Reference architecture" },
        { "@type": "Thing", name: "Open source data engineering" },
        { "@type": "Thing", name: "Data lakehouse architecture" },
      ],
      abstract: HUB_DEFINITION,
      hasPart: PATTERNS.map((p) => ({ "@type": "TechArticle", headline: p.title, url: canonicalUrl(patternPath(p.slug)) })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Open source data engineering reference architectures",
      itemListElement: PATTERNS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonicalUrl(patternPath(p.slug)),
        name: `${p.title}: ${p.stackLine}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${HUB_TITLE} dataset`,
      description: "Every open reference architecture, component and industry lens on openlakehouse.io as JSON.",
      url: canonicalUrl(HUB_PATH),
      dateModified: HUB_UPDATED,
      creator: publisher,
      isAccessibleForFree: true,
      distribution: [{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE_URL}/reference-architectures.json` }],
    },
    {
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "Lakehouse industry lenses",
      hasDefinedTerm: INDUSTRIES.map((i) => ({ "@type": "DefinedTerm", name: i.name, url: canonicalUrl(industryPath(i.slug)), description: i.summary })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Open source data engineering resources",
      itemListElement: RESOURCE_GROUPS.flatMap((g) => g.items).map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "SoftwareSourceCode", name: r.name, description: r.what, codeRepository: r.url },
      })),
    },
    faqLd(HUB_FAQS),
    breadcrumb([
      { name: "Home", path: "/" },
      { name: HUB_TITLE, path: HUB_PATH },
    ]),
  ];
}

export function patternJsonLd(p: Pattern) {
  const url = canonicalUrl(patternPath(p.slug));
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: `${p.title}: ${p.stackLine}`,
      description: p.definition,
      url,
      mainEntityOfPage: url,
      dateModified: p.updated,
      datePublished: p.updated,
      author: publisher,
      publisher,
      proficiencyLevel: "Intermediate",
      keywords: p.keywords.join(", "),
      isPartOf: { "@type": "CollectionPage", name: HUB_TITLE, url: canonicalUrl(HUB_PATH) },
      about: { "@type": "Thing", name: p.title },
      mentions: p.nodes
        .map((n) => componentById(n.component))
        .filter((c, i, a) => c && a.indexOf(c) === i)
        .map((c) => ({ "@type": "SoftwareApplication", name: c!.name, url: c!.url, applicationCategory: "DataManagement", ...(c!.license ? { license: c!.license } : {}) })),
      citation: p.sources.map((s) => s.href),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How data flows through the ${p.title.toLowerCase()} architecture`,
      step: p.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
      tool: p.nodes.filter((n) => n.component).map((n) => ({ "@type": "HowToTool", name: nodeName(n) })),
    },
    ...p.repos.map((r) => ({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: r.name,
      codeRepository: r.url,
      description: r.description,
      ...(r.license ? { license: r.license } : {}),
    })),
    faqLd(p.faqs),
    breadcrumb([
      { name: "Home", path: "/" },
      { name: HUB_TITLE, path: HUB_PATH },
      { name: p.title, path: patternPath(p.slug) },
    ]),
  ];
}

export function industryJsonLd(ind: Industry) {
  const url = canonicalUrl(industryPath(ind.slug));
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: `Open source data architecture for ${ind.name}`,
      description: ind.summary,
      url,
      dateModified: HUB_UPDATED,
      author: publisher,
      publisher,
      about: [{ "@type": "Thing", name: ind.name }, { "@type": "Thing", name: "Reference architecture" }],
      mentions: ind.formats.map((f) => ({ "@type": "CreativeWork", name: f.name, url: f.url, publisher: { "@type": "Organization", name: f.body } })),
      hasPart: ind.useCases.map((u) => ({ "@type": "TechArticle", headline: patternBySlug(u.pattern)?.title, url: canonicalUrl(patternPath(u.pattern)) })),
    },
    faqLd(industryFaqs(ind)),
    breadcrumb([
      { name: "Home", path: "/" },
      { name: HUB_TITLE, path: HUB_PATH },
      { name: ind.name, path: industryPath(ind.slug) },
    ]),
  ];
}

