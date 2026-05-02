import { Repository } from "typeorm";
import {
  ChatHistoryDao,
  ConversationCountPoint,
} from "../daos/chat-history.dao.js";
import { ContactName } from "../entities/contact-name.entity.js";
import { toConversationDto, toMessageDto } from "../helpers/chats.helpers.js";
import { ConversationDto, MessageDto } from "../types/chats.types.js";

export class ChatsService {
  constructor(
    private chatHistoryDao: ChatHistoryDao,
    private contactNameRepository: Repository<ContactName>,
  ) {}

  async getConversations(): Promise<ConversationDto[]> {
    const rows = await this.chatHistoryDao.getConversations();
    const contactNames = await this.contactNameRepository.find();
    const nameMap = new Map(contactNames.map((cn) => [cn.phone, cn.name]));

    return rows.map((row) => toConversationDto(row, nameMap));
  }

  async getMessages(sessionId: string): Promise<MessageDto[]> {
    const entries = await this.chatHistoryDao.getMessagesBySessionId(sessionId);
    return entries.map((entry) => toMessageDto(entry));
  }

  async getConversationCountsByDay(): Promise<ConversationCountPoint[]> {
    return this.chatHistoryDao.getConversationCountsByDay();
  }

  async getConversationCountsByMonth(year: number): Promise<ConversationCountPoint[]> {
    return this.chatHistoryDao.getConversationCountsByMonth(year);
  }
}
