import { Router } from "express";
import { RepairNoteController } from "../controllers/repair-note.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createRepairNoteRouter = (controller: RepairNoteController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.get("/:id/items", controller.getItems);
  router.get("/:id/pdf", controller.getPdf);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);
  return router;
};
