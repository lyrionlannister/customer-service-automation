import { ConversationRow } from "../daos/chat-history.dao.js";
import { ConversationDto, MessageDto } from "../types/chats.types.js";

export function normalizePhone(sessionId: string): string {
  return sessionId.replace(/@c\.us$/, "");
}

export function toConversationDto(
  row: ConversationRow,
  contactNameByPhone: Map<string, string>,
): ConversationDto {
  const phone = normalizePhone(row.sessionId);
  return {
    sessionId: row.sessionId,
    phone,
    contactName: contactNameByPhone.get(phone),
    lastId: row.lastId,
    messageCount: row.messageCount,
    lastContent: row.lastContent ?? "",
    lastType: row.lastType ?? "human",
  };
}

export function toMessageDto(entry: {
  id: number;
  sessionId: string;
  message: { content?: string; type: string };
}): MessageDto {
  return {
    id: entry.id,
    sessionId: entry.sessionId,
    content: entry.message.content ?? "",
    type: entry.message.type,
    fromMe: entry.message.type === "ai",
  };
}
