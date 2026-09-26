import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("event_logs")
@Index('idx_transactionId_occuredAt', ['transactionId', 'occurredAt'])
export class EventLog {
  @PrimaryColumn({ type: "varchar", length: 255 })
  eventId!: string;

  @Column({ type: "varchar", length: 255 })
  transactionId!: string;

  @Column({ type: "varchar", length: 50 })
  eventType!: string;

  @Column({ type: "jsonb" })
  payload!: Record<string, any>;

  @Column({type: "timestamptz"})
  occurredAt!: Date;
}