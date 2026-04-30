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
  console.log(`Servidor de atención al cliente escuchando en el puerto ${port}`);
  console.log(
    `Listener de WhatsApp habilitado: ${enableWhatsappListener ? "sí" : "no"}`,
  );

  if (enableWhatsappListener) {
    listener.start();
  }
});
