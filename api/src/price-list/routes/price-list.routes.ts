import { Router } from "express";
import express from "express";
import { PriceListController } from "../controllers/price-list.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";

export const createPriceListRouter = (controller: PriceListController): Router => {
  const router = Router();

  router.use((req, _res, next) => {
    console.log(`[price-list-router] ${req.method} ${req.path}`);
    next();
  });

  router.get("/", authMiddleware, controller.getAll);
  router.post("/", authMiddleware, controller.create);
  router.post(
    "/upload",
    authMiddleware,
    express.raw({ type: "application/pdf", limit: "20mb" }),
    controller.uploadPdf,
  );
  router.patch("/:id", authMiddleware, controller.update);
  router.delete("/:id", authMiddleware, controller.delete);
  return router;
};
