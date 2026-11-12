import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller.js";
import { authMiddleware } from "../../../identity/auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../../core/tenancy/tenant.middleware.js";

export const createCustomerRouter = (controller: CustomerController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.get("/:id/devices", controller.getDevices);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);
  return router;
};
