import { useState } from "react";
import { Github, Linkedin, Twitter, Youtube, MessageCircle, ExternalLink, Calendar } from "lucide-react";
import logoUrl from "@/assets/bundled/olai-logo-white.png";
import databricksLogo from "@/assets/logos/databricks.svg";

const projects = [
  { name: "Delta Lake", url: "https://delta.io" },
  { name: "Apache Spark", url: "https://spark.apache.org" },
  { name: "Apache Iceberg", url: "https://iceberg.apache.org" },
  { name: "Apache DataFusion", url: "https://datafusion.apache.org" },
  { name: "MLflow", url: "https://mlflow.org" },
  { name: "Unity Catalog", url: "https://unitycatalog.io" },
  { name: "Apache Polaris", url: "https://polaris.apache.org" },
  { name: "OpenLineage", url: "https://openlineage.io" },
];

const learn = [
  { name: "Delta Lake Blog", url: "https://delta.io/blog" },
  { name: "Iceberg Blog", url: "https://iceberg.apache.org/blog" },
  { name: "Databricks Blog", url: "https://www.databricks.com/blog" },
  
  { name: "DataFusion Tutorials", url: "https://datafusion.apache.org/user-guide" },
  { name: "Open Lakehouse Tutorials", url: "/learn/getting-started/" },
];

const asfProjects = [
  { name: "Apache Spark", url: "https://spark.apache.org/" },
  { name: "Apache Iceberg", url: "https://iceberg.apache.org/" },
  { name: "Apache Polaris", url: "https://polaris.apache.org/" },
  { name: "Apache Flink", url: "https://flink.apache.org/" },
  { name: "Apache DataFusion", url: "https://datafusion.apache.org/" },
];

const lfaiProjects = [
  { name: "Unity Catalog", url: "https://lfaidata.foundation/projects/unity-catalog/" },
  { name: "Delta Lake", url: "https://lfaidata.foundation/projects/delta-lake/" },
  { name: "MLflow", url: "https://insights.linuxfoundation.org/project/MLF" },
];

const socials: Record<string, { name: string; url: string }[]> = {
  X: [
    { name: "@DeltaLakeOSS", url: "https://x.com/DeltaLakeOSS" },
    { name: "@ApacheIceberg", url: "https://x.com/apacheiceberg" },
    { name: "@ApacheSpark", url: "https://x.com/ApacheSpark" },
    { name: "@MLflow", url: "https://x.com/MLflow" },
  ],
  LinkedIn: [
    { name: "Delta Lake", url: "https://www.linkedin.com/company/delta-lake/" },
    { name: "Apache Iceberg", url: "https://www.linkedin.com/company/apache-iceberg/" },
  ],
  Reddit: [
    { name: "r/dataengineering", url: "https://reddit.com/r/dataengineering" },
    { name: "r/apachespark", url: "https://reddit.com/r/apachespark" },
    { name: "r/apacheflink", url: "https://www.reddit.com/r/apacheflink/" },
    { name: "r/ApacheIceberg", url: "https://www.reddit.com/r/ApacheIceberg/" },
    { name: "r/mlflow", url: "https://www.reddit.com/r/mlflow/" },
    { name: "r/open_lakehouse", url: "https://www.reddit.com/r/open_lakehouse/" },
    { name: "r/DeltaLake", url: "https://www.reddit.com/r/DeltaLake/" },
  ],
  YouTube: [
    { name: "Delta Lake", url: "https://www.youtube.com/@DeltaLake" },
    { name: "Open Lakehouse + AI", url: "https://www.youtube.com/@OpenLakehouseAI" },
    { name: "Apache Iceberg", url: "https://www.youtube.com/@ApacheIceberg" },
    { name: "Apache Spark", url: "https://www.youtube.com/@ApacheSparkOss" },
  ],
};

const socialIcons: Record<string, any> = { X: Twitter, LinkedIn: Linkedin, Reddit: MessageCircle, YouTube: Youtube };

const LinkList = ({ items }: { items: { name: string; url: string }[] }) => (
  <ul className="space-y-2.5">
    {items.map((l) => (
      <li key={l.name}>
        <a href={l.url} target="_blank" rel="noopener noreferrer"
           className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          {l.name}
          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </li>
    ))}
  </ul>
);

export const SiteFooter = () => {
  const [openSocial, setOpenSocial] = useState<string | null>(null);

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-secondary/40">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">Projects</h4>
            <LinkList items={projects} />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">Learn</h4>
            <LinkList items={learn} />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">Social</h4>
            <ul className="space-y-2">
              {Object.keys(socials).map((key) => {
                const Icon = socialIcons[key];
                const open = openSocial === key;
                return (
                  <li key={key} className="relative"
                      onMouseEnter={() => setOpenSocial(key)}
                      onMouseLeave={() => setOpenSocial((c) => (c === key ? null : c))}>
                    <button className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                      <Icon className="h-4 w-4" />
                      {key}
                    </button>
                    {open && (
                      <div className="absolute left-0 md:left-32 top-0 z-20 min-w-[220px] rounded-xl border border-border bg-popover shadow-glow p-2 animate-[fade-up_0.2s_ease-out]">
                        {socials[key].map((s) => (
                          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                             className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors">
                            <span>{s.name}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
              <li>
                <a
                  href="https://luma.com/openlakehouseai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <Calendar className="h-4 w-4" />
                  Luma
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">Apache Software Foundation</h4>
            <LinkList items={asfProjects} />
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Apache®, the Apache feather logo, and project names are trademarks of the Apache Software Foundation.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">LF AI &amp; Data</h4>
            <LinkList items={lfaiProjects} />
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Hosted by the LF AI &amp; Data Foundation, a project of The Linux Foundation.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Open Lakehouse Guide Hub — open data and AI architecture on Delta Lake, Apache Iceberg, Unity Catalog, MLflow, and Apache Spark" className="h-7 w-auto invert dark:invert-0" />
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} openlakehouse.io · Open by design.</span>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <p className="text-xs text-muted-foreground">Vendor-neutral · Open standards · Community-driven</p>
            <a
              href="https://en.wikipedia.org/wiki/Databricks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Sponsored by</span>
              <img src={databricksLogo} alt="Databricks" className="h-5 w-auto invert dark:invert-0" />
              <span className="font-semibold text-foreground/80">Databricks</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
