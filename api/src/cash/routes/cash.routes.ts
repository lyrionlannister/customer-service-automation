import { Router } from "express";
import { CashController } from "../controllers/cash.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createCashRouter = (controller: CashController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);

  router.get("/sessions", controller.getAllSessions);
  router.get("/sessions/open", controller.getOpenSession);
  router.get("/sessions/:id", controller.getSessionById);
  router.post("/sessions", controller.openSession);
  router.post("/sessions/:id/close", controller.closeSession);
  router.get("/sessions/:id/movements", controller.getMovements);
  router.post("/sessions/:id/movements", controller.registerMovement);
  router.get("/sessions/:id/summary", controller.getSummary);

  return router;
};
