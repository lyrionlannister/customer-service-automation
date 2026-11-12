import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/require-role.middleware.js";
import { tenantMiddleware } from "../../tenancy/tenant.middleware.js";

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.get(
    "/users",
    authMiddleware,
    tenantMiddleware,
    requireRole("owner", "admin"),
    authController.getUsers,
  );
  router.patch(
    "/users/:id/toggle-status",
    authMiddleware,
    tenantMiddleware,
    requireRole("owner", "admin"),
    authController.toggleUserStatus,
  );
  router.get("/employees", authMiddleware, tenantMiddleware, authController.listEmployees);
  router.post(
    "/employees",
    authMiddleware,
    tenantMiddleware,
    requireRole("owner", "admin"),
    authController.createEmployee,
  );

  return router;
};
