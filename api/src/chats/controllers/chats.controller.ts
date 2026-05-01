import { Request, Response } from "express";
import { ChatsService } from "../services/chats.service.js";

export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  async listConversations(_req: Request, res: Response): Promise<void> {
    try {
      const conversations = await this.chatsService.getConversations();
      res.status(200).json(conversations);
    } catch (error) {
      console.error("Error listando conversaciones", error);
      res.status(500).json({ error: "Error al obtener las conversaciones" });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.sessionId)
        ? req.params.sessionId[0]
        : req.params.sessionId;
      if (!sessionId) {
        res.status(400).json({ error: "sessionId es requerido" });
        return;
      }
      const messages = await this.chatsService.getMessages(sessionId);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error obteniendo mensajes", error);
      res.status(500).json({ error: "Error al obtener los mensajes" });
    }
  }
}
