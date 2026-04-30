import express from "express";
import { listener } from "./whatsapp/whatsapp-service.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const enableWhatsappListener = process.env.ENABLE_WHATSAPP_LISTENER === "true";

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "customer-service",
    status: "ok",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Customer service listening on port ${port}`);

  if (enableWhatsappListener) {
    listener.start();
  }
});
