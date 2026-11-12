import { Router } from "express";
import { MessageTemplateController } from "../controllers/message-template.controller.js";
import { authMiddleware } from "../../../identity/auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../../core/tenancy/tenant.middleware.js";

export const createMessageTemplateRouter = (controller: MessageTemplateController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/", controller.getAll);
  router.get("/by-key/:key", controller.getByKey);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);
  return router;
};
