import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";

export const createNotificationRouter = (controller: NotificationController): Router => {
  const router = Router();
  router.get("/", authMiddleware, controller.getAll);
  router.patch("/read-all", authMiddleware, controller.markAllRead);
  router.patch("/:id/read", authMiddleware, controller.markRead);
  return router;
};
