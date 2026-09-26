import { KafkaJS } from "@confluentinc/kafka-javascript";
import { AppDataSource } from "../config/database";
import { EventLog } from "../entities/EventLog";
import { Payment } from "../entities/Payment";
import { PaymentStatus } from "../constants/payment.constants";
import { PaymentStatusEvent } from "../dto/paymentStatusEvent.dto";

export default async () => {
  const kafkaClient = new KafkaJS.Kafka({
    "bootstrap.servers": process.env.KAFKA_BROKERS || "kafka:9092",
  })

  const admin = kafkaClient.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [{
      topic: "payment-events",
      numPartitions: process.env.PAYMENT_EVENT_TOPIC_PARTITIONS ? parseInt(process.env.PAYMENT_EVENT_TOPIC_PARTITIONS) : 2,
      replicationFactor: 1      
    }]
  })

  const consumer = kafkaClient.consumer({
    "group.id": "payment-processor-group",
    "auto.offset.reset": "earliest",    // offset is scoped per group
    "partition.assignment.strategy": "roundrobin",
  });

  await consumer.connect();
  await consumer.subscribe({ topics: ["payment-events"] });

  consumer.run({
    eachMessage: async ({ message }) => {

      const event = JSON.parse(message.value!.toString()) as PaymentStatusEvent;
      const { event_id, event_type, transaction_id, amount, currency, occurred_at } = event;

      try {
        // Wrap in a database transaction for atomic idempotency
        await AppDataSource.transaction(async (transactionalEntityManager) => {
          // 1. Idempotency Check: Drop duplicate event_ids
          const existingEvent = await transactionalEntityManager.findOne(EventLog, {
            where: { eventId: event_id },
          });

          if (existingEvent) return;

          const prevRecordedEvent = await transactionalEntityManager.findOne(EventLog, {
            where: { transactionId: transaction_id},
            order: { occurredAt: 'DESC'}
          })

          console.log(prevRecordedEvent?.occurredAt)

          // 2. Persist to event log
          const eventLog = transactionalEntityManager.create(EventLog, {
            eventId: event_id,
            transactionId: transaction_id,
            eventType: event_type,
            payload: {
              ...event,
              event_type: undefined,
              occurred_at: undefined,
              event_id: undefined
            },
            occurredAt: new Date(occurred_at),
          });
          await transactionalEntityManager.save(eventLog);

          if (prevRecordedEvent && prevRecordedEvent.occurredAt > new Date(occurred_at))
            return;

          // 3. Upsert transaction aggregate state
          let transaction = await transactionalEntityManager.findOne(Payment, {
            where: { id: transaction_id },
          });

          if (!transaction) {
            transaction = transactionalEntityManager.create(Payment, {
              id: transaction_id,
              status: event_type as PaymentStatus,
              amount: parseFloat(amount),
              currency,
            });
          } else {
              transaction.status = event_type as PaymentStatus;
              transaction.amount = parseFloat(amount);
              transaction.currency = currency;
          }

          await transactionalEntityManager.save(transaction);
        });
      } catch (error) {
        console.log(error);
        // TODO: Add message to DEAD LETTER QUEUE
      }
      

      
    }
  })
};