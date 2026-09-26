import "reflect-metadata";
import { DataSource } from "typeorm";
import { Payment } from "../entities/Payment";
import { EventLog } from "../entities/EventLog";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "postgres",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "payment_assignment",
  synchronize: process.env.NODE_ENV === "development", // Auto-create tables for local development
  logging: false,
  entities: [Payment, EventLog],
});