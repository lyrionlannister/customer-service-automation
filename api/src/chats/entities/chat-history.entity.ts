import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export type ChatMessageType = "human" | "ai";

export interface ChatMessagePayload {
  type: ChatMessageType;
  content: string;
  additional_kwargs?: Record<string, unknown>;
  response_metadata?: Record<string, unknown>;
  tool_calls?: unknown[];
  invalid_tool_calls?: unknown[];
}

@Entity("n8n_chat_histories")
export class ChatHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "session_id", type: "varchar", length: 255 })
  sessionId!: string;

  @Column({ type: "jsonb" })
  message!: ChatMessagePayload;

  @CreateDateColumn({ name: "created_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
