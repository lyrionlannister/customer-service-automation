import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../identity/auth/middlewares/auth.middleware.js";
import { runWithTenant } from "./tenant-context.js";

// Va siempre despues de authMiddleware: ese ya puso req.user.tenantId desde
// el JWT. Este middleware solo propaga ese tenant al AsyncLocalStorage para
// que los TenantScopedDao de todo el resto de la cadena lo vean.
export const tenantMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  runWithTenant(tenantId, () => next());
};
