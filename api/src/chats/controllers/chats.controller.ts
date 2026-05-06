import { Request, Response } from "express";
import { CHATS_ERROR_MESSAGES } from "../constants/chats.constants.js";
import { ChatsService } from "../services/chats.service.js";
import { humanModeService } from "../../human-mode/human-mode.service.js";
import { listener } from "../../whatsapp/whatsapp-service.js";
import AppDataSource from "../../config/data-source.js";
import { ContactName } from "../entities/contact-name.entity.js";

export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  async listConversations(_req: Request, res: Response): Promise<void> {
    try {
      const conversations = await this.chatsService.getConversations();
      res.status(200).json(conversations);
    } catch (error) {
      console.error("Error listando conversaciones", error);
      res.status(500).json({ error: CHATS_ERROR_MESSAGES.CONVERSATIONS_LIST });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.sessionId)
        ? req.params.sessionId[0]
        : req.params.sessionId;
      if (!sessionId) {
        res.status(400).json({ error: CHATS_ERROR_MESSAGES.SESSION_ID_REQUIRED });
        return;
      }
      const messages = await this.chatsService.getMessages(sessionId);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error obteniendo mensajes", error);
      res.status(500).json({ error: CHATS_ERROR_MESSAGES.MESSAGES_LIST });
    }
  }

  async getConversationCountsByDay(_req: Request, res: Response): Promise<void> {
    try {
      const counts = await this.chatsService.getConversationCountsByDay();
      res.status(200).json(counts);
    } catch (error) {
      console.error("Error obteniendo conteo diario", error);
      res.status(500).json({ error: CHATS_ERROR_MESSAGES.DAILY_COUNT });
    }
  }

  async getConversationCountsByMonth(req: Request, res: Response): Promise<void> {
    try {
      const year = Number(req.query.year ?? new Date().getFullYear());
      const counts = await this.chatsService.getConversationCountsByMonth(year);
      res.status(200).json(counts);
    } catch (error) {
      console.error("Error obteniendo conteo mensual", error);
      res.status(500).json({ error: CHATS_ERROR_MESSAGES.MONTHLY_COUNT });
    }
  }

  async getWeekSessionCount(_req: Request, res: Response): Promise<void> {
    try {
      const count = await this.chatsService.getWeekSessionCount();
      res.status(200).json({ count });
    } catch (error) {
      console.error("Error obteniendo conteo semanal", error);
      res.status(500).json({ error: CHATS_ERROR_MESSAGES.WEEKLY_COUNT });
    }
  }

  async getLastInteractionAt(_req: Request, res: Response): Promise<void> {
    try {
      const lastAt = await this.chatsService.getLastInteractionAt();
      res.status(200).json({ lastAt });
    } catch (error) {
      console.error("Error obteniendo última interacción", error);
      res.status(500).json({ error: CHATS_ERROR_MESSAGES.LAST_INTERACTION });
    }
  }

  async getTransferStatus(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
      const isHumanMode = await humanModeService.isActive(sessionId);
      res.status(200).json({ isHumanMode });
    } catch (error) {
      console.error("Error obteniendo estado de transferencia:", error);
      res.status(500).json({ error: "Error al obtener estado de transferencia" });
    }
  }

  async activateTransfer(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
      const contactName = await AppDataSource.getRepository(ContactName)
        .findOneBy({ phone: sessionId })
        .then((cn) => cn?.name);
      await humanModeService.activate(sessionId, contactName);
      listener.broadcast("conversation_transferred", {
        sessionId,
        phone: sessionId,
        contactName: contactName ?? null,
      });
      res.status(200).json({ isHumanMode: true });
    } catch (error) {
      console.error("Error activando transferencia:", error);
      res.status(500).json({ error: "Error al activar transferencia" });
    }
  }

  async deactivateTransfer(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
      await humanModeService.deactivate(sessionId);
      res.status(200).json({ isHumanMode: false });
    } catch (error) {
      console.error("Error desactivando transferencia:", error);
      res.status(500).json({ error: "Error al desactivar transferencia" });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
      const body = req.body?.body as string | undefined;

      if (!body?.trim()) {
        res.status(400).json({ error: "El campo 'body' es requerido" });
        return;
      }

      const isHumanMode = await humanModeService.isActive(sessionId);
      if (!isHumanMode) {
        res.status(400).json({ error: "La conversación no está en modo humano" });
        return;
      }

      await listener.sendReply(sessionId, body.trim());
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error enviando mensaje manual:", error);
      const message = error instanceof Error ? error.message : "Error al enviar mensaje";
      res.status(500).json({ error: message });
    }
  }
}
