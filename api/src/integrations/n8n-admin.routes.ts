import { Router } from "express";
import { settingsService } from "../settings/settings.service.js";
import { authMiddleware } from "../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../tenancy/tenant.middleware.js";

function validateAbsoluteUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol || !parsed.hostname) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isAllowedByEnvironment(url: URL): boolean {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return url.protocol === "https:";
  }

  if (url.protocol === "https:") return true;

  return (
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
  );
}

export function createN8nIntegrationRouter(): Router {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);

  router.get("/", async (_req, res) => {
    const config = await settingsService.getN8nIntegrationConfig();
    res.status(200).json(config);
  });

  router.patch("/", async (req, res) => {
    const n8nEditorUrl = req.body?.n8nEditorUrl;

    if (typeof n8nEditorUrl !== "string" || !n8nEditorUrl.trim()) {
      res.status(400).json({
        error: "El campo n8nEditorUrl es requerido y debe ser string",
      });
      return;
    }

    const parsedUrl = validateAbsoluteUrl(n8nEditorUrl.trim());
    if (!parsedUrl) {
      res.status(400).json({
        error: "n8nEditorUrl debe ser una URL absoluta válida",
      });
      return;
    }

    if (!isAllowedByEnvironment(parsedUrl)) {
      res.status(400).json({
        error:
          process.env.NODE_ENV === "production"
            ? "En producción n8nEditorUrl debe usar HTTPS"
            : "En desarrollo n8nEditorUrl debe usar HTTPS o HTTP en localhost",
      });
      return;
    }

    const savedUrl = await settingsService.setN8nEditorUrl(parsedUrl.toString());
    res.status(200).json({ n8nEditorUrl: savedUrl, source: "db" });
  });

  return router;
}
