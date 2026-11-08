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
