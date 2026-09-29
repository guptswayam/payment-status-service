import request from "supertest";
import crypto from "crypto";
import { app } from "../../index"; // Imports your existing Express application
import { TestDataSource } from "../mocks/test-data-source";

// Mock AppDataSource so TypeORM binds to in-memory SQLite during test execution
jest.mock("../../config/database", () => ({
  AppDataSource: TestDataSource,
}));

// Mock Kafka producer to prevent attempts to connect to a real broker
jest.mock("../../kafka/producer", () => ({
  publishPaymentEvent: jest.fn().mockResolvedValue(undefined),
}));

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "my-secret-key";

function generateHmacSignature(payload: any, secret = WEBHOOK_SECRET): string {
  const body = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("POST /webhooks/payment - HMAC Signature Validation", () => {

  const validPayload = {
    event_id: "evt_sig_test_001",
    event_type: "payment.succeeded",
    transaction_id: "txn_sig_test_101",
    amount: 150.00,
    currency: "USD",
    occurred_at: "2026-09-29T12:00:00.000Z",
  };

  it("should return 202 Accepted when HMAC signature is valid", async () => {
    const signature = generateHmacSignature(validPayload);

    const res = await request(app)
      .post("/webhooks/payment")
      .set("x-signature", signature)
      .send(validPayload);

    expect(res.status).toBe(202);
    expect(res.body).toEqual({
      status: "accepted",
      message: "Event queued for processing",
    });
  });

  it("should return 401 Unauthorized when x-signature header is missing", async () => {
    const res = await request(app)
      .post("/webhooks/payment")
      .send(validPayload);

    expect(res.status).toBe(401);
  });

  it("should return 401 Unauthorized when payload is modified after signing", async () => {
    const signature = generateHmacSignature(validPayload);
    const tamperedPayload = { ...validPayload, amount: 9999.99 };

    const res = await request(app)
      .post("/webhooks/payment")
      .set("x-signature", signature)
      .send(tamperedPayload);

    expect(res.status).toBe(401);
  });

  it("should return 401 Unauthorized when signed with an invalid secret", async () => {
    const invalidSignature = generateHmacSignature(validPayload, "wrong_secret_key");

    const res = await request(app)
      .post("/webhooks/payment")
      .set("x-signature", invalidSignature)
      .send(validPayload);

    expect(res.status).toBe(401);
  });
});