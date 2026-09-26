import { KafkaJS } from "@confluentinc/kafka-javascript";
import { PaymentStatusEvent } from "../dto/paymentStatusEvent.dto";

const producer = new KafkaJS.Kafka().producer({
  "bootstrap.servers": process.env.KAFKA_BROKERS || "kafka:9092",
});

export const publishPaymentEvent = async (eventPayload: PaymentStatusEvent): Promise<KafkaJS.RecordMetadata[]> => {
  return producer.send({
    topic: 'payment-events',
    messages: [
      {
        key: eventPayload.transaction_id,
        value: Buffer.from(JSON.stringify(eventPayload)),
      }
    ],
  });
};

export default producer;