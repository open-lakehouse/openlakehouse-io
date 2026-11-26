import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { WikiShell, type Tab } from "@/components/wiki/WikiShell";
import { Seo } from "@/components/Seo";
import { canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import NotFound from "@/pages/NotFound";
import { CategoryLinks, WikiAnchor, WikiMdxProvider, WikiPageContext } from "@/components/wiki/WikiMdx";
import { NAVBOX, NAVBOX_TITLE } from "@/content/wiki-navbox";
import {
  WIKI_HOME,
  WIKI_LICENSE,
  WIKI_NAME,
  categoryMembers,
  editUrl,
  getWikiPage,
  glossaryEntries,
  historyUrl,
  loadWikiBody,
  wikiBodySync,
  type WikiPageMeta,
} from "@/content/wiki";
import { WikiHome } from "./WikiHome";

const wikiLd = { "@type": "WebSite", name: WIKI_NAME, url: canonicalUrl(WIKI_HOME) };
const org = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

const crumbs = (p: WikiPageMeta) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: WIKI_NAME, item: canonicalUrl(WIKI_HOME) },
    { "@type": "ListItem", position: 2, name: p.displayTitle ?? p.title, item: canonicalUrl(p.path) },
  ],
});

const articleLd = (p: WikiPageMeta) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: p.displayTitle ?? p.title,
  description: p.summary,
  url: canonicalUrl(p.path),
  ...(p.verified ? { dateModified: p.verified } : {}),
  inLanguage: "en",
  license: WIKI_LICENSE.url,
  isPartOf: wikiLd,
  publisher: org,
  about: p.categories.map((c) => ({ "@type": "Thing", name: c })),
});

/** The page title as shown: "Category:Table formats", "Project:Glossary", "transformWithState". */
const heading = (p: WikiPageMeta) =>
  p.kind === "category" ? `Category:${p.title}` : p.kind === "project" ? `Project:${p.title}` : (p.displayTitle ?? p.title);

const tabLabel = (p: WikiPageMeta) => (p.kind === "category" ? "Category" : p.kind === "project" ? "Project page" : "Page");

