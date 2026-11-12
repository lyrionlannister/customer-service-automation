import { Router } from "express";
import express from "express";
import { ImportStagingController } from "../controllers/import-staging.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";
import { requireInternalToken } from "../../n8n/n8n-public.routes.js";

export const createImportStagingRouter = (controller: ImportStagingController): Router => {
  const router = Router();

  // Callback de n8n: sin JWT, gateado por el mismo secreto compartido que /api/v1/n8n/*.
  router.post("/callback", requireInternalToken, controller.callback);

  router.use(authMiddleware, tenantMiddleware);
  router.post("/upload", express.raw({ type: "*/*", limit: "20mb" }), controller.upload);
  router.get("/:importId", controller.getById);
  router.patch("/:importId", controller.updateRows);
  router.post("/:importId/commit", controller.commit);
  router.delete("/:importId", controller.discard);

  return router;
};
