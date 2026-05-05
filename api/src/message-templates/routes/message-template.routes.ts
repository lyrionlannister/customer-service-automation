import { Router } from "express";
import { MessageTemplateController } from "../controllers/message-template.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";

export const createMessageTemplateRouter = (controller: MessageTemplateController): Router => {
  const router = Router();
  router.get("/", authMiddleware, controller.getAll);
  router.get("/by-key/:key", authMiddleware, controller.getByKey);
  router.post("/", authMiddleware, controller.create);
  router.patch("/:id", authMiddleware, controller.update);
  router.delete("/:id", authMiddleware, controller.delete);
  return router;
};
