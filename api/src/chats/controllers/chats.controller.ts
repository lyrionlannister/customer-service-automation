import { Request, Response } from "express";
import { CHATS_ERROR_MESSAGES } from "../constants/chats.constants.js";
import { ChatsService } from "../services/chats.service.js";

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
}
