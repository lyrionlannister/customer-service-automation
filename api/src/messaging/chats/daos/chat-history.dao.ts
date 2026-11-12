import { Repository } from "typeorm";
import { BaseDao } from "../../../core/daos/base.dao.js";
import { ChatHistory } from "../entities/chat-history.entity.js";

export interface ConversationRow {
  sessionId: string;
  lastId: number;
  messageCount: number;
  lastContent: string;
  lastType: string;
}

export interface ConversationCountPoint {
  bucket: string;
  count: number;
}

export interface WeekSessionCount {
  count: number;
}

export interface LastInteractionResult {
  lastAt: string | null;
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

  async getConversationCountsByDay(): Promise<ConversationCountPoint[]> {
    return this.repository.query(`
      SELECT
        TO_CHAR(d, 'YYYY-MM-DD') AS bucket,
        COALESCE(COUNT(h.id), 0)::int AS count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '29 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d
      LEFT JOIN n8n_chat_histories h ON h.created_at::date = d::date
      GROUP BY d
      ORDER BY d ASC
    `);
  }

  async getConversationCountsByMonth(year: number): Promise<ConversationCountPoint[]> {
    return this.repository.query(
      `
      SELECT
        TO_CHAR(m, 'YYYY-MM') AS bucket,
        COALESCE(COUNT(DISTINCT h.session_id), 0)::int AS count
      FROM generate_series(
        MAKE_DATE($1, 1, 1)::timestamp,
        MAKE_DATE($1, 12, 1)::timestamp,
        INTERVAL '1 month'
      ) AS m
      LEFT JOIN n8n_chat_histories h
        ON DATE_TRUNC('month', h.created_at) = DATE_TRUNC('month', m)
      GROUP BY m
      ORDER BY m ASC
      `,
      [year],
    );
  }

  async getWeekSessionCount(): Promise<number> {
    const result = await this.repository.query(`
      SELECT COUNT(DISTINCT session_id)::int AS count
      FROM n8n_chat_histories
      WHERE created_at >= DATE_TRUNC('week', CURRENT_TIMESTAMP)
    `);
    return result[0]?.count ?? 0;
  }

  async getLastInteractionAt(): Promise<string | null> {
    const result = await this.repository.query(`
      SELECT MAX(created_at) AS "lastAt"
      FROM n8n_chat_histories
    `);
    return result[0]?.lastAt ?? null;
  }
}
