import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, History, Pencil } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { WikiShell } from "@/components/wiki/WikiShell";
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
  wikiPages,
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

/** The page title as shown: "Category: Table formats", "Glossary", "transformWithState". */
const heading = (p: WikiPageMeta) => (p.kind === "category" ? `Category: ${p.title}` : (p.displayTitle ?? p.title));

const Navbox = () => (
  <nav className="wiki-navbox" aria-label={`${NAVBOX_TITLE} articles`}>
    <div className="wiki-navbox-title">
      <WikiAnchor href="/wiki/Open_lakehouse">{NAVBOX_TITLE}</WikiAnchor>
    </div>
    <dl>
      {NAVBOX.map((g) => (
        <div key={g.group}>
          <dt>{g.group}</dt>
          <dd>
            {g.links.map(([target, text], i) => (
              <span key={target}>
                {i > 0 && " · "}
                <WikiAnchor href={`/wiki/${target.replace(/ /g, "_")}`}>{text}</WikiAnchor>
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  </nav>
);

const PageTools = ({ p }: { p: WikiPageMeta }) => (
  <ul className="wiki-tools">
    {p.file && (
      <li>
        <a href={editUrl(p)} rel="noopener">
          <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit on GitHub
        </a>
      </li>
    )}
    {p.file && (
      <li>
        <a href={historyUrl(p)} rel="noopener">
          <History className="h-3.5 w-3.5" aria-hidden /> History
        </a>
      </li>
    )}
    <li>
      <a href={`${p.path}.md`}>
        <FileText className="h-3.5 w-3.5" aria-hidden /> Markdown
      </a>
    </li>
  </ul>
);

const LetterGroups = ({ pages, render }: { pages: WikiPageMeta[]; render: (p: WikiPageMeta) => ReactNode }) => {
  const groups = new Map<string, WikiPageMeta[]>();
  for (const p of pages) {
    const letter = (p.displayTitle ?? p.title).charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), p]);
  }
  return (
    <>
      {[...groups].map(([letter, list]) => (
        <section key={letter}>
          <h3 className="wiki-letter">{letter}</h3>
          <ul>{list.map((p) => <li key={p.key}>{render(p)}</li>)}</ul>
        </section>
      ))}
    </>
  );
};

const CategoryMembers = ({ p }: { p: WikiPageMeta }) => {
  const members = categoryMembers(p.title);
  return (
    <>
      <h2>Pages in category "{p.title}"</h2>
      {members.length ? (
        <>
          <p>This category contains the following {members.length === 1 ? "page" : `${members.length} pages`}.</p>
          <div className="wiki-columns">
            <LetterGroups pages={members} render={(m) => <WikiAnchor href={m.path}>{m.displayTitle ?? m.title}</WikiAnchor>} />
          </div>
        </>
      ) : (
        <p>This category has no pages yet.</p>
      )}
    </>
  );
};

const Glossary = () => (
  <dl className="wiki-glossary">
    {glossaryEntries().map((p) => (
      <div key={p.key}>
        <dt>
          <WikiAnchor href={p.path}>{p.displayTitle ?? p.title}</WikiAnchor>
        </dt>
        <dd>{p.summary}</dd>
      </div>
    ))}
  </dl>
);

const WikiArticle = ({ p }: { p: WikiPageMeta }) => {
  const [Body, setBody] = useState(() => wikiBodySync(p));
  useEffect(() => {
    const cached = wikiBodySync(p);
    if (cached) setBody(() => cached);
    else loadWikiBody(p).then((c) => c && setBody(() => c));
  }, [p]);

  const title = heading(p);
  const description = p.summary || (p.kind === "category" ? `Pages in the ${p.title} category of the ${WIKI_NAME}.` : title);
  return (
    <WikiShell>
      <Seo
        title={`${title} - ${WIKI_NAME}`}
        suffix={false}
        description={description.length > 300 ? `${description.slice(0, 297)}...` : description}
        path={p.path}
        type={p.kind === "article" ? "article" : "website"}
        jsonLd={[p.kind === "article" ? articleLd(p) : { "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: canonicalUrl(p.path), isPartOf: wikiLd }, crumbs(p)]}
      />
      <Helmet>
        <link rel="alternate" type="text/markdown" href={`${p.path}.md`} />
      </Helmet>
      <article className="container mx-auto px-4 py-8">
        <header className="wiki-header">
          <h1>{title}</h1>
          <p className="wiki-from">From the {WIKI_NAME}</p>
          <PageTools p={p} />
        </header>
        <div className="prose post-article wiki-article max-w-none">
          <WikiPageContext.Provider value={p}>
            <WikiMdxProvider>{Body ? <Body /> : null}</WikiMdxProvider>
            {p.key === "Open_Lakehouse_Wiki:Glossary" && <Glossary />}
            {p.kind === "category" && <CategoryMembers p={p} />}
          </WikiPageContext.Provider>
        </div>
        {p.kind === "article" && <Navbox />}
        <CategoryLinks categories={p.categories} />
        <footer className="wiki-license">
          Text is available under the <a href={WIKI_LICENSE.url}>{WIKI_LICENSE.name}</a> license. To change this page,{" "}
          {p.file ? (
            <a href={editUrl(p)} rel="noopener">
              edit it on GitHub
            </a>
          ) : (
            "edit it on GitHub"
          )}{" "}
          and open a pull request; see the <Link to="/wiki/Open_Lakehouse_Wiki:Style_guide">style guide</Link>.
        </footer>
      </article>
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
