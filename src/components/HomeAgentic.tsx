import { Link } from "react-router-dom";
import { ArrowRight, Bot, ShieldCheck, Workflow } from "lucide-react";

/** Homepage: the agentic lakehouse and agentic data engineering, linked up front. */
export const HomeAgentic = () => (
  <section id="agentic-lakehouse" aria-labelledby="home-agentic-heading" className="container py-20 md:py-24">
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-primary">The agentic lakehouse</p>
        <h2 id="home-agentic-heading" className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          A lakehouse AI agents can work in, safely.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          An agentic lakehouse gives AI agents open tables, a catalog that tells them what exists and what they may touch,
          tools over the Model Context Protocol, and declarative pipelines the platform checks before anything runs.
          Agentic data engineering is the practice built on it: agents write and run pipelines, and policies, sandboxes
          and dry runs decide what they are allowed to do.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/agentic-lakehouse" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">
            What is an agentic lakehouse? <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/agentic-data-engineering" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-semibold hover:border-primary">
            Agentic data engineering
          </Link>
        </div>
      </div>
      <ul className="grid gap-4">
        {[
          { icon: Workflow, title: "Declare", text: "Agents write Spark Declarative Pipelines; a dry run against the real catalog must pass before anything runs.", to: "/agentic-data-engineering#what-changes" },
          { icon: ShieldCheck, title: "Scope and policy", text: "Agents write only to their own namespace, and every tool call is allowed, denied or sent to a person.", to: "/agentic-lakehouse#guardrails" },
          { icon: Bot, title: "Sandboxed Spark for every agent", text: "Omnigent and MLflow over a sandboxed Spark Connect session per agent, on Iceberg and a catalog that authorizes every request.", to: "/reference-architectures/agentic-lakehouse" },
        ].map((c) => (
          <li key={c.title}>
            <Link to={c.to} className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary">
              <c.icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <span>
                <span className="font-semibold group-hover:text-primary">{c.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{c.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
