import express from "express";
import { AppDataSource } from "./config/database";
import paymentEventConsumer from "./kafka/paymentEvent.consumer";
import paymentRoutes from "./routes/payment.routes"
import producer from "./kafka/producers";

const app = express();
app.use(express.json());

app.get("/healthcheck", (_, res) => {
    res.status(200).json({ "status": "success" })
})

app.use(paymentRoutes);

const PORT = process.env.PORT || 7080;

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected successfully");
    
    // Start Kafka Background Worker
    await paymentEventConsumer();
    console.log("Kafka consumer initialized");
    await producer.connect();
    console.log("Kafka producer initialized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Initialization error:", err);
  });