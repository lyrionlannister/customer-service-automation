import { Router } from "express";
import { LocalController } from "../controllers/local.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";

export const createLocalRouter = (controller: LocalController): Router => {
  const router = Router();
  router.get("/", authMiddleware, controller.get);
  router.patch("/", authMiddleware, controller.update);
  return router;
};
