import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import { WikiAnchor } from "@/components/wiki/WikiMdx";
import { WIKI_HOME, WIKI_LICENSE, WIKI_NAME, WIKI_REPO, articles, categoryMembers, wikiPages } from "@/content/wiki";
import { WikiSearch, WikiShell } from "@/components/wiki/WikiShell";

export const WIKI_TAGLINE =
  "The open reference for the open lakehouse and the agentic lakehouse: open table formats, catalogs, engines, pipelines, and the AI agents that work on them. Every fact is cited and dated.";

const W = ({ to, children }: { to: string; children?: ReactNode }) => (
  <WikiAnchor href={`/wiki/${to.replace(/ /g, "_")}`}>{children ?? to}</WikiAnchor>
);

const Card = ({ title, tone = "", children }: { title: string; tone?: string; children: ReactNode }) => (
  <section className={`wiki-card ${tone}`}>
    <h2>{title}</h2>
    {children}
  </section>
);

const categories = wikiPages
  .filter((p) => p.kind === "category")
  .map((p) => ({ p, n: categoryMembers(p.title).length }))
  .filter(({ n }) => n > 0)
  .sort((a, b) => a.p.title.localeCompare(b.p.title));

export const WikiHome = () => (
  <WikiShell>
    <Seo
      title={WIKI_NAME}
      suffix={false}
      description={WIKI_TAGLINE}
      path={WIKI_HOME}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: WIKI_NAME,
        url: canonicalUrl(WIKI_HOME),
        description: WIKI_TAGLINE,
        license: WIKI_LICENSE.url,
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      }}
    />
    <div className="container mx-auto px-4 py-8 wiki-home">
      <header className="wiki-hero">
        <h1>{WIKI_NAME}</h1>
        <p>
          The open reference for the <W to="Open lakehouse">open lakehouse</W> and the{" "}
          <W to="Agentic lakehouse">agentic lakehouse</W>: open table formats, catalogs, engines, pipelines, and the AI
          agents that work on them. Every fact is cited and dated. Anyone can suggest a change with a pull request.
        </p>
        <WikiSearch className="mt-4 max-w-md" />
      </header>

      <div className="wiki-grid">
        <Card title="Start here">
          <ul>
            <li><W to="Open lakehouse" />: open tables on object storage, any engine</li>
            <li><W to="Agentic lakehouse" />: a lakehouse that AI agents can use safely</li>
            <li><W to="Open table format" />: how Iceberg, Delta and Hudi make files into tables</li>
            <li><W to="Data catalog" />: the map of what data exists and who may touch it</li>
            <li><W to="Medallion architecture" />: bronze, silver and gold layers</li>
          </ul>
        </Card>
        <Card title="Table formats" tone="blue">
          <ul>
            <li><W to="Apache Iceberg" /></li>
            <li><W to="Delta Lake" /></li>
            <li><W to="Apache Hudi" /></li>
            <li><W to="Apache Parquet" /> (the file format underneath)</li>
          </ul>
        </Card>
        <Card title="Catalogs" tone="yellow">
          <ul>
            <li><W to="Unity Catalog" /> (open source)</li>
            <li><W to="Apache Polaris" /></li>
            <li><W to="Iceberg REST catalog" /> (the open API between engines and catalogs)</li>
          </ul>
        </Card>
        <Card title="Engines" tone="navy">
          <ul>
            <li><W to="Apache Spark" /></li>
            <li><W to="Spark Connect" /></li>
            <li><W to="DuckDB" /></li>
            <li><W to="Trino" /></li>
          </ul>
        </Card>
        <Card title="Pipelines and orchestration">
          <ul>
            <li><W to="Spark Declarative Pipelines" /></li>
            <li><W to="Structured Streaming" /></li>
            <li><W to="Apache Airflow" /></li>
          </ul>
        </Card>
        <Card title="Agents" tone="blue">
          <ul>
            <li><W to="Agentic lakehouse" /></li>
            <li><W to="Model Context Protocol" /></li>
          </ul>
        </Card>
      </div>

      <div className="wiki-grid">
        <Card title="Concepts the docs assume you know" tone="yellow">
          <ul>
            <li>How engines work: <W to="Executor" />, <W to="Shuffle" />, <W to="Partition" />, <W to="Predicate pushdown" /></li>
            <li>
              Data layout: <W to="Logical type" />, <W to="Variant type" />, <W to="Deletion vector" />,{" "}
              <W to="Copy-on-write and merge-on-read" />, <W to="Small files problem" />, <W to="Iceberg File Format API" />
            </li>
            <li>Streaming: <W to="Stream processing" />, <W to="Streaming lakehouse" />, <W to="Watermark" />, <W to="Exactly-once semantics" /></li>
            <li>The <W to="Open Lakehouse Wiki:Glossary">glossary</W>: every term in one line</li>
          </ul>
        </Card>
        <Card title="Is it deprecated?" tone="navy">
          <p>
            Each article says up front whether its subject is active, experimental, in maintenance mode, deprecated or
            removed, with the version and a source.
          </p>
          <ul>
            <li><W to="GraphX" /> and <W to="GraphFrames" /></li>
            <li><W to="Spark Streaming (DStreams)" /></li>
            <li>
              <W to="Category:Deprecated">Everything deprecated</W> · <W to="Category:Deprecation proposed">Deprecation proposed</W> ·{" "}
              <W to="Category:Removed">Removed</W> · <W to="Category:Experimental">Experimental</W>
            </li>
          </ul>
        </Card>
      </div>

      <div className="wiki-grid">
        <Card title="How this wiki works" tone="navy">
          <ul>
            <li>Pages are neutral and vendor-neutral, and every checkable fact links to a primary source.</li>
            <li>Each article shows the date its facts were last verified.</li>
            <li>
              Every page is a Markdown file in <a href={WIKI_REPO}>the site's repository</a>. To change one, use its "Edit
              on GitHub" link and open a pull request. Read the <W to="Open Lakehouse Wiki:Style guide">style guide</W>{" "}
              first.
            </li>
            <li>Content is licensed <a href={WIKI_LICENSE.url}>{WIKI_LICENSE.name}</a>.</li>
          </ul>
        </Card>
        <Card title="Go deeper" tone="yellow">
          <ul>
            <li><Link to="/agentic-lakehouse">The agentic lakehouse guide</Link> on openlakehouse.io</li>
            <li><Link to="/agentic-data-engineering">Agentic data engineering</Link> on openlakehouse.io</li>
            <li><W to="Open Lakehouse Wiki:About">About the wiki</W></li>
          </ul>
        </Card>
      </div>

      <section className="wiki-index" aria-labelledby="all-articles">
        <h2 id="all-articles">All articles</h2>
        <ul className="wiki-columns">
          {articles.map((p) => (
            <li key={p.key}>
              <WikiAnchor href={p.path}>{p.displayTitle ?? p.title}</WikiAnchor>
            </li>
          ))}
        </ul>
        <h2 id="categories">Categories</h2>
        <ul className="wiki-columns">
          {categories.map(({ p, n }) => (
            <li key={p.key}>
              <WikiAnchor href={p.path}>{p.title}</WikiAnchor> <span className="text-muted-foreground">({n})</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  </WikiShell>
);
