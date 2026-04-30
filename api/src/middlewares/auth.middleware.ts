import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded as { id: string; email: string };
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Sesion expirada" });
    } else {
      res.status(401).json({ error: "Token invalido" });
    }
  }
};
