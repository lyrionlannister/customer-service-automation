import { Router } from "express";
import { ChatsController } from "../controllers/chats.controller.js";

export function createChatsRouter(chatsController: ChatsController): Router {
  const router = Router();

  router.get("/", (req, res) => chatsController.listConversations(req, res));
  router.get("/stats/daily", (req, res) => chatsController.getConversationCountsByDay(req, res));
  router.get("/stats/monthly", (req, res) => chatsController.getConversationCountsByMonth(req, res));
  router.get("/stats/weekly", (req, res) => chatsController.getWeekSessionCount(req, res));
  router.get("/stats/last-interaction", (req, res) => chatsController.getLastInteractionAt(req, res));
  router.get("/:sessionId", (req, res) => chatsController.getMessages(req, res));

  return router;
}
