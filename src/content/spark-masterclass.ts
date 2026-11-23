// Single source of truth for the /spark-masterclass project page.
// Plain data only (no JSX) so both the React page and the SEO/llms.txt
// generator can import it. PARTS mirrors the `nav` in the book's mkdocs.yml
// (https://github.com/open-lakehouse/spark-masterclass/blob/main/mkdocs.yml);
// update it from there when the book adds or renames chapters.

export const SLUG = "/spark-masterclass";
export const TITLE = "Spark Masterclass";
export const TAGLINE = "An open, runnable online book on Apache Spark 4.3";

export const BOOK_URL = "https://open-lakehouse.github.io/spark-masterclass/";
export const REPO_URL = "https://github.com/open-lakehouse/spark-masterclass";
export const SPARK_VERSION = "4.3";
export const PYSPARK_PIN = "pyspark==4.3.0";

export const META_DESCRIPTION =
  "Spark Masterclass is a free, open-source online book on Apache Spark 4.3: 92 chapters from execution fundamentals to SQL, Spark Connect, streaming, Declarative Pipelines and internals, each backed by runnable code and saved output.";

export const DESCRIPTION =
  "Spark Masterclass is an open, in-depth online book about Apache Spark 4.3. It follows Spark below the API: how a DataFrame becomes a plan, where Python code runs, what stateful streaming keeps, and how the same engine behaves on a laptop and in production. Every technical result in the book comes from a script in the repository and the output that script saved.";

// Self-contained definition block, front-loaded so answer engines can lift it whole.
export const DEFINITION =
  "Spark Masterclass is a free, Apache-2.0-licensed online book that teaches Apache Spark 4.3 by running it. It has 92 chapters in 14 parts, from how Spark runs your code through Spark SQL, Spark Connect, file formats, performance, Structured Streaming, lakehouse tables, Spark Declarative Pipelines, machine learning, production operations, extension APIs and engine internals. Each chapter has the exact code that ran, pinned to pyspark 4.3.0, and the real output saved next to it, including the query plans Spark printed and the metrics the Spark UI reported. The examples use one month of public New York City taxi trip data and run on a laptop.";

export type Chapter = { n: number; title: string; path: string };
export type BookPart = { numeral: string; title: string; chapters: Chapter[] };

export const chapterUrl = (c: Chapter) => `${BOOK_URL}${c.path}`;

