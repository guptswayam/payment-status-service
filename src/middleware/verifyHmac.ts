import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const HMAC_SECRET = process.env.HMAC_SECRET || "my-secret-key";

export const verifyHmac = (req: Request, res: Response, next: NextFunction): void => {
  const signature = req.headers["x-signature"] as string;

  if (!signature) {
    res.status(401).json({ error: "Missing x-signature header" });
    return;
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(payload)
    .digest("hex");

  const isTimingSafeMatch =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!isTimingSafeMatch) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  next();
};