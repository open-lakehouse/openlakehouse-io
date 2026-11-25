// Components available in every wiki page (src/content/wiki/**/*.mdx), without imports.
// They replace the MediaWiki templates the pages used before the move to the site.
import { createContext, useContext, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { Link } from "react-router-dom";
import { categoryPath, wikiPathExists, type WikiPageMeta } from "@/content/wiki";

export const WikiPageContext = createContext<WikiPageMeta | null>(null);

// ---------- Infobox ----------

const LABELS: Record<string, string> = {
  // software
  developer: "Developer",
  initial_release: "Initial release",
  latest_release: "Latest release",
  latest_release_date: "Release date",
  written_in: "Written in",
  type: "Type",
  license: "License",
  website: "Website",
  repo: "Repository",
  // concept
  also_known_as: "Also known as",
  field: "Field",
  introduced: "Introduced",
  key_parts: "Key parts",
  implementations: "Open source implementations",
  // both
  related: "Related",
};

/** Summary box floated beside the lead. `type` is "software" or "concept"; `name` defaults to the page title. */
export const Infobox = ({ name, children }: { type?: "software" | "concept"; name?: string; children: ReactNode }) => {
  const page = useContext(WikiPageContext);
  return (
    <table className="olw-infobox">
      <caption>{name ?? page?.displayTitle ?? page?.title}</caption>
      <tbody>{children}</tbody>
    </table>
  );
};

/** One infobox row. `name` is one of the field names above; unknown names show as written. */
export const Field = ({ name, children }: { name: string; children: ReactNode }) => (
  <tr>
    <th scope="row">{LABELS[name] ?? name.replace(/_/g, " ")}</th>
    <td>{children}</td>
  </tr>
);

// ---------- notices ----------

const longDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

/** When the page's facts were last checked against primary sources, and against what. */
export const Verified = ({ date, children }: { date: string; children?: ReactNode }) => (
  <div className="olw-verified">
    Last verified <time dateTime={date}>{longDate(date)}</time>
    {children ? <> against {children}</> : null}.
  </div>
);

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  experimental: "Experimental",
  maintenance: "Maintenance mode",
  proposed: "Deprecation proposed, not yet in a release",
  deprecated: "Deprecated",
  removed: "Removed",
  archived: "Archived",
};

/**
 * Whether the subject is still the recommended choice. The page joins the
 * matching category (Deprecated, Removed, ...) automatically.
 */
export const Status = ({ level, since, children }: { level: string; since?: string; children?: ReactNode }) => (
  <div className={`olw-status olw-status-${level}`}>
    <strong>Status: {STATUS_LABEL[level] ?? level}</strong>
    {since ? ` since ${since}` : ""}. {children}
  </div>
);

/** "Main article: ..." or "See also: ..." line under a heading. */
export const Hatnote = ({ children }: { children: ReactNode }) => <div className="olw-hatnote">{children}</div>;

export const Note = ({ children }: { children: ReactNode }) => <div className="olw-note">{children}</div>;

/** For data loss risks, known bugs and breaking changes. */
export const Warning = ({ children }: { children: ReactNode }) => (
  <div className="olw-warning" role="note">
    {children}
  </div>
);

// ---------- links ----------

/**
 * Wiki links that point at a page that does not exist yet render as plain
 * text (MediaWiki's red links), so readers and crawlers never hit a 404.
 * They become links on their own once the page is written.
 */
export const WikiAnchor = ({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (href.startsWith("/wiki/")) {
    if (!wikiPathExists(href))
      return (
        <span className="olw-redlink" title="This page does not exist yet">
          {children}
        </span>
      );
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (/^https?:\/\//.test(href))
    return (
      <a href={href} rel="noopener" {...rest}>
        {children}
      </a>
    );
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
};

const Table = (props: HTMLAttributes<HTMLTableElement>) => (
  <div className="olw-table-scroll">
    <table {...props} />
  </div>
);

const components = {
  Infobox,
  Field,
  Verified,
  Status,
  Hatnote,
  Note,
  Warning,
  a: WikiAnchor,
  table: Table,
};

export const WikiMdxProvider = ({ children }: { children: ReactNode }) => (
  <MDXProvider components={components}>{children}</MDXProvider>
);

export const CategoryLinks = ({ categories }: { categories: string[] }) =>
  categories.length ? (
    <div className="olw-catlinks">
      <Link to="/wiki/Main_Page#categories">Categories</Link>:{" "}
      <ul>
        {categories.map((c) => (
          <li key={c}>
            <Link to={categoryPath(c)}>{c}</Link>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
