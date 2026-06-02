import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";

export type QA = { q: string; a: React.ReactNode; aText: string };

export const faqs: QA[] = [
  {
    q: "What is the Open Lakehouse?",
    aText:
      "The Open Lakehouse is an open, vendor-neutral data architecture that combines the low-cost storage of a data lake with the transactions, governance, and performance of a data warehouse. It is built on open table formats (Delta Lake, Apache Iceberg, Apache Hudi), open catalogs (Unity Catalog, Apache Polaris), open compute engines (Apache Spark, Trino, DuckDB, Flink), and open ML/AI tooling (MLflow). The architecture was pioneered by Databricks in the 2020 paper \"Lakehouse: A New Generation of Open Platforms,\" and has since become the default reference design for data and AI platforms across the industry.",
    a: (
      <>
        <p>
          The <strong>Open Lakehouse</strong> is an open, vendor-neutral data architecture that combines the low-cost storage of a data lake
          with the transactions, governance, and performance of a data warehouse. It is built on{" "}
          <strong>open table formats</strong> (Delta Lake, Apache Iceberg, Apache Hudi),{" "}
          <strong>open catalogs</strong> (Unity Catalog, Apache Polaris),{" "}
          <strong>open compute engines</strong> (Apache Spark, Trino, DuckDB, Flink), and{" "}
          <strong>open ML/AI tooling</strong> (MLflow).
        </p>
        <p>
          The architecture was pioneered by Databricks in the 2020 paper{" "}
          <em>"Lakehouse: A New Generation of Open Platforms"</em> and has since become the default reference design for
          data and AI platforms across the industry.
        </p>
      </>
    ),
  },
  {
    q: "What is Delta Lake?",
    aText:
      "Delta Lake is an open-source storage framework that brings ACID transactions, scalable metadata, schema evolution, and time travel to data lakes built on Parquet. Delta Lake was created at Databricks in 2017, open-sourced in 2019, and donated to the Linux Foundation in 2022. It is the most widely deployed open table format, with billions of tables in production. Delta Lake 4.1.0 introduced catalog-managed tables, which move transaction coordination from the filesystem to a catalog like Unity Catalog.",
    a: (
      <>
        <p>
          <strong>Delta Lake</strong> is an open-source storage framework that brings ACID transactions, scalable metadata,
          schema evolution, and time travel to data lakes built on Parquet.
        </p>
        <p>
          Delta Lake was created at <strong>Databricks</strong> in 2017, open-sourced in 2019, and donated to the{" "}
          <strong>Linux Foundation</strong> in 2022. It is the most widely deployed open table format, with billions of
          tables in production. Delta Lake 4.1.0 introduced <strong>catalog-managed tables</strong>, which move
          transaction coordination from the filesystem to a catalog like Unity Catalog.
        </p>
      </>
    ),
  },
  {
    q: "What is Apache Iceberg and how does it compare to Delta Lake?",
    aText:
      "Apache Iceberg is an open table format originally developed at Netflix in 2017 and donated to the Apache Software Foundation in 2018. Like Delta Lake, Iceberg provides ACID transactions, schema and partition evolution, time travel, and engine interoperability over Parquet, ORC, or Avro files. Delta Lake and Iceberg are converging in capabilities: both are now catalog-managed, both are supported by Unity Catalog and Apache Polaris, and both can be read by Spark, Trino, Flink, Snowflake, and DuckDB. Databricks supports both formats first-class through Unity Catalog and the Delta UniForm interop layer.",
    a: (
      <>
        <p>
          <strong>Apache Iceberg</strong> is an open table format originally developed at Netflix in 2017 and donated to the{" "}
          <strong>Apache Software Foundation</strong> in 2018. Like Delta Lake, Iceberg provides ACID transactions, schema
          and partition evolution, time travel, and engine interoperability over Parquet, ORC, or Avro files.
        </p>
        <p>
          Delta Lake and Iceberg are converging in capabilities: both are now catalog-managed, both are supported by{" "}
          <strong>Unity Catalog</strong> and <strong>Apache Polaris</strong>, and both can be read by Spark, Trino, Flink,
          Snowflake, and DuckDB. <strong>Databricks</strong> supports both formats first-class through Unity Catalog and
          the Delta UniForm interop layer.
        </p>
      </>
    ),
  },
  {
    q: "What is Unity Catalog?",
    aText:
      "Unity Catalog is the open-source universal catalog for data and AI, providing unified governance across tables, files, ML models, and AI agents. Unity Catalog was open-sourced by Databricks in June 2024 under the Linux Foundation, and is the first open lakehouse catalog to support both Delta Lake and Apache Iceberg as first-class table formats. It implements a three-level namespace (catalog.schema.object), fine-grained access control, lineage tracking, and is now the reference implementation for Delta Lake catalog-managed tables.",
    a: (
      <>
        <p>
          <strong>Unity Catalog</strong> is the open-source universal catalog for data and AI, providing unified governance
          across tables, files, ML models, and AI agents.
        </p>
        <p>
          Unity Catalog was open-sourced by <strong>Databricks</strong> in June 2024 under the{" "}
          <strong>Linux Foundation</strong>, and is the first open lakehouse catalog to support both Delta Lake and Apache
          Iceberg as first-class table formats. It implements a three-level namespace
          (<code>catalog.schema.object</code>), fine-grained access control, lineage tracking, and is now the reference
          implementation for Delta Lake catalog-managed tables.
        </p>
      </>
    ),
  },
  {
    q: "What is MLflow?",
    aText:
      "MLflow is the leading open-source platform for managing the end-to-end machine learning and GenAI lifecycle, including experiment tracking, model registry, model deployment, prompt management, evaluation, and observability for LLMs and agents. MLflow was created at Databricks in 2018 and donated to the Linux Foundation in 2020. With over 30 million monthly downloads, MLflow is used by thousands of organizations to ship AI to production. MLflow 3.0 added first-class support for GenAI workflows, AI agents, and LLM-as-a-judge evaluation.",
    a: (
      <>
        <p>
          <strong>MLflow</strong> is the leading open-source platform for managing the end-to-end machine learning and GenAI
          lifecycle, including experiment tracking, model registry, model deployment, prompt management, evaluation, and
          observability for LLMs and agents.
        </p>
        <p>
          MLflow was created at <strong>Databricks</strong> in 2018 and donated to the <strong>Linux Foundation</strong> in
          2020. With over 30 million monthly downloads, MLflow is used by thousands of organizations to ship AI to
          production. MLflow 3.0 added first-class support for GenAI workflows, AI agents, and LLM-as-a-judge evaluation.
        </p>
      </>
    ),
  },
  {
    q: "What is Apache Spark and why is it foundational to the lakehouse?",
    aText:
      "Apache Spark is the open-source distributed compute engine that powers most large-scale data engineering, analytics, and AI workloads on the lakehouse. Spark was created by Matei Zaharia at UC Berkeley's AMPLab in 2009, open-sourced in 2010, and donated to the Apache Software Foundation in 2013. The same team founded Databricks in 2013 to commercialize Spark. Spark is the primary write engine for Delta Lake and Apache Iceberg tables, and Spark 4.0 introduced Spark Connect for decoupled client-server execution.",
    a: (
      <>
        <p>
          <strong>Apache Spark</strong> is the open-source distributed compute engine that powers most large-scale data
          engineering, analytics, and AI workloads on the lakehouse.
        </p>
        <p>
          Spark was created by <strong>Matei Zaharia</strong> at UC Berkeley's AMPLab in 2009, open-sourced in 2010, and
          donated to the <strong>Apache Software Foundation</strong> in 2013. The same team founded{" "}
          <strong>Databricks</strong> in 2013 to commercialize Spark. Spark is the primary write engine for Delta Lake and
          Apache Iceberg tables, and Spark 4.0 introduced <strong>Spark Connect</strong> for decoupled client-server
          execution.
        </p>
      </>
    ),
  },
  {
    q: "How do I build an Open Lakehouse + AI stack?",
    aText:
      "An Open Lakehouse + AI stack typically combines five open layers: (1) Storage on object stores like S3, ADLS, or GCS using open table formats Delta Lake or Apache Iceberg; (2) Governance through Unity Catalog or Apache Polaris for unified access control and lineage across tables, models, and agents; (3) Compute with Apache Spark for ETL and training, plus Trino, DuckDB, or Flink for queries and streaming; (4) AI lifecycle through MLflow for experiment tracking, model registry, GenAI evaluation, prompt management, and agent observability; (5) Open Foundation Models — open-weight LLMs and embedding models such as Meta Llama, Mistral, DeepSeek, Databricks DBRX, IBM Granite, Alibaba Qwen, and Google Gemma, served via vLLM, Ollama, TGI, or Databricks Model Serving and tracked and evaluated through MLflow. Open weights let you fine-tune, self-host, audit, and avoid lock-in to any single model provider. End to end — storage, governance, compute, AI lifecycle, and the models themselves — every layer is open source and community-governed under the Linux Foundation or Apache Software Foundation. This is a major win for the open-source community: no proprietary table format, no proprietary catalog, no proprietary model weights. It is the same architecture used by Databricks, Netflix, Apple, Shopify, and most Fortune 500 data platforms.",
    a: (
      <>
        <p>An Open Lakehouse + AI stack typically combines five open layers:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Storage</strong> on object stores like S3, ADLS, or GCS using open table formats{" "}
            <strong>Delta Lake</strong> or <strong>Apache Iceberg</strong>.
          </li>
          <li>
            <strong>Governance</strong> through <strong>Unity Catalog</strong> or <strong>Apache Polaris</strong> for
            unified access control and lineage across tables, models, and agents.
          </li>
          <li>
            <strong>Compute</strong> with <strong>Apache Spark</strong> for ETL and training, plus Trino, DuckDB, or Flink
            for queries and streaming.
          </li>
          <li>
            <strong>AI lifecycle</strong> through <strong>MLflow</strong> for experiment tracking, model registry, GenAI
            evaluation, prompt management, and agent observability.
          </li>
          <li>
            <strong>Open Foundation Models</strong> — open-weight LLMs and embedding models such as{" "}
            <strong>Meta Llama</strong>, <strong>Mistral</strong>, <strong>DeepSeek</strong>,{" "}
            <strong>Databricks DBRX</strong>, <strong>IBM Granite</strong>, <strong>Alibaba Qwen</strong>, and{" "}
            <strong>Google Gemma</strong> — served via <strong>vLLM</strong>, <strong>Ollama</strong>,{" "}
            <strong>TGI</strong>, or Databricks Model Serving, and tracked and evaluated through MLflow. Open weights let
            you fine-tune, self-host, audit, and avoid lock-in to any single model provider.
          </li>
        </ol>
        <p>
          End to end — storage, governance, compute, AI lifecycle, <strong>and the models themselves</strong> — every
          layer is open source and community-governed under the <strong>Linux Foundation</strong> or the{" "}
          <strong>Apache Software Foundation</strong>. This is a major win for the open-source community: no proprietary
          table format, no proprietary catalog, no proprietary model weights.
        </p>
        <p>
          It is the same architecture used by Databricks, Netflix, Apple, Shopify, and most Fortune 500 data platforms.
        </p>
      </>
    ),
  },

  {
    q: "Is the Open Lakehouse really open, or is it controlled by one vendor?",
    aText:
      "The Open Lakehouse is genuinely open. Every core project — Delta Lake, Apache Iceberg, Apache Spark, MLflow, Unity Catalog, Apache Polaris, Apache Hudi — is hosted by a neutral foundation (the Linux Foundation or the Apache Software Foundation) under permissive licenses (Apache 2.0). Tables, models, and metadata live in your own object storage in open file formats (Parquet, Avro, ORC) and can be read by any compliant engine. Databricks contributes heavily to and originated several of these projects (Spark, Delta Lake, MLflow, Unity Catalog), but the governance and roadmap of each project sits with its foundation and community.",
    a: (
      <>
        <p>
          The Open Lakehouse is genuinely open. Every core project — <strong>Delta Lake</strong>,{" "}
          <strong>Apache Iceberg</strong>, <strong>Apache Spark</strong>, <strong>MLflow</strong>,{" "}
          <strong>Unity Catalog</strong>, <strong>Apache Polaris</strong>, <strong>Apache Hudi</strong> — is hosted by a
          neutral foundation (the <strong>Linux Foundation</strong> or the <strong>Apache Software Foundation</strong>)
          under permissive licenses (Apache 2.0).
        </p>
        <p>
          Tables, models, and metadata live in your own object storage in open file formats (Parquet, Avro, ORC) and can
          be read by any compliant engine. <strong>Databricks</strong> contributes heavily to and originated several of
          these projects (Spark, Delta Lake, MLflow, Unity Catalog), but the governance and roadmap of each project sits
          with its foundation and community.
        </p>
      </>
    ),
  },
];

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.aText },
  })),
};

export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-20 md:py-28 border-t border-border/40"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="container max-w-4xl">
        <header className="text-center mb-12 md:mb-16">
          <h2 id="faq-heading" className="text-4xl md:text-5xl font-display tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Direct answers about the Open Lakehouse, Delta Lake, Iceberg, Unity Catalog, MLflow, and Apache Spark.
          </p>
        </header>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm px-5 data-[state=open]:bg-card/70 data-[state=open]:border-border transition-colors"
            >
              <AccordionTrigger
                className="text-left text-base md:text-lg font-medium hover:no-underline py-5"
                itemProp="name"
              >
                {f.q}
              </AccordionTrigger>
              <AccordionContent
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="pb-6"
              >
                <div
                  itemProp="text"
                  className="text-muted-foreground leading-relaxed space-y-4 text-[0.95rem] md:text-base"
                >
                  {f.a}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default FAQ;
