import { Router, Request, Response } from "express";
import { verifyHmac } from "../middleware/verifyHmac";
import { publishPaymentEvent } from "../kafka/producers";
import { getTransactionStatus } from "../services/payment.service";
import { PaymentStatus } from "../constants/payment.constants";

const router = Router();

// 1 & 2. POST /webhooks/payment with HMAC verification
router.post("/webhooks/payment", verifyHmac, async (req: Request, res: Response): Promise<void> => {
  const { event_id, event_type, transaction_id, amount, currency, occurred_at } = req.body;

  if (!event_id || !event_type || !transaction_id || !amount || !currency || !occurred_at) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (!Object.values(PaymentStatus).includes(event_type)) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    await publishPaymentEvent(req.body);
    res.status(202).json({ status: "accepted", message: "Event queued for processing" });
  } catch (error) {
    res.status(500).json({ error: "Failed to process webhook event" });
  }
});

// 4. GET /transactions/:id — Transaction state & full event history
router.get("/transactions/:id", async (req: Request, res: Response): Promise<any> => {
  const transactionId = req.params.id as string;

  const transaction = await getTransactionStatus(transactionId)

  if (!transaction)
    return res.status(404).json({ error: "Transaction not found" });

  res.status(200).json(transaction);
});

export default router;