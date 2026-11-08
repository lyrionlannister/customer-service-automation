import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service.js";

export class NotificationController {
  constructor(private service: NotificationService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const unreadOnly = req.query.unread === "true";
      const notifications = await this.service.getAll(unreadOnly);
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error obteniendo notificaciones:", error);
      res.status(500).json({ error: "Error al obtener notificaciones" });
    }
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(rawId, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const notification = await this.service.markRead(id);
      if (!notification) {
        res.status(404).json({ error: "Notificación no encontrada" });
        return;
      }
      res.status(200).json(notification);
    } catch (error) {
      console.error("Error marcando notificación:", error);
      res.status(500).json({ error: "Error al marcar notificación" });
    }
  };

  markAllRead = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.service.markAllRead();
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error marcando todas las notificaciones:", error);
      res.status(500).json({ error: "Error al marcar notificaciones" });
    }
  };
}
