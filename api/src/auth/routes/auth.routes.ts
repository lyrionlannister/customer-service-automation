import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.get("/users", authMiddleware, authController.getUsers);
  router.patch("/users/:id/toggle-status", authMiddleware, authController.toggleUserStatus);

  return router;
};
