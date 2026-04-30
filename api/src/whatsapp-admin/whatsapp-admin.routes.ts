import { Router, type Response } from "express";
import { listener } from "../whatsapp/whatsapp-service.js";

export function createWhatsappAdminRouter(): Router {
  const router = Router();

  router.get("/status", (_req, res) => {
    res.status(200).json({ status: listener.getStatus() });
  });

  router.get("/qr", (_req, res) => {
    res.status(200).json(listener.getLastQr());
  });

  router.get("/events", (_req, res) => {
    setupSseHeaders(res);

    const unsubscribe = listener.subscribe((event) => {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    });

    _req.on("close", () => {
      unsubscribe();
      res.end();
    });
  });

  return router;
}

function setupSseHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}
