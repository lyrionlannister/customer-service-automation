import { describe, expect, it } from "vitest";
import {
  normalizePhone,
  toConversationDto,
  toMessageDto,
} from "../../../src/chats/helpers/chats.helpers.js";
import type { ConversationRow } from "../../../src/chats/daos/chat-history.dao.js";

describe("normalizePhone", () => {
  it("strips the WhatsApp @c.us suffix", () => {
    expect(normalizePhone("5215512345678@c.us")).toBe("5215512345678");
  });

  it("leaves a session id without the suffix untouched", () => {
    expect(normalizePhone("5215512345678")).toBe("5215512345678");
  });
});

describe("toConversationDto", () => {
  const row: ConversationRow = {
    sessionId: "5215512345678@c.us",
    lastId: 42,
    messageCount: 3,
    lastContent: "hola",
    lastType: "human",
  };

  it("looks up the contact name by normalized phone", () => {
    const names = new Map([["5215512345678", "Juan Perez"]]);
    const dto = toConversationDto(row, names);

    expect(dto.phone).toBe("5215512345678");
    expect(dto.contactName).toBe("Juan Perez");
  });

  it("leaves contactName undefined when there's no match", () => {
    const dto = toConversationDto(row, new Map());
    expect(dto.contactName).toBeUndefined();
  });

  it("falls back to empty content and 'human' type when missing", () => {
    const dto = toConversationDto(
      { ...row, lastContent: null as unknown as string, lastType: null as unknown as string },
      new Map(),
    );
    expect(dto.lastContent).toBe("");
    expect(dto.lastType).toBe("human");
  });
});

describe("toMessageDto", () => {
  it("marks AI messages as fromMe", () => {
    const dto = toMessageDto({
      id: 1,
      sessionId: "x@c.us",
      message: { content: "hola", type: "ai" },
    });
    expect(dto.fromMe).toBe(true);
  });

  it("marks human messages as not fromMe", () => {
    const dto = toMessageDto({
      id: 2,
      sessionId: "x@c.us",
      message: { content: "hola", type: "human" },
    });
    expect(dto.fromMe).toBe(false);
  });

  it("defaults content to an empty string when missing", () => {
    const dto = toMessageDto({
      id: 3,
      sessionId: "x@c.us",
      message: { type: "human" },
    });
    expect(dto.content).toBe("");
  });
});
