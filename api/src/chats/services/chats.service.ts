import { Repository } from "typeorm";
import {
  ChatHistoryDao,
  ConversationCountPoint,
  ConversationRow,
} from "../daos/chat-history.dao.js";
import { ContactName } from "../entities/contact-name.entity.js";

export interface ConversationDto {
  sessionId: string;
  phone: string;
  contactName?: string;
  lastId: number;
  messageCount: number;
  lastContent: string;
  lastType: string;
}

export interface MessageDto {
  id: number;
  sessionId: string;
  content: string;
  type: string;
  fromMe: boolean;
}

function normalizePhone(sessionId: string): string {
  return sessionId.replace(/@c\.us$/, "");
}

export class ChatsService {
  constructor(
    private chatHistoryDao: ChatHistoryDao,
    private contactNameRepository: Repository<ContactName>,
  ) {}

  async getConversations(): Promise<ConversationDto[]> {
    const rows: ConversationRow[] = await this.chatHistoryDao.getConversations();
    const contactNames = await this.contactNameRepository.find();
    const nameMap = new Map(contactNames.map((cn) => [cn.phone, cn.name]));

    return rows.map((row) => {
      const phone = normalizePhone(row.sessionId);
      return {
        sessionId: row.sessionId,
        phone,
        contactName: nameMap.get(phone),
        lastId: row.lastId,
        messageCount: row.messageCount,
        lastContent: row.lastContent ?? "",
        lastType: row.lastType ?? "human",
      };
    });
  }

  async getMessages(sessionId: string): Promise<MessageDto[]> {
    const entries = await this.chatHistoryDao.getMessagesBySessionId(sessionId);
    return entries.map((entry) => ({
      id: entry.id,
      sessionId: entry.sessionId,
      content: entry.message.content ?? "",
      type: entry.message.type,
      fromMe: entry.message.type === "ai",
    }));
  }

  async getConversationCountsByDay(): Promise<ConversationCountPoint[]> {
    return this.chatHistoryDao.getConversationCountsByDay();
  }

  async getConversationCountsByMonth(year: number): Promise<ConversationCountPoint[]> {
    return this.chatHistoryDao.getConversationCountsByMonth(year);
  }
}