export const PARTS: BookPart[] = [
  {
    numeral: "I",
    title: "Background",
    chapters: [
      { n: 1, title: "From MapReduce to Spark", path: "chapters/ch01-mapreduce-to-spark/" },
      { n: 2, title: "Inside a Spark application", path: "chapters/ch02-inside-a-spark-application/" },
      { n: 3, title: "From RDDs to a SQL engine", path: "chapters/ch03-rdds-to-a-sql-engine/" },
      { n: 4, title: "One engine for batch and streaming", path: "chapters/ch04-one-engine-batch-and-streaming/" },
    ],
  },
  {
    numeral: "II",
    title: "Getting started",
    chapters: [
      { n: 5, title: "How Spark runs your code", path: "chapters/ch05-how-spark-runs/" },
      { n: 6, title: "Installing Spark 4.3", path: "chapters/ch06-installing/" },
      { n: 7, title: "Quick start", path: "chapters/ch07-quick-start/" },
      { n: 8, title: "Setting Spark configurations", path: "chapters/ch08-setting-configurations/" },
    ],
  },
  {
    numeral: "III",
    title: "DataFrames and the other APIs",
    chapters: [
      { n: 9, title: "DataFrames, columns and schemas", path: "chapters/ch09-dataframes-columns-schemas/" },
      { n: 10, title: "Cleaning values", path: "chapters/ch10-cleaning-values/" },
      { n: 11, title: "Joins", path: "chapters/ch11-joins/" },
      { n: 12, title: "RDDs today", path: "chapters/ch12-rdds-today/" },
      { n: 13, title: "pandas API on Spark", path: "chapters/ch13-pandas-api-on-spark/" },
      { n: 14, title: "Datasets and Encoders in Scala", path: "chapters/ch14-datasets-encoders-scala/" },
    ],
  },
  {
    numeral: "IV",
    title: "Spark SQL",
    chapters: [
      { n: 15, title: "The language, the catalog and the tools", path: "chapters/ch15-spark-sql/" },
      { n: 16, title: "Tables, DDL and writes", path: "chapters/ch16-tables-ddl-writes/" },
      { n: 17, title: "Hive tables and the metastore", path: "chapters/ch17-hive-tables-metastore/" },
      { n: 18, title: "Spark SQL in depth", path: "chapters/ch18-spark-sql-in-depth/" },
      { n: 19, title: "Aggregation: GROUP BY, grouping sets, ROLLUP, CUBE and pivots", path: "chapters/ch19-aggregation/" },
      { n: 20, title: "Procedural SQL", path: "chapters/ch20-procedural-sql/" },
      { n: 21, title: "Time series", path: "chapters/ch21-time-series/" },
      { n: 22, title: "Geospatial data in Spark 4.3", path: "chapters/ch22-geospatial/" },
      { n: 23, title: "Metric views", path: "chapters/ch23-metric-views/" },
    ],
  },
  {
    numeral: "V",
    title: "Spark Connect",
    chapters: [
      { n: 24, title: "Why Spark Connect should be your default", path: "chapters/ch24-spark-connect/" },
      { n: 25, title: "Inside the Spark Connect protocol", path: "chapters/ch25-connect-protocol/" },
      { n: 26, title: "Session observability", path: "chapters/ch26-connect-observability/" },
      { n: 27, title: "Spark Connect clients beyond Python", path: "chapters/ch27-connect-clients/" },
      { n: 28, title: "Building an application on a Connect client", path: "chapters/ch28-connect-application/" },
      { n: 29, title: "Writing a Spark Connect client", path: "chapters/ch29-writing-a-connect-client/" },
      { n: 30, title: "Spark Connect in production", path: "chapters/ch30-connect-in-production/" },
    ],
  },
  {
    numeral: "VI",
    title: "Files, formats and data sources",
    chapters: [
      { n: 31, title: "Files as files, globs and metadata", path: "chapters/ch31-files-as-files/" },
      { n: 32, title: "Text, logs and CSV", path: "chapters/ch32-text-logs-csv/" },
      { n: 33, title: "JSON: inference, drift and quarantine", path: "chapters/ch33-json/" },
      { n: 34, title: "Structs, arrays, maps and higher-order functions", path: "chapters/ch34-complex-types/" },
      { n: 35, title: "VARIANT: landing, profiling and editing", path: "chapters/ch35-variant/" },
      { n: 36, title: "XML, Avro and Protobuf", path: "chapters/ch36-xml-avro-protobuf/" },
      { n: 37, title: "Documents, images, audio and tables for blobs", path: "chapters/ch37-documents-images-audio/" },
      { n: 38, title: "Spark on object storage", path: "chapters/ch38-object-storage/" },
      { n: 39, title: "Databases over JDBC", path: "chapters/ch39-jdbc/" },
    ],
  },
  {
    numeral: "VII",
    title: "Performance",
    chapters: [
      { n: 40, title: "Reading query plans", path: "chapters/ch40-query-plans/" },
      { n: 41, title: "Statistics, the cost-based optimizer and partition pruning", path: "chapters/ch41-statistics-cbo-pruning/" },
      { n: 42, title: "Partitions, caching, memory and spill", path: "chapters/ch42-partitions-caching-memory/" },
      { n: 43, title: "Python on Spark", path: "chapters/ch43-python-udfs-arrow/" },
      { n: 44, title: "Python UDTFs", path: "chapters/ch44-python-udtfs/" },
      { n: 45, title: "Parquet and ORC from the inside", path: "chapters/ch45-parquet-inside/" },
      { n: 46, title: "Project Feather", path: "chapters/ch46-project-feather/" },
      { n: 47, title: "Acceleration", path: "chapters/ch47-acceleration/" },
    ],
  },
  {
    numeral: "VIII",
    title: "Streaming",
    chapters: [
      { n: 48, title: "Structured Streaming fundamentals", path: "chapters/ch48-structured-streaming/" },
      { n: 49, title: "Streaming messy data", path: "chapters/ch49-streaming-messy-data/" },
      { n: 50, title: "Stateful processing with transformWithState", path: "chapters/ch50-transform-with-state/" },
      { n: 51, title: "Real-time Mode", path: "chapters/ch51-real-time-mode/" },
      { n: 52, title: "Inside a checkpoint and the state store", path: "chapters/ch52-checkpoints-and-state-store/" },
      { n: 53, title: "Kafka with Spark in depth", path: "chapters/ch53-kafka-in-depth/" },
    ],
  },
  {
    numeral: "IX",
    title: "Lakehouse tables",
    chapters: [
      { n: 54, title: "Tables: Delta and Iceberg, MERGE and time travel", path: "chapters/ch54-tables-delta-iceberg/" },
      { n: 55, title: "Apache Iceberg with Spark", path: "chapters/ch55-iceberg/" },
    ],
  },
  {
    numeral: "X",
    title: "Declarative Pipelines",
    chapters: [
      { n: 56, title: "Your first ETL pipeline", path: "chapters/ch56-first-etl-pipeline/" },
      { n: 57, title: "The spark-pipelines CLI and the project", path: "chapters/ch57-pipelines-cli-project/" },
      { n: 58, title: "Configuring a pipeline", path: "chapters/ch58-configuring-pipelines/" },
      { n: 59, title: "Declarative Pipelines", path: "chapters/ch59-declarative-pipelines/" },
      { n: 60, title: "Medallion in practice", path: "chapters/ch60-medallion/" },
      { n: 61, title: "Change data capture", path: "chapters/ch61-change-data-capture/" },
      { n: 62, title: "A pipeline end to end, and how SDP runs it", path: "chapters/ch62-pipeline-end-to-end/" },
    ],
  },
  {
    numeral: "XI",
    title: "Machine learning and applied algorithms",
    chapters: [
      { n: 63, title: "ML pipelines with MLlib, tracked in MLflow", path: "chapters/ch63-mllib-mlflow/" },
      { n: 64, title: "MLlib beyond regression", path: "chapters/ch64-mllib-beyond-regression/" },
      { n: 65, title: "Text analytics without an LLM", path: "chapters/ch65-text-analytics/" },
      { n: 66, title: "Similarity search", path: "chapters/ch66-similarity-search/" },
      { n: 67, title: "Entity resolution and connected components", path: "chapters/ch67-entity-resolution/" },
      { n: 68, title: "Sketches: HLL, Theta and KLL", path: "chapters/ch68-sketches/" },
      { n: 69, title: "Calling models and services from Spark", path: "chapters/ch69-calling-models/" },
    ],
  },
  {
    numeral: "XII",
    title: "Running Spark in production",
    chapters: [
      { n: 70, title: "Submitting applications", path: "chapters/ch70-submitting-applications/" },
      { n: 71, title: "Securing Spark", path: "chapters/ch71-securing-spark/" },
      { n: 72, title: "Determinism, retries and fault injection", path: "chapters/ch72-determinism-retries/" },
      { n: 73, title: "Shipping Python dependencies", path: "chapters/ch73-shipping-dependencies/" },
      { n: 74, title: "Observability", path: "chapters/ch74-observability/" },
      { n: 75, title: "Testing and debugging PySpark", path: "chapters/ch75-testing-debugging-pyspark/" },
      { n: 76, title: "Spark on Kubernetes with the Spark Kubernetes Operator", path: "chapters/ch76-kubernetes-operator/" },
      { n: 77, title: "Orchestrating Spark", path: "chapters/ch77-orchestration/" },
      { n: 78, title: "Writing Spark pipelines with agents", path: "chapters/ch78-pipelines-with-agents/" },
    ],
  },
  {
    numeral: "XIII",
    title: "Extending Spark",
    chapters: [
      { n: 79, title: "Python data sources I", path: "chapters/ch79-python-data-sources-readers/" },
      { n: 80, title: "Python data sources II", path: "chapters/ch80-python-data-sources-apis-databases/" },
      { n: 81, title: "Python data sources III", path: "chapters/ch81-python-data-sources-pushdown/" },
      { n: 82, title: "Python data sources IV", path: "chapters/ch82-python-data-sources-writers-streaming/" },
      { n: 83, title: "Shipping a source", path: "chapters/ch83-shipping-a-python-data-source/" },
      { n: 84, title: "A DSv2 connector in Java", path: "chapters/ch84-dsv2-connector-java/" },
      { n: 85, title: "Catalyst extensions", path: "chapters/ch85-catalyst-extensions/" },
      { n: 86, title: "Spark Connect plugins", path: "chapters/ch86-connect-plugins/" },
      { n: 87, title: "Capstone: your own connector", path: "chapters/ch87-capstone-connector/" },
    ],
  },
  {
    numeral: "XIV",
    title: "Internals",
    chapters: [
      { n: 88, title: "How Catalyst plans Python", path: "chapters/ch88-catalyst-plans-python/" },
      { n: 89, title: "The Python worker protocol", path: "chapters/ch89-python-worker-protocol/" },
      { n: 90, title: "The VARIANT binary format", path: "chapters/ch90-variant-binary-format/" },
      { n: 91, title: "From wrong results to a fix", path: "chapters/ch91-upstream-case-study/" },
      { n: 92, title: "Building Spark from source", path: "chapters/ch92-building-spark/" },
    ],
  },
];

