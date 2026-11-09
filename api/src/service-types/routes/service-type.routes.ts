import { Router } from "express";
import { ServiceTypeController } from "../controllers/service-type.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createServiceTypeRouter = (controller: ServiceTypeController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.getAll);
  router.post("/", controller.create);
  return router;
};
