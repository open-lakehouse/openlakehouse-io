// Bottom-of-page navigation for every wiki article (was Template:Navbox open lakehouse).
// Add new articles here when they are written. Each entry is [target title, link text].
export const NAVBOX_TITLE = "Open lakehouse";
export const NAVBOX: { group: string; links: [string, string][] }[] = [
  { group: "Concepts", links: [["Open lakehouse", "Open lakehouse"], ["Agentic lakehouse", "Agentic lakehouse"], ["Open table format", "Open table format"], ["Data catalog", "Data catalog"], ["Medallion architecture", "Medallion architecture"]] },
  { group: "Table formats", links: [["Apache Iceberg", "Apache Iceberg"], ["Delta Lake", "Delta Lake"], ["Apache Hudi", "Apache Hudi"], ["Apache Parquet", "Apache Parquet"]] },
  { group: "Catalogs", links: [["Unity Catalog", "Unity Catalog"], ["Apache Polaris", "Apache Polaris"], ["Iceberg REST catalog", "Iceberg REST catalog"], ["Hive Metastore", "Hive Metastore"], ["Project Nessie", "Project Nessie"]] },
  { group: "Engines", links: [["Apache Spark", "Apache Spark"], ["Spark Connect", "Spark Connect"], ["DuckDB", "DuckDB"], ["Trino", "Trino"], ["Apache Hive", "Apache Hive"]] },
  { group: "Pipelines and orchestration", links: [["Spark Declarative Pipelines", "Spark Declarative Pipelines"], ["Structured Streaming", "Structured Streaming"], ["Apache Airflow", "Apache Airflow"]] },
  { group: "Agents", links: [["Agentic lakehouse", "Agentic lakehouse"], ["Model Context Protocol", "Model Context Protocol"]] },
  { group: "How engines work", links: [["Executor", "Executor"], ["Shuffle", "Shuffle"], ["Partition", "Partition"], ["Predicate pushdown", "Predicate pushdown"]] },
  { group: "Data layout", links: [["Logical type", "Logical type"], ["Variant type", "Variant type"], ["Deletion vector", "Deletion vector"], ["Copy-on-write and merge-on-read", "Copy-on-write and merge-on-read"], ["Iceberg position delete", "Iceberg position delete"], ["Small files problem", "Small files problem"], ["Iceberg File Format API", "Iceberg File Format API"], ["INT96 timestamp", "INT96 timestamp"]] },
  { group: "Streaming", links: [["Stream processing", "Stream processing"], ["Streaming lakehouse", "Streaming lakehouse"], ["Watermark", "Watermark"], ["Exactly-once semantics", "Exactly-once semantics"], ["Trigger (Structured Streaming)", "Trigger"], ["TransformWithState", "transformWithState"], ["MapGroupsWithState and flatMapGroupsWithState", "mapGroupsWithState"]] },
  { group: "Spark APIs and legacy", links: [["RDD", "RDD"], ["MLlib", "MLlib"], ["Spark.mllib (RDD-based API)", "spark.mllib"], ["SparkR", "SparkR"], ["Project Tungsten", "Project Tungsten"], ["GraphFrames", "GraphFrames"], ["GraphX", "GraphX"], ["Spark Streaming (DStreams)", "Spark Streaming (DStreams)"], ["Hive on Spark", "Hive on Spark"], ["Apache Mesos support in Spark", "Mesos support"], ["Spark 3 to Spark 4 migration", "Spark 3 to Spark 4 migration"], ["Scala 2.12 and 2.13 in Spark", "Scala 2.12 and 2.13 in Spark"], ["Category:Deprecated", "All deprecated"]] },
  { group: "Storage and licensing", links: [["MinIO", "MinIO"], ["Business Source License", "Business Source License"]] },
  { group: "People", links: [["Category:People", "People"]] },
  { group: "Reference", links: [["Project:Glossary", "Glossary"], ["Category:Glossary terms", "All concept pages"]] },
];