export const CHAPTER_COUNT = PARTS.reduce((n, p) => n + p.chapters.length, 0);

// What every chapter contains (from the book's home page).
export const CHAPTER_CONTENTS: { title: string; body: string }[] = [
  {
    title: "The exact code that ran",
    body: "A script under code/ in the repository, pinned to pyspark==4.3.0, that produces every result the chapter states.",
  },
  {
    title: "Its real output",
    body: "Saved next to the script: the query plans Spark printed and the numbers the Spark UI reported.",
  },
  {
    title: "Diagrams of the mechanism",
    body: "Where the data goes, which operator runs, and what the engine keeps.",
  },
  {
    title: "Figures and animations from saved output",
    body: "So that a shuffle, a plan or a commit is visible, not only described.",
  },
];

export const REQUIREMENTS = [
  "Python 3.11 or later",
  "Java 17, 21 or 25",
  "uv, for the chapter environment",
  "A POSIX shell for the data and utility scripts",
];

export const QUICKSTART = [
  `git clone ${REPO_URL} && cd spark-masterclass`,
  "./code/common/get_data.sh   # one month of NYC taxi trips",
  "cd code && uv sync          # creates the environment with pyspark 4.3.0",
  "uv run python ch07/quickstart.py",
].join("\n");

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Spark Masterclass?",
    a: "Spark Masterclass is a free, open-source online book about Apache Spark 4.3. It explains how Spark plans and runs work, from DataFrames and SQL to Spark Connect, Structured Streaming, Spark Declarative Pipelines and engine internals, and it backs every technical result with runnable code and saved output.",
  },
  {
    q: "Which version of Apache Spark does Spark Masterclass cover?",
    a: "Apache Spark 4.3. The example environment pins pyspark==4.3.0, so the plans and output in the book come from that release.",
  },
  {
    q: "What does Spark Masterclass cover?",
    a: "92 chapters in 14 parts: Background, Getting started, DataFrames and the other APIs, Spark SQL, Spark Connect, Files, formats and data sources, Performance, Streaming, Lakehouse tables, Declarative Pipelines, Machine learning and applied algorithms, Running Spark in production, Extending Spark, and Internals.",
  },
  {
    q: "How are the examples in Spark Masterclass verified?",
    a: "Each technical claim is tied to a script in the repository's code/ directory and to the output that script saved, including printed query plans and Spark UI metrics. A reader can run the same script and compare the result.",
  },
  {
    q: "Do I need a cluster or a managed platform to follow Spark Masterclass?",
    a: "No. The examples are designed to run on a laptop with Python 3.11 or later, Java 17, 21 or 25, and uv. Some chapters need more, such as Docker for catalogs, Kafka or Kubernetes with kind, extra Maven packages, or an NVIDIA GPU; each chapter states its requirements at the start.",
  },
  {
    q: "Is Spark Masterclass free?",
    a: "Yes. The book is free to read online and its text and code are licensed under the Apache License 2.0, the same license as Apache Spark. Corrections are accepted as GitHub issues or pull requests.",
  },
];
