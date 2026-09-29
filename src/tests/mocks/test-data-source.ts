import "reflect-metadata";
import { DataSource } from "typeorm";
import { EventLog } from "../../entities/EventLog";
import { Payment } from "../../entities/Payment";

export const TestDataSource = new DataSource({
  type: "better-sqlite3",
  database: ":memory:",
  dropSchema: true,
  synchronize: true, // Recreates tables automatically in-memory
  logging: false,
  entities: [Event, Payment],
});