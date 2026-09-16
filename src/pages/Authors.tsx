import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { authors } from "@/content/content";

const authorList = Object.values(authors).sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
);

const Authors = () => (
  <div className="min-h-screen flex flex-col">
    <Seo
      title="Open Lakehouse Authors"
      description="Meet the maintainers, authors, and practitioners contributing to the Open Lakehouse community."
      path="/authors"
    />
    <SiteHeader />
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="container py-24 md:py-32 text-center max-w-4xl mx-auto animate-[fade-up_0.8s_ease-out]">
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">Authors</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            Meet the people
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">
            Maintainers, authors, and practitioners sharing their knowledge with the Open Lakehouse
            community.
          </p>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authorList.map((author) => (
            <li key={author.slug}>
              <Link
                to={`/authors/${author.slug}`}
                className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-glow"
              >
                {author.avatar && (
                  <img
                    src={author.avatar}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
                  />
                )}
                <div>
                  <h2 className="font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {author.name}
                  </h2>
                  {author.role && (
                    <p className="mt-1 text-sm text-muted-foreground">{author.role}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default Authors;
