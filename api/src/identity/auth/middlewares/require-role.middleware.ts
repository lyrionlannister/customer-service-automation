import { Response, NextFunction } from "express";
import { UserRole } from "../entities/user.entity.js";
import { AuthenticatedRequest } from "./auth.middleware.js";

export const requireRole = (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }
    next();
  };
