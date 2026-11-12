import { Router } from "express";
import { ChatsController } from "../controllers/chats.controller.js";
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js";

// NOTA: no se agrega tenantMiddleware aqui. n8n_chat_histories es una tabla
// propia de n8n (sin columna tenant_id) y hoy el proceso solo sirve una
// sesion de WhatsApp compartida -- aislar esto por tenant de verdad depende
// de la misma decision de arquitectura pendiente que el WhatsappListener
// singleton (una sesion por tenant), fuera de alcance de este modulo.
// authMiddleware si cierra el hueco critico de "cero autenticacion".
export function createChatsRouter(chatsController: ChatsController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/", (req, res) => chatsController.listConversations(req, res));
  router.get("/stats/daily", (req, res) => chatsController.getConversationCountsByDay(req, res));
  router.get("/stats/monthly", (req, res) => chatsController.getConversationCountsByMonth(req, res));
  router.get("/stats/weekly", (req, res) => chatsController.getWeekSessionCount(req, res));
  router.get("/stats/last-interaction", (req, res) => chatsController.getLastInteractionAt(req, res));
  router.get("/:sessionId/transfer", (req, res) => chatsController.getTransferStatus(req, res));
  router.post("/:sessionId/transfer", (req, res) => chatsController.activateTransfer(req, res));
  router.delete("/:sessionId/transfer", (req, res) => chatsController.deactivateTransfer(req, res));
  router.post("/:sessionId/messages", (req, res) => chatsController.sendMessage(req, res));
  router.get("/:sessionId", (req, res) => chatsController.getMessages(req, res));

  return router;
}
