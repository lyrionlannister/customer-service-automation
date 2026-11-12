import { Router } from "express";
import { ReportsController } from "../controllers/reports.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createReportsRouter = (controller: ReportsController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);
  router.get("/employee-performance", controller.getEmployeePerformance);
  router.get("/accessory-sales", controller.getAccessorySales);
  router.get("/repair-notes-by-type", controller.getRepairNotesByType);
  return router;
};
