import { Router, type Response } from "express";
import { listener } from "../whatsapp/whatsapp-service.js";
import type { Repository } from "typeorm";
import { ExcludedPhone } from "./entities/excluded-phone.entity.js";
import { normalizeWhatsappPhone } from "./utils/phone-normalizer.js";
import { authMiddleware, type AuthenticatedRequest } from "../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../tenancy/tenant.middleware.js";

export function createWhatsappAdminRouter(
  exclusionsRepository: Repository<ExcludedPhone>,
): Router {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);

  // NOTA: el WhatsappListener (QR, status, logout, toggle de IA) sigue
  // siendo una sola sesion global del proceso, no una por tenant todavia
  // -- eso es un cambio de arquitectura aparte (pool de sesiones/Chromium
  // por tenant), fuera del alcance de este modulo. Las exclusiones si son
  // por tenant desde ahora.

  router.get("/status", (_req, res) => {
    res.status(200).json({ status: listener.getStatus() });
  });

  router.get("/qr", (_req, res) => {
    res.status(200).json(listener.getLastQr());
  });

  router.post("/session/logout", async (_req, res) => {
    await listener.logoutSession();
    res.status(200).json({ status: listener.getStatus() });
  });

  router.get("/events", (_req, res) => {
    setupSseHeaders(res);
    res.write(`event: state_change\ndata: ${JSON.stringify({ status: listener.getStatus() })}\n\n`);

    const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 25_000);

    const unsubscribe = listener.subscribe((event) => {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    });

    _req.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
      res.end();
    });
  });

  router.get("/settings", async (_req, res) => {
    const aiRepliesEnabled = await listener.getAiRepliesEnabled();
    res.status(200).json({ aiRepliesEnabled });
  });

  router.patch("/settings", async (req, res) => {
    const aiRepliesEnabled = req.body?.aiRepliesEnabled;

    if (typeof aiRepliesEnabled !== "boolean") {
      res.status(400).json({
        error: "El campo aiRepliesEnabled es requerido y debe ser booleano",
      });
      return;
    }

    const updatedValue = await listener.setAiRepliesEnabled(aiRepliesEnabled);
    res.status(200).json({ aiRepliesEnabled: updatedValue });
  });

  router.get("/exclusions", async (req: AuthenticatedRequest, res) => {
    const exclusions = await exclusionsRepository.find({
      where: { tenantId: req.user!.tenantId },
      order: { createdAt: "DESC" },
    });
    res.status(200).json(exclusions);
  });

  router.post("/exclusions", async (req: AuthenticatedRequest, res) => {
    const normalizedPhone = normalizeWhatsappPhone(req.body?.phone ?? "");

    if (!normalizedPhone) {
      res.status(400).json({ error: "El teléfono es requerido" });
      return;
    }

    const exclusion = exclusionsRepository.create({
      tenantId: req.user!.tenantId,
      phone: normalizedPhone,
    });
    await exclusionsRepository.save(exclusion);

    res.status(201).json(exclusion);
  });

  router.delete("/exclusions/:phone", async (req: AuthenticatedRequest, res) => {
    const normalizedPhone = normalizeWhatsappPhone(String(req.params.phone));

    if (!normalizedPhone) {
      res.status(400).json({ error: "Teléfono inválido" });
      return;
    }

    await exclusionsRepository.delete({ tenantId: req.user!.tenantId, phone: normalizedPhone });

    res.status(204).send();
  });

  return router;
}

function setupSseHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}
