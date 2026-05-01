import { Router } from "express";
import { ChatsController } from "../controllers/chats.controller.js";

export function createChatsRouter(chatsController: ChatsController): Router {
  const router = Router();

  router.get("/", (req, res) => chatsController.listConversations(req, res));
  router.get("/:sessionId", (req, res) => chatsController.getMessages(req, res));

  return router;
}
