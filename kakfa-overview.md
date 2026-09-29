# Kafka Overview
1. [KafkaJS Client Docs](https://docs.confluent.io/kafka-clients/javascript/current/overview.html#message-batching-async-sends-and-flushing)

## Kafka Broker and Replication factor
1. The replication factor in Apache Kafka is a topic-level setting that determines the total number of copies of each partition stored across different brokers in a cluster
2. It uses the Leader-slave model, One broker is chosen as the leader for a partition. It handles all read and write requests for that partition
3. The industry standard for replication factor is 3 in production, that balances fault tolerance, storage cost, and network overhead

## Consumer group (GroupID)
1. Consumer instances configured with same group id collectively known as consumer group

## Batch processing (Message Batching and async sends)
1. Messages are batched internally by the library on a per partition basis.
2. Messages are batched by producer instance. And whole batch is assigned to a consumer for processing.
3. When a producer batches messages, it ensures that a single batch created by a producer only contains messages destined for the exact same partition.
    - it does so to optimize network performance. 
4. Each producer instance handles batching completely independently, so their batches will always be physically separate network requests.
5. Batching mechanism:
    - Setting the linger.ms property allows the library to wait up to the specified amount of time to accumulate messages into a single batch.
    - Default for linger.ms is 5ms in Kafka v3 or higher
    - The maximum size of the batch is determined by batch.num.messages (max no of messages) or batch.size (max number of bytes)
    - Note that if send is awaited on, only the messages included within that send can be batched together.
    - For the best possible throughput, it’s recommended to use send calls without awaiting them, and then await all of them together
6. The producer client instance determines the partition(routing) for a message, by applying the configured algorithm

## Commit Offsets (producer and consumer offsets)

## Kafka Direct Streams


## Parallel processing using partitions within consumer group

### With Key while producing message (Key-based partitioning)
1. Kafka runs a hash function (the murmur2 algorithm) on the key and uses modulo arithmetic (hash(key) % numPartitions). This means the same key is strictly guaranteed to go to the exact same partition every single time, which preserves message order for that specific key

### Without key while producing message (Round-Robin / Sticky Partitioning)
1. If you pass a null key, Kafka distributes the messages across partitions to balance the load evenly. Modern Kafka versions use a "sticky partitioner" for null keys instead of pure round-robin to batch messages together and boost performance, but it still serves to spread unkeyed data across partitions rather than pinning it to one

## Partition assignment to comsumer instances within group (client-side and server-side)
1. When the modern consumer group protocol (group.protocol=consumer) is enabled, partition assignment is handled server-side via remote assignors instead of client-side assignor
    - The Group Coordinator on the broker calculates and assign partitions to consumers within group
2. While the default group.protocol=classic, partition assignment is handles client-side.
    - The Kafka client automatically balances and assigns the partitions across all active consumers in your consumer group
    - Client like KafkaJS automatically distributes partitions among consumers within group using a process called rebalancing.
    - When multiple instances of a consumer share the same groupId, the Kafka broker elects a leader among them. 
    - That leader runs a partition assignment strategy (like RoundRobin or Range) to evenly divide the topic's partitions among all active instances.

### Available partition assigment strategies for consumers within group
1. *range, roundrobin, cooperative-sticky* for group.protocol=classic
2. *range, uniform* for group.protocol=consumer

#### 1. Round Robin


### Manual assigning partition to consumers within group





