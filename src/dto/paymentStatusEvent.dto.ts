export interface PaymentStatusEvent {
    event_id: string
    event_type: string
    transaction_id: string
    amount: string
    currency: string
    occurred_at: string
}