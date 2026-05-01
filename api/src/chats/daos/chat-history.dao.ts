import { Repository } from "typeorm";
import { BaseDao } from "../../daos/base.dao.js";
import { ChatHistory } from "../entities/chat-history.entity.js";

export interface ConversationRow {
  sessionId: string;
  lastId: number;
  messageCount: number;
  lastContent: string;
  lastType: string;
}

export class ChatHistoryDao extends BaseDao<ChatHistory> {
  constructor(repository: Repository<ChatHistory>) {
    super(repository);
  }

  async getConversations(): Promise<ConversationRow[]> {
    return this.repository.query(`
      SELECT
        session_id                                                                              AS "sessionId",
        MAX(id)::int                                                                            AS "lastId",
        COUNT(*)::int                                                                           AS "messageCount",
        (SELECT message->>'content' FROM n8n_chat_histories s WHERE s.session_id = h.session_id ORDER BY id DESC LIMIT 1) AS "lastContent",
        (SELECT message->>'type'    FROM n8n_chat_histories s WHERE s.session_id = h.session_id ORDER BY id DESC LIMIT 1) AS "lastType"
      FROM n8n_chat_histories h
      GROUP BY session_id
      ORDER BY "lastId" DESC
    `);
  }

  async getMessagesBySessionId(sessionId: string): Promise<ChatHistory[]> {
    return this.repository.find({
      where: { sessionId } as any,
      order: { id: "ASC" } as any,
    });
  }
}