const Navbox = () => (
  <table className="olw-navbox">
    <tbody>
      <tr>
        <th colSpan={2} className="olw-navbox-title">
          <WikiAnchor href="/wiki/Open_lakehouse">{NAVBOX_TITLE}</WikiAnchor>
        </th>
      </tr>
      {NAVBOX.map((g) => (
        <tr key={g.group}>
          <th scope="row" className="olw-navbox-group">
            {g.group}
          </th>
          <td className="olw-navbox-list">
            {g.links.map(([target, text], i) => (
              <span key={target}>
                {i > 0 && " · "}
                <WikiAnchor href={`/wiki/${target.replace(/ /g, "_")}`}>{text}</WikiAnchor>
              </span>
            ))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const LetterColumns = ({ pages }: { pages: WikiPageMeta[] }) => {
  const groups = new Map<string, WikiPageMeta[]>();
  for (const p of pages) {
    const letter = (p.displayTitle ?? p.title).charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), p]);
  }
  return (
    <div className="olw-category-columns">
      {[...groups].map(([letter, list]) => (
        <div key={letter} className="olw-category-group">
          <h3>{letter}</h3>
          <ul>
            {list.map((p) => (
              <li key={p.key}>
                <WikiAnchor href={p.path}>{p.displayTitle ?? p.title}</WikiAnchor>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const CategoryMembers = ({ p }: { p: WikiPageMeta }) => {
  const members = categoryMembers(p.title);
  return (
    <div className="olw-category-members">
      <h2>Pages in category "{p.title}"</h2>
      {members.length ? (
        <>
          <p>
            The following {members.length === 1 ? "page is" : `${members.length} pages are`} in this category, out of{" "}
            {members.length} total.
          </p>
          <LetterColumns pages={members} />
        </>
      ) : (
        <p>This category currently contains no pages.</p>
      )}
    </div>
  );
};

const Glossary = () => {
  const entries = glossaryEntries();
  const groups = new Map<string, WikiPageMeta[]>();
  for (const p of entries) {
    const letter = (p.displayTitle ?? p.title).charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), p]);
  }
  return (
    <>
      {[...groups].map(([letter, list]) => (
        <section key={letter}>
          <h2 id={letter}>{letter}</h2>
          <dl className="olw-glossary">
            {list.map((p) => (
              <div key={p.key}>
                <dt>
                  <WikiAnchor href={p.path}>{p.displayTitle ?? p.title}</WikiAnchor>
                </dt>
                <dd>{p.summary}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </>
  );
};

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const pageTabs = (p: WikiPageMeta): { left: Tab[]; right: Tab[] } => ({
  left: [{ label: tabLabel(p), to: p.path, current: true }],
  right: [
    { label: "Read", to: p.path, current: true },
    ...(p.file ? [{ label: "Edit on GitHub", href: editUrl(p) }, { label: "View history", href: historyUrl(p) }] : []),
    { label: "Markdown", href: `${p.path}.md` },
  ],
});

const WikiArticle = ({ p }: { p: WikiPageMeta }) => {
  const [Body, setBody] = useState(() => wikiBodySync(p));
  useEffect(() => {
    const cached = wikiBodySync(p);
    if (cached) setBody(() => cached);
    else loadWikiBody(p).then((c) => c && setBody(() => c));
  }, [p]);

  const title = heading(p);
  const description = p.summary || (p.kind === "category" ? `Pages in the ${p.title} category of the ${WIKI_NAME}.` : title);
  const { left, right } = pageTabs(p);
  const glossary = p.key === "Project:Glossary";
  const contents: { depth: number; text: string; id: string }[] = glossary
    ? glossaryEntries()
        .map((g) => (g.displayTitle ?? g.title).charAt(0).toUpperCase())
        .filter((l, i, a) => a.indexOf(l) === i)
        .map((l) => ({ depth: 2, text: l, id: l }))
    : p.headings;

  const footer: ReactNode = p.verified ? (
    <p>The facts on this page were last verified on {longDate(p.verified)}.</p>
  ) : null;

  return (
    <WikiShell
      title={p.displayTitle && p.kind === "article" ? p.displayTitle : title}
      tabsLeft={left}
      tabsRight={right}
      contents={contents.length >= 2 ? contents : undefined}
      footer={footer}
    >
      <Seo
        title={`${title} - ${WIKI_NAME}`}
        suffix={false}
        description={description.length > 300 ? `${description.slice(0, 297)}...` : description}
        path={p.path}
        type={p.kind === "article" ? "article" : "website"}
        jsonLd={[
          p.kind === "article"
            ? articleLd(p)
            : { "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: canonicalUrl(p.path), isPartOf: wikiLd },
          crumbs(p),
        ]}
      />
      <Helmet>
        <link rel="alternate" type="text/markdown" href={`${p.path}.md`} />
      </Helmet>
      <div className="olw-siteSub">From {WIKI_NAME}</div>
      <div className="olw-body">
        <WikiPageContext.Provider value={p}>
          <WikiMdxProvider>{Body ? <Body /> : null}</WikiMdxProvider>
          {glossary && <Glossary />}
          {p.kind === "category" && <CategoryMembers p={p} />}
        </WikiPageContext.Provider>
        {p.kind === "article" && <Navbox />}
      </div>
      <CategoryLinks categories={p.categories} />
    </WikiShell>
  );
};

const WikiPage = () => {
  const { "*": splat = "" } = useParams();
  const key = splat.replace(/\/$/, "");
  if (key === "" || key === "Main_Page") return <WikiHome />;
  const p = getWikiPage(key);
  if (!p) return <NotFound />;
  return <WikiArticle key={p.key} p={p} />;
};

export default WikiPage;
