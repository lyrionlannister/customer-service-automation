import { Router } from "express";
import { LocalController } from "../controllers/local.controller.js";
import { authMiddleware } from "../../../identity/auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../../core/tenancy/tenant.middleware.js";

export const createLocalRouter = (controller: LocalController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.get);
  router.patch("/", controller.update);
  return router;
};
