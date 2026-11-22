# Real-time streaming with Spark Real-Time Mode: Kafka in, Kafka out, milliseconds in between

> Continuous processing for fraud, recommendations and live boards, measured end to end.

Real-time streaming is the architecture for decisions that must happen while an event is still in flight: score a payment, update a recommendation, move a leaderboard. In open source Apache Spark, Real-Time Mode is a Structured Streaming trigger that processes records continuously instead of in micro-batches. The reference pipelines read from Kafka, transform or keep state with transformWithState, and write back to Kafka or a key-value store, with latency measured from producer timestamp to consumer.

## When to use it
- Your SLA is in tens or hundreds of milliseconds, not seconds.
- You are porting Apache Flink jobs and want to know which ones move to Spark.
- You already run Spark for batch and want one engine for both.

## When not to
- Writing large analytical tables: use the streaming medallion pattern and keep this path thin.
- Python UDFs in the hot path: Real-Time Mode does not support them.

## Components

| Layer | Component | Role | Version |
|---|---|---|---|
| Sources | Payments, clicks, game events | Producers with event timestamps |  |
| Ingestion and streaming | Apache Kafka | Input topic, 16 partitions in the reference runs | Confluent 7.6.0 image |
| Compute engines | Spark Real-Time Mode | Continuous processing trigger | Spark 4.1 to 4.3 |
| Compute engines | Apache Spark | transformWithState for keyed state, on RocksDB | 4.3.0 |
| Compute engines | Apache Flink | The engine being compared or migrated from |  |
| Serving | Kafka sink topic | Output and latency topics |  |
| Serving | Redis | Latest state for applications |  |
| Open table format | Delta Lake | Optional history table written by a separate query |  |
| Consumers | Fraud engine, app UI, live board | Read results within milliseconds |  |

## How data flows
1. **Produce with timestamps.** A generator writes keyed events to Kafka with the send time embedded.
2. **Process continuously.** A Structured Streaming query with the real-time trigger processes each record as it arrives instead of waiting for a micro-batch.
3. **Keep state.** Stateful steps such as deduplication, windows or a custom transformWithState processor keep per-key state in RocksDB.
4. **Emit.** Results go to an output Kafka topic or a key-value store.
5. **Measure.** A consumer subtracts the embedded send time from arrival time and reports p50, p95 and p99.

## Run it

### [lisancao/spark-rtm-quickstart](https://github.com/lisancao/spark-rtm-quickstart)

Five Real-Time Mode pipelines on Spark 4.1 with Kafka and a latency consumer, compared against micro-batch.

```bash
# Start Kafka + Spark
docker compose up -d

# Create Kafka topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
    --create --topic rtm-input --partitions 16 --if-not-exists
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
    --create --topic rtm-output --partitions 16 --if-not-exists
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
    --create --topic rtm-latency --partitions 16 --if-not-exists

# Start the data generator (in a separate terminal)
python data_generator/producer.py --rate 1000 --keys 100

# Run a pipeline
docker exec spark spark-submit /opt/spark-data/pipelines/01_stateless_passthrough.py
```

### [lisancao/spark-demos](https://github.com/lisancao/spark-demos)

Demo 14 (bookshop recommender, Spark 4.3.0) and demo 10 (chained transformWithState lobby board) compare micro-batch with Real-Time Mode and commit the numbers in NOTES.md.

### [lisancao/flink-to-spark-rtm](https://github.com/lisancao/flink-to-spark-rtm)

Four streaming patterns (stateless, tumbling window, sliding window, keyed state) written for both Flink 1.20 and Spark 4.1 Real-Time Mode, with migration notes.

## Caveats
- Open source Spark 4.1 Real-Time Mode is stateless only; stateful queries need a later release (the stateful demos run on Spark 4.3).
- Python UDFs are not supported in Real-Time Mode.
- PySpark 4.1 has no trigger(realTime=...) argument; the quickstart uses a Py4J helper.
- transformWithState requires the RocksDB state store provider.
- Size task slots to source partitions plus shuffles times shuffle partitions, or the query stalls.

## Industry use cases
- **Banking: Real-time card fraud scoring.** Score each authorization against recent account behaviour before the switch times out.
- **Payments and fintech: Sub-second fraud features.** Maintain velocity counters per card and device and serve them while the payment is still in flight.
- **Payments and fintech: Migrating a Flink fraud job to Spark.** Port keyed state and windows to Spark and measure whether latency holds.
- **Healthcare providers: Real-time deterioration alerts.** Score streaming vitals against early-warning rules and push alerts to care teams.
- **Manufacturing: Predictive maintenance.** Compute rolling sensor features per asset and score failure risk continuously.
- **Energy and utilities: Outage detection from streaming telemetry.** Correlate last-gasp meter events and SCADA alarms within seconds.
- **Retail and e-commerce: In-session recommendations.** Update product recommendations while the shopper is still browsing.
- **Telecommunications: Service assurance.** Correlate alarms and KPI drops across cells within seconds.
- **Cybersecurity: Streaming detections.** Evaluate detection rules on normalized events within seconds of arrival.

## Frequently asked questions

### How fast is Spark Real-Time Mode?

In the spark-rtm-quickstart run committed in results/latency-results.md (stateless, 500 events per second, 16 cores), end-to-end p50 was 17 ms and p99 was 21 to 26 ms across six runs. In spark-demos demo 14 on Spark 4.3.0, a stateless enrichment step measured p50 0 ms and p99 1 ms in real-time mode against 115 ms and 204 ms in micro-batch.

### Can Spark replace Flink for low-latency streaming?

For many stateless and windowed jobs, yes; flink-to-spark-rtm writes the same four patterns for both engines. Keyed state with timers is where migrations need the most care, since Spark expresses it through transformWithState.

### Does Real-Time Mode support stateful queries?

Not in open source Spark 4.1. The stateful reference demos (transformWithState, dedup and windows) run on Spark 4.3.

## Sources
- [spark-rtm-quickstart results/latency-results.md](https://github.com/lisancao/spark-rtm-quickstart/blob/main/results/latency-results.md)
- [spark-demos demo 14 NOTES.md](https://github.com/lisancao/spark-demos/blob/main/demos/14_real_time_mode/NOTES.md)
- [spark-demos demo 10 NOTES.md](https://github.com/lisancao/spark-demos/blob/main/demos/10_stateful_streaming/NOTES.md)

Last updated: 2026-11-21. Canonical page: https://openlakehouse.io/reference-architectures/real-time-streaming
