const WHATSAPP_SUFFIX = "@c.us";

export function normalizeWhatsappPhone(phone: string): string {
  const trimmed = phone.trim().toLowerCase();

  if (!trimmed) return "";

  if (trimmed.includes("@")) {
    const [localPart] = trimmed.split("@");
    const digits = localPart.replace(/\D/g, "");
    return digits ? `${digits}${WHATSAPP_SUFFIX}` : "";
  }

  const digits = trimmed.replace(/\D/g, "");
  return digits ? `${digits}${WHATSAPP_SUFFIX}` : "";
}
