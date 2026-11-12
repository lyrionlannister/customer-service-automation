import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { authMiddleware } from "../../../identity/auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../../core/tenancy/tenant.middleware.js";

export const createNotificationRouter = (controller: NotificationController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.getAll);
  router.patch("/read-all", controller.markAllRead);
  router.patch("/:id/read", controller.markRead);
  return router;
};
