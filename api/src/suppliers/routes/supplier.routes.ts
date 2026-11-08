import { Router } from "express";
import { SupplierController } from "../controllers/supplier.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";

export const createSupplierRouter = (controller: SupplierController): Router => {
  const router = Router();
  router.get("/", authMiddleware, controller.getAll);
  return router;
};
