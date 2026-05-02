export type WhatsappStatus = "connecting" | "qr_required" | "ready" | "disconnected";

export type QrResponse = {
  qr: string | null;
  expiresAt?: string;
};

export type ExcludedPhone = {
  phone: string;
  createdAt: string;
};

export type WhatsappSettings = {
  aiRepliesEnabled: boolean;
};

export type AutomationConfig = {
  automationUrl: string;
  source: "db" | "env";
};
