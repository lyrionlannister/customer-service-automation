import { Router } from "express";
import { PriceListController } from "../controllers/price-list.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createPriceListRouter = (controller: PriceListController): Router => {
  const router = Router();
  router.use(authMiddleware, tenantMiddleware);

  router.get("/", controller.getAll);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);
  return router;
};
