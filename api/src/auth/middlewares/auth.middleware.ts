import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requireJwtSecret } from "../jwt-secret.js";
import { UserRole } from "../entities/user.entity.js";

const { verify } = jwt;

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; tenantId: string; role: UserRole };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // EventSource (SSE) no puede mandar headers custom, asi que el cliente le
  // pasa el token por query string para esas conexiones — unico fallback
  // aceptado, todo lo demas sigue exigiendo el header Authorization.
  const token =
    req.headers.authorization?.split(" ")[1] ?? (req.query.token as string | undefined);

  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    const decoded = verify(token, requireJwtSecret());
    req.user = decoded as { id: string; email: string; tenantId: string; role: UserRole };
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Sesion expirada" });
    } else {
      res.status(401).json({ error: "Token invalido" });
    }
  }
};
