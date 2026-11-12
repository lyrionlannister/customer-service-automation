import { Router } from "express";
import { settingsService } from "../settings/settings.service.js";
import { authMiddleware } from "../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../tenancy/tenant.middleware.js";

const allowedDomains = (process.env.AUTOMATION_ALLOWED_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

function validateAbsoluteUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol || !parsed.hostname) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isAllowedDomain(hostname: string): boolean {
  if (allowedDomains.length === 0) return true;

  const normalized = hostname.toLowerCase();
  return allowedDomains.some(
    (domain) => normalized === domain || normalized.endsWith(`.${domain}`),
  );
}

export function createAutomationAdminRouter(): Router {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);

  router.get("/config", async (_req, res) => {
    const config = await settingsService.getAutomationConfig();
    res.status(200).json(config);
  });

  router.patch("/config", async (req, res) => {
    const automationUrl = req.body?.automationUrl;

    if (typeof automationUrl !== "string" || !automationUrl.trim()) {
      res.status(400).json({
        error: "El campo automationUrl es requerido y debe ser string",
      });
      return;
    }

    const parsedUrl = validateAbsoluteUrl(automationUrl.trim());
    if (!parsedUrl) {
      res.status(400).json({
        error: "automationUrl debe ser una URL absoluta válida",
      });
      return;
    }

    if (!isAllowedDomain(parsedUrl.hostname)) {
      res.status(400).json({
        error: "El dominio de automationUrl no está permitido",
        allowedDomains,
      });
      return;
    }

    const savedUrl = await settingsService.setAutomationUrl(parsedUrl.toString());
    res.status(200).json({ automationUrl: savedUrl, source: "db" });
  });

  return router;
}
