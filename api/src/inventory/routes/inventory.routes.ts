import { Router } from "express";
import express from "express";
import { InventoryController } from "../controllers/inventory.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createInventoryRouter = (controller: InventoryController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.getAll);
  router.post("/import", express.raw({ type: "*/*", limit: "10mb" }), controller.bulkImport);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);
  router.get("/:id/movements", controller.getMovements);
  router.post("/:id/movements", controller.registerMovement);
  return router;
};
