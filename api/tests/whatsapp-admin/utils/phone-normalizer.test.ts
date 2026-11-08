import { describe, expect, it } from "vitest";
import { normalizeWhatsappPhone } from "../../../src/whatsapp-admin/utils/phone-normalizer.js";

describe("normalizeWhatsappPhone", () => {
  it("strips non-digits and appends the WhatsApp suffix", () => {
    expect(normalizeWhatsappPhone("+52 155 1234 5678")).toBe("5215512345678@c.us");
  });

  it("is idempotent on an already-normalized WhatsApp id", () => {
    expect(normalizeWhatsappPhone("5215512345678@c.us")).toBe("5215512345678@c.us");
  });

  it("normalizes a different @ suffix to the WhatsApp one", () => {
    expect(normalizeWhatsappPhone("5215512345678@g.us")).toBe("5215512345678@c.us");
  });

  it("returns an empty string for blank input", () => {
    expect(normalizeWhatsappPhone("   ")).toBe("");
  });

  it("returns an empty string when there are no digits at all", () => {
    expect(normalizeWhatsappPhone("abc@c.us")).toBe("");
  });
});
