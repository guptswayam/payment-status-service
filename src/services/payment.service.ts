import { AppDataSource } from "../config/database";
import { Payment } from "../entities/Payment";
import { EventLog } from "../entities/EventLog";

export async function getTransactionStatus(id: string) {
    const paymentRepository = AppDataSource.getRepository(Payment);
    const eventLogRepository = AppDataSource.getRepository(EventLog);

    const transaction = await paymentRepository.findOne({ where: { id } });

    if (!transaction) {
        return;
    }

    const events = await eventLogRepository.find({
        where: { transactionId: id },
        order: { occurredAt: "DESC" },
    });

    return {
        transaction_id: transaction.id,
        current_status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        created_at: transaction.createdAt,
        updated_at: transaction.updatedAt,
        history: events.map((e) => ({
            event_id: e.eventId,
            event_type: e.eventType,
            occurred_at: e.occurredAt,
            details: e.payload,
        })),
    }
}