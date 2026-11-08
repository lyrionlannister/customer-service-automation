import { Router } from "express";
import { SupplierController } from "../controllers/supplier.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createSupplierRouter = (controller: SupplierController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.getAll);
  return router;
};
