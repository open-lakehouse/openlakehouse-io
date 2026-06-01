import { useState } from "react";
import { Github, Linkedin, Twitter, Youtube, MessageCircle, ExternalLink, Calendar } from "lucide-react";
import logoAsset from "@/assets/olai-logo-white.png.asset.json";

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
  { name: "Tabular Substack", url: "https://tabular.substack.com" },
  { name: "DataFusion Tutorials", url: "https://datafusion.apache.org/user-guide" },
  { name: "Open Lakehouse Tutorials", url: "https://openlakehouse.io" },
];

const socials: Record<string, { name: string; url: string }[]> = {
  X: [
    { name: "@deltalakeio", url: "https://x.com/deltalakeio" },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
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
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Open Lakehouse + AI" className="h-7 w-auto invert dark:invert-0" />
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} openlakehouse.io · Open by design.</span>
          </div>
          <p className="text-xs text-muted-foreground">Vendor-neutral · Open standards · Community-driven</p>
        </div>
      </div>
    </footer>
  );
};
