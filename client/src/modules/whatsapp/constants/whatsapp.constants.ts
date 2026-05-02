import type { WhatsappStatus } from "../types/whatsapp.types";

export const STATUS_STYLES: Record<WhatsappStatus, { label: string; color: string }> = {
  connecting: { label: "Conectando", color: "secondary" },
  qr_required: { label: "Requiere vinculación", color: "warning" },
  ready: { label: "Conectado", color: "success" },
  disconnected: { label: "Desconectado", color: "danger" },
};
