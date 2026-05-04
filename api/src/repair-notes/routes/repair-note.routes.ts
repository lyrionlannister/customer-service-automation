import { Router } from "express";
import { RepairNoteController } from "../controllers/repair-note.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";

export const createRepairNoteRouter = (controller: RepairNoteController): Router => {
  const router = Router();
  router.get("/", authMiddleware, controller.getAll);
  router.get("/:id", authMiddleware, controller.getById);
  router.post("/", authMiddleware, controller.create);
  router.patch("/:id", authMiddleware, controller.update);
  router.delete("/:id", authMiddleware, controller.delete);
  return router;
};
